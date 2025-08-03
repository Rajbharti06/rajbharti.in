const phrases = [
  "Engineer",
  "Cybersecurity  Student",
  "AI innovator"
];

let typedText = document.querySelector('.typing-text span');
let phraseIndex = 0;
let letterIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function type() {
  const currentPhrase = phrases[phraseIndex];
  
  if (!isDeleting) {
    typedText.textContent = currentPhrase.substring(0, letterIndex + 1);
    letterIndex++;
    if (letterIndex === currentPhrase.length) {
      isDeleting = true;
      setTimeout(type, 1500);
      return;
    }
  } else {
    typedText.textContent = currentPhrase.substring(0, letterIndex - 1);
    letterIndex--;
    if (letterIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }
  setTimeout(type, isDeleting ? typingSpeed / 2 : typingSpeed);
}

type();

// Mobile menu toggle
const menuIcon = document.getElementById('menu-icon');
const nav = document.getElementById('navbar');

menuIcon.addEventListener('click', () => {
  nav.classList.toggle('show');
});

