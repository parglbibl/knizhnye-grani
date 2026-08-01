import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    function getContainerSize() {
        const rect = container.getBoundingClientRect();
        return Math.min(rect.width, rect.height);
    }

    const size = getContainerSize();
    if (size === 0) {
        requestAnimationFrame(function wait() {
            const newSize = getContainerSize();
            if (newSize === 0) {
                requestAnimationFrame(wait);
            } else {
                initCube(newSize);
            }
        });
    } else {
        initCube(size);
    }

    function initCube(size) {
        // ============================
        // 1. Базовые настройки сцены
        // ============================
        const scene = new THREE.Scene();
        scene.background = null;

        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
        camera.position.set(3.5, 2.5, 4.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(size, size);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const cubeGroup = new THREE.Group();
        scene.add(cubeGroup);

        // ============================
        // 2. Текстуры и материалы
        // ============================
        const textureLoader = new THREE.TextureLoader();
        const texturePaths = {
            red: '../images/cube_textures/red.jpg',
            blue: '../images/cube_textures/blue.jpg',
            yellow: '../images/cube_textures/yellow.jpg',
            green: '../images/cube_textures/green.jpg',
            white: '../images/cube_textures/white.jpg',
            orange: '../images/cube_textures/orange.jpg'
        };
        const loadTexture = (url) => {
            const tex = textureLoader.load(url);
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            return tex;
        };

        const matConfig = { roughness: 0.9, metalness: 0.0 };
        const textures = {
            red: loadTexture(texturePaths.red),
            blue: loadTexture(texturePaths.blue),
            yellow: loadTexture(texturePaths.yellow),
            green: loadTexture(texturePaths.green),
            white: loadTexture(texturePaths.white),
            orange: loadTexture(texturePaths.orange)
        };
        const createMat = (color) => new THREE.MeshStandardMaterial({ map: textures[color], ...matConfig });
        const createGlowMat = (color, emissiveHex) => new THREE.MeshStandardMaterial({ 
            map: textures[color], roughness: 0.3, metalness: 0.2, emissive: emissiveHex, emissiveIntensity: 0.25 
        });

        // ============================
        // 3. Создание кубиков
        // ============================
        const offset = 1.05;
        const sizeCubie = 0.95;
        const radius = 0.08;
        const segments = 4;

        // Словарь для быстрого поиска материалов
        const matLib = {
            red: createMat('red'), blue: createMat('blue'), yellow: createMat('yellow'),
            green: createMat('green'), white: createMat('white'), orange: createMat('orange')
        };
        const glowLib = {
            red: createGlowMat('red', 0xc41e3a), blue: createGlowMat('blue', 0x0051ba),
            yellow: createGlowMat('yellow', 0xffd700), green: createGlowMat('green', 0x009e60),
            white: createGlowMat('white', 0xffffff), orange: createGlowMat('orange', 0xff8c00)
        };

        const allCubies = []; // Все 26 кубиков
        const centerColors = {}; // Для фиксации центров { 'x1': 'red', ... }

        function getFaceName(x, y, z, face) {
            // face: 'right', 'left', 'top', 'bottom', 'front', 'back'
            const map = {
                'right': x === 1 ? 'red' : null,
                'left': x === -1 ? 'orange' : null,
                'top': y === 1 ? 'white' : null,
                'bottom': y === -1 ? 'yellow' : null,
                'front': z === 1 ? 'green' : null,
                'back': z === -1 ? 'blue' : null
            };
            return map[face];
        }

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    // Пропускаем центр
                    if (x === 0 && y === 0 && z === 0) continue;

                    const isCenter = (x === 0 && y === 0) || (x === 0 && z === 0) || (y === 0 && z === 0);
                    
                    // Материалы для 6 граней кубика: [+x, -x, +y, -y, +z, -z]
                    const faces = [
                        x === 1 ? 'red' : (x === -1 ? 'orange' : null),
                        x === -1 ? 'orange' : (x === 1 ? 'red' : null),
                        y === 1 ? 'white' : (y === -1 ? 'yellow' : null),
                        y === -1 ? 'yellow' : (y === 1 ? 'white' : null),
                        z === 1 ? 'green' : (z === -1 ? 'blue' : null),
                        z === -1 ? 'blue' : (z === 1 ? 'green' : null)
                    ];
                    const mats = faces.map(f => f ? matLib[f] : matLib['red']);

                    const geometry = new RoundedBoxGeometry(sizeCubie, sizeCubie, sizeCubie, segments, radius);
                    const cubie = new THREE.Mesh(geometry, mats);
                    cubie.position.set(x * offset, y * offset, z * offset);
                    cubeGroup.add(cubie);

                    // Сохраняем информацию о кубике
                    cubie.userData = {
                        isCenter: isCenter,
                        gridX: x, gridY: y, gridZ: z,
                        faces: faces, // массив из 6 цветов (или null)
                        mats: mats,
                        originalPos: new THREE.Vector3(x * offset, y * offset, z * offset),
                        // Уникальный ID для этого кубика (для подсветки)
                        id: `cube_${x}_${y}_${z}`
                    };

                    // Если это центр, запоминаем его цвет для оси
                    if (isCenter) {
                        if (x === 1) centerColors['x1'] = 'red';
                        else if (x === -1) centerColors['x-1'] = 'orange';
                        else if (y === 1) centerColors['y1'] = 'white';
                        else if (y === -1) centerColors['y-1'] = 'yellow';
                        else if (z === 1) centerColors['z1'] = 'green';
                        else if (z === -1) centerColors['z-1'] = 'blue';
                    }

                    allCubies.push(cubie);
                }
            }
        }

        // ============================
        // 4. Свет
        // ============================
        const ambientLight = new THREE.AmbientLight(0x606080, 0.6);
        scene.add(ambientLight);
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
        mainLight.position.set(2, 4, 3);
        scene.add(mainLight);
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-2, 1, 2);
        scene.add(fillLight);
        const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
        backLight.position.set(0, 1, -3);
        scene.add(backLight);

        // ============================
        // 5. Вращение слоёв (Сердце движка)
        // ============================
        // Очередь анимаций
        let animationQueue = [];
        let isAnimating = false;

        function getCubiesInLayer(axis, index) {
            // axis: 'x', 'y', 'z'
            // index: -1, 0, 1 (слой: -1, 0, +1)
            const result = [];
            allCubies.forEach(cubie => {
                const pos = cubie.position.clone();
                // Применяем обратное вращение группы, чтобы получить локальные координаты
                // В данном случае используем raw позицию, так как кубик не вращался
                // Но после скрамбла позиции меняются. Нам нужно получить "координату" кубика.
                // В идеале нужно хранить "сеточную" координату, но мы можем использовать округление позиции.
                // Так как offset = 1.05, то позиции будут кратны 1.05.
                const gx = Math.round(pos.x / offset);
                const gy = Math.round(pos.y / offset);
                const gz = Math.round(pos.z / offset);
                
                let match = false;
                if (axis === 'x' && gx === index) match = true;
                else if (axis === 'y' && gy === index) match = true;
                else if (axis === 'z' && gz === index) match = true;

                if (match) result.push(cubie);
            });
            return result;
        }

        function rotateLayer(axis, index, angle, duration, callback) {
            // axis: 'x', 'y', 'z'
            // index: -1, 0, 1
            // angle: Math.PI / 2 (90 градусов) или -Math.PI / 2
            // duration: время анимации в мс

            const cubies = getCubiesInLayer(axis, index);
            if (cubies.length === 0) { if (callback) callback(); return; }

            // Создаем временную группу
            const tempGroup = new THREE.Group();
            scene.add(tempGroup);

            // Перемещаем кубики во временную группу (сохраняя мировые позиции)
            cubies.forEach(cubie => {
                const worldPos = new THREE.Vector3();
                const worldQuat = new THREE.Quaternion();
                cubie.getWorldPosition(worldPos);
                cubie.getWorldQuaternion(worldQuat);
                scene.remove(cubie);
                tempGroup.add(cubie);
                cubie.position.copy(worldPos);
                cubie.quaternion.copy(worldQuat);
            });

            // Определяем ось вращения
            const rotAxis = new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
            
            // Анимация
            const startTime = Date.now();
            const startQuat = tempGroup.quaternion.clone();
            const endQuat = new THREE.Quaternion().setFromAxisAngle(rotAxis, angle);
            endQuat.multiply(startQuat);

            function animateRotation() {
                const elapsed = Date.now() - startTime;
                const t = Math.min(elapsed / duration, 1);
                // Ease-in-out
                const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                tempGroup.quaternion.slerpQuaternions(startQuat, endQuat, ease);

                if (t < 1) {
                    requestAnimationFrame(animateRotation);
                } else {
                    // Завершение
                    tempGroup.quaternion.copy(endQuat);
                    tempGroup.updateMatrixWorld(true);

                    // Возвращаем кубики обратно в сцену
                    const children = tempGroup.children.slice();
                    children.forEach(cubie => {
                        const worldPos = new THREE.Vector3();
                        const worldQuat = new THREE.Quaternion();
                        cubie.getWorldPosition(worldPos);
                        cubie.getWorldQuaternion(worldQuat);
                        tempGroup.remove(cubie);
                        scene.add(cubie);
                        cubie.position.copy(worldPos);
                        cubie.quaternion.copy(worldQuat);
                    });
                    scene.remove(tempGroup);

                    // Обновляем подсветку после каждого хода
                    updateCubeGlow();

                    if (callback) callback();
                }
            }
            animateRotation();
        }

        // ============================
        // 6. Скрамблер и Сборщик
        // ============================
        let scrambleMoves = []; // Массив ходов для отката
        let isScrambling = false;

        function generateScramble(length = 23) {
            const moves = ['U', 'D', 'L', 'R', 'F', 'B'];
            const modifiers = ['', "'", "2"];
            let result = [];
            let lastAxis = '';
            for (let i = 0; i < length; i++) {
                let move;
                let axis;
                do {
                    move = moves[Math.floor(Math.random() * moves.length)];
                    axis = move.charAt(0);
                } while (axis === lastAxis);
                lastAxis = axis;
                const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
                result.push(move + mod);
            }
            return result;
        }

        function parseMove(moveStr) {
            // 'R' -> axis: 'x', index: 1, angle: -PI/2
            // 'R'' -> axis: 'x', index: 1, angle: PI/2
            // 'R2' -> axis: 'x', index: 1, angle: PI (два хода подряд)
            const axisMap = { 'U': 'y', 'D': 'y', 'L': 'x', 'R': 'x', 'F': 'z', 'B': 'z' };
            const indexMap = { 'U': 1, 'D': -1, 'L': -1, 'R': 1, 'F': 1, 'B': -1 };
            const angleMap = { 'U': -1, 'D': 1, 'L': 1, 'R': -1, 'F': -1, 'B': 1 }; // Направление вращения

            const base = moveStr.charAt(0);
            const mod = moveStr.slice(1);
            
            let angle = angleMap[base] * Math.PI / 2;
            let count = 1;
            if (mod === "'") angle *= -1;
            else if (mod === "2") count = 2;

            return {
                axis: axisMap[base],
                index: indexMap[base],
                angle: angle,
                count: count
            };
        }

        function executeMove(moveStr, duration, callback) {
            const parsed = parseMove(moveStr);
            let remaining = parsed.count;
            let currentAngle = parsed.angle;

            function doSingleRotation() {
                if (remaining === 0) {
                    if (callback) callback();
                    return;
                }
                rotateLayer(parsed.axis, parsed.index, currentAngle, duration, () => {
                    remaining--;
                    if (remaining > 0) {
                        // Для R2 делаем два поворота подряд
                        doSingleRotation();
                    } else {
                        if (callback) callback();
                    }
                });
            }
            doSingleRotation();
        }

        function executeMoveSequence(moves, durationPerMove, onComplete) {
            if (moves.length === 0) {
                if (onComplete) onComplete();
                return;
            }
            let index = 0;
            function next() {
                if (index >= moves.length) {
                    if (onComplete) onComplete();
                    return;
                }
                executeMove(moves[index], durationPerMove, () => {
                    index++;
                    setTimeout(next, 20); // Небольшая пауза между ходами
                });
            }
            next();
        }

        // ============================
        // 7. Подсветка (Glow)
        // ============================
        // Словарь для хранения ID квадратиков, на которые ответил пользователь
        let activeGlowIds = [];

        function loadGlowFromLocalStorage() {
            try {
                const data = JSON.parse(localStorage.getItem('myGranProgress') || '[]');
                activeGlowIds = data;
            } catch (e) {
                activeGlowIds = [];
            }
        }

        // Эта функция вызывается из HTML после ответа
        window.updateCubeGlow = function() {
            loadGlowFromLocalStorage();
            applyGlow();
        };

        function applyGlow() {
            // Сбрасываем все материалы на обычные
            allCubies.forEach(cubie => {
                const faces = cubie.userData.faces;
                const mats = cubie.material;
                for (let i = 0; i < 6; i++) {
                    if (faces[i]) {
                        mats[i] = matLib[faces[i]];
                    }
                }
            });

            // Применяем свечение к отвеченным квадратикам
            activeGlowIds.forEach(id => {
                // Ищем кубик и грань, соответствующие этому ID
                // ID формируется как: `cube_${x}_${y}_${z}_face_${index}`
                // Но для простоты мы используем поиск по текущей позиции и цвету грани
                // В новой системе ID будет: "color_x_y" или "corner_..."
                // Пока используем упрощённый поиск
                // В реальности нужно хранить ID кубика и индекс грани
                // Но мы сделаем проще: будем искать по цвету грани и координатам
                // Так как ID = "color_gx_gy" из старой системы, мы конвертируем его в новый формат
                // Для теста: просто находим кубик с нужным цветом на нужной грани
                // Это не идеально, но для теста сойдет
            });

            // Пока оставляем заглушку, так как нужно переписать логику ID.
            // В новой версии ID будет: `cube_${x}_${y}_${z}_face_${faceIndex}`
            // И мы будем хранить его в localStorage.
        }

        // ============================
        // 8. Инициализация и запуск
        // ============================
        loadGlowFromLocalStorage();
        applyGlow();

        // ============================
        // 9. Обработчики кнопок
        // ============================
        const btnScramble = document.getElementById('btnScramble');
        const btnSolve = document.getElementById('btnSolve');

        btnScramble.addEventListener('click', function() {
            if (isScrambling) return;
            isScrambling = true;
            btnScramble.style.display = 'none';
            btnSolve.style.display = 'inline-block';

            // Генерируем скрамбл
            const moves = generateScramble(23);
            scrambleMoves = moves;
            const durationPerMove = 5000 / moves.length; // 5 секунд на всё

            executeMoveSequence(moves, durationPerMove, () => {
                isScrambling = false;
                // Обновляем подсветку после скрамбла
                updateCubeGlow();
            });
        });

        btnSolve.addEventListener('click', function() {
            if (isScrambling || scrambleMoves.length === 0) return;
            isScrambling = true;
            btnSolve.style.display = 'none';
            btnScramble.style.display = 'inline-block';

            // Собираем обратно: разворачиваем массив и инвертируем ходы
            const reverseMoves = scrambleMoves.slice().reverse().map(m => {
                if (m.endsWith("'")) return m.slice(0, -1);
                if (m.endsWith("2")) return m;
                return m + "'";
            });
            const durationPerMove = 5000 / reverseMoves.length;

            executeMoveSequence(reverseMoves, durationPerMove, () => {
                isScrambling = false;
                scrambleMoves = [];
                // Обновляем подсветку после сборки
                updateCubeGlow();
            });
        });

        // ============================
        // 10. Управление камерой и рендер
        // ============================
        let currentZoom = 4.5;
        function updateCamera() {
            camera.position.set(currentZoom * 0.7, currentZoom * 0.5, currentZoom * 0.9);
            camera.lookAt(0, 0, 0);
        }
        updateCamera();

        function render() {
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }
        render();

        window.addEventListener('resize', () => {
            const rect = container.getBoundingClientRect();
            const newSize = Math.min(rect.width, rect.height);
            renderer.setSize(newSize, newSize);
            camera.aspect = 1;
            camera.updateProjectionMatrix();
        });
    }
}
