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

    // Автоматическое медленное вращение
    let autoRotate = true;
    let rotationSpeed = 0.005;

    // Перемешивание
    let isScrambled = false;

    function scrambleCube() {
        const positions = cubies.map(c => c.position.clone());
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        cubies.forEach((cubie, index) => {
            cubie.position.copy(positions[index]);
        });
    }

    function resetCube() {
        cubies.forEach(cubie => {
            cubie.position.copy(cubie.userData.originalPos);
        });
    }

    // Анимация
    function animate() {
        requestAnimationFrame(animate);
        
        if (autoRotate) {
            cubeGroup.rotation.y += rotationSpeed;
            cubeGroup.rotation.x += rotationSpeed * 0.6;
        }
        
        renderer.render(scene, camera);
    }
    animate();

    // Клик для перемешивания/сборки
    container.addEventListener('click', () => {
        if (!isScrambled) {
            scrambleCube();
            isScrambled = true;
            autoRotate = false;
            // Через 2 секунды возвращаем вращение
            setTimeout(() => {
                autoRotate = true;
            }, 2000);
        } else {
            resetCube();
            isScrambled = false;
            autoRotate = true;
        }
    });

    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
}