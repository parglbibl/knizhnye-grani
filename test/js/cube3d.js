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

        // ===== ТЕКСТУРЫ (из твоего оригинала) =====
        const textureLoader = new THREE.TextureLoader();
        const textureFiles = {
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

        const textureMaterials = {
            red: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.red), roughness: 0.9, metalness: 0.0 }),
            blue: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.blue), roughness: 0.9, metalness: 0.0 }),
            yellow: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.yellow), roughness: 0.9, metalness: 0.0 }),
            green: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.green), roughness: 0.9, metalness: 0.0 }),
            white: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.white), roughness: 0.9, metalness: 0.0 }),
            orange: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.orange), roughness: 0.9, metalness: 0.0 })
        };

        // ===== МАТЕРИАЛЫ ДЛЯ ПОДСВЕТКИ =====
        const glowMaterials = {
            red: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.red), roughness: 0.3, metalness: 0.2, emissive: 0xc41e3a, emissiveIntensity: 0.25 }),
            blue: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.blue), roughness: 0.3, metalness: 0.2, emissive: 0x0051ba, emissiveIntensity: 0.25 }),
            yellow: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.yellow), roughness: 0.3, metalness: 0.2, emissive: 0xffd700, emissiveIntensity: 0.25 }),
            green: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.green), roughness: 0.3, metalness: 0.2, emissive: 0x009e60, emissiveIntensity: 0.25 }),
            white: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.white), roughness: 0.3, metalness: 0.2, emissive: 0xffffff, emissiveIntensity: 0.15 }),
            orange: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.orange), roughness: 0.3, metalness: 0.2, emissive: 0xff8c00, emissiveIntensity: 0.25 })
        };

        const fallbackMaterials = {
            red: new THREE.MeshStandardMaterial({ color: 0xc41e3a, roughness: 0.9, metalness: 0.0 }),
            blue: new THREE.MeshStandardMaterial({ color: 0x0051ba, roughness: 0.9, metalness: 0.0 }),
            yellow: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.9, metalness: 0.0 }),
            green: new THREE.MeshStandardMaterial({ color: 0x009e60, roughness: 0.9, metalness: 0.0 }),
            white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.0 }),
            orange: new THREE.MeshStandardMaterial({ color: 0xff8c00, roughness: 0.9, metalness: 0.0 })
        };

        const offset = 0.685;  
        const sizeCubie = 0.675;    
        const radius = 0.08;    
        const segments = 4;     

        const cubies = [];

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const faceNames = [
                        x === 1 ? 'red' : 'orange',
                        x === -1 ? 'orange' : 'red',
                        y === 1 ? 'white' : 'yellow',
                        y === -1 ? 'yellow' : 'white',
                        z === 1 ? 'green' : 'blue',
                        z === -1 ? 'blue' : 'green'
                    ];

                    const matArray = [
                        x === 1 ? textureMaterials.red || fallbackMaterials.red : (x === -1 ? textureMaterials.orange || fallbackMaterials.orange : textureMaterials.red || fallbackMaterials.red),
                        x === -1 ? textureMaterials.orange || fallbackMaterials.orange : (x === 1 ? textureMaterials.red || fallbackMaterials.red : textureMaterials.orange || fallbackMaterials.orange),
                        y === 1 ? textureMaterials.white || fallbackMaterials.white : (y === -1 ? textureMaterials.yellow || fallbackMaterials.yellow : textureMaterials.white || fallbackMaterials.white),
                        y === -1 ? textureMaterials.yellow || fallbackMaterials.yellow : (y === 1 ? textureMaterials.white || fallbackMaterials.white : textureMaterials.yellow || fallbackMaterials.yellow),
                        z === 1 ? textureMaterials.green || fallbackMaterials.green : (z === -1 ? textureMaterials.blue || fallbackMaterials.blue : textureMaterials.green || fallbackMaterials.green),
                        z === -1 ? textureMaterials.blue || fallbackMaterials.blue : (z === 1 ? textureMaterials.green || fallbackMaterials.green : textureMaterials.blue || fallbackMaterials.blue)
                    ];
                    
                    const geometry = new RoundedBoxGeometry(sizeCubie, sizeCubie, sizeCubie, segments, radius);
                    const cubie = new THREE.Mesh(geometry, matArray);
                    cubie.userData = { 
                        originalPos: { x: x * offset, y: y * offset, z: z * offset },
                        gridX: x, gridY: y, gridZ: z,
                        materials: matArray,
                        faceNames: faceNames
                    };
                    cubie.position.set(x * offset, y * offset, z * offset);
                    cubeGroup.add(cubie);
                    cubies.push(cubie);
                }
            }
        }

        // ===== ПОДСВЕТКА ПРОЙДЕННЫХ ГРАНЕЙ =====
        setTimeout(() => {
            try {
                const myProgress = JSON.parse(localStorage.getItem('myGranProgress') || '[]');
                if (myProgress.length > 0) {
                    cubies.forEach(cubie => {
                        const faces = cubie.userData.faceNames;
                        const matArray = cubie.material;
                        for (let i = 0; i < faces.length; i++) {
                            const color = faces[i];
                            const gx = (i === 0 || i === 1) ? (cubie.userData.gridY + 1) : (i === 2 || i === 3) ? (cubie.userData.gridX + 1) : (cubie.userData.gridX + 1);
                            const gy = (i === 0 || i === 1) ? (cubie.userData.gridZ + 1) : (i === 2 || i === 3) ? (cubie.userData.gridZ + 1) : (cubie.userData.gridY + 1);
                            const elementId = color + '_' + String(gx) + '_' + String(gy) + '_1';
                            
                            if (myProgress.includes(elementId)) {
                                if (glowMaterials[color]) {
                                    matArray[i] = glowMaterials[color];
                                }
                            }
                        }
                    });
                }
            } catch (e) {}
        }, 100);

        // ===== СВЕТ (оригинальный) =====
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

        // ===== ЛОГИКА КЛИКА (оригинальная) =====
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        function getGridCoords(position) {
            const x = Math.round(position.x / offset);
            const y = Math.round(position.y / offset);
            const z = Math.round(position.z / offset);
            return { x, y, z };
        }

        function openGran(colorName, gx, gy) {
            gx = Math.min(2, Math.max(0, gx));
            gy = Math.min(2, Math.max(0, gy));
            if (window.openBookGran) {
                window.openBookGran(colorName, gx, gy);
            }
        }

        function onMouseClick(event) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(cubies);

            if (intersects.length > 0) {
                const clickedCubie = intersects[0].object;
                const pos = clickedCubie.position;
                const coords = getGridCoords(pos);
                
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

                const colorName = clickedCubie.userData.faceNames[materialIndex];
                if (!colorName) return;
                
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
                
                openGran(colorName, gx, gy);
            }
        }

        // ===== ОБРАБОТЧИКИ МЫШИ (оригинальные) =====
        let isDragging = false;
        let startX = 0, startY = 0;
        let lastX = 0, lastY = 0;

        function getXY(e) {
            if (e.touches) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
            return { x: e.clientX, y: e.clientY };
        }

        function onMouseDown(e) {
            const coords = getXY(e);
            isDragging = true;
            startX = coords.x;
            startY = coords.y;
            lastX = coords.x;
            lastY = coords.y;
            container.style.cursor = 'grabbing';
        }

        function onMouseMove(e) {
            if (!isDragging) return;
            const coords = getXY(e);
            const deltaX = coords.x - lastX;
            const deltaY = coords.y - lastY;
            if (deltaX !== 0 || deltaY !== 0) {
                const axis = new THREE.Vector3(deltaY, deltaX, 0).normalize();
                const angle = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 0.008;
                const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
                cubeGroup.quaternion.multiply(quaternion);
                lastX = coords.x;
                lastY = coords.y;
            }
        }

        function onMouseUp(e) {
            isDragging = false;
            container.style.cursor = 'pointer';
            
            const coords = getXY(e);
            const dx = Math.abs(coords.x - startX);
            const dy = Math.abs(coords.y - startY);
            
            if (dx < 6 && dy < 6 && !isBlocked) {
                onMouseClick(e);
            }
        }

        container.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        // ===== ОБРАБОТЧИКИ ТАЧА (оригинальные) =====
        let touchStartX = 0, touchStartY = 0;
        let touchLastX = 0, touchLastY = 0;
        let touchMoved = false;

        function onTouchStart(e) {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchLastX = touch.clientX;
            touchLastY = touch.clientY;
            touchMoved = false;
        }

        function onTouchMove(e) {
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchLastX;
            const deltaY = touch.clientY - touchLastY;
            if (deltaX !== 0 || deltaY !== 0) {
                touchMoved = true;
                const axis = new THREE.Vector3(deltaY, deltaX, 0).normalize();
                const angle = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 0.008;
                const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
                cubeGroup.quaternion.multiply(quaternion);
                touchLastX = touch.clientX;
                touchLastY = touch.clientY;
            }
        }

        function onTouchEnd(e) {
            const touch = e.changedTouches[0];
            const dx = Math.abs(touch.clientX - touchStartX);
            const dy = Math.abs(touch.clientY - touchStartY);
            
            if (dx < 10 && dy < 10 && !touchMoved && !isBlocked) {
                onMouseClick(e);
            }
        }

        const el = renderer.domElement;
        el.addEventListener('touchstart', onTouchStart, { passive: false });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd, { passive: true });

        // ===== ЗУМ (оригинальный) =====
        let currentZoom = 4.5;

        container.addEventListener('wheel', function(e) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.5 : -0.5;
            currentZoom = Math.min(7, Math.max(2.5, currentZoom + delta));
            updateCamera();
        }, { passive: false });

        let lastTouchDist = 0;
        el.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDist = Math.sqrt(dx*dx + dy*dy);
            }
        }, { passive: true });

        el.addEventListener('touchmove', function(e) {
            if (e.touches.length === 2) {
                e.preventDefault();
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const delta = (dist - lastTouchDist) * 0.02;
                currentZoom = Math.min(7, Math.max(2.5, currentZoom - delta));
                updateCamera();
                lastTouchDist = dist;
            }
        }, { passive: false });

        function updateCamera() {
            camera.position.set(currentZoom * 0.7, currentZoom * 0.5, currentZoom * 0.9);
            camera.lookAt(0, 0, 0);
        }

        // ===== ДОБАВЛЯЕМ СКРАМБЛЕР И БЛОКИРОВКУ =====
        let isAnimating = false;
        let scrambleMoves = [];
        let isScrambling = false;
        let isBlocked = false;

        function getCubiesInLayer(axis, index) {
            const result = [];
            cubies.forEach(cubie => {
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
            isAnimating = true;

            const cubies = getCubiesInLayer(axis, index);
            if (cubies.length === 0) { 
                isAnimating = false;
                if (callback) callback(); 
                return; 
            }

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

                    updateCubeGlow();
                    isAnimating = false;
                    if (callback) callback();
                }
            }
            animateRotation();
        }

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

        const btnScramble = document.getElementById('btnScramble');
        const btnSolve = document.getElementById('btnSolve');

        btnScramble.addEventListener('click', function() {
            if (isScrambling || isAnimating || isBlocked) return;
            
            isBlocked = true;
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
            if (isScrambling || isAnimating || scrambleMoves.length === 0) return;
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
                
                isBlocked = false;
            });
        });

        // ===== ПОДСВЕТКА ДЛЯ СКРАМБЛЕРА =====
        window.updateCubeGlow = function() {
            const myProgress = JSON.parse(localStorage.getItem('myGranProgress') || '[]');
            cubies.forEach(cubie => {
                const faces = cubie.userData.faceNames;
                const matArray = cubie.material;
                for (let i = 0; i < 6; i++) {
                    if (faces[i]) {
                        matArray[i] = matLib[faces[i]];
                    }
                }
            });

            myProgress.forEach(id => {
                cubies.forEach(cubie => {
                    const faces = cubie.userData.faceNames;
                    const matArray = cubie.material;
                    for (let i = 0; i < 6; i++) {
                        if (faces[i]) {
                            const gx = (i === 0 || i === 1) ? (cubie.userData.gridY + 1) : (i === 2 || i === 3) ? (cubie.userData.gridX + 1) : (cubie.userData.gridX + 1);
                            const gy = (i === 0 || i === 1) ? (cubie.userData.gridZ + 1) : (i === 2 || i === 3) ? (cubie.userData.gridZ + 1) : (cubie.userData.gridY + 1);
                            const elementId = faces[i] + '_' + String(gx) + '_' + String(gy) + '_1';
                            if (id === elementId) {
                                if (glowMaterials[faces[i]]) {
                                    matArray[i] = glowMaterials[faces[i]];
                                }
                            }
                        }
                    }
                });
            });
        };

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