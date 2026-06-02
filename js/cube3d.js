import * as THREE from 'three';

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(3, 2, 4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(350, 350);
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

    // Создаём 27 кубиков, составляющих куб 3x3x3
    const cubies = [];
    const offset = 1;
    const size = 0.94;

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

    // Освещение
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(2, 3, 2);
    scene.add(mainLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-1, 1, -1);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, 1, -2);
    scene.add(rimLight);

    let isScrambled = false;
    let animating = false;
    let animProgress = 0;
    let startRot = { x: 0, y: 0, z: 0 };
    let endRot = { x: 0, y: 0, z: 0 };

    // Функция для случайного обмена позициями между кубиками (сохраняет форму)
    function scrambleCube() {
        // Создаём массив текущих позиций
        const positions = cubies.map(c => c.position.clone());
        
        // Перемешиваем позиции случайным образом
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        // Применяем новые позиции к кубикам
        cubies.forEach((cubie, index) => {
            cubie.position.copy(positions[index]);
        });
    }

    function resetCube() {
        cubies.forEach(cubie => {
            cubie.position.copy(cubie.userData.originalPos);
        });
    }

    function animateGroupRotation() {
        if (animating) {
            animProgress += 0.08;
            if (animProgress >= 1) {
                animProgress = 1;
                animating = false;
            }
            const t = Math.sin(animProgress * Math.PI / 2);
            cubeGroup.rotation.x = startRot.x + (endRot.x - startRot.x) * t;
            cubeGroup.rotation.y = startRot.y + (endRot.y - startRot.y) * t;
            cubeGroup.rotation.z = startRot.z + (endRot.z - startRot.z) * t;
        }
        requestAnimationFrame(animateGroupRotation);
    }
    animateGroupRotation();

    container.addEventListener('click', () => {
        if (animating) return;
        
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
            x: startRot.x + (Math.random() - 0.5) * Math.PI * 1.2,
            y: startRot.y + (Math.random() - 0.5) * Math.PI * 1.2,
            z: startRot.z + (Math.random() - 0.5) * Math.PI * 0.6
        };
        animProgress = 0;
        animating = true;
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