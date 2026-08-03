import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ ДОСТУПА ИЗ КНОПОК =====
window.isSolved = true;
window.isScrambling = false;
window.isAnimating = false;
window.isBlocked = false;
window.scrambleMoves = [];
window.executeMoveSequence = null;
window.generateScramble = null;
window.updateCubeGlow = null;

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
        const scene = new THREE.Scene();
        scene.background = null;

        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
        camera.position.set(3.5, 2.5, 4.5);
        camera.lookAt(0, 0, 0);
        scene.add(camera);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(size, size);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.enableZoom = true;
        controls.rotateSpeed = 1.0;
        controls.target.set(0, 0, 0);
        controls.minDistance = 3;
        controls.maxDistance = 8;

        const cubeGroup = new THREE.Group();
        scene.add(cubeGroup);

        const textureLoader = new THREE.TextureLoader();
        const texturePaths = {
            red: '/images/cube_textures/red.jpg',
            blue: '/images/cube_textures/blue.jpg',
            yellow: '/images/cube_textures/yellow.jpg',
            green: '/images/cube_textures/green.jpg',
            white: '/images/cube_textures/white.jpg',
            orange: '/images/cube_textures/orange.jpg'
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

        const createGlowMat = (color, emissiveHex, intensity) => new THREE.MeshStandardMaterial({
            map: textures[color], roughness: 0.3, metalness: 0.2, emissive: emissiveHex, emissiveIntensity: intensity
        });

        const offset = 0.685;
        const sizeCubie = 0.675;
        const radius = 0.08;
        const segments = 4;

        const matLib = {
            red: createMat('red'), blue: createMat('blue'), yellow: createMat('yellow'),
            green: createMat('green'), white: createMat('white'), orange: createMat('orange')
        };

        const glowLib = {
            red: createGlowMat('red', 0xc41e3a, 0.12),
            blue: createGlowMat('blue', 0x0051ba, 0.12),
            yellow: createGlowMat('yellow', 0xffd700, 0.12),
            green: createGlowMat('green', 0x009e60, 0.12),
            white: createGlowMat('white', 0xffffff, 0.04),
            orange: createGlowMat('orange', 0xff8c00, 0.12)
        };

        let allCubies = [];

        function buildCubies() {
            while (cubeGroup.children.length > 0) {
                const child = cubeGroup.children[0];
                child.geometry.dispose();
                cubeGroup.remove(child);
            }
            allCubies = [];

            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    for (let z = -1; z <= 1; z++) {
                        if (x === 0 && y === 0 && z === 0) continue;

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
                            mats: mats
                        };

                        allCubies.push(cubie);
                    }
                }
            }
        }

        buildCubies();

        // ===== ОСВЕЩЕНИЕ =====
        const ambientLight = new THREE.AmbientLight(0x606080, 0.6);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 0.45);
        mainLight.position.set(2, 4, 3);
        camera.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-2, 1, 2);
        camera.add(fillLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.1);
        backLight.position.set(0, 1, -3);
        camera.add(backLight);

        // ===== ФУНКЦИЯ ПРОВЕРКИ СБОРКИ =====
        function isCubeSolved() {
            for (let cubie of allCubies) {
                const pos = cubie.position;
                const gx = Math.round(pos.x / offset);
                const gy = Math.round(pos.y / offset);
                const gz = Math.round(pos.z / offset);
                if (gx !== cubie.userData.gridX ||
                    gy !== cubie.userData.gridY ||
                    gz !== cubie.userData.gridZ) {
                    return false;
                }
            }
            return true;
        }

        // ===== ВРАЩЕНИЕ СЛОЁВ =====
        let isAnimating = false;

        function getCubiesInLayer(axis, index) {
            const result = [];
            allCubies.forEach(cubie => {
                const pos = cubie.position;
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
            isAnimating = true;
            const cubies = getCubiesInLayer(axis, index);
            if (cubies.length === 0) {
                isAnimating = false;
                if (callback) callback();
                return;
            }

            const newPositions = cubies.map(cubie => {
                const pos = cubie.position.clone();
                const gx = Math.round(pos.x / offset);
                const gy = Math.round(pos.y / offset);
                const gz = Math.round(pos.z / offset);

                let newX = gx, newY = gy, newZ = gz;
                const cos = Math.round(Math.cos(angle));
                const sin = Math.round(Math.sin(angle));

                if (axis === 'x') {
                    newY = gy * cos - gz * sin;
                    newZ = gy * sin + gz * cos;
                } else if (axis === 'y') {
                    newX = gx * cos + gz * sin;
                    newZ = -gx * sin + gz * cos;
                } else if (axis === 'z') {
                    newX = gx * cos - gy * sin;
                    newY = gx * sin + gy * cos;
                }

                return {
                    cubie: cubie,
                    startPos: pos.clone(),
                    endPos: new THREE.Vector3(newX * offset, newY * offset, newZ * offset),
                    startRot: cubie.quaternion.clone(),
                    endRot: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0), angle).multiply(cubie.quaternion.clone())
                };
            });

            const startTime = Date.now();

            function animateMove() {
                const elapsed = Date.now() - startTime;
                const t = Math.min(elapsed / duration, 1);
                const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

                newPositions.forEach(item => {
                    item.cubie.position.lerpVectors(item.startPos, item.endPos, ease);
                    item.cubie.quaternion.slerpQuaternions(item.startRot, item.endRot, ease);
                });

                if (t < 1) {
                    requestAnimationFrame(animateMove);
                } else {
                    newPositions.forEach(item => {
                        item.cubie.position.copy(item.endPos);
                        item.cubie.quaternion.copy(item.endRot);
                    });
                    updateCubeGlow();
                    isAnimating = false;
                    if (callback) callback();
                }
            }
            animateMove();
        }

        // ===== СКРАМБЛЕР И СБОРЩИК =====
        let scrambleMoves = [];
        let isScrambling = false;
        let isBlocked = false;

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
            const axisMap = { 'U': 'y', 'D': 'y', 'L': 'x', 'R': 'x', 'F': 'z', 'B': 'z' };
            const indexMap = { 'U': 1, 'D': -1, 'L': -1, 'R': 1, 'F': 1, 'B': -1 };
            const angleMap = { 'U': -1, 'D': 1, 'L': 1, 'R': -1, 'F': -1, 'B': 1 };

            const base = moveStr.charAt(0);
            const mod = moveStr.slice(1);
            let angle = angleMap[base] * Math.PI / 2;
            let count = 1;
            if (mod === "'") angle *= -1;
            else if (mod === "2") count = 2;

            return { axis: axisMap[base], index: indexMap[base], angle, count };
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

        // Экспортируем функции в глобальную область для кнопок
        window.executeMoveSequence = executeMoveSequence;
        window.generateScramble = generateScramble;
        window.updateCubeGlow = updateCubeGlow;

        // ===== РУЧНОЕ ВРАЩЕНИЕ (СВАЙП) — ОТДЕЛЬНО ДЛЯ МЫШИ И ПАЛЬЦЕВ =====
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        function getGridCoords(position) {
            const x = Math.round(position.x / offset);
            const y = Math.round(position.y / offset);
            const z = Math.round(position.z / offset);
            return { x, y, z };
        }

        let dragStart = null;
        let dragAxis = null;
        let dragLayer = null;
        let isDragging = false;
        let isPointerDown = false;

        // ===== ДЛЯ МЫШИ (ПК) =====
        renderer.domElement.addEventListener('mousedown', (e) => {
            // СВАЙП РАБОТАЕТ ТОЛЬКО НА РАЗОБРАННОМ КУБИКЕ
            if (window.isSolved) return;
            if (isScrambling || isAnimating || isBlocked) return;
            if (isPointerDown) return;
            isPointerDown = true;

            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(allCubies);

            if (intersects.length === 0) {
                isPointerDown = false;
                return;
            }

            const clicked = intersects[0].object;
            const normal = intersects[0].face.normal.clone().applyQuaternion(clicked.quaternion);
            const nx = Math.round(normal.x);
            const ny = Math.round(normal.y);
            const nz = Math.round(normal.z);

            if (nx !== 0) {
                dragAxis = 'x';
                dragLayer = Math.round(clicked.position.x / offset);
            } else if (ny !== 0) {
                dragAxis = 'y';
                dragLayer = Math.round(clicked.position.y / offset);
            } else if (nz !== 0) {
                dragAxis = 'z';
                dragLayer = Math.round(clicked.position.z / offset);
            } else {
                isPointerDown = false;
                return;
            }

            dragStart = {
                x: e.clientX,
                y: e.clientY,
                axis: dragAxis,
                layer: dragLayer,
                normalX: nx,
                normalY: ny,
                normalZ: nz,
                moved: false
            };
            isDragging = true;
        });

        renderer.domElement.addEventListener('mousemove', (e) => {
            if (!isDragging || !dragStart) return;
            if (window.isSolved) return; // дополнительная защита

            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            const threshold = 15;

            if (!dragStart.moved && Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
            dragStart.moved = true;

            let angle = 0;
            let axisVec = new THREE.Vector3();

            if (dragStart.axis === 'x') {
                angle = dy * 0.01;
                axisVec.set(1, 0, 0);
            } else if (dragStart.axis === 'y') {
                angle = dx * 0.01;
                axisVec.set(0, 1, 0);
            } else if (dragStart.axis === 'z') {
                angle = dx * 0.01;
                axisVec.set(0, 0, 1);
            }

            if (dragStart.normalX < 0) angle *= -1;
            if (dragStart.normalY < 0) angle *= -1;
            if (dragStart.normalZ < 0) angle *= -1;

            const cubies = getCubiesInLayer(dragStart.axis, dragStart.layer);
            const quat = new THREE.Quaternion().setFromAxisAngle(axisVec, angle);
            cubies.forEach(cubie => {
                cubie.position.applyQuaternion(quat);
                cubie.quaternion.multiply(quat);
            });
        });

        renderer.domElement.addEventListener('mouseup', (e) => {
            if (!isDragging || !dragStart) {
                isPointerDown = false;
                return;
            }

            isDragging = false;
            isPointerDown = false;

            if (dragStart.moved) {
                const cubies = getCubiesInLayer(dragStart.axis, dragStart.layer);
                cubies.forEach(cubie => {
                    const pos = cubie.position;
                    pos.x = Math.round(pos.x / offset) * offset;
                    pos.y = Math.round(pos.y / offset) * offset;
                    pos.z = Math.round(pos.z / offset) * offset;
                });
                cubies.forEach(cubie => {
                    const q = cubie.quaternion;
                    q.normalize();
                    const euler = new THREE.Euler().setFromQuaternion(q);
                    euler.x = Math.round(euler.x / (Math.PI / 2)) * (Math.PI / 2);
                    euler.y = Math.round(euler.y / (Math.PI / 2)) * (Math.PI / 2);
                    euler.z = Math.round(euler.z / (Math.PI / 2)) * (Math.PI / 2);
                    cubie.quaternion.setFromEuler(euler);
                });
                // После движения проверяем, не собрался ли кубик
                if (isCubeSolved()) {
                    window.isSolved = true;
                }
                updateCubeGlow();
            }

            // ===== КЛИК БЕЗ ПЕРЕМЕЩЕНИЯ — ТОЛЬКО НА СОБРАННОМ КУБИКЕ =====
            if (!dragStart.moved && window.isSolved) {
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(allCubies);
                if (intersects.length > 0) {
                    const clicked = intersects[0].object;
                    const normal = intersects[0].face.normal.clone().applyQuaternion(clicked.quaternion);
                    const nx = Math.round(normal.x);
                    const ny = Math.round(normal.y);
                    const nz = Math.round(normal.z);
                    let materialIndex = 0;
                    if (nx === 1) materialIndex = 0;
                    else if (nx === -1) materialIndex = 1;
                    else if (ny === 1) materialIndex = 2;
                    else if (ny === -1) materialIndex = 3;
                    else if (nz === 1) materialIndex = 4;
                    else if (nz === -1) materialIndex = 5;
                    else materialIndex = 0;

                    const colorName = clicked.userData.faces[materialIndex];
                    if (!colorName) return;

                    const coords = getGridCoords(clicked.position);
                    let gx = 0, gy = 0;
                    if (materialIndex === 0 || materialIndex === 1) {
                        gx = coords.y + 1;
                        gy = coords.z + 1;
                    } else if (materialIndex === 2 || materialIndex === 3) {
                        gx = coords.x + 1;
                        gy = coords.z + 1;
                    } else {
                        gx = coords.x + 1;
                        gy = coords.y + 1;
                    }

                    const popup = document.getElementById('popup');
                    const title = document.getElementById('popupTitle');
                    const question = document.getElementById('popupQuestion');
                    const colorNames = {
                        red: 'Любовь',
                        blue: 'Надежда',
                        yellow: 'Совесть',
                        green: 'Добро',
                        white: 'Память',
                        orange: 'Семья'
                    };
                    const questions = {
                        red_0_0_1: 'Какая книга подарила тебе ощущение дома?',
                        blue_0_0_1: 'Какая книга помогла тебе проснуться утром?',
                        yellow_0_0_1: 'Какая книга помогла тебе услышать свой тихий внутренний голос?',
                        green_0_0_1: 'Назови книгу, которая вдохновила тебя сделать кому-то приятное просто так.',
                        white_0_0_1: 'Какая книга заставила тебя вспомнить голос бабушки или дедушки?',
                        orange_0_0_1: 'Какая книга подарила тебе ощущение, что ты всегда можешь вернуться домой?'
                    };
                    const key = colorName + '_' + gx + '_' + gy + '_1';
                    title.textContent = colorNames[colorName] || colorName;
                    question.textContent = questions[key] || 'Придумай свой вопрос для этой грани!';
                    popup.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            }

            dragStart = null;
        });

        // ===== ДЛЯ ПАЛЬЦЕВ (ТЕЛЕФОН) =====
        renderer.domElement.addEventListener('touchstart', (e) => {
            // СВАЙП РАБОТАЕТ ТОЛЬКО НА РАЗОБРАННОМ КУБИКЕ
            if (window.isSolved) return;
            if (isScrambling || isAnimating || isBlocked) return;
            if (isPointerDown) return;
            isPointerDown = true;
            e.preventDefault();

            const touch = e.changedTouches[0];
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(allCubies);

            if (intersects.length === 0) {
                isPointerDown = false;
                return;
            }

            const clicked = intersects[0].object;
            const normal = intersects[0].face.normal.clone().applyQuaternion(clicked.quaternion);
            const nx = Math.round(normal.x);
            const ny = Math.round(normal.y);
            const nz = Math.round(normal.z);

            if (nx !== 0) {
                dragAxis = 'x';
                dragLayer = Math.round(clicked.position.x / offset);
            } else if (ny !== 0) {
                dragAxis = 'y';
                dragLayer = Math.round(clicked.position.y / offset);
            } else if (nz !== 0) {
                dragAxis = 'z';
                dragLayer = Math.round(clicked.position.z / offset);
            } else {
                isPointerDown = false;
                return;
            }

            dragStart = {
                x: touch.clientX,
                y: touch.clientY,
                axis: dragAxis,
                layer: dragLayer,
                normalX: nx,
                normalY: ny,
                normalZ: nz,
                moved: false
            };
            isDragging = true;
        });

        renderer.domElement.addEventListener('touchmove', (e) => {
            if (!isDragging || !dragStart) return;
            if (window.isSolved) return; // дополнительная защита
            e.preventDefault();

            const touch = e.changedTouches[0];
            const dx = touch.clientX - dragStart.x;
            const dy = touch.clientY - dragStart.y;
            const threshold = 20;

            if (!dragStart.moved && Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
            dragStart.moved = true;

            let angle = 0;
            let axisVec = new THREE.Vector3();

            if (dragStart.axis === 'x') {
                angle = dy * 0.01;
                axisVec.set(1, 0, 0);
            } else if (dragStart.axis === 'y') {
                angle = dx * 0.01;
                axisVec.set(0, 1, 0);
            } else if (dragStart.axis === 'z') {
                angle = dx * 0.01;
                axisVec.set(0, 0, 1);
            }

            if (dragStart.normalX < 0) angle *= -1;
            if (dragStart.normalY < 0) angle *= -1;
            if (dragStart.normalZ < 0) angle *= -1;

            const cubies = getCubiesInLayer(dragStart.axis, dragStart.layer);
            const quat = new THREE.Quaternion().setFromAxisAngle(axisVec, angle);
            cubies.forEach(cubie => {
                cubie.position.applyQuaternion(quat);
                cubie.quaternion.multiply(quat);
            });
        });

        renderer.domElement.addEventListener('touchend', (e) => {
            if (!isDragging || !dragStart) {
                isPointerDown = false;
                return;
            }

            isDragging = false;
            isPointerDown = false;
            e.preventDefault();

            const touch = e.changedTouches[0];

            if (dragStart.moved) {
                const cubies = getCubiesInLayer(dragStart.axis, dragStart.layer);
                cubies.forEach(cubie => {
                    const pos = cubie.position;
                    pos.x = Math.round(pos.x / offset) * offset;
                    pos.y = Math.round(pos.y / offset) * offset;
                    pos.z = Math.round(pos.z / offset) * offset;
                });
                cubies.forEach(cubie => {
                    const q = cubie.quaternion;
                    q.normalize();
                    const euler = new THREE.Euler().setFromQuaternion(q);
                    euler.x = Math.round(euler.x / (Math.PI / 2)) * (Math.PI / 2);
                    euler.y = Math.round(euler.y / (Math.PI / 2)) * (Math.PI / 2);
                    euler.z = Math.round(euler.z / (Math.PI / 2)) * (Math.PI / 2);
                    cubie.quaternion.setFromEuler(euler);
                });
                // После движения проверяем, не собрался ли кубик
                if (isCubeSolved()) {
                    window.isSolved = true;
                }
                updateCubeGlow();
            }

            // ===== КЛИК БЕЗ ПЕРЕМЕЩЕНИЯ — ТОЛЬКО НА СОБРАННОМ КУБИКЕ =====
            if (!dragStart.moved && window.isSolved) {
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(allCubies);
                if (intersects.length > 0) {
                    const clicked = intersects[0].object;
                    const normal = intersects[0].face.normal.clone().applyQuaternion(clicked.quaternion);
                    const nx = Math.round(normal.x);
                    const ny = Math.round(normal.y);
                    const nz = Math.round(normal.z);
                    let materialIndex = 0;
                    if (nx === 1) materialIndex = 0;
                    else if (nx === -1) materialIndex = 1;
                    else if (ny === 1) materialIndex = 2;
                    else if (ny === -1) materialIndex = 3;
                    else if (nz === 1) materialIndex = 4;
                    else if (nz === -1) materialIndex = 5;
                    else materialIndex = 0;

                    const colorName = clicked.userData.faces[materialIndex];
                    if (!colorName) return;

                    const coords = getGridCoords(clicked.position);
                    let gx = 0, gy = 0;
                    if (materialIndex === 0 || materialIndex === 1) {
                        gx = coords.y + 1;
                        gy = coords.z + 1;
                    } else if (materialIndex === 2 || materialIndex === 3) {
                        gx = coords.x + 1;
                        gy = coords.z + 1;
                    } else {
                        gx = coords.x + 1;
                        gy = coords.y + 1;
                    }

                    const popup = document.getElementById('popup');
                    const title = document.getElementById('popupTitle');
                    const question = document.getElementById('popupQuestion');
                    const colorNames = {
                        red: 'Любовь',
                        blue: 'Надежда',
                        yellow: 'Совесть',
                        green: 'Добро',
                        white: 'Память',
                        orange: 'Семья'
                    };
                    const questions = {
                        red_0_0_1: 'Какая книга подарила тебе ощущение дома?',
                        blue_0_0_1: 'Какая книга помогла тебе проснуться утром?',
                        yellow_0_0_1: 'Какая книга помогла тебе услышать свой тихий внутренний голос?',
                        green_0_0_1: 'Назови книгу, которая вдохновила тебя сделать кому-то приятное просто так.',
                        white_0_0_1: 'Какая книга заставила тебя вспомнить голос бабушки или дедушки?',
                        orange_0_0_1: 'Какая книга подарила тебе ощущение, что ты всегда можешь вернуться домой?'
                    };
                    const key = colorName + '_' + gx + '_' + gy + '_1';
                    title.textContent = colorNames[colorName] || colorName;
                    question.textContent = questions[key] || 'Придумай свой вопрос для этой грани!';
                    popup.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            }

            dragStart = null;
        });

        // ===== ЗАКРЫТИЕ ПОПАПА ПО КЛИКУ ВНЕ =====
        document.getElementById('popup').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.style.display = 'none';
                document.body.style.overflow = '';
            }
        });

        // ===== ПОДСВЕТКА =====
        let activeGlowIds = [];

        function loadGlowFromLocalStorage() {
            try {
                const data = JSON.parse(localStorage.getItem('myGranProgress') || '[]');
                activeGlowIds = data;
            } catch (e) {
                activeGlowIds = [];
            }
        }

        window.updateCubeGlow = function() {
            loadGlowFromLocalStorage();
            applyGlow();
        };

        function applyGlow() {
            allCubies.forEach(cubie => {
                const faces = cubie.userData.faces;
                const mats = cubie.material;
                for (let i = 0; i < 6; i++) {
                    if (faces[i]) {
                        mats[i] = matLib[faces[i]];
                    }
                }
            });
        }

        loadGlowFromLocalStorage();
        applyGlow();

        // ===== ЦИКЛ РЕНДЕРА =====
        function render() {
            requestAnimationFrame(render);
            controls.update();
            renderer.render(scene, camera);
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

// ===== КНОПКИ (ПЕРЕОПРЕДЕЛЕНИЕ ВНЕ INITCUBE) =====
document.addEventListener('DOMContentLoaded', function() {
    const btnScramble = document.getElementById('btnScramble');
    const btnSolve = document.getElementById('btnSolve');

    if (!btnScramble || !btnSolve) return;

    // Убираем старые обработчики (если есть) через клонирование
    const newBtnScramble = btnScramble.cloneNode(true);
    const newBtnSolve = btnSolve.cloneNode(true);
    btnScramble.parentNode.replaceChild(newBtnScramble, btnScramble);
    btnSolve.parentNode.replaceChild(newBtnSolve, btnSolve);

    // Вешаем новые
    newBtnScramble.addEventListener('click', function() {
        if (window.isScrambling || window.isAnimating || window.isBlocked) return;
        window.isBlocked = true;
        window.isScrambling = true;
        window.isSolved = false; // <--- ГЛАВНОЕ: разрешаем свайп
        this.style.display = 'none';
        newBtnSolve.style.display = 'inline-block';

        const moves = window.generateScramble ? window.generateScramble(23) : ['U', "R'", 'F2', 'L', "D'", 'B'];
        window.scrambleMoves = moves;
        const durationPerMove = 5000 / moves.length;

        window.executeMoveSequence(moves, durationPerMove, () => {
            window.isScrambling = false;
            if (window.updateCubeGlow) window.updateCubeGlow();
        });
    });

    newBtnSolve.addEventListener('click', function() {
        if (window.isScrambling || window.isAnimating || !window.scrambleMoves || window.scrambleMoves.length === 0) return;
        window.isScrambling = true;
        window.isSolved = true; // <--- ГЛАВНОЕ: запрещаем свайп
        this.style.display = 'none';
        newBtnScramble.style.display = 'inline-block';

        const reverseMoves = window.scrambleMoves.slice().reverse().map(m => {
            if (m.endsWith("'")) return m.slice(0, -1);
            if (m.endsWith("2")) return m;
            return m + "'";
        });
        const durationPerMove = 5000 / reverseMoves.length;

        window.executeMoveSequence(reverseMoves, durationPerMove, () => {
            window.isScrambling = false;
            window.scrambleMoves = [];
            if (window.updateCubeGlow) window.updateCubeGlow();
            window.isBlocked = false;
        });
    });
});