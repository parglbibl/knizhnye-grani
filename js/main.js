// main.js — Книжные грани (с правильными путями для любого уровня)

document.addEventListener('DOMContentLoaded', function() {

    // ===== ОПРЕДЕЛЯЕМ ГЛУБИНУ ВЛОЖЕННОСТИ =====
    const path = window.location.pathname;
    let prefix = '';
    
    // Если мы в подпапке (например, /boardgames/ или /speedcubing/)
    if (path.includes('/boardgames/') || path.includes('/speedcubing/')) {
        prefix = '../';
    }

    const nav = document.getElementById('nav');
    const menuToggle = document.getElementById('menuToggle');

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

    // ===== ТЕКУЩИЙ ГОД =====
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

});