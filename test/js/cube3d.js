import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let cubeGroup;
let isAnimating = false;
let scrambleHistory = [];
let cubies = [];

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    init();
}

function init() {
    const rect = container.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);

    // Сцена
    scene = new THREE.Scene();
    scene.background = null;

    // Камера
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(3.8, 2.8, 4.8);
    camera.lookAt(0, 0, 0);

    // Рендер
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ОрбитКонтрол (вращение мышкой)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = false;
    controls.rotateSpeed = 1.0;
    controls.target.set(0, 0, 0);

    // Свет
    const ambientLight = new THREE.AmbientLight(0x606080, 0.7);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(2, 4, 3);
    scene.add(mainLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-2, 1, 2);
    scene.add(fillLight);
    const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
    backLight.position.set(0, 1, -3);
    scene.add(backLight);

    // Создаём кубик
    buildCube();

    // Запускаем рендер
    animate();

    // Обработчики кнопок
    document.getElementById('btnScramble').addEventListener('click', () => scramble());
    document.getElementById('btnSolve').addEventListener('click', () => solve());
}

// === СОЗДАНИЕ КУБИКА ===
const COLORS = ['red', 'blue', 'yellow', 'green', 'white', 'orange'];
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

const matConfig = { roughness: 0.9, metalness: 0.0 };
const createMat = (color) => new THREE.MeshStandardMaterial({ map: textures[color], ...matConfig });
const matLib = {};
COLORS.forEach(color => {
    matLib[color] = createMat(color);
});

function buildCube() {
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    const size = 0.85;
    const offset = 1.0;
    const geometry = new THREE.BoxGeometry(size, size, size);

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                if (x === 0 && y === 0 && z === 0) continue;

                const mats = [
                    x === 1 ? matLib['red'] : matLib['orange'],     // +X
                    x === -1 ? matLib['orange'] : matLib['red'],    // -X
                    y === 1 ? matLib['white'] : matLib['yellow'],   // +Y
                    y === -1 ? matLib['yellow'] : matLib['white'],  // -Y
                    z === 1 ? matLib['green'] : matLib['blue'],     // +Z
                    z === -1 ? matLib['blue'] : matLib['green']     // -Z
                ];

                const cubie = new THREE.Mesh(geometry, mats);
                cubie.position.set(x * offset, y * offset, z * offset);
                cubie.userData = {
                    gridPos: { x, y, z },
                    currentPos: { x, y, z }
                };
                cubeGroup.add(cubie);
                cubies.push(cubie);
            }
        }
    }
}

// === ВРАЩЕНИЕ СЛОЁВ ===
function getCubiesInLayer(axis, index) {
    const result = [];
    cubies.forEach(cubie => {
        const pos = cubie.position;
        const gx = Math.round(pos.x);
        const gy = Math.round(pos.y);
        const gz = Math.round(pos.z);
        
        let match = false;
        if (axis === 'x' && gx === index) match = true;
        else if (axis === 'y' && gy === index) match = true;
        else if (axis === 'z' && gz === index) match = true;

        if (match) result.push(cubie);
    });
    return result;
}

function rotateLayer(axis, index, angle, duration, callback) {
    const layerCubies = getCubiesInLayer(axis, index);
    if (layerCubies.length === 0) { if (callback) callback(); return; }

    // Создаём временную группу
    const tempGroup = new THREE.Group();
    scene.add(tempGroup);

    layerCubies.forEach(cubie => {
        const worldPos = new THREE.Vector3();
        const worldQuat = new THREE.Quaternion();
        cubie.getWorldPosition(worldPos);
        cubie.getWorldQuaternion(worldQuat);
        cubeGroup.remove(cubie);
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
                cubeGroup.add(cubie);
                cubie.position.copy(worldPos);
                cubie.quaternion.copy(worldQuat);
            });
            scene.remove(tempGroup);
            if (callback) callback();
        }
    }
    animateRotation();
}

// === СКРАМБЛ И СБОРКА ===
function generateScramble(length = 20) {
    const moves = ['U', 'D', 'L', 'R', 'F', 'B'];
    const modifiers = ['', "'", "2"];
    let result = [];
    let lastAxis = '';
    for (let i = 0; i < length; i++) {
        let move, axis;
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
    if (moves.length === 0) { if (onComplete) onComplete(); return; }
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

function scramble() {
    if (isAnimating) return;
    isAnimating = true;
    document.getElementById('btnScramble').style.display = 'none';
    document.getElementById('btnSolve').style.display = 'inline-block';

    const moves = generateScramble(20);
    scrambleHistory = moves;
    const durationPerMove = 5000 / moves.length;

    executeMoveSequence(moves, durationPerMove, () => {
        isAnimating = false;
    });
}

function solve() {
    if (isAnimating || scrambleHistory.length === 0) return;
    isAnimating = true;
    document.getElementById('btnSolve').style.display = 'none';
    document.getElementById('btnScramble').style.display = 'inline-block';

    const reverseMoves = scrambleHistory.slice().reverse().map(m => {
        if (m.endsWith("'")) return m.slice(0, -1);
        if (m.endsWith("2")) return m;
        return m + "'";
    });
    const durationPerMove = 5000 / reverseMoves.length;

    executeMoveSequence(reverseMoves, durationPerMove, () => {
        isAnimating = false;
        scrambleHistory = [];
    });
}

// === АНИМАЦИЯ ===
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// === РЕЗАЙЗ ===
window.addEventListener('resize', () => {
    const rect = container.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    renderer.setSize(size, size);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
});
