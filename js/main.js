// main.js — Книжные грани (Premium Editorial Design)

document.addEventListener('DOMContentLoaded', function() {

    // ===== ДОБАВЛЯЕМ СЕТКУ АВТОМАТИЧЕСКИ =====
    (function() {
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

    // ===== ПЛАВНОЕ ПОЯВЛЕНИЕ КАРТОЧЕК ПРИ СКРОЛЛЕ =====
    const fadeElements = document.querySelectorAll('.event-card, .direction-card, .team-card, .partner-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(25px)';
        el.style.transition = 'opacity 0.5s cubic-bezier(0.2, 0.9, 0.4, 1), transform 0.5s cubic-bezier(0.2, 0.9, 0.4, 1)';
        observer.observe(el);
    });

    // ===== ЛЁГКИЙ GLITCH ПРИ НАВЕДЕНИИ НА КНОПКИ =====
    const glitchBtns = document.querySelectorAll('.btn');
    glitchBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
        });
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

    // ===== АНИМАЦИЯ ПОЯВЛЕНИЯ ЗАГОЛОВКА =====
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle && !heroTitle.hasAttribute('data-animated')) {
        heroTitle.setAttribute('data-animated', 'true');
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(20px)';
        heroTitle.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        setTimeout(() => {
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }, 200);
    }

});