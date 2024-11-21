let urlParams = new URLSearchParams(window.location.search);
let movieID = urlParams.get("movieID");

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

if(!movieID) {
  alert("Invalid Movie ID, Redirecting to the Home Page!");
  window.location.href = "index.html";
}else {
  fetchIndividualMovieDetails(movieID) 
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//individual movie details function

let loader = document.querySelector(".loader");
let movieDetailsDiv = document.querySelector(".movieDetailsDiv");

async function fetchIndividualMovieDetails(movieID) {
  try {
    let response = await fetch(`https://www.omdbapi.com/?i=${movieID}&apikey=e554dc1e`)
    let data = await response.json();
    
    if(data.Response === "False") {
      alert("Movie Details Not Found :(");
      window.location.replace("index.html");
      return;
    }else {
      renderMovie(data);
    }

  }catch(error) {
    console.log(error);
    movieDetailsDiv.innerHTML = "<p>Something went wrong. Please try again later.</p>";
  }finally {
    loader.style.display = "none";
  }
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//rendering movie details

function renderMovie(data) {
  return movieDetailsDiv.innerHTML = `
    <div class="leftPosterDiv">
      <img src="${data.Poster !== "N/A" ? data.Poster : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoWcWg0E8pSjBNi0TtiZsqu8uD2PAr_K11DA&s'}"  alt="${data.Title}" title="${data.Title}" >
    </div>
    <div class="rightInfoDiv">
      <h1>Movie Details</h1>
      <table class="movieDetailsTable">
        <tr>
          <th>Title</th>
          <td title="${data.title}" >${data.Title}</td>
        </tr>
        <tr>
          <th>Released Year</th>
          <td>${data.Released}</td>
        </tr>
        <tr>
          <th>IMDB Rating</th>
          <td>${data.imdbRating}</td>
        </tr>
      </table>
      <p id="summary">${data.Plot}</p>
    </div>
  `
}

