// main.js — Книжные грани (без иконок в подменю)

document.addEventListener('DOMContentLoaded', function() {

    // БУРГЕР-МЕНЮ
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('nav');
    let overlay = document.querySelector('.menu-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
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
                    dropdown.classList.toggle('active');
                });
            }
        });
    }
    
    // ПОИСК
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
    
    // ЛОГОТИП — ССЫЛКА НА ГЛАВНУЮ
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
    
    // ДИНАМИЧЕСКАЯ СБОРКА МЕНЮ
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