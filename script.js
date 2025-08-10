const phrases = [
  "Engineer",
  "Cybersecurity Student",
  "AI innovator"
];

const typedTextSpan = document.querySelector('.typing-text span');
let phraseIndex = 0;
let letterIndex = 0;
let isDeleting = false;
const typingSpeed = 100;
const deletingSpeed = typingSpeed / 2;
const delayAfterComplete = 1500;

function type() {
  const currentPhrase = phrases[phraseIndex];
  if (!isDeleting) {
    typedTextSpan.textContent = currentPhrase.substring(0, letterIndex + 1);
    letterIndex++;
    if (letterIndex === currentPhrase.length) {
      isDeleting = true;
      setTimeout(type, delayAfterComplete);
      return;
    }
  } else {
    typedTextSpan.textContent = currentPhrase.substring(0, letterIndex - 1);
    letterIndex--;
    if (letterIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }
  setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
  type();

  const menuIcon = document.getElementById('menu-icon');
  const nav = document.getElementById('navbar');

  menuIcon.addEventListener('click', () => {
    const expanded = menuIcon.getAttribute('aria-expanded') === 'true' || false;
    menuIcon.setAttribute('aria-expanded', !expanded);
    nav.classList.toggle('show');
  });

  // Close menu when a link is clicked (mobile friendly)
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('show')) {
        nav.classList.remove('show');
        menuIcon.setAttribute('aria-expanded', false);
      }
    });
  });
});
