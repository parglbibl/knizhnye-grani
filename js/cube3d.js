import * as THREE from 'three';

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(3, 2.5, 4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(320, 320);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    // Цвета кубика Рубика
    const colors = {
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
        white: createMaterial(colors.white),
        yellow: createMaterial(colors.yellow),
        red: createMaterial(colors.red),
        orange: createMaterial(colors.orange),
        green: createMaterial(colors.green),
        blue: createMaterial(colors.blue)
    };

    // Создаём 27 кубиков
    const cubies = [];
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

    // ===== ВРАЩЕНИЕ МЫШКОЙ =====
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        container.style.cursor = 'grabbing';
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        
        if (deltaX !== 0 || deltaY !== 0) {
            targetRotationY += deltaX * 0.008;
            targetRotationX += deltaY * 0.008;
            
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

    // Перемешивание при клике (без движения мыши)
    let isScrambled = false;
    let clickTimer = null;
    let startClickX, startClickY;

    container.addEventListener('mousedown', (e) => {
        startClickX = e.clientX;
        startClickY = e.clientY;
        clickTimer = setTimeout(() => {
            clickTimer = null;
        }, 100);
    });

    container.addEventListener('click', (e) => {
        // Если было движение мыши больше 3px, не считаем за клик
        const dx = Math.abs(e.clientX - startClickX);
        const dy = Math.abs(e.clientY - startClickY);
        
        if (dx < 3 && dy < 3) {
            if (!isScrambled) {
                const positions = cubies.map(c => c.position.clone());
                for (let i = positions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [positions[i], positions[j]] = [positions[j], positions[i]];
                }
                cubies.forEach((cubie, index) => {
                    cubie.position.copy(positions[index]);
                });
                isScrambled = true;
            } else {
                cubies.forEach(cubie => {
                    cubie.position.copy(cubie.userData.originalPos);
                });
                isScrambled = false;
            }
        }
    });

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
}