// main.js — Книжные грани
document.addEventListener('DOMContentLoaded', function() {

    // БУРГЕР-МЕНЮ
    var menuToggle = document.getElementById('menuToggle');
    var nav = document.getElementById('nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            if (nav.style.display === 'flex' || nav.style.display === 'block') {
                nav.style.display = 'none';
            } else {
                nav.style.display = 'flex';
            }
        });
    }

    // АККОРДЕОН ДЛЯ FAQ
    var faqQuestions = document.querySelectorAll('.faq-question');
    for (var i = 0; i < faqQuestions.length; i++) {
        faqQuestions[i].addEventListener('click', function() {
            var answer = this.nextElementSibling;
            var isActive = this.classList.contains('active');
            
            for (var j = 0; j < faqQuestions.length; j++) {
                faqQuestions[j].classList.remove('active');
                if (faqQuestions[j].nextElementSibling) {
                    faqQuestions[j].nextElementSibling.classList.remove('show');
                }
            }
            
            if (!isActive) {
                this.classList.add('active');
                if (answer) {
                    answer.classList.add('show');
                }
            }
        });
    }

    // ТЕКУЩИЙ ГОД В ПОДВАЛЕ
    var yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

});