let urlParams = new URLSearchParams(window.location.search);
let movieID = urlParams.get("movieID");

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

if(!movieID || movieID.toString().length !== 9) {
  alert("Invalid Movie ID, Redirecting to the Home Page!");
  window.location.href = "index.html";
}else {
  // fetchIndividualMovieDetails(movieID) 
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//individual movie details function

async function fetchIndividualMovieDetails(movieID) {
  try {
    let response = await fetch(`https://www.omdbapi.com/?i=${movieID}&apikey=e554dc1e`)
    let data = await response.json();
    console.log(data);
  }catch(error) {
    console.log(error);
  }
}