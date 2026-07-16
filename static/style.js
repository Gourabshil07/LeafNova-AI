
// =============================
// Mobile Menu
// =============================

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenu = document.getElementById("closeMenu");

menuBtn.addEventListener("click", () => {

    mobileMenu.classList.add("active");

});

closeMenu.addEventListener("click", () => {

    mobileMenu.classList.remove("active");

});



// const text = "Grow Smarter with";
// const typingElement = document.querySelector(".typing-text");

// let index = 0;
// let deleting = false;

// function typeAnimation(){

//     if(!deleting){

//         typingElement.textContent = text.substring(0,index);

//         index++;

//         if(index > text.length){

//             deleting = true;

//             setTimeout(typeAnimation,2000);

//             return;

//         }

//         setTimeout(typeAnimation,120);

//     }

//     else{

//         typingElement.textContent = text.substring(0,index);

//         index--;

//         if(index < 0){

//             deleting = false;

//             index = 0;

//         }

//         setTimeout(typeAnimation,60);

//     }

// }

// typeAnimation();

const text = "Grow Smarter with";
const typing = document.querySelector(".typing-text");

let i = 0;
let deleting = false;

function animateText() {

    if (!deleting) {

        typing.textContent = text.substring(0, i);
        i++;

        if (i > text.length) {
            deleting = true;
            setTimeout(animateText, 1800);
            return;
        }

        setTimeout(animateText, 120);

    } else {

        typing.textContent = text.substring(0, i);
        i--;

        if (i < 0) {
            deleting = false;
            i = 0;
        }

        setTimeout(animateText, 60);
    }
}

animateText();

