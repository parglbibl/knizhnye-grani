// main.js — Книжные грани (Cyber Brutalism)

document.addEventListener('DOMContentLoaded', function() {

    // ===== ДОБАВЛЯЕМ ЦИФРОВОЙ ШУМ, ГЛИТЧ И СЕТКУ АВТОМАТИЧЕСКИ =====
    (function() {
        // Цифровой шум
        if (!document.querySelector('.digital-noise')) {
            const noise = document.createElement('div');
            noise.className = 'digital-noise';
            document.body.insertBefore(noise, document.body.firstChild);
        }
        
        // Глитч-оверлей
        if (!document.querySelector('.glitch-overlay')) {
            const glitch = document.createElement('div');
            glitch.className = 'glitch-overlay';
            document.body.insertBefore(glitch, document.body.firstChild);
        }
        
        // Сетка
        if (!document.querySelector('.grid-overlay')) {
            const grid = document.createElement('div');
            grid.className = 'grid-overlay';
            document.body.insertBefore(grid, document.body.firstChild);
        }
    })();

    // ===== КАТЕГОРИИ МЕНЮ =====
    const nav = document.getElementById('nav');
    const menuToggle = document.getElementById('menuToggle');

    // Определяем глубину вложенности
    const path = window.location.pathname;
    let prefix = '';
    if (path.includes('/boardgames/') || path.includes('/speedcubing/')) {
        prefix = '../';
    }

    if (nav) {
        const currentFile = path.split('/').pop() || 'index.html';
        
        const menuData = [
            {
                title: 'О проекте',
                icon: 'fas fa-info-circle',
                items: [
                    { name: 'О проекте', href: prefix + 'about.html' },
                    { name: 'Организаторы', href: prefix + 'organizers.html' },
                    { name: 'Команда', href: prefix + 'team.html' }
                ]
            },
            {
                title: 'Мероприятия',
                icon: 'fas fa-calendar-alt',
                items: [
                    { name: 'Афиша', href: prefix + 'events.html' },
                    { name: 'Настольные игры', href: prefix + 'boardgames/index.html' },
                    { name: 'Спидкубинг', href: prefix + 'speedcubing/index.html' }
                ]
            },
            {
                title: 'Участие',
                icon: 'fas fa-handshake',
                items: [
                    { name: 'Партнёры', href: prefix + 'partners.html' },
                    { name: 'Контакты', href: prefix + 'contacts.html' },
                    { name: 'FAQ', href: prefix + 'faq.html' }
                ]
            }
        ];

        let html = '<ul class="desktop-menu">';
        
        menuData.forEach(cat => {
            let isActive = false;
            cat.items.forEach(item => {
                const targetFile = item.href.split('/').pop();
                if (targetFile === currentFile || (currentFile === '' && targetFile === 'index.html')) {
                    isActive = true;
                }
            });
            
            html += `<li class="dropdown">
                        <div class="dropdown-title ${isActive ? 'active' : ''}">
                            <i class="${cat.icon}"></i> ${cat.title} <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="dropdown-menu">`;
            
            cat.items.forEach(item => {
                const targetFile = item.href.split('/').pop();
                const activeClass = (targetFile === currentFile) ? 'active' : '';
                html += `<li><a href="${item.href}" class="${activeClass}">${item.name}</a></li>`;
            });
            
            html += `</ul></li>`;
        });
        
        html += '</ul>';
        nav.innerHTML = html;
    }

    // ===== БУРГЕР-МЕНЮ =====
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }

    // ===== GLITCH-ЭФФЕКТ ПРИ НАВЕДЕНИИ НА КНОПКИ =====
    const glitchBtns = document.querySelectorAll('.btn');
    glitchBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'skewX(-2deg)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'skewX(0)';
        });
    });

    // ===== FADE-IN ПРИ СКРОЛЛЕ (ДЛЯ КАРТОЧЕК) =====
    const fadeElements = document.querySelectorAll('.event-card, .direction-card, .team-card, .partner-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ===== FAQ АККОРДЕОН =====
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');
            
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                if (q.nextElementSibling) {
                    q.nextElementSibling.classList.remove('show');
                }
            });
            
            if (!isActive) {
                question.classList.add('active');
                if (answer) {
                    answer.classList.add('show');
                }
            }
        });
    });

    // ===== КНОПКА "НАВЕРХ" =====
    function initBackToTop() {
        const backBtn = document.createElement('a');
        backBtn.href = '#';
        backBtn.className = 'back-to-top';
        backBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        document.body.appendChild(backBtn);
        
        function toggleButton() {
            if (window.pageYOffset > 300) {
                backBtn.classList.add('show');
            } else {
                backBtn.classList.remove('show');
            }
        }
        
        window.addEventListener('scroll', toggleButton);
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        toggleButton();
    }
    
    initBackToTop();

    // ===== ТЕКУЩИЙ ГОД В ПОДВАЛЕ =====
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ===== ПОИСК (если есть на странице) =====
    const searchIcon = document.getElementById('searchIcon');
    const searchPopup = document.getElementById('searchPopup');
    if (searchIcon && searchPopup) {
        searchIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            searchPopup.classList.toggle('active');
        });
        document.addEventListener('click', function(event) {
            if (!searchIcon.contains(event.target) && !searchPopup.contains(event.target)) {
                searchPopup.classList.remove('active');
            }
        });
    }

    // ===== ЭФФЕКТ ПЕЧАТИ ДЛЯ ЗАГОЛОВКОВ (по желанию) =====
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle && !heroTitle.hasAttribute('data-typed')) {
        heroTitle.setAttribute('data-typed', 'true');
        // Небольшой эффект появления для заголовка
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(20px)';
        heroTitle.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        setTimeout(() => {
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }, 200);
    }

});