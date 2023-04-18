const mobileNavButton = document.querySelector(".btn-mobile-nav");
const header = document.querySelector(".header--container");

mobileNavButton.addEventListener("click", () => {
    header.classList.toggle("nav-open");
});
