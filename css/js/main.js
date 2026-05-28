// main.js — Книжные грани

document.addEventListener('DOMContentLoaded', function() {

    // ===== БУРГЕР-МЕНЮ =====
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }

    // ===== FAQ АККОРДЕОН =====
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');
            
            // Закрываем все остальные
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                if (q.nextElementSibling) {
                    q.nextElementSibling.classList.remove('show');
                }
            });
            
            // Открываем текущий, если он не был открыт
            if (!isActive) {
                question.classList.add('active');
                if (answer) {
                    answer.classList.add('show');
                }
            }
        });
    });

    // ===== ПЛАВНАЯ ПРОКРУТКА ДЛЯ ЯКОРЕЙ =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#!' && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // ===== ГОД В ПОДВАЛЕ =====
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

});
