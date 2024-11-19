let signUpFormDiv = document.querySelector("#signUpFormDiv");
let signUpForm = document.querySelector("#signUpForm");
let logInBtn = document.querySelector("#logInBtn");

let logInFormDiv = document.querySelector("#logInFormDiv");
let logInForm = document.querySelector("#logInForm");
let signUpBtn = document.querySelector("#signUpBtn");

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//toggle functionality btw auth forms
logInBtn.addEventListener("click", function() {
  signUpFormDiv.style.display = "none";
  logInFormDiv.style.display = "block";
})

signUpBtn.addEventListener("click", function() {
  logInFormDiv.style.display = "none";
  signUpFormDiv.style.display = "block";
})

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

let globalUserState = JSON.parse(localStorage.getItem("userDetails")) || { currentUser: null, users:[] }

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//sign up functionality

signUpForm.addEventListener("submit", function(event) {
  event.preventDefault();

  let inputValue = this.querySelector("input").value.trim().toLowerCase();
  let userState = {
    username: inputValue,
    personalWatchlist:[]
  }

  for (let user of globalUserState.users) {
    if (user.username === inputValue) {
      alert("User is already registered, Please Log In!");
      return; 
    }
  }

  globalUserState.currentUser = inputValue;
  globalUserState.users.push(userState);
  localStorage.setItem("userDetails", JSON.stringify(globalUserState));
  window.location.replace("index.html");
})


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//log in functionality

logInForm.addEventListener("submit", function(event) {
  event.preventDefault();

  let inputValue = this.querySelector("input").value.trim().toLowerCase();

  for(let user of globalUserState.users) {
    if(inputValue === user.username) {
      globalUserState.currentUser = inputValue;
      localStorage.setItem("userDetails", JSON.stringify(globalUserState));
      window.location.replace("index.html");
      return;
    }
  }

  alert("User is not registered, Please sign up!");
})