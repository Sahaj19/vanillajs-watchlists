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

function updateUserName() {  
  if(!loggedInUser) {
    currentUserEmail.innerHTML = "Guest";
    currentUserEmail.setAttribute("title", "Guest");
  }else {
    currentUserEmail.innerHTML = loggedInUser.length <= 20 ? loggedInUser : loggedInUser.slice(0,20) + "...";
    currentUserEmail.setAttribute("title", loggedInUser);
  }
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
updateUserName();

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
  if (inputValue) {
    loader.style.display = "block";
    paginationDiv.style.display = "none";
    moviesDataContainer.innerHTML = "";
    fetchMovies(inputValue);
  }
})

async function fetchMovies(query) {
  try {
  let response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=e554dc1e`);
  let data = await response.json();

  if(data.Response === "False") {
    moviesDataContainer.innerHTML = "<p>No movies found. Please try a different search.</p>";
    return;
  }
  
  let movieDataPromises = data.Search.map(async (movie) => {
    let dataResponse = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=e554dc1e`);
    return dataResponse.json();
  })
  

  let completeMovieDetails = await Promise.all(movieDataPromises);
  paginatedMoviesData = completeMovieDetails
  currentPage = 1;
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
      plusBtn.style.color = "green"; // added
    } else {
      plusBtn.style.color = "gray"; // removed/not added
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
      renderWatchlist();
    })
  })
}


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//fetching data from user's personal watchlist
//rendering user's added movies.

let watchlistDiv = document.querySelector(".watchlistDiv");

function renderWatchlist() {
  let userDetails = JSON.parse(localStorage.getItem("userDetails"));
  let loggedInUser = userDetails?.currentUser;

  if(!loggedInUser) {
    watchlistDiv.innerHTML = `<p>Please log in to view/edit your watchlist.</p>`
    return;
  }

  let currentUser = userDetails.users.find((user) => user.username === loggedInUser);
  let currentUserWatchlist = currentUser?.personalWatchlist || [];

  // console.log(currentUserWatchlist);

  if(currentUserWatchlist.length === 0) {
    watchlistDiv.innerHTML = `<p>Your Watchlist is Empty!</p>`
    return;
  }

  watchlistDiv.innerHTML = `<p>Loading...</p>`;

  //fetching & rendering personal watchlist
  let personalDataPromises = currentUserWatchlist.map(async (movieID) => {
    try {
      const res = await fetch(`https://www.omdbapi.com/?i=${movieID}&apikey=e554dc1e`);
      return await res.json();
    } catch (error) {
      return console.log(error);
    }
  })

  //movie array -> mapping -> rendering
  Promise.all(personalDataPromises)
  .then((movies) => {
    watchlistDiv.innerHTML = movies.map((movie) => {
      return `
        <div class="watchlistMovieDiv">
          <div class="imgDiv">
            <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoWcWg0E8pSjBNi0TtiZsqu8uD2PAr_K11DA&s'}"  alt="${movie.Title}" title="${movie.Title}" onclick=showMovieDetails("${movie.imdbID}") loading="lazy" >
          </div>
          <div class="controlsDiv">
            <p title="${movie.Title}" >${movie.Title.length <= 50 ? movie.Title : movie.Title.slice(0,50) + "..."}</p>
            <div class="controls">
              <span class="removeBtn" data-movieID="${movie.imdbID}"><i class="bi bi-bookmark-dash-fill"></i></span>
              <span class="watchedBtn" data-movieID="${movie.imdbID}"><i class="bi bi-check-circle-fill"></i></span>
            </div>
          </div>
        </div>
      `
    }).join("")
    removeWatchedFunctionality();
    updateWatchedBtnState();  
  })
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function removeWatchedFunctionality() {
  let removeBtns = document.querySelectorAll(".removeBtn");
  let watchedBtns = document.querySelectorAll(".watchedBtn");

  removeBtns.forEach((removeBtn) => {
    removeBtn.addEventListener("click", function() {
      let movieID = removeBtn.getAttribute("data-movieID");
      removeMovie(movieID);
    })
  })

  watchedBtns.forEach((watchBtn) => {
    watchBtn.addEventListener("click", function() {
      let movieID = watchBtn.getAttribute("data-movieID");
      console.log("button clicked - 1");
      markMovieAsWatched(movieID, this);
    })
  })
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function showMovieDetails(movieID) {
  window.location.href = `moviedetails.html?movieID=${movieID}`;
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function removeMovie(movieID) {
  let warning = confirm("Are you sure you want to remove this movie from your personal watchlist?");

  if(!warning) return;

  let userDetails = JSON.parse(localStorage.getItem("userDetails"));
  let loggedInUser = userDetails?.currentUser;

  if(!loggedInUser) return;

  let currentUser = userDetails.users.find((user) => user.username === loggedInUser);
  currentUser.personalWatchlist = currentUser.personalWatchlist.filter((id) => id !== movieID);
  localStorage.setItem("userDetails", JSON.stringify(userDetails));
  renderWatchlist();
  updateNavListCounter();
  plusBtnHandler();
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function markMovieAsWatched(movieID, btn) {
  let userDetails = JSON.parse(localStorage.getItem("userDetails"));
  let loggedInUser = userDetails?.currentUser;

  if(!loggedInUser) return;

  let currentUser = userDetails.users.find((user) => user.username === loggedInUser);

  if(!currentUser.watchedMovies) {
    currentUser.watchedMovies = [];
  }


  if (!currentUser.watchedMovies.includes(movieID)) {
    currentUser.watchedMovies.push(movieID);
    btn.style.color = "green"; 
  } else {
    currentUser.watchedMovies = currentUser.watchedMovies.filter((id) => id !== movieID);
    btn.style.color = "black"; 
  }

  localStorage.setItem("userDetails", JSON.stringify(userDetails));
  updateWatchedBtnState();
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function updateWatchedBtnState() {
  let userDetails = JSON.parse(localStorage.getItem("userDetails"));
  let loggedInUser = userDetails?.currentUser;

  if (!loggedInUser) return;

  let currentUser = userDetails.users.find((user) => user.username === loggedInUser);

  let watchedMovies = currentUser?.watchedMovies || [];

  // Update button colors based on the movies in the watched list
  let watchedBtns = document.querySelectorAll(".watchedBtn");

  watchedBtns.forEach((btn) => {
    let movieID = btn.getAttribute("data-movieID");

    if (watchedMovies.includes(movieID)) {
      btn.style.color = "green";
    } else {
      btn.style.color = "black";
    }
  });
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
renderWatchlist();

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Function to toggle login status and update content accordingly

function toggleLoginStatus() {
  let userDetails = JSON.parse(localStorage.getItem("userDetails"));
  let loggedInUser = userDetails?.currentUser;

  let loginStatusDiv = document.querySelector(".loginStatusDiv");
  let signInLink = document.querySelector("#signInLink");
  let logoutBtn = document.querySelector("#logoutBtn");

  if (loggedInUser) {
    signInLink.style.display = "none";
    logoutBtn.style.display = "block";
  } else {
    signInLink.style.display = "block";
    logoutBtn.style.display = "none";
  }

  if(loginStatusDiv.style.display === "none") {
    loginStatusDiv.style.display = "block";
  }else {
    loginStatusDiv.style.display = "none";
  }
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Event listener for the "More Options" button (three dots)
document.querySelector("#moreOptions").addEventListener("click", function() {
  toggleLoginStatus();
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
document.querySelector("#logoutBtn").addEventListener("click", function() {
  let userDetails = JSON.parse(localStorage.getItem("userDetails"));
  if (userDetails) {
    userDetails.currentUser = null;
    localStorage.setItem("userDetails", JSON.stringify(userDetails));
  }

  toggleLoginStatus();
  updateNavListCounter();
  currentUserEmail.innerHTML = "Guest";
  currentUserEmail.setAttribute("title", "Guest");
  renderWatchlist();
  plusBtnHandler();
});
