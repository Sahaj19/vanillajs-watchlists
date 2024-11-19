//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
//toggling content divs based on navigation buttons (its scalable now)
let navLinks = document.querySelectorAll(".navLink");
let contentDivs = document.querySelectorAll(".contentDiv");

navLinks.forEach((link) => {
  link.addEventListener("click", function() {

    navLinks.forEach((btn) => btn.classList.remove("activeNavLink"));

    this.classList.add("activeNavLink");

    contentDivs.forEach((div) => {
      div.style.display = "none";
    })

    let targetDiv = this.getAttribute("data-target");
    document.querySelector(`#${targetDiv}`).style.display = "block";
  })
})

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//fetching movies data

let moviesSearchForm = document.querySelector("#moviesSearchForm");
let movieInput = moviesSearchForm.querySelector("input");
let paginatedMoviesData = [];
let currentPage = 1;
let moviesPerPage = 3;

moviesSearchForm.addEventListener("submit", function(event) {
  event.preventDefault();
  let inputValue = movieInput.value.trim().toLowerCase();
  fetchMovies(inputValue);
})

async function fetchMovies(query) {
  try {
  let response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=e554dc1e`);
  let data = await response.json();
  
  let movieDataPromises;
  if(data.Response === "True") {
    movieDataPromises = data.Search.map(async (movie) => {
      let dataResponse = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=e554dc1e`);
      return dataResponse.json();
    })
  }

  let completeMovieDetails = await Promise.all(movieDataPromises);
  paginatedMoviesData = completeMovieDetails
  renderMovies();
  movieInput.value = "";
  }catch(error) {
    console.log(error);
  }
}


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//rendering movies data

let moviesDataContainer = document.querySelector("#moviesDataContainer");
let prevBtn = document.querySelector("#prevBtn");
let currentPageNum = document.querySelector("#pageNum");
let nextBtn = document.querySelector("#nextBtn");

function renderMovies() {
  // console.log(paginatedMoviesData);
  moviesDataContainer.innerHTML = "";
  let startingIndex = (currentPage - 1) * moviesPerPage;
  let endingIndex = startingIndex + moviesPerPage;
  let slicedMoviesData = paginatedMoviesData.slice(startingIndex,endingIndex);
  moviesDataContainer.innerHTML = slicedMoviesData.map((movie) => {
    let ratingEmoji;
    if(movie.imdbRating && !isNaN(movie.imdbRating) && movie.imdbRating * 10 >= 70) {
      ratingEmoji = "&#128522;"
    }else {
      ratingEmoji = "&#128524;";
    }
    return `
      <div class="movieDetails">
            <div class="upperPosterDiv">
              <img src=${movie.Poster == "N/A" ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoWcWg0E8pSjBNi0TtiZsqu8uD2PAr_K11DA&s" : movie.Poster} alt=${movie.Title} title="${movie.Title}" data-movieInfo="${movie.imdbID}">
              <span class="plusBtn"><i class="bi bi-bookmark-plus-fill"></i></span>
            </div>
            <div class="lowerInfoDiv">
              <p id="movieTitle" title="${movie.Title}">${movie.Title.length <= 30 ? movie.Title : movie.Title.slice(0,30) + "..."}</p>
              <p id="movieYear">${movie.Year}</p>
              <p><span>${ratingEmoji}</span>&nbsp;<span id="movieRating">${movie.imdbRating && !isNaN(movie.imdbRating) ? movie.imdbRating * 10 + "/100" : "N/A"}</span></p>
            </div>
      </div>
    `
  }).join("");
  updatePaginationBtnState();
  moviePosterListener();
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

prevBtn.addEventListener("click" , function() {
  if(currentPage > 1) {
      currentPage--;
  }
  renderMovies();
})

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

nextBtn.addEventListener("click" , function() {
  if(currentPage < Math.ceil(paginatedMoviesData.length/moviesPerPage)) {
      currentPage++;
  }
  renderMovies();
})

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function updatePaginationBtnState() {
  if(currentPage === 1) {
      prevBtn.setAttribute("disabled" , true);
  }else {
      prevBtn.removeAttribute("disabled")
  }

  if(currentPage === Math.ceil(paginatedMoviesData.length/moviesPerPage)) {
      nextBtn.setAttribute("disabled", "true");
  }else {
      nextBtn.removeAttribute("disabled")
  }

  currentPageNum.innerHTML = currentPage;
}


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//individual movie details

function moviePosterListener() {
  let moviePosters = document.querySelectorAll(".movieDetails .upperPosterDiv img");
  console.log(moviePosters);

  moviePosters.forEach((moviePoster) => {
    moviePoster.addEventListener("click", function() {
      let movieID = moviePoster.getAttribute("data-movieInfo");
      window.location.href = `moviedetails.html?movieID=${movieID}`;
    })
  })
}




