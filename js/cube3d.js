import * as THREE from 'three';

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    // Сцена с прозрачным фоном
    const scene = new THREE.Scene();
    scene.background = null;

    // Камера — подальше, чтобы кубик был виден целиком
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(3, 2, 4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    // Правильные цвета для кубика Рубика
    const colorMap = {
        'right': 0xc41e3a,  // красный
        'left': 0xff8c00,   // оранжевый
        'up': 0xffffff,     // белый
        'down': 0xffd700,   // жёлтый
        'front': 0x009e60,  // зелёный
        'back': 0x0051ba     // синий
    };

    // Материалы
    const materials = {
        right: new THREE.MeshStandardMaterial({ color: colorMap.right, roughness: 0.2, metalness: 0.05 }),
        left: new THREE.MeshStandardMaterial({ color: colorMap.left, roughness: 0.2, metalness: 0.05 }),
        up: new THREE.MeshStandardMaterial({ color: colorMap.up, roughness: 0.2, metalness: 0.05 }),
        down: new THREE.MeshStandardMaterial({ color: colorMap.down, roughness: 0.2, metalness: 0.05 }),
        front: new THREE.MeshStandardMaterial({ color: colorMap.front, roughness: 0.2, metalness: 0.05 }),
        back: new THREE.MeshStandardMaterial({ color: colorMap.back, roughness: 0.2, metalness: 0.05 })
    };

    // Создание 27 маленьких кубиков
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
                
                const finalMats = matArray.map(mat => mat || new THREE.MeshStandardMaterial({ color: 0x222222 }));
                const cubie = new THREE.Mesh(geometry, finalMats);
                cubie.position.set(x * offset, y * offset, z * offset);
                cubeGroup.add(cubie);
                cubies.push({
                    mesh: cubie,
                    originalPos: { x: x * offset, y: y * offset, z: z * offset },
                    originalMat: finalMats
                });
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

    let isScrambled = false;
    let currentRotation = { x: 0, y: 0, z: 0 };

    // Функция для случайного вращения грани (эффект перемешивания)
    function scrambleCube() {
        // Сохраняем текущие позиции и материалы
        const cubieData = cubies.map(c => ({
            pos: c.mesh.position.clone(),
            mats: c.mesh.material
        }));
        
        // Применяем случайные сдвиги для каждой грани
        cubies.forEach(cubie => {
            // Случайное вращение вокруг оси
            const axis = Math.floor(Math.random() * 3);
            const angle = (Math.floor(Math.random() * 4) * Math.PI / 2);
            
            if (axis === 0) { // вращение вокруг X
                cubie.mesh.position.x = cubie.originalPos.x;
                cubie.mesh.position.y = cubie.originalPos.y * Math.cos(angle) - cubie.originalPos.z * Math.sin(angle);
                cubie.mesh.position.z = cubie.originalPos.y * Math.sin(angle) + cubie.originalPos.z * Math.cos(angle);
            } else if (axis === 1) { // вращение вокруг Y
                cubie.mesh.position.y = cubie.originalPos.y;
                cubie.mesh.position.x = cubie.originalPos.x * Math.cos(angle) + cubie.originalPos.z * Math.sin(angle);
                cubie.mesh.position.z = -cubie.originalPos.x * Math.sin(angle) + cubie.originalPos.z * Math.cos(angle);
            } else { // вращение вокруг Z
                cubie.mesh.position.z = cubie.originalPos.z;
                cubie.mesh.position.x = cubie.originalPos.x * Math.cos(angle) - cubie.originalPos.y * Math.sin(angle);
                cubie.mesh.position.y = cubie.originalPos.x * Math.sin(angle) + cubie.originalPos.y * Math.cos(angle);
            }
        });
    }

    function resetCube() {
        cubies.forEach(cubie => {
            cubie.mesh.position.copy(cubie.originalPos);
        });
    }

    // Анимация вращения всей группы при клике
    let animating = false;
    let animProgress = 0;
    let startRot = { x: 0, y: 0, z: 0 };
    let endRot = { x: 0, y: 0, z: 0 };
    
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

    // Клик по кубику
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
            x: startRot.x + (Math.random() - 0.5) * Math.PI * 1.5,
            y: startRot.y + (Math.random() - 0.5) * Math.PI * 1.5,
            z: startRot.z + (Math.random() - 0.5) * Math.PI * 0.8
        };
        animProgress = 0;
        animating = true;
    });

    // Рендер
    function render() {
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    // Адаптация к размеру
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
}