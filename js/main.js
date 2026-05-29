// main.js — Книжные грани

document.addEventListener('DOMContentLoaded', function() {

    // ===== МЕНЮ С ВЫПАДАЮЩИМИ СПИСКАМИ =====
    const nav = document.getElementById('nav');
    const menuToggle = document.getElementById('menuToggle');

    if (nav) {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        
        // ГЛАВНЫЕ КАТЕГОРИИ И ПУНКТЫ
        const menuData = [
            {
                title: 'О проекте',
                icon: 'fas fa-info-circle',
                items: [
                    { name: 'О проекте', href: 'about.html' },
                    { name: 'Организаторы', href: 'organizers.html' },
                    { name: 'Команда', href: 'team.html' }
                ]
            },
            {
                title: 'Мероприятия',
                icon: 'fas fa-calendar-alt',
                items: [
                    { name: 'Афиша', href: 'events.html' },
                    { name: 'Настольные игры', href: 'boardgames/index.html' },
                    { name: 'Спидкубинг', href: 'speedcubing/index.html' }
                ]
            },
            {
                title: 'Участие',
                icon: 'fas fa-handshake',
                items: [
                    { name: 'Партнёры', href: 'partners.html' },
                    { name: 'Контакты', href: 'contacts.html' },
                    { name: 'FAQ', href: 'faq.html' }
                ]
            }
        ];

        let html = '<ul class="desktop-menu">';
        
        menuData.forEach(cat => {
            // Проверяем, активна ли категория
            let isActive = false;
            cat.items.forEach(item => {
                if (item.href === currentPath || (currentPath === '' && item.href === 'index.html')) {
                    isActive = true;
                }
            });
            
            html += `<li class="dropdown">
                        <div class="dropdown-title ${isActive ? 'active' : ''}">
                            <i class="${cat.icon}"></i> ${cat.title} <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="dropdown-menu">`;
            
            cat.items.forEach(item => {
                const activeClass = (item.href === currentPath) ? 'active' : '';
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

    // ===== ТЕКУЩИЙ ГОД =====
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

});