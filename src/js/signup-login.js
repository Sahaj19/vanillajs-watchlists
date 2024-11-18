let signUpFormDiv = document.querySelector("#signUpFormDiv");
let signUpForm = document.querySelector("#signUpForm");
let logInBtn = document.querySelector("#logInBtn");

let logInFormDiv = document.querySelector("#logInFormDiv");
let logInForm = document.querySelector("#logInForm");
let signUpBtn = document.querySelector("#signUpBtn");

//toggle functionality btw auth forms
logInBtn.addEventListener("click", function() {
  signUpFormDiv.style.display = "none";
  logInFormDiv.style.display = "block";
})

signUpBtn.addEventListener("click", function() {
  logInFormDiv.style.display = "none";
  signUpFormDiv.style.display = "block";
})