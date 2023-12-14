let menuElement = document.querySelector(".menu-icon");
let navContainer = document.querySelector(".nav-closed");
let closeBtn = document.querySelector(".close-btn");
let toggleStatus = false;

menuElement.addEventListener("click", openMenu);

function openMenu() {
  if (toggleStatus === false) {
    navContainer.classList.remove("nav-closed");
    navContainer.classList.add("nav-wrap");

    return (toggleStatus = true);
  }
}

closeBtn.addEventListener("click", closeMenu);

function closeMenu() {
  if (toggleStatus === true) {
    navContainer.classList.remove("nav-wrap");
    navContainer.classList.add("nav-closed");

    return (toggleStatus = false);
  }
}

const accordionItmes = document.querySelectorAll(".accordion-item");

for (let i = 0; i < accordionItmes.length; i++) {
  accordionItmes[i].addEventListener("click", function () {
    this.classList.toggle("active");
  });
}



