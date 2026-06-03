import * as THREE from 'three';

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    camera.position.set(3.2, 2.5, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(320, 320);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    // Цвета
    const colorValues = {
        white: 0xffffff,
        yellow: 0xffd700,
        red: 0xc41e3a,
        orange: 0xff8c00,
        green: 0x009e60,
        blue: 0x0051ba
    };

    const createMaterial = (color) => {
        return new THREE.MeshStandardMaterial({ color: color, roughness: 0.25, metalness: 0.05 });
    };

    const materials = {
        white: createMaterial(colorValues.white),
        yellow: createMaterial(colorValues.yellow),
        red: createMaterial(colorValues.red),
        orange: createMaterial(colorValues.orange),
        green: createMaterial(colorValues.green),
        blue: createMaterial(colorValues.blue)
    };

    // Создаём 27 кубиков
    const cubies = [];
    const cubiesMap = new Map();
    const offset = 0.72;
    const size = 0.68;

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const matArray = [
                    x === 1 ? materials.red : (x === -1 ? materials.orange : materials.red),
                    x === -1 ? materials.orange : (x === 1 ? materials.red : materials.orange),
                    y === 1 ? materials.white : (y === -1 ? materials.yellow : materials.white),
                    y === -1 ? materials.yellow : (y === 1 ? materials.white : materials.yellow),
                    z === 1 ? materials.green : (z === -1 ? materials.blue : materials.green),
                    z === -1 ? materials.blue : (z === 1 ? materials.green : materials.blue)
                ];
                
                const geometry = new THREE.BoxGeometry(size, size, size);
                const cubie = new THREE.Mesh(geometry, matArray);
                cubie.userData = { originalPos: { x: x * offset, y: y * offset, z: z * offset } };
                cubie.position.set(x * offset, y * offset, z * offset);
                cubeGroup.add(cubie);
                cubies.push(cubie);
                cubiesMap.set(`${x},${y},${z}`, cubie);
            }
        }
    }

    // Освещение
    const ambientLight = new THREE.AmbientLight(0x606080);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(2, 3, 2);
    scene.add(mainLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-1.5, 1, 1.5);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 1, -3);
    scene.add(rimLight);

    // Вращение слоя (для перемешивания)
    function rotateLayer(axis, layerValue, angle) {
        const affectedCubies = [];
        
        cubies.forEach(cubie => {
            let pos;
            if (axis === 'x') pos = Math.round(cubie.position.x / offset);
            else if (axis === 'y') pos = Math.round(cubie.position.y / offset);
            else pos = Math.round(cubie.position.z / offset);
            
            if (pos === layerValue) {
                affectedCubies.push(cubie);
            }
        });
        
        affectedCubies.forEach(cubie => {
            const x = cubie.position.x;
            const y = cubie.position.y;
            const z = cubie.position.z;
            
            let newX, newY, newZ;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            if (axis === 'x') {
                newX = x;
                newY = y * cos - z * sin;
                newZ = y * sin + z * cos;
            } else if (axis === 'y') {
                newX = x * cos + z * sin;
                newY = y;
                newZ = -x * sin + z * cos;
            } else {
                newX = x * cos - y * sin;
                newY = x * sin + y * cos;
                newZ = z;
            }
            
            cubie.position.set(newX, newY, newZ);
            
            const oldMaterials = cubie.material;
            const newMaterials = [...oldMaterials];
            
            if (axis === 'x') {
                [newMaterials[2], newMaterials[3], newMaterials[4], newMaterials[5]] = 
                [newMaterials[4], newMaterials[5], newMaterials[3], newMaterials[2]];
            } else if (axis === 'y') {
                [newMaterials[0], newMaterials[1], newMaterials[4], newMaterials[5]] = 
                [newMaterials[4], newMaterials[5], newMaterials[1], newMaterials[0]];
            } else {
                [newMaterials[0], newMaterials[1], newMaterials[2], newMaterials[3]] = 
                [newMaterials[2], newMaterials[3], newMaterials[1], newMaterials[0]];
            }
            
            cubie.material = newMaterials;
        });
    }

    // Перемешивание
    function scrambleCube() {
        const axes = ['x', 'y', 'z'];
        const layers = [-1, 0, 1];
        const angles = [Math.PI / 2, -Math.PI / 2];
        
        const moves = 120 + Math.floor(Math.random() * 80);
        
        for (let i = 0; i < moves; i++) {
            const axis = axes[Math.floor(Math.random() * axes.length)];
            const layer = layers[Math.floor(Math.random() * layers.length)];
            const angle = angles[Math.floor(Math.random() * angles.length)];
            rotateLayer(axis, layer, angle);
        }
    }

    // Сброс в собранное состояние
    function resetCube() {
        cubies.forEach(cubie => {
            cubie.position.copy(cubie.userData.originalPos);
        });
        
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const matArray = [
                        x === 1 ? materials.red : (x === -1 ? materials.orange : materials.red),
                        x === -1 ? materials.orange : (x === 1 ? materials.red : materials.orange),
                        y === 1 ? materials.white : (y === -1 ? materials.yellow : materials.white),
                        y === -1 ? materials.yellow : (y === 1 ? materials.white : materials.yellow),
                        z === 1 ? materials.green : (z === -1 ? materials.blue : materials.green),
                        z === -1 ? materials.blue : (z === 1 ? materials.green : materials.blue)
                    ];
                    
                    const key = `${x},${y},${z}`;
                    const cubie = cubiesMap.get(key);
                    if (cubie) {
                        cubie.material = matArray;
                    }
                }
            }
        }
    }

    // ===== ВРАЩЕНИЕ МЫШКОЙ И ПАЛЬЦЕМ =====
    let isDragging = false;
    let lastX = 0, lastY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    // Получение координат (для мыши и тача)
    function getClientXY(e) {
        if (e.touches) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function onStart(e) {
        e.preventDefault();
        isDragging = true;
        const coords = getClientXY(e);
        lastX = coords.x;
        lastY = coords.y;
        container.style.cursor = 'grabbing';
    }

    function onMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const coords = getClientXY(e);
        const deltaX = coords.x - lastX;
        const deltaY = coords.y - lastY;
        
        if (deltaX !== 0 || deltaY !== 0) {
            targetRotationY += deltaX * 0.008;
            targetRotationX += deltaY * 0.008;
            
            cubeGroup.rotation.x = targetRotationX;
            cubeGroup.rotation.y = targetRotationY;
            
            lastX = coords.x;
            lastY = coords.y;
        }
    }

    function onEnd(e) {
        isDragging = false;
        container.style.cursor = 'pointer';
    }

    // События для мыши
    container.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    
    // События для тач-экранов (мобильные)
    container.addEventListener('touchstart', onStart, { passive: false });
    container.addEventListener('touchmove', onMove, { passive: false });
    container.addEventListener('touchend', onEnd);

    // ===== КЛИК ДЛЯ ПЕРЕМЕШИВАНИЯ/СБОРКИ =====
    let isScrambled = false;
    let isAnimating = false;
    let animProgress = 0;
    let startRot = { x: 0, y: 0, z: 0 };
    let endRot = { x: 0, y: 0, z: 0 };

    // Отличаем клик от перетаскивания
    let startClickX = 0, startClickY = 0;
    let hasMoved = false;

    function onPointerStart(e) {
        const coords = getClientXY(e);
        startClickX = coords.x;
        startClickY = coords.y;
        hasMoved = false;
    }

    function onPointerMove(e) {
        const coords = getClientXY(e);
        const dx = Math.abs(coords.x - startClickX);
        const dy = Math.abs(coords.y - startClickY);
        if (dx > 5 || dy > 5) {
            hasMoved = true;
        }
    }

    function onPointerEnd(e) {
        if (!hasMoved) {
            // Это был клик (не перетаскивание)
            if (!isAnimating) {
                startRot = {
                    x: cubeGroup.rotation.x,
                    y: cubeGroup.rotation.y,
                    z: cubeGroup.rotation.z
                };
                
                if (!isScrambled) {
                    scrambleCube();
                    isScrambled = true;
                } else {
                    resetCube();
                    isScrambled = false;
                }
                
                endRot = {
                    x: startRot.x + (Math.random() - 0.5) * 0.5,
                    y: startRot.y + (Math.random() - 0.5) * 0.5,
                    z: startRot.z + (Math.random() - 0.5) * 0.3
                };
                animProgress = 0;
                isAnimating = true;
            }
        }
    }

    container.addEventListener('mousedown', onPointerStart);
    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('mouseup', onPointerEnd);
    container.addEventListener('touchstart', onPointerStart, { passive: false });
    container.addEventListener('touchmove', onPointerMove, { passive: false });
    container.addEventListener('touchend', onPointerEnd);

    function animateRotation() {
        if (isAnimating) {
            animProgress += 0.08;
            if (animProgress >= 1) {
                animProgress = 1;
                isAnimating = false;
            }
            const t = Math.sin(animProgress * Math.PI / 2);
            cubeGroup.rotation.x = startRot.x + (endRot.x - startRot.x) * t;
            cubeGroup.rotation.y = startRot.y + (endRot.y - startRot.y) * t;
            cubeGroup.rotation.z = startRot.z + (endRot.z - startRot.z) * t;
            
            targetRotationX = cubeGroup.rotation.x;
            targetRotationY = cubeGroup.rotation.y;
        }
        requestAnimationFrame(animateRotation);
    }
    animateRotation();

    function render() {
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
}