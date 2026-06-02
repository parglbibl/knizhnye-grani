import * as THREE from 'three';

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    const scene = new THREE.Scene();
    scene.background = null;

    // Камера — строго спереди, без наклона
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    camera.position.set(0, 0, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(280, 280);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    // Правильные цвета кубика Рубика (стандарт WCA)
    const colors = {
        up: 0xffffff,    // белый
        down: 0xffd700,  // жёлтый
        right: 0xc41e3a, // красный
        left: 0xff8c00,  // оранжевый
        front: 0x009e60, // зелёный
        back: 0x0051ba   // синий
    };

    const materials = {
        right: new THREE.MeshStandardMaterial({ color: colors.right, roughness: 0.25, metalness: 0.05 }),
        left: new THREE.MeshStandardMaterial({ color: colors.left, roughness: 0.25, metalness: 0.05 }),
        up: new THREE.MeshStandardMaterial({ color: colors.up, roughness: 0.25, metalness: 0.05 }),
        down: new THREE.MeshStandardMaterial({ color: colors.down, roughness: 0.25, metalness: 0.05 }),
        front: new THREE.MeshStandardMaterial({ color: colors.front, roughness: 0.25, metalness: 0.05 }),
        back: new THREE.MeshStandardMaterial({ color: colors.back, roughness: 0.25, metalness: 0.05 })
    };

    // Создаём 27 кубиков
    const cubies = [];
    const offset = 1;
    const size = 0.92;

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const geometry = new THREE.BoxGeometry(size, size, size);
                const matArray = [];
                
                matArray.push(x === 1 ? materials.right : null);
                matArray.push(x === -1 ? materials.left : null);
                matArray.push(y === 1 ? materials.up : null);
                matArray.push(y === -1 ? materials.down : null);
                matArray.push(z === 1 ? materials.front : null);
                matArray.push(z === -1 ? materials.back : null);
                
                const finalMats = matArray.map(mat => mat || new THREE.MeshStandardMaterial({ color: 0x111111 }));
                const cubie = new THREE.Mesh(geometry, finalMats);
                cubie.userData = { originalPos: { x: x * offset, y: y * offset, z: z * offset } };
                cubie.position.set(x * offset, y * offset, z * offset);
                cubeGroup.add(cubie);
                cubies.push(cubie);
            }
        }
    }

    // Освещение — мягкое и равномерное
    const ambientLight = new THREE.AmbientLight(0x606080);
    scene.add(ambientLight);
    
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(0, 1, 3);
    scene.add(frontLight);
    
    const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
    topLight.position.set(0, 3, 1);
    scene.add(topLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 0, -3);
    scene.add(backLight);

    let isScrambled = false;

    // Перемешивание — обмен позициями между случайными кубиками
    function scrambleCube() {
        // Копируем текущие позиции
        const positions = cubies.map(c => c.position.clone());
        
        // Перемешиваем массив позиций
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        // Применяем новые позиции
        cubies.forEach((cubie, index) => {
            cubie.position.copy(positions[index]);
        });
    }

    function resetCube() {
        cubies.forEach(cubie => {
            cubie.position.copy(cubie.userData.originalPos);
        });
    }

    // Клик по кубику — перемешивание без наклона
    container.addEventListener('click', () => {
        if (!isScrambled) {
            scrambleCube();
            isScrambled = true;
        } else {
            resetCube();
            isScrambled = false;
        }
    });

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