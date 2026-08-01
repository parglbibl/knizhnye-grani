import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Cube } from 'three-cube';

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    // Загружаем текстуры
    const textureLoader = new THREE.TextureLoader();
    const texturePaths = {
        red: '../images/cube_textures/red.jpg',
        blue: '../images/cube_textures/blue.jpg',
        yellow: '../images/cube_textures/yellow.jpg',
        green: '../images/cube_textures/green.jpg',
        white: '../images/cube_textures/white.jpg',
        orange: '../images/cube_textures/orange.jpg'
    };
    
    const textures = {};
    Object.keys(texturePaths).forEach(key => {
        textures[key] = textureLoader.load(texturePaths[key]);
    });

    // Инициализация кубика
    const cube = new Cube(container, {
        size: 180, // Размер в пикселях (будет масштабироваться в контейнере 580px)
        colors: {
            white: textures.white || '#ffffff',
            yellow: textures.yellow || '#ffff00',
            red: textures.red || '#ff0000',
            orange: textures.orange || '#ff8c00',
            blue: textures.blue || '#0000ff',
            green: textures.green || '#00ff00'
        },
        allowRotation: true,
        perspective: 500,
        onFaceClick: (face) => {
            // Определяем цвет и координаты грани
            const color = face.color;
            // Определяем позицию грани на кубике (от 0 до 2 по каждой оси)
            // face.index — это индекс грани (0-5), но нам нужны координаты X и Y (0, 1, 2)
            // Для упрощения будем использовать случайные координаты для теста,
            // но в реальности нужно сопоставить face.index с координатами.
            // Для теста используем заглушку, которая имитирует реальные ID.
            const x = Math.floor(Math.random() * 3);
            const y = Math.floor(Math.random() * 3);
            const id = color + '_' + x + '_' + y + '_1';
            
            const question = questionsDB[id] || 'Для этого квадратика пока нет вопроса. Придумай свой!';
            if (window.openBookGran) {
                window.openBookGran(id, color, question);
            }
        }
    });

    // Кнопка «Перемешать»
    document.getElementById('btnScramble').addEventListener('click', () => {
        if (cube.isAnimating) return;
        document.getElementById('btnScramble').style.display = 'none';
        document.getElementById('btnSolve').style.display = 'inline-block';
        
        // 20 ходов по 250мс (ровно 5 секунд)
        cube.scramble(20, 250, () => {});
    });

    // Кнопка «Собрать»
    document.getElementById('btnSolve').addEventListener('click', () => {
        if (cube.isAnimating) return;
        document.getElementById('btnSolve').style.display = 'none';
        document.getElementById('btnScramble').style.display = 'inline-block';
        
        cube.solve(250, () => {});
    });
}
