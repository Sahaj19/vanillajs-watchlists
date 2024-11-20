//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//initializing our localstorage

if(!JSON.parse(localStorage.getItem("userDetails"))) {
  localStorage.setItem("userDetails", JSON.stringify({ currentUser: null, users:[] }));
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//checking the current user

let navListCounter = document.querySelector("#listCounter");
let currentUserEmail = document.querySelector("#currentUserEmail");
let loggedInUser = JSON.parse(localStorage.getItem("userDetails"))?.currentUser;

if(!loggedInUser) {
  currentUserEmail.innerHTML = "Guest";
  currentUserEmail.setAttribute("title", "Guest");
}else {
  currentUserEmail.innerHTML = loggedInUser.length <= 20 ? loggedInUser : loggedInUser.slice(0,20) + "...";
  currentUserEmail.setAttribute("title", loggedInUser);
}

function updateNavListCounter() {
  let userDetails = JSON.parse(localStorage.getItem("userDetails"));
  let loggedInUser = userDetails?.currentUser;

  if(!loggedInUser) {
    navListCounter.innerHTML = 0;
  }else {
    let currentUser = userDetails.users.find((user) => user.username === loggedInUser);
    navListCounter.innerHTML = currentUser?.personalWatchlist?.length || 0;
  }
}

updateNavListCounter();

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

let loader = document.querySelector(".loader");
let paginationDiv = document.querySelector(".paginationDiv");
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
  loader.style.display = "block";
  try {
  let response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=e554dc1e`);
  let data = await response.json();

  if(data.Response === "False") {

  }
  
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
  }catch(error) {
    console.log(error);
    moviesDataContainer.innerHTML = "<p>An error occurred. Please try again later.</p>";
  }finally {
    loader.style.display = "none";
    paginationDiv.style.display = paginatedMoviesData.length > moviesPerPage ? "block" : "none";
    movieInput.value = "";
  }
}


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//rendering movies data

let moviesDataContainer = document.querySelector("#moviesDataContainer");
let prevBtn = document.querySelector("#prevBtn");
let currentPageNum = document.querySelector("#pageNum");
let nextBtn = document.querySelector("#nextBtn");

function renderMovies() {
  moviesDataContainer.innerHTML = "";

  //error handling for empty result
  if (paginatedMoviesData.length === 0) {
    moviesDataContainer.innerHTML = "<p>No movies found. Try searching for something else.</p>";
    paginationDiv.style.display = "none";
    return;
  }

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
              <span class="plusBtn" data-movieID="${movie.imdbID}" ><i class="bi bi-bookmark-plus-fill"></i></span>
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
  plusBtnHandler();
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//prev btn functionality

prevBtn.addEventListener("click" , function() {
  if(currentPage > 1) {
      currentPage--;
  }
  renderMovies();
})

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//next btn functionality

nextBtn.addEventListener("click" , function() {
  if(currentPage < Math.ceil(paginatedMoviesData.length/moviesPerPage)) {
      currentPage++;
  }
  renderMovies();
})

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//prev & next btn states updation function

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

  moviePosters.forEach((moviePoster) => {
    moviePoster.addEventListener("click", function() {
      let movieID = moviePoster.getAttribute("data-movieInfo");
      window.location.href = `moviedetails.html?movieID=${movieID}`;
    })
  })
}


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//adding to personal watchlist functionality


function plusBtnHandler() {
  let userDetails = JSON.parse(localStorage.getItem("userDetails"))
  let plusBtns = document.querySelectorAll(".plusBtn");
  
  plusBtns.forEach((plusBtn) => {
    let movieID = plusBtn.getAttribute("data-movieID");

    // Check if the current movie is already in the watchlist
    if (
      userDetails.currentUser &&
      userDetails.users.find((user) => user.username === userDetails.currentUser)
        .personalWatchlist.includes(movieID)
    ) {
      plusBtn.style.color = "green"; // Mark as added
    } else {
      plusBtn.style.color = "gray"; // Mark as not added
    }
    
    plusBtn.addEventListener("click", function() {
      if(userDetails.currentUser === null) {
        alert("Log In First!");
        return;
      }

      let currentUser = userDetails.currentUser;
      let userObj = userDetails.users.find((user) => user.username === currentUser);


      if (this.style.color === "gray") {
        if (!userObj.personalWatchlist.includes(movieID)) {
          userObj.personalWatchlist.push(movieID);
          this.style.color = "green";
        }
      } else {
        userObj.personalWatchlist = userObj.personalWatchlist.filter(
          (id) => id !== movieID
        );
        this.style.color = "gray";
      }

      localStorage.setItem("userDetails", JSON.stringify(userDetails));
      updateNavListCounter();
    })
  })
}


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//fetching data from user's personal watchlist
//rendering user's added movies.