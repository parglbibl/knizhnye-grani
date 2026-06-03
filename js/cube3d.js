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

    // ===== ВРАЩЕНИЕ МЫШКОЙ =====
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;
    let animatingMouse = false;
    let mouseAnimProgress = 0;
    let startMouseX = 0, startMouseY = 0;
    let endMouseX = 0, endMouseY = 0;

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        container.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        
        if (deltaX !== 0 || deltaY !== 0) {
            targetRotationY += deltaX * 0.008;
            targetRotationX += deltaY * 0.008;
            
            // Плавное применение вращения
            cubeGroup.rotation.x = targetRotationX;
            cubeGroup.rotation.y = targetRotationY;
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'pointer';
    });

    // Клик для перемешивания/сборки (без вращения)
    let clickTimer = null;
    container.addEventListener('click', (e) => {
        // Если было движение мыши, не считаем за клик
        if (Math.abs(targetRotationY - lastStoredY) > 0.05) return;
        
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
            
            isAnimating = true;
            animProgress = 0;
        }
    });
    
    let lastStoredY = 0;
    setInterval(() => {
        lastStoredY = targetRotationY;
    }, 100);

    let isAnimating = false;
    let animProgress = 0;
    let startRot = { x: 0, y: 0, z: 0 };
    let endRot = { x: 0, y: 0, z: 0 };

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
            
            // Синхронизируем targetRotation с текущим вращением
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

    let isScrambled = false;

    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
}