// main.js — Книжные грани (с динамическими хлебными крошками)

document.addEventListener('DOMContentLoaded', function() {

    // ===== БУРГЕР-МЕНЮ =====
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('nav');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // ===== АВТОМАТИЧЕСКОЕ ЗАКРЫТИЕ МЕНЮ =====
    const navLinks = document.querySelectorAll('#nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
            const openDropdowns = document.querySelectorAll('.dropdown.active');
            openDropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        });
    });
    
    // ===== ЗАКРЫТИЕ МЕНЮ ПРИ КЛИКЕ ВНЕ =====
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = navMenu && navMenu.contains(event.target);
        const isClickOnToggle = menuToggle && menuToggle.contains(event.target);
        
        if (navMenu && navMenu.classList.contains('active') && !isClickInsideMenu && !isClickOnToggle) {
            navMenu.classList.remove('active');
        }
    });
    
    // ===== ДИНАМИЧЕСКАЯ СБОРКА МЕНЮ =====
    const path = window.location.pathname;
    let prefix = '';
    if (path.includes('/boardgames/') || path.includes('/speedcubing/')) {
        prefix = '../';
    }
    
    const navContainer = document.getElementById('nav');
    if (navContainer) {
        const currentFile = path.split('/').pop() || 'index.html';
        
        const menuItems = [
            {
                type: 'simple',
                title: 'Главная',
                icon: 'fas fa-home',
                href: prefix + 'index.html'
            },
            {
                type: 'dropdown',
                title: 'О проекте',
                icon: 'fas fa-info-circle',
                items: [
                    { name: 'О проекте', href: prefix + 'about.html', icon: 'fas fa-info-circle' },
                    { name: 'Организаторы', href: prefix + 'organizers.html', icon: 'fas fa-building' },
                    { name: 'Команда', href: prefix + 'team.html', icon: 'fas fa-users' }
                ]
            },
            {
                type: 'dropdown',
                title: 'Мероприятия',
                icon: 'fas fa-calendar-alt',
                items: [
                    { name: 'Афиша', href: prefix + 'events.html', icon: 'fas fa-calendar-alt' },
                    { name: 'Настольные игры', href: prefix + 'boardgames/index.html', icon: 'fas fa-dice-d6' },
                    { name: 'Спидкубинг', href: prefix + 'speedcubing/index.html', icon: 'fas fa-cube' }
                ]
            },
            {
                type: 'dropdown',
                title: 'Участие',
                icon: 'fas fa-handshake',
                items: [
                    { name: 'Партнёры', href: prefix + 'partners.html', icon: 'fas fa-handshake' },
                    { name: 'Контакты', href: prefix + 'contacts.html', icon: 'fas fa-phone-alt' },
                    { name: 'FAQ', href: prefix + 'faq.html', icon: 'fas fa-question-circle' }
                ]
            }
        ];
        
        let html = '<ul class="desktop-menu">';
        
        menuItems.forEach(item => {
            if (item.type === 'simple') {
                const isActive = (item.href === currentFile);
                html += `<li class="simple-menu-item">
                            <a href="${item.href}" class="${isActive ? 'active' : ''}">
                                <i class="${item.icon}"></i> ${item.title}
                            </a>
                        </li>`;
            } else {
                let isCategoryActive = item.items.some(sub => sub.href === currentFile);
                html += `<li class="dropdown">
                            <div class="dropdown-title ${isCategoryActive ? 'active' : ''}">
                                <i class="${item.icon}"></i> ${item.title} <i class="fas fa-chevron-down"></i>
                            </div>
                            <ul class="dropdown-menu">`;
                item.items.forEach(sub => {
                    const isActive = (sub.href === currentFile);
                    html += `<li><a href="${sub.href}" class="${isActive ? 'active' : ''}">
                                <i class="${sub.icon}"></i> ${sub.name}
                            </a></li>`;
                });
                html += `</ul></li>`;
            }
        });
        
        html += '</ul>';
        navContainer.innerHTML = html;
    }
    
    // ОТКРЫТИЕ ПОДМЕНЮ НА МОБИЛКАХ
    function bindDropdownEvents() {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(function(dropdown) {
            const title = dropdown.querySelector('.dropdown-title');
            if (title && !title.hasListener) {
                title.hasListener = true;
                title.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (dropdown.classList.contains('active')) {
                        dropdown.classList.remove('active');
                    } else {
                        dropdowns.forEach(function(otherDropdown) {
                            otherDropdown.classList.remove('active');
                        });
                        dropdown.classList.add('active');
                    }
                });
            }
        });
    }
    
    bindDropdownEvents();
    
    // ===== ДИНАМИЧЕСКИЕ ХЛЕБНЫЕ КРОШКИ =====
    function generateBreadcrumbs() {
        const currentPath = window.location.pathname;
        const fileName = currentPath.split('/').pop() || 'index.html';
        const isInBoardgames = currentPath.includes('/boardgames/');
        const isInSpeedcubing = currentPath.includes('/speedcubing/');
        
        let breadcrumbs = [
            { name: 'Главная', href: prefix + 'index.html' }
        ];
        
        // Определяем структуру хлебных крошек
        if (isInBoardgames) {
            breadcrumbs.push({ name: 'Настольные игры', href: prefix + 'boardgames/index.html' });
            
            if (fileName === 'catalog.html') {
                breadcrumbs.push({ name: 'Каталог игр', href: null });
            } else if (fileName === 'rules.html') {
                breadcrumbs.push({ name: 'Правила посещения', href: null });
            } else if (fileName === 'news.html') {
                breadcrumbs.push({ name: 'Новости игротеки', href: null });
            }
        } 
        else if (isInSpeedcubing) {
            breadcrumbs.push({ name: 'Спидкубинг', href: prefix + 'speedcubing/index.html' });
            
            if (fileName === 'about-sport.html') {
                breadcrumbs.push({ name: 'Что такое спидкубинг', href: null });
            } else if (fileName === 'levels.html') {
                breadcrumbs.push({ name: 'Уровни обучения', href: null });
            } else if (fileName === 'gallery.html') {
                breadcrumbs.push({ name: 'Фотогалерея', href: null });
            } else if (fileName === 'news.html') {
                breadcrumbs.push({ name: 'Новости спидкубинга', href: null });
            }
        }
        else {
            // Страницы в корне
            if (fileName === 'about.html') {
                breadcrumbs.push({ name: 'О проекте', href: null });
            } else if (fileName === 'organizers.html') {
                breadcrumbs.push({ name: 'О проекте', href: prefix + 'about.html' });
                breadcrumbs.push({ name: 'Организаторы', href: null });
            } else if (fileName === 'team.html') {
                breadcrumbs.push({ name: 'О проекте', href: prefix + 'about.html' });
                breadcrumbs.push({ name: 'Команда', href: null });
            } else if (fileName === 'events.html') {
                breadcrumbs.push({ name: 'Мероприятия', href: null });
            } else if (fileName === 'partners.html') {
                breadcrumbs.push({ name: 'Партнёры', href: null });
            } else if (fileName === 'contacts.html') {
                breadcrumbs.push({ name: 'Контакты', href: null });
            } else if (fileName === 'faq.html') {
                breadcrumbs.push({ name: 'FAQ', href: null });
            }
        }
        
        // Создаём HTML хлебных крошек
        let breadcrumbsHtml = '<div class="breadcrumbs"><ul class="breadcrumbs-list">';
        breadcrumbs.forEach((item, index) => {
            if (item.href) {
                breadcrumbsHtml += `<li class="breadcrumbs-item"><a href="${item.href}" class="breadcrumbs-link">${item.name}</a></li>`;
            } else {
                breadcrumbsHtml += `<li class="breadcrumbs-item"><span class="breadcrumbs-current">${item.name}</span></li>`;
            }
        });
        breadcrumbsHtml += '</ul></div>';
        
        // Вставляем хлебные крошки после открытия section
        const section = document.querySelector('.section');
        if (section && !section.querySelector('.breadcrumbs')) {
            const container = section.querySelector('.container');
            if (container) {
                container.insertAdjacentHTML('afterbegin', breadcrumbsHtml);
            }
        }
    }
    
    generateBreadcrumbs();
    
    // ЛОГОТИП — ССЫЛКА НА ГЛАВНУЮ
    const logo = document.querySelector('.logo a');
    if (logo) {
        logo.href = prefix + 'index.html';
    }
    
    // АНИМАЦИЯ КАРТОЧЕК
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
    
    fadeElements.forEach(el => observer.observe(el));
    
    // FAQ АККОРДЕОН
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');
            
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                if (q.nextElementSibling) q.nextElementSibling.classList.remove('show');
            });
            
            if (!isActive) {
                question.classList.add('active');
                if (answer) answer.classList.add('show');
            }
        });
    });
    
    // КНОПКА НАВЕРХ
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
    
    // ГОД В ПОДВАЛЕ
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    
    // АНИМАЦИЯ ЗАГОЛОВКА
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