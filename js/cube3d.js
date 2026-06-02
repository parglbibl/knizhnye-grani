import * as THREE from 'three';

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    const scene = new THREE.Scene();
    scene.background = null;

    // Камера
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(3.5, 2.5, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(450, 450);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    // Правильные цвета кубика Рубика
    const colorValues = {
        white: 0xffffff,
        yellow: 0xffd700,
        red: 0xc41e3a,
        orange: 0xff8c00,
        green: 0x009e60,
        blue: 0x0051ba,
        black: 0x111111
    };

    // Создаём материалы
    const materials = {
        white: new THREE.MeshStandardMaterial({ color: colorValues.white, roughness: 0.25, metalness: 0.05 }),
        yellow: new THREE.MeshStandardMaterial({ color: colorValues.yellow, roughness: 0.25, metalness: 0.05 }),
        red: new THREE.MeshStandardMaterial({ color: colorValues.red, roughness: 0.25, metalness: 0.05 }),
        orange: new THREE.MeshStandardMaterial({ color: colorValues.orange, roughness: 0.25, metalness: 0.05 }),
        green: new THREE.MeshStandardMaterial({ color: colorValues.green, roughness: 0.25, metalness: 0.05 }),
        blue: new THREE.MeshStandardMaterial({ color: colorValues.blue, roughness: 0.25, metalness: 0.05 }),
        black: new THREE.MeshStandardMaterial({ color: colorValues.black, roughness: 0.3 })
    };

    // Для каждой позиции (x,y,z) определяем, какие цвета должны быть на гранях
    // Собранное состояние: белый верх (y=1), жёлтый низ (y=-1), 
    // зелёный перед (z=1), синий зад (z=-1),
    // оранжевый лево (x=-1), красный право (x=1)
    const getMaterialsForPosition = (x, y, z) => {
        return [
            x === 1 ? materials.orange : (x === -1 ? materials.red : materials.black),   // право
            x === -1 ? materials.red : (x === 1 ? materials.orange : materials.black),   // лево
            y === 1 ? materials.white : (y === -1 ? materials.yellow : materials.black), // верх
            y === -1 ? materials.yellow : (y === 1 ? materials.white : materials.black), // низ
            z === 1 ? materials.green : (z === -1 ? materials.blue : materials.black),   // перед
            z === -1 ? materials.blue : (z === 1 ? materials.green : materials.black)    // зад
        ];
    };

    // Создаём 27 кубиков
    const cubies = [];
    const offset = 1;
    const size = 0.94;

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const matArray = getMaterialsForPosition(x, y, z);
                const geometry = new THREE.BoxGeometry(size, size, size);
                const cubie = new THREE.Mesh(geometry, matArray);
                cubie.userData = { 
                    originalPos: { x: x * offset, y: y * offset, z: z * offset },
                    originalMaterials: matArray.map(m => m)
                };
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

    let isScrambled = false;
    let isAnimating = false;
    let animProgress = 0;
    let startRot = { x: 0, y: 0, z: 0 };
    let endRot = { x: 0, y: 0, z: 0 };

    // Перемешивание — меняем позиции кубиков местами
    // Это гарантирует, что видимыми остаются только внешние цветные грани
    function scrambleCube() {
        // Создаём массив текущих позиций
        const positions = cubies.map(c => c.position.clone());
        
        // Перемешиваем позиции
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

    function animateRotation() {
        if (isAnimating) {
            animProgress += 0.07;
            if (animProgress >= 1) {
                animProgress = 1;
                isAnimating = false;
            }
            const t = Math.sin(animProgress * Math.PI / 2);
            cubeGroup.rotation.x = startRot.x + (endRot.x - startRot.x) * t;
            cubeGroup.rotation.y = startRot.y + (endRot.y - startRot.y) * t;
            cubeGroup.rotation.z = startRot.z + (endRot.z - startRot.z) * t;
        }
        requestAnimationFrame(animateRotation);
    }
    animateRotation();

    container.addEventListener('click', () => {
        if (isAnimating) return;
        
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
            x: startRot.x + (Math.random() - 0.5) * 1.2,
            y: startRot.y + (Math.random() - 0.5) * 1.2,
            z: startRot.z + (Math.random() - 0.5) * 0.8
        };
        animProgress = 0;
        isAnimating = true;
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