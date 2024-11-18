//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
//toggling between Home Tab & Watchlists Tab
let homeNavigationBtn = document.querySelector("#homeNavigationBtn");
let personalWatchlistNavigationBtn = document.querySelector("#personalWatchlistNavigationBtn");
let homeDiv = document.querySelector("#homeDiv");
let myListsDiv = document.querySelector("#myListsDiv");

homeNavigationBtn.addEventListener("click", function() {
  this.classList.add("activeNavLink");
  personalWatchlistNavigationBtn.classList.remove("activeNavLink");
  homeDiv.style.display = "block";
  myListsDiv.style.display = "none";
})

personalWatchlistNavigationBtn.addEventListener("click", function() {
  this.classList.add("activeNavLink");
  homeNavigationBtn.classList.remove("activeNavLink");
  myListsDiv.style.display = "block";
  homeDiv.style.display = "none";
})

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//fetching movies data

let moviesSearchForm = document.querySelector("#moviesSearchForm");
let movieInput = moviesSearchForm.querySelector("input");

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
  console.log(completeMovieDetails);

  }catch(error) {
    console.log(error);
  }

}
