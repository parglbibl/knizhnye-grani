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
        // Фиксируем камеру, чтобы кубик выглядел как в оригинале
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
        // 2. Текстуры и материалы (как в оригинале)
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
        // 3. Создание кубиков (ТОЧНЫЕ РАЗМЕРЫ КАК В ОРИГИНАЛЕ)
        // ============================
        const offset = 0.86; // Расстояние между центрами кубиков (как в оригинале)
        const sizeCubie = 0.75; // Размер самого кубика (как в оригинале)
        const radius = 0.08;
        const segments = 4;

        const matLib = {
            red: createMat('red'), blue: createMat('blue'), yellow: createMat('yellow'),
            green: createMat('green'), white: createMat('white'), orange: createMat('orange')
        };
        const glowLib = {
            red: createGlowMat('red', 0xc41e3a), blue: createGlowMat('blue', 0x0051ba),
            yellow: createGlowMat('yellow', 0xffd700), green: createGlowMat('green', 0x009e60),
            white: createGlowMat('white', 0xffffff), orange: createGlowMat('orange', 0xff8c00)
        };

        const allCubies = [];

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    if (x === 0 && y === 0 && z === 0) continue; // Пропускаем центр

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

                    cubie.userData = {
                        gridX: x, gridY: y, gridZ: z,
                        faces: faces,
                        mats: mats,
                        originalPos: new THREE.Vector3(x * offset, y * offset, z * offset)
                    };

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
        function getCubiesInLayer(axis, index) {
            const result = [];
            allCubies.forEach(cubie => {
                const pos = cubie.position.clone();
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
            const cubies = getCubiesInLayer(axis, index);
            if (cubies.length === 0) { if (callback) callback(); return; }

            const tempGroup = new THREE.Group();
            scene.add(tempGroup);

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

            const rotAxis = new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
            
            const startTime = Date.now();
            const startQuat = tempGroup.quaternion.clone();
            const endQuat = new THREE.Quaternion().setFromAxisAngle(rotAxis, angle);
            endQuat.multiply(startQuat);

            function animateRotation() {
                const elapsed = Date.now() - startTime;
                const t = Math.min(elapsed / duration, 1);
                const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                tempGroup.quaternion.slerpQuaternions(startQuat, endQuat, ease);

                if (t < 1) {
                    requestAnimationFrame(animateRotation);
                } else {
                    tempGroup.quaternion.copy(endQuat);
                    tempGroup.updateMatrixWorld(true);

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

                    if (callback) callback();
                }
            }
            animateRotation();
        }

        // ============================
        // 6. Скрамблер и Сборщик
        // ============================
        let scrambleMoves = [];
        let isScrambling = false;

        function generateScramble(length = 20) {
            const moves = ['U', 'D', 'L', 'R', 'F', 'B'];
            const modifiers = ['', "'", "2"];
            let result = [];
            let lastAxis = '';
            let lastMove = '';
            
            for (let i = 0; i < length; i++) {
                let move;
                let axis;
                let newMove;
                do {
                    move = moves[Math.floor(Math.random() * moves.length)];
                    axis = move.charAt(0);
                } while (axis === lastAxis);
                
                // Случайный модификатор, но избегаем 2 подряд
                let mod = modifiers[Math.floor(Math.random() * modifiers.length)];
                newMove = move + mod;
                
                lastAxis = axis;
                result.push(newMove);
            }
            return result;
        }

        function parseMove(moveStr) {
            const axisMap = { 'U': 'y', 'D': 'y', 'L': 'x', 'R': 'x', 'F': 'z', 'B': 'z' };
            const indexMap = { 'U': 1, 'D': -1, 'L': -1, 'R': 1, 'F': 1, 'B': -1 };
            const angleMap = { 'U': -1, 'D': 1, 'L': 1, 'R': -1, 'F': -1, 'B': 1 };

            const base = moveStr.charAt(0);
            const mod = moveStr.slice(1);
            
            let angle = angleMap[base] * Math.PI / 2;
            let count = 1;
            if (mod === "'") angle *= -1;
            else if (mod === "2") count = 2;

            return { axis: axisMap[base], index: indexMap[base], angle: angle, count: count };
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
                    setTimeout(next, 20);
                });
            }
            next();
        }

        // ============================
        // 7. Обработчики кнопок
        // ============================
        const btnScramble = document.getElementById('btnScramble');
        const btnSolve = document.getElementById('btnSolve');

        btnScramble.addEventListener('click', function() {
            if (isScrambling) return;
            isScrambling = true;
            btnScramble.style.display = 'none';
            btnSolve.style.display = 'inline-block';

            const moves = generateScramble(20);
            scrambleMoves = moves;
            const durationPerMove = 5000 / moves.length;

            executeMoveSequence(moves, durationPerMove, () => {
                isScrambling = false;
            });
        });

        btnSolve.addEventListener('click', function() {
            if (isScrambling || scrambleMoves.length === 0) return;
            isScrambling = true;
            btnSolve.style.display = 'none';
            btnScramble.style.display = 'inline-block';

            const reverseMoves = scrambleMoves.slice().reverse().map(m => {
                if (m.endsWith("'")) return m.slice(0, -1);
                if (m.endsWith("2")) return m;
                return m + "'";
            });
            const durationPerMove = 5000 / reverseMoves.length;

            executeMoveSequence(reverseMoves, durationPerMove, () => {
                isScrambling = false;
                scrambleMoves = [];
            });
        });

        // ============================
        // 8. Вращение кубика МЫШКОЙ (как в оригинале)
        // ============================
        let isDragging = false;
        let startX = 0, startY = 0;
        let lastX = 0, lastY = 0;
        let isClick = false;

        function getXY(e) {
            if (e.touches) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
            return { x: e.clientX, y: e.clientY };
        }

        function onPointerDown(e) {
            const coords = getXY(e);
            isDragging = true;
            isClick = true;
            startX = coords.x;
            startY = coords.y;
            lastX = coords.x;
            lastY = coords.y;
            container.style.cursor = 'grabbing';
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            const coords = getXY(e);
            const deltaX = coords.x - lastX;
            const deltaY = coords.y - lastY;
            if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                isClick = false;
            }
            if (deltaX !== 0 || deltaY !== 0) {
                const axis = new THREE.Vector3(deltaY, deltaX, 0).normalize();
                const angle = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 0.008;
                const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
                cubeGroup.quaternion.multiply(quaternion);
                lastX = coords.x;
                lastY = coords.y;
            }
        }

        function onPointerUp(e) {
            isDragging = false;
            container.style.cursor = 'pointer';
            
            if (isClick) {
                const coords = getXY(e);
                const rect = renderer.domElement.getBoundingClientRect();
                const mouse = new THREE.Vector2(
                    ((coords.x - rect.left) / rect.width) * 2 - 1,
                    -((coords.y - rect.top) / rect.height) * 2 + 1
                );
                
                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(allCubies);

                if (intersects.length > 0) {
                    const clickedCubie = intersects[0].object;
                    const normal = intersects[0].face.normal.clone();
                    normal.applyQuaternion(clickedCubie.quaternion);
                    
                    let materialIndex = 0;
                    const nx = Math.round(normal.x);
                    const ny = Math.round(normal.y);
                    const nz = Math.round(normal.z);
                    
                    if (nx === 1) materialIndex = 0;
                    else if (nx === -1) materialIndex = 1;
                    else if (ny === 1) materialIndex = 2;
                    else if (ny === -1) materialIndex = 3;
                    else if (nz === 1) materialIndex = 4;
                    else if (nz === -1) materialIndex = 5;
                    
                    const colorName = clickedCubie.userData.faces[materialIndex];
                    if (!colorName) return;

                    // Формируем ID квадратика
                    // В реальной версии здесь будет сложная привязка к кубику и грани
                    const id = colorName + '_0_0_1'; // Заглушка для теста
                    
                    // Получаем вопрос
                    const question = questionsDB[id] || 'Какой вопрос ты хочешь задать этой грани?';

                    if (window.openBookGran) {
                        window.openBookGran(id, colorName, question);
                    }
                }
            }
        }

        container.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);

        container.addEventListener('touchstart', function(e) {
            const touch = e.touches[0];
            const fakeEvent = { touches: [touch] };
            onPointerDown(fakeEvent);
        }, { passive: true });

        window.addEventListener('touchmove', function(e) {
            const touch = e.touches[0];
            const fakeEvent = { touches: [touch] };
            onPointerMove(fakeEvent);
        }, { passive: true });

        window.addEventListener('touchend', function(e) {
            const touch = e.changedTouches[0];
            const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
            onPointerUp(fakeEvent);
        }, { passive: true });

        // ============================
        // 9. Управление камерой и рендер
        // ============================
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
