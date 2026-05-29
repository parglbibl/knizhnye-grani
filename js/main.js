document.addEventListener('DOMContentLoaded', function() {

    // Меню
    const nav = document.getElementById('nav');
    const menuToggle = document.getElementById('menuToggle');

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
                if (targetFile === currentFile) {
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

    // Бургер
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }

    // FAQ
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
                if (answer) answer.classList.add('show');
            }
        });
    });

    // Кнопка наверх
    const backBtn = document.createElement('a');
    backBtn.href = '#';
    backBtn.className = 'back-to-top';
    backBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    document.body.appendChild(backBtn);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backBtn.classList.add('show');
        } else {
            backBtn.classList.remove('show');
        }
    });
    
    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Год в подвале
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Поиск
    const searchIcon = document.getElementById('searchIcon');
    const searchPopup = document.getElementById('searchPopup');
    if (searchIcon && searchPopup) {
        searchIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            searchPopup.classList.toggle('active');
        });
        document.addEventListener('click', (event) => {
            if (!searchIcon.contains(event.target) && !searchPopup.contains(event.target)) {
                searchPopup.classList.remove('active');
            }
        });
    }

});