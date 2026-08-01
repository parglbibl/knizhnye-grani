import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.enableZoom = false;
        controls.rotateSpeed = 1.0;
        controls.target.set(0, 0, 0);

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
        // 3. Создание кубиков и КАРТЫ ID (faceMap)
        // ============================
        const offset = 0.685;  
        const sizeCubie = 0.675;    
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

        let allCubies = [];
        let faceMap = {};

        function buildCubies() {
            while(cubeGroup.children.length > 0) {
                const child = cubeGroup.children[0];
                child.geometry.dispose();
                cubeGroup.remove(child);
            }
            allCubies = [];
            faceMap = {};

            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    for (let z = -1; z <= 1; z++) {
                        if (x === 0 && y === 0 && z === 0) continue;

                        const isCenter = (x === 0 && y === 0) || (x === 0 && z === 0) || (y === 0 && z === 0);
                        
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

                        const faceIds = faces.map((color, idx) => {
                            if (!color) return null;
                            return `face_${color}_${x}_${y}_${z}_${idx}`;
                        });

                        cubie.userData = {
                            isCenter: isCenter,
                            gridX: x, gridY: y, gridZ: z,
                            faces: faces,
                            mats: mats,
                            faceIds: faceIds
                        };

                        allCubies.push(cubie);

                        // ЗАПОЛНЯЕМ КАРТУ
                        for (let i = 0; i < 6; i++) {
                            if (faceIds[i]) {
                                const key = `${x}_${y}_${z}_${i}`;
                                faceMap[key] = faceIds[i];
                            }
                        }
                    }
                }
            }
        }

        buildCubies();

        // ============================
        // 4. Свет
        // ============================
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
        scene.add(hemiLight);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        // ============================
        // 5. Вращение слоёв (с обновлением КАРТЫ)
        // ============================
        let isAnimating = false;

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

            // Вычисляем новые координаты
            const newPositions = cubies.map(cubie => {
                const pos = cubie.position.clone();
                const gx = Math.round(pos.x / offset);
                const gy = Math.round(pos.y / offset);
                const gz = Math.round(pos.z / offset);
                
                let newX = gx, newY = gy, newZ = gz;
                
                // Поворот координат на 90 градусов
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
                    endRot: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0), angle).multiply(cubie.quaternion.clone()),
                    oldGrid: { x: gx, y: gy, z: gz },
                    newGrid: { x: newX, y: newY, z: newZ }
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
                        
                        // ОБНОВЛЯЕМ КАРТУ ДЛЯ ЭТОГО КУБИКА
                        const oldX = item.oldGrid.x;
                        const oldY = item.oldGrid.y;
                        const oldZ = item.oldGrid.z;
                        const newX = item.newGrid.x;
                        const newY = item.newGrid.y;
                        const newZ = item.newGrid.z;

                        // Перемещаем все 6 граней этого кубика в карте
                        for (let i = 0; i < 6; i++) {
                            const oldKey = `${oldX}_${oldY}_${oldZ}_${i}`;
                            const newKey = `${newX}_${newY}_${newZ}_${i}`;
                            if (faceMap[oldKey]) {
                                faceMap[newKey] = faceMap[oldKey];
                                delete faceMap[oldKey];
                            }
                        }
                    });
                    
                    updateCubeGlow();
                    if (callback) callback();
                }
            }
            animateMove();
        }

        // ============================
        // 6. Скрамблер и Сборщик
        // ============================
        let scrambleMoves = [];
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

            const moves = generateScramble(23);
            scrambleMoves = moves;
            const durationPerMove = 5000 / moves.length;

            executeMoveSequence(moves, durationPerMove, () => {
                isScrambling = false;
                updateCubeGlow();
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
                updateCubeGlow();
            });
        });

        // ============================
        // 8. Кликабельность (через КАРТУ)
        // ============================
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        function onMouseClick(event) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

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
                else materialIndex = 0;

                // Получаем текущие координаты грани
                const pos = clickedCubie.position.clone();
                const gx = Math.round(pos.x / offset);
                const gy = Math.round(pos.y / offset);
                const gz = Math.round(pos.z / offset);
                
                // Ищем ID в КАРТЕ
                const key = `${gx}_${gy}_${gz}_${materialIndex}`;
                const faceId = faceMap[key];
                const colorName = clickedCubie.userData.faces[materialIndex];

                if (!faceId || !colorName) return;

                if (window.openBookGran) {
                    window.openBookGran(faceId, colorName);
                }
            }
        }

        let pointerDownPos = { x: 0, y: 0 };
        let isClick = false;

        renderer.domElement.addEventListener('pointerdown', (e) => {
            pointerDownPos.x = e.clientX;
            pointerDownPos.y = e.clientY;
            isClick = true;
        });

        renderer.domElement.addEventListener('pointerup', (e) => {
            const dx = e.clientX - pointerDownPos.x;
            const dy = e.clientY - pointerDownPos.y;
            if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && isClick && !isScrambling && !isAnimating) {
                onMouseClick(e);
            }
            isClick = false;
        });

        // ============================
        // 9. Подсветка
        // ============================
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

            activeGlowIds.forEach(glowId => {
                allCubies.forEach(cubie => {
                    const faceIds = cubie.userData.faceIds;
                    const faces = cubie.userData.faces;
                    const mats = cubie.material;
                    
                    for (let i = 0; i < 6; i++) {
                        if (faceIds[i] === glowId) {
                            if (faces[i] && glowLib[faces[i]]) {
                                mats[i] = glowLib[faces[i]];
                            }
                        }
                    }
                });
            });
        }

        loadGlowFromLocalStorage();
        applyGlow();

        // ============================
        // 10. Рендер
        // ============================
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