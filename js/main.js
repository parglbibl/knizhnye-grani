// main.js — Книжные грани (финальная версия)

document.addEventListener('DOMContentLoaded', function() {

    // ===== БУРГЕР-МЕНЮ С ЗАТЕМНЕНИЕМ =====
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('nav');
    
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        overlay.addEventListener('click', function() {
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('menu-open');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Открытие подменю на мобилках
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(function(dropdown) {
        const title = dropdown.querySelector('.dropdown-title');
        if (title) {
            title.addEventListener('click', function(e) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            });
        }
    });

    // ===== ПОИСК =====
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

    // ===== ССЫЛКА НА ГЛАВНУЮ ДЛЯ ЛОГОТИПА =====
    const path = window.location.pathname;
    let prefix = '';
    if (path.includes('/boardgames/') || path.includes('/speedcubing/')) {
        prefix = '../';
    }

    const logo = document.querySelector('.logo');
    if (logo && !logo.querySelector('a')) {
        const link = document.createElement('a');
        link.href = prefix + 'index.html';
        link.style.display = 'flex';
        link.style.alignItems = 'center';
        link.style.gap = '0.75rem';
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';
        while (logo.firstChild) {
            link.appendChild(logo.firstChild);
        }
        logo.appendChild(link);
    }

    // ===== МЕНЮ (ДИНАМИЧЕСКАЯ СБОРКА) =====
    const navContainer = document.getElementById('nav');
    if (navContainer) {
        const currentFile = path.split('/').pop() || 'index.html';
        
        const menuData = [
            {
                title: 'Главная',
                icon: 'fas fa-home',
                items: [
                    { name: 'Главная', href: prefix + 'index.html' }
                ]
            },
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
            let isCategoryActive = cat.items.some(item => item.href === currentFile);
            html += `<li class="dropdown">
                        <div class="dropdown-title ${isCategoryActive ? 'active' : ''}">
                            <i class="${cat.icon}"></i> ${cat.title} <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="dropdown-menu">`;
            cat.items.forEach(item => {
                const isActive = (item.href === currentFile);
                html += `<li><a href="${item.href}" class="${isActive ? 'active' : ''}">${item.name}</a></li>`;
            });
            html += `</ul></li>`;
        });
        
        html += '</ul>';
        navContainer.innerHTML = html;
    }

    // ===== АНИМАЦИЯ ПОЯВЛЕНИЯ КАРТОЧЕК С ЗАДЕРЖКОЙ (ЛЕСЕНКА) =====
    const fadeElements = document.querySelectorAll('.event-card, .direction-card, .team-card, .partner-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    fadeElements.forEach(el => {
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
        
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backBtn.classList.add('show');
            } else {
                backBtn.classList.remove('show');
            }
        });
        
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    initBackToTop();

    // ===== ТЕКУЩИЙ ГОД В ПОДВАЛЕ =====
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ===== АНИМАЦИЯ ЗАГОЛОВКА =====
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