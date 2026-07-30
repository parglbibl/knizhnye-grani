document.addEventListener('DOMContentLoaded', function() {
    function addFavicon() {
        if (document.querySelector('link[rel="icon"][type="image/x-icon"]')) return;
        const links = [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' },
            { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png' },
            { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png' },
            { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
            { rel: 'manifest', href: '/favicon/site.webmanifest' }
        ];
        links.forEach(linkData => {
            const link = document.createElement('link');
            Object.keys(linkData).forEach(key => {
                link.setAttribute(key, linkData[key]);
            });
            document.head.appendChild(link);
        });
        const metaTags = [
            { name: 'msapplication-TileColor', content: '#ff2e5a' },
            { name: 'theme-color', content: '#fef9f0' }
        ];
        metaTags.forEach(metaData => {
            const meta = document.createElement('meta');
            Object.keys(metaData).forEach(key => {
                meta.setAttribute(key, metaData[key]);
            });
            document.head.appendChild(meta);
        });
    }

    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('nav');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

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

    document.addEventListener('click', function(event) {
        const isClickInsideMenu = navMenu && navMenu.contains(event.target);
        const isClickOnToggle = menuToggle && menuToggle.contains(event.target);
        if (navMenu && navMenu.classList.contains('active') && !isClickInsideMenu && !isClickOnToggle) {
            navMenu.classList.remove('active');
        }
    });

    const path = window.location.pathname;
    let prefix = '';
    if (path.includes('/boardgames/') || path.includes('/speedcubing/') || path.includes('/events/')) {
        prefix = '../';
    }
    
    const navContainer = document.getElementById('nav');
    if (navContainer) {
        const currentFile = path.split('/').pop() || 'index.html';
        const menuItems = [
            { type: 'simple', title: 'Главная', icon: 'fas fa-home', href: prefix + 'index.html' },
            {
                type: 'dropdown', title: 'О проекте', icon: 'fas fa-info-circle',
                items: [
                    { name: 'О проекте', href: prefix + 'about.html', icon: 'fas fa-info-circle' },
                    { name: 'Организаторы', href: prefix + 'organizers.html', icon: 'fas fa-building' },
                    { name: 'Команда', href: prefix + 'team.html', icon: 'fas fa-users' }
                ]
            },
            {
                type: 'dropdown', title: 'Мероприятия', icon: 'fas fa-calendar-alt',
                items: [
                    { name: 'Афиша', href: prefix + 'events.html', icon: 'fas fa-calendar-alt' },
                    { name: 'Настольные игры', href: prefix + 'boardgames/index.html', icon: 'fas fa-dice-d6' },
                    { name: 'Спидкубинг', href: prefix + 'speedcubing/index.html', icon: 'fas fa-cube' }
                ]
            },
            {
                type: 'dropdown', title: 'Новости', icon: 'fas fa-newspaper',
                items: [
                    { name: 'Новости', href: prefix + 'news.html', icon: 'fas fa-newspaper' }
                ]
            },
            {
                type: 'dropdown', title: 'Фотоотчёты', icon: 'fas fa-images',
                items: [
                    { name: 'Все фото', href: prefix + 'gallery.html', icon: 'fas fa-images' }
                ]
            },
            {
                type: 'dropdown', title: 'Участие', icon: 'fas fa-handshake',
                items: [
                    { name: 'Партнёры', href: prefix + 'partners.html', icon: 'fas fa-handshake' },
                    { name: 'Контакты', href: prefix + 'contacts.html', icon: 'fas fa-phone-alt' },
                    { name: 'Обратная связь', href: prefix + 'feedback.html', icon: 'fas fa-envelope' },
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

    function generateBreadcrumbs() {
        const currentPath = window.location.pathname;
        const fileName = currentPath.split('/').pop() || 'index.html';
        if (fileName === 'index.html' || fileName === '' || currentPath.endsWith('/')) {
            return;
        }
        const isInBoardgames = currentPath.includes('/boardgames/');
        const isInSpeedcubing = currentPath.includes('/speedcubing/');
        const isInEvents = currentPath.includes('/events/');
        let breadcrumbs = [ { name: 'Главная', href: prefix + 'index.html' } ];
        if (isInBoardgames) {
            breadcrumbs.push({ name: 'Настольные игры', href: prefix + 'boardgames/index.html' });
            if (fileName === 'catalog.html') breadcrumbs.push({ name: 'Каталог игр', href: null });
            else if (fileName === 'rules.html') breadcrumbs.push({ name: 'Правила посещения', href: null });
        } else if (isInSpeedcubing) {
            breadcrumbs.push({ name: 'Спидкубинг', href: prefix + 'speedcubing/index.html' });
            if (fileName === 'about-sport.html') breadcrumbs.push({ name: 'Что такое спидкубинг', href: null });
            else if (fileName === 'levels.html') breadcrumbs.push({ name: 'Уровни обучения', href: null });
        } else if (isInEvents) {
            breadcrumbs.push({ name: 'Мероприятия', href: prefix + 'events.html' });
            const urlParams = new URLSearchParams(window.location.search);
            const eventId = urlParams.get('id');
            if (eventId) {
                const eventNames = { 'summer-party': 'Игротека «Книжные грани»' };
                const eventName = eventNames[eventId] || 'Событие';
                breadcrumbs.push({ name: eventName, href: null });
            }
        } else {
            if (fileName === 'about.html') breadcrumbs.push({ name: 'О проекте', href: null });
            else if (fileName === 'organizers.html') { breadcrumbs.push({ name: 'О проекте', href: prefix + 'about.html' }); breadcrumbs.push({ name: 'Организаторы', href: null }); }
            else if (fileName === 'team.html') { breadcrumbs.push({ name: 'О проекте', href: prefix + 'about.html' }); breadcrumbs.push({ name: 'Команда', href: null }); }
            else if (fileName === 'events.html') breadcrumbs.push({ name: 'Мероприятия', href: null });
            else if (fileName === 'partners.html') breadcrumbs.push({ name: 'Партнёры', href: null });
            else if (fileName === 'contacts.html') breadcrumbs.push({ name: 'Контакты', href: null });
            else if (fileName === 'faq.html') breadcrumbs.push({ name: 'FAQ', href: null });
            else if (fileName === 'feedback.html') breadcrumbs.push({ name: 'Обратная связь', href: null });
            else if (fileName === 'gallery.html') breadcrumbs.push({ name: 'Фотоотчёты', href: null });
            else if (fileName === 'news.html') breadcrumbs.push({ name: 'Новости', href: null });
        }
        let breadcrumbsHtml = '<div class="breadcrumbs"><ul class="breadcrumbs-list">';
        breadcrumbs.forEach((item, index) => {
            if (item.href) {
                breadcrumbsHtml += `<li class="breadcrumbs-item"><a href="${item.href}" class="breadcrumbs-link">${item.name}</a></li>`;
            } else {
                breadcrumbsHtml += `<li class="breadcrumbs-item"><span class="breadcrumbs-current">${item.name}</span></li>`;
            }
        });
        breadcrumbsHtml += '</ul></div>';
        const section = document.querySelector('.section');
        if (section && !section.querySelector('.breadcrumbs')) {
            const container = section.querySelector('.container');
            if (container) {
                container.insertAdjacentHTML('afterbegin', breadcrumbsHtml);
            }
        }
    }
    generateBreadcrumbs();

    const logo = document.querySelector('.logo a');
    if (logo) {
        logo.href = prefix + 'index.html';
    }

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

    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (question && answer) {
            question.addEventListener('click', () => {
                const isActive = question.classList.contains('active');
                faqItems.forEach(otherItem => {
                    const otherQuestion = otherItem.querySelector('.faq-question');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherQuestion && otherAnswer && otherQuestion !== question) {
                        otherQuestion.classList.remove('active');
                        otherAnswer.classList.remove('show');
                    }
                });
                if (!isActive) {
                    question.classList.add('active');
                    answer.classList.add('show');
                } else {
                    question.classList.remove('active');
                    answer.classList.remove('show');
                }
            });
        }
    });

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

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

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

    const slider = document.getElementById('archiveSlider');
    const prevBtn = document.querySelector('.archive-arrow.prev');
    const nextBtn = document.querySelector('.archive-arrow.next');
    const countEl = document.getElementById('archiveCount');
    const modal = document.getElementById('archiveModal');
    const closeBtn = document.getElementById('archiveModalClose');
    const modalBody = document.getElementById('archiveModalBody');
    
    window.closeModalAndGo = function(event, url) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        if (url) {
            window.location.href = url;
        }
        if (event) {
            event.preventDefault();
        }
    };
    
    window.closeModal = function() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };
    
    if (slider && prevBtn && nextBtn && !slider._initialized) {
        slider._initialized = true;
        const cardWidth = 200 + 16;
        const cards = slider.querySelectorAll('.archive-card');
        if (countEl) {
            const count = cards.length;
            const word = count === 1 ? 'мероприятие' : (count < 5 ? 'мероприятия' : 'мероприятий');
            countEl.textContent = count + ' ' + word;
        }
        nextBtn.addEventListener('click', function() {
            slider.scrollBy({ left: cardWidth * 2, behavior: 'smooth' });
        });
        prevBtn.addEventListener('click', function() {
            slider.scrollBy({ left: -cardWidth * 2, behavior: 'smooth' });
        });
        const archiveData = {
            '17 июня': { title: 'Игротека «Книжные грани»', date: '17 июня 2026', image: 'images/afisha/afisha1706.jpg', description: 'Первая летняя игротека в Библиотеке-мастерской. Мастер-класс по сборке кубика Рубика и большая игротека от Hobby World.', link: '/events/detail.html?id=summer-party', gallery: '/gallery.html' },
            '1 июля': { title: 'Игротека «Книжные грани»', date: '1 июля 2026', image: 'images/afisha/afisha0107.PNG', description: 'Большая игротека от Hobby World. Десятки настольных игр на любой вкус. Приходите один или с друзьями — найдём компанию!', link: '/events/detail.html?id=july-party', gallery: '/gallery.html' },
            '22 июля': { title: 'Игротека «Книжные грани»', date: '22 июля 2026', image: 'images/afisha/afisha2207.PNG', description: 'В библиотеке «Мастерская» продолжает работу пространство с головоломками и настолками для детей и подростков. Вас ждут две площадки: мастер-класс по сборке кубика Рубика (6+) от тренера, который покажет секреты и алгоритмы сборки на скорость, и тестирование головоломок от CCCstore. Приходите, чтобы первыми оценить новинку и повлиять на финальный результат тестирования!', link: '/events/detail.html?id=july-22', gallery: '/gallery.html' }
        };
        window.openArchiveModal = function(eventKey) {
            const data = archiveData[eventKey];
            if (!data) return;
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="archive-modal-image"><img src="${data.image}" alt="${data.title}"></div>
                    <div class="archive-modal-date">📅 ${data.date}</div>
                    <h2 class="archive-modal-title">${data.title}</h2>
                    <p class="archive-modal-desc">${data.description}</p>
                    <div class="archive-modal-actions">
                        <a href="${data.gallery}" class="btn btn-sm" target="_blank" onclick="closeModalAndGo(event, '${data.gallery}')">📸 Смотреть фотоотчёт</a>
                        <a href="${data.link}" class="btn btn-sm" onclick="closeModalAndGo(event, '${data.link}')">📝 Подробнее</a>
                    </div>
                `;
            }
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        };
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
        document.querySelectorAll('.archive-card').forEach(card => {
            card.addEventListener('click', function() {
                const eventName = this.dataset.event;
                if (eventName && archiveData[eventName]) {
                    window.openArchiveModal(eventName);
                }
            });
        });
    }
    addFavicon();
});