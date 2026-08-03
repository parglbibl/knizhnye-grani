import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
window.isSolved = true;
window.isScrambling = false;
window.isAnimating = false;
window.isBlocked = false;
window.moveHistory = [];
window.executeMoveSequence = null;
window.generateScramble = null;
window.updateCubeGlow = null;
window.rotateLayer = null;
window.camera = null;
window.allCubies = null;
window.offset = null;
window.cubeGroup = null;

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
        window.camera = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(size, size);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.enableZoom = true;
        controls.rotateSpeed = 0.5;
        controls.target.set(0, 0, 0);
        controls.minDistance = 3;
        controls.maxDistance = 8;

        const cubeGroup = new THREE.Group();
        scene.add(cubeGroup);
        window.cubeGroup = cubeGroup;

        const textureLoader = new THREE.TextureLoader();
        // Относительные пути к текстурам (для тестовой папки)
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

        const createGlowMat = (color, emissiveHex, intensity) => new THREE.MeshStandardMaterial({
            map: textures[color], roughness: 0.3, metalness: 0.2, emissive: emissiveHex, emissiveIntensity: intensity
        });

        const offset = 0.685;
        const sizeCubie = 0.675;
        const radius = 0.08;
        const segments = 4;
        window.offset = offset;

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
        window.allCubies = allCubies;

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

        // ===== ВРАЩЕНИЕ СЛОЁВ (с защитой от быстрых нажатий) =====
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
            if (isAnimating) {
                if (callback) callback();
                return;
            }

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
                const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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
                        item.cubie.userData.gridX = Math.round(item.cubie.position.x / offset);
                        item.cubie.userData.gridY = Math.round(item.cubie.position.y / offset);
                        item.cubie.userData.gridZ = Math.round(item.cubie.position.z / offset);
                    });
                    updateCubeGlow();
                    isAnimating = false;
                    if (callback) callback();
                }
            }
            animateMove();
        }

        // ===== ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ =====
        window.rotateLayer = rotateLayer;

        // ===== СКРАМБЛЕР И СБОРЩИК =====
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

            return { axis: axisMap[base], index: indexMap[base], angle: angle * count };
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
                    setTimeout(next, 15);
                });
            }
            next();
        }

        window.executeMoveSequence = executeMoveSequence;
        window.generateScramble = generateScramble;
        window.updateCubeGlow = updateCubeGlow;

        // ===== КНОПКИ «ПЕРЕМЕШАТЬ» И «СОБРАТЬ» =====
        document.addEventListener('DOMContentLoaded', function() {
            const btnScramble = document.getElementById('btnScramble');
            const btnSolve = document.getElementById('btnSolve');

            if (!btnScramble || !btnSolve) return;

            const newBtnScramble = btnScramble.cloneNode(true);
            const newBtnSolve = btnSolve.cloneNode(true);
            btnScramble.parentNode.replaceChild(newBtnScramble, btnScramble);
            btnSolve.parentNode.replaceChild(newBtnSolve, btnSolve);

            const SCRAMBLE_DURATION = 4000;
            const SOLVE_DURATION = 4000;
            const DELAY_BETWEEN_MOVES = 15;

            newBtnScramble.addEventListener('click', function() {
                if (window.isScrambling || window.isAnimating) return;
                window.isBlocked = true;
                window.isScrambling = true;
                window.isSolved = false;
                this.style.display = 'none';
                newBtnSolve.style.display = 'inline-block';

                window.moveHistory = [];

                const moves = window.generateScramble ? window.generateScramble(23) : ['U', "R'", 'F2', 'L', "D'", 'B'];
                moves.forEach(m => window.moveHistory.push(m));

                const durationPerMove = SCRAMBLE_DURATION / moves.length;
                window.executeMoveSequence(moves, durationPerMove, () => {
                    window.isScrambling = false;
                    window.isBlocked = false;
                    if (window.updateCubeGlow) window.updateCubeGlow();
                });
            });

            newBtnSolve.addEventListener('click', function() {
                if (window.isScrambling || window.isAnimating || window.moveHistory.length === 0) return;
                if (window.isBlocked) return;
                
                window.isBlocked = true;
                window.isScrambling = true;
                window.isSolved = true;
                this.style.display = 'none';
                newBtnScramble.style.display = 'inline-block';

                const reverseMoves = window.moveHistory.slice().reverse().map(m => {
                    if (m.endsWith("'")) return m.slice(0, -1);
                    if (m.endsWith("2")) return m;
                    return m + "'";
                });
                
                const durationPerMove = SOLVE_DURATION / reverseMoves.length;
                window.executeMoveSequence(reverseMoves, durationPerMove, () => {
                    window.isScrambling = false;
                    window.moveHistory = [];
                    window.isBlocked = false;
                    if (window.updateCubeGlow) window.updateCubeGlow();
                });
            });
        });

        // ===== ЗАКРЫТИЕ ПОПАПА =====
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

// ===== ГЛАВНАЯ ФУНКЦИЯ ДЛЯ КНОПОК (ИСПРАВЛЕННАЯ) =====
window.doMove = function(direction) {
    if (window.isSolved) return;
    if (!direction) return;
    if (window.isAnimating) return;

    // Проверяем штрих
    let isReverse = direction.includes("'");
    let cleanDir = direction.replace("'", "");

    const camera = window.camera;
    if (!camera) return;

    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    const faceNormals = {
        '+x': new THREE.Vector3(1, 0, 0),
        '-x': new THREE.Vector3(-1, 0, 0),
        '+y': new THREE.Vector3(0, 1, 0),
        '-y': new THREE.Vector3(0, -1, 0),
        '+z': new THREE.Vector3(0, 0, 1),
        '-z': new THREE.Vector3(0, 0, -1)
    };

    let targetDir = null;
    if (cleanDir === 'U') targetDir = camUp;
    else if (cleanDir === 'D') targetDir = camUp.clone().negate();
    else if (cleanDir === 'R') targetDir = camRight;
    else if (cleanDir === 'L') targetDir = camRight.clone().negate();
    else if (cleanDir === 'F') targetDir = camDir.clone().negate();
    else if (cleanDir === 'B') targetDir = camDir;
    else return;

    let bestFace = null;
    let bestDot = -Infinity;
    for (let [faceName, normal] of Object.entries(faceNormals)) {
        const dot = targetDir.dot(normal);
        if (dot > bestDot) {
            bestDot = dot;
            bestFace = faceName;
        }
    }
    if (!bestFace) return;

    let axis = '';
    let index = 0;
    if (bestFace === '+x') { axis = 'x'; index = 1; }
    else if (bestFace === '-x') { axis = 'x'; index = -1; }
    else if (bestFace === '+y') { axis = 'y'; index = 1; }
    else if (bestFace === '-y') { axis = 'y'; index = -1; }
    else if (bestFace === '+z') { axis = 'z'; index = 1; }
    else if (bestFace === '-z') { axis = 'z'; index = -1; }
    else return;

    // === ПРЕОБРАЗУЕМ В НОТАЦИЮ КУБИКА ===
    let move = '';
    switch (bestFace) {
        case '+x': move = 'R'; break;
        case '-x': move = 'L'; break;
        case '+y': move = 'U'; break;
        case '-y': move = 'D'; break;
        case '+z': move = 'F'; break;
        case '-z': move = 'B'; break;
    }
    if (isReverse) move += "'";

    // === ЗАПИСЫВАЕМ В ИСТОРИЮ (только если не скрамбл) ===
    if (!window.isScrambling) {
        window.moveHistory.push(move);
    }

    // === ВЫЧИСЛЯЕМ УГОЛ ===
    let baseAngle = 0;
    if (axis === 'y') {
        baseAngle = (index === 1) ? -Math.PI/2 : Math.PI/2;
    } else {
        if (index === 1) baseAngle = -Math.PI/2;
        else baseAngle = Math.PI/2;
    }

    const angle = isReverse ? -baseAngle : baseAngle;

    // === ПОВОРАЧИВАЕМ СЛОЙ ===
    window.rotateLayer(axis, index, angle, 150, () => {
        if (window.updateCubeGlow) window.updateCubeGlow();
    });
};