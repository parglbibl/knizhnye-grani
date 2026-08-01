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

    // Инициализация кубика через библиотеку three-cube
    const cube = new Cube(container, {
        size: 220, // Размер кубика в пикселях (будет масштабироваться)
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
            // Библиотека возвращает face с уникальным ID!
            // Формат ID: "cube_face_цвет_индекс"
            // Индекс 0..5 соответствует порядку: +X, -X, +Y, -Y, +Z, -Z
            const color = face.color;
            const idx = face.index; // 0..5
            
            // Генерируем стабильный ID
            const id = `face_${color}_${idx}`;
            
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
        
        cube.scramble(23, 220, () => {});
    });

    // Кнопка «Собрать»
    document.getElementById('btnSolve').addEventListener('click', () => {
        if (cube.isAnimating) return;
        document.getElementById('btnSolve').style.display = 'none';
        document.getElementById('btnScramble').style.display = 'inline-block';
        
        cube.solve(220, () => {});
    });

    // Экспорт для доступа из HTML (если понадобится)
    window.cubeObject = cube;
}