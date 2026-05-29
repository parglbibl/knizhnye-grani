// main.js — Книжные грани

document.addEventListener('DOMContentLoaded', function() {

    // ===== КАТЕГОРИИ МЕНЮ =====
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
                { name: 'Настольные игры', href: 'boardgames/index.html', icon: 'fas fa-dice-d6' },
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

    // ===== ПОСТРОЕНИЕ МЕНЮ =====
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

    // ===== ТЕКУЩИЙ ГОД В ПОДВАЛЕ =====
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

});
