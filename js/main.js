// main.js — Книжные грани 

document.addEventListener('DOMContentLoaded', function() {

    // ===== КАТЕГОРИИ МЕНЮ  =====
    const menuCategories = [
        {
            title: 'О проекте',
            icon: 'fas fa-info-circle',
            items: [
                { name: 'О проекте', href: 'about.html', icon: 'fas fa-info-circle' },
                { name: 'Организаторы', href: 'organizers.html', icon: 'fas fa-building' },
                { name: 'Команда', href: 'team.html', icon: 'fas fa-users' }
            ]
        },
        {
            title: 'Мероприятия',
            icon: 'fas fa-calendar-alt',
            items: [
                { name: 'Афиша', href: 'events.html', icon: 'fas fa-calendar-alt' },
                { name: 'Настольные игры', href: 'board-games/index.html', icon: 'fas fa-dice-d6' },
                { name: 'Спидкубинг', href: 'speedcubing/index.html', icon: 'fas fa-cube' }
            ]
        },
        {
            title: 'Участие',
            icon: 'fas fa-handshake',
            items: [
                { name: 'Партнёры', href: 'partners.html', icon: 'fas fa-handshake' },
                { name: 'Контакты', href: 'contacts.html', icon: 'fas fa-phone-alt' },
                { name: 'FAQ', href: 'faq.html', icon: 'fas fa-question-circle' }
            ]
        }
    ];

    // ===== ПОСТРОЕНИЕ МЕНЮ (ДЕСКТОП/МОБИЛЬНОЕ) =====
    const nav = document.getElementById('nav');
    const menuToggle = document.getElementById('menuToggle');

    function buildDesktopMenu() {
        if (!nav) return;
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        let html = '<ul class="desktop-horizontal-menu">';
        menuCategories.forEach(cat => {
            let isCategoryActive = cat.items.some(item => item.href === currentPath);
            html += `<li class="desktop-category">
                        <div class="desktop-category-header ${isCategoryActive ? 'active' : ''}">
                            <i class="${cat.icon}"></i> ${cat.title} <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="desktop-category-content">`;
            cat.items.forEach(item => {
                const isActive = (item.href === currentPath);
                html += `<li><a href="${item.href}" class="${isActive ? 'active' : ''}"><i class="${item.icon}"></i> ${item.name}</a></li>`;
            });
            html += `</ul></li>`;
        });
        html += `</ul>`;
        nav.innerHTML = html;

        // Логика раскрытия по ховеру
        const categories = nav.querySelectorAll('.desktop-category');
        let closeTimeout;
        categories.forEach(category => {
            category.addEventListener('mouseenter', function() {
                if (closeTimeout) clearTimeout(closeTimeout);
                categories.forEach(cat => { if (cat !== this) cat.classList.remove('open'); });
                this.classList.add('open');
            });
            category.addEventListener('mouseleave', function() {
                closeTimeout = setTimeout(() => { this.classList.remove('open'); }, 300);
            });
        });
    }

    function buildMobileMenu() {
        if (!nav) return;
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        let html = '<ul class="mobile-accordion">';
        menuCategories.forEach(cat => {
            html += `<li class="accordion-category">
                        <div class="accordion-header">
                            <i class="${cat.icon}"></i> ${cat.title} <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="accordion-content">`;
            cat.items.forEach(item => {
                const isActive = (item.href === currentPath);
                html += `<li><a href="${item.href}" class="${isActive ? 'active' : ''}"><i class="${item.icon}"></i> ${item.name}</a></li>`;
            });
            html += `</ul></li>`;
        });
        html += `</ul>`;
        nav.innerHTML = html;

        const headers = nav.querySelectorAll('.accordion-header');
        headers.forEach(header => {
            header.addEventListener('click', function(e) {
                e.preventDefault();
                const parent = this.closest('.accordion-category');
                parent.classList.toggle('open');
                const icon = this.querySelectorAll('i')[1];
                icon.style.transform = parent.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
            });
        });
    }

    function handleResize() {
        if (window.innerWidth <= 768) {
            buildMobileMenu();
        } else {
            buildDesktopMenu();
            if (nav && nav.classList.contains('active')) nav.classList.remove('active');
        }
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                nav.classList.toggle('active');
                if (nav.classList.contains('active')) buildMobileMenu();
            } else {
                nav.classList.toggle('active');
            }
        });
    }

    // ===== ПОИСК В ШАПКЕ =====
    const searchIcon = document.getElementById('searchIcon');
    const searchPopup = document.getElementById('searchPopup');
    if (searchIcon && searchPopup) {
        searchIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            searchPopup.classList.toggle('active');
            const searchInput = searchPopup.querySelector('input[type="text"]');
            if (searchInput && searchPopup.classList.contains('active')) {
                setTimeout(() => searchInput.focus(), 100);
            }
        });
        document.addEventListener('click', function(event) {
            if (!searchIcon.contains(event.target) && !searchPopup.contains(event.target)) {
                searchPopup.classList.remove('active');
            }
        });
    }

    // ===== FAQ АККОРДЕОН =====
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

    // ===== КНОПКА "НАВЕРХ" =====
    function initBackToTop() {
        const backBtn = document.createElement('a');
        backBtn.href = '#';
        backBtn.className = 'back-to-top';
        backBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        document.body.appendChild(backBtn);
        
        backBtn.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            background: linear-gradient(135deg, #e5989b, #b5838d);
            color: #fff; width: 50px; height: 50px;
            border-radius: 50%; display: flex;
            align-items: center; justify-content: center;
            text-decoration: none; font-size: 24px;
            opacity: 0; visibility: hidden;
            transition: all 0.3s ease; z-index: 99999;
            cursor: pointer; border: none;
        `;
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 100) {
                backBtn.style.opacity = '1';
                backBtn.style.visibility = 'visible';
            } else {
                backBtn.style.opacity = '0';
                backBtn.style.visibility = 'hidden';
            }
        });
        
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    initBackToTop();

    // ===== ТЕКУЩИЙ ГОД В ПОДВАЛЕ =====
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

});
