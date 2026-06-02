import * as THREE from 'three';

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    const scene = new THREE.Scene();
    scene.background = null;

    // Камера подальше, чтобы кубик полностью помещался
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
        blue: 0x0051ba
    };

    // Создаём материалы для всех 6 цветов
    const materialCache = {
        white: new THREE.MeshStandardMaterial({ color: colorValues.white, roughness: 0.25, metalness: 0.05 }),
        yellow: new THREE.MeshStandardMaterial({ color: colorValues.yellow, roughness: 0.25, metalness: 0.05 }),
        red: new THREE.MeshStandardMaterial({ color: colorValues.red, roughness: 0.25, metalness: 0.05 }),
        orange: new THREE.MeshStandardMaterial({ color: colorValues.orange, roughness: 0.25, metalness: 0.05 }),
        green: new THREE.MeshStandardMaterial({ color: colorValues.green, roughness: 0.25, metalness: 0.05 }),
        blue: new THREE.MeshStandardMaterial({ color: colorValues.blue, roughness: 0.25, metalness: 0.05 }),
        black: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3 })
    };

    // Определяем, какой цвет должна иметь каждая грань у каждого кубика
    // Формат: для каждой позиции (x,y,z) указываем цвета граней [правая, левая, верхняя, нижняя, передняя, задняя]
    const cubeColors = {};

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const key = `${x},${y},${z}`;
                cubeColors[key] = {
                    right: x === 1 ? 'orange' : (x === -1 ? 'red' : 'black'),
                    left: x === -1 ? 'red' : (x === 1 ? 'orange' : 'black'),
                    up: y === 1 ? 'white' : (y === -1 ? 'yellow' : 'black'),
                    down: y === -1 ? 'yellow' : (y === 1 ? 'white' : 'black'),
                    front: z === 1 ? 'green' : (z === -1 ? 'blue' : 'black'),
                    back: z === -1 ? 'blue' : (z === 1 ? 'green' : 'black')
                };
            }
        }
    }

    // Создаём 27 кубиков с правильными материалами
    const cubies = [];
    const offset = 1;
    const size = 0.92;

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const key = `${x},${y},${z}`;
                const colors = cubeColors[key];
                
                const matArray = [
                    materialCache[colors.right],
                    materialCache[colors.left],
                    materialCache[colors.up],
                    materialCache[colors.down],
                    materialCache[colors.front],
                    materialCache[colors.back]
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
    
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 1, -3);
    scene.add(backLight);

    let isScrambled = false;

    // Перемешивание — меняем материалы (цвета граней) местами между кубиками
    function scrambleCube() {
        // Собираем все материалы со всех граней всех кубиков
        const allMaterials = [];
        cubies.forEach(cubie => {
            const mats = cubie.material;
            for (let i = 0; i < 6; i++) {
                allMaterials.push(mats[i]);
            }
        });
        
        // Перемешиваем массив материалов
        for (let i = allMaterials.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allMaterials[i], allMaterials[j]] = [allMaterials[j], allMaterials[i]];
        }
        
        // Раздаём перемешанные материалы обратно кубикам
        let idx = 0;
        cubies.forEach(cubie => {
            const newMats = [];
            for (let i = 0; i < 6; i++) {
                newMats.push(allMaterials[idx++]);
            }
            cubie.material = newMats;
        });
    }

    function resetCube() {
        // Восстанавливаем исходные материалы
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const key = `${x},${y},${z}`;
                    const colors = cubeColors[key];
                    const matArray = [
                        materialCache[colors.right],
                        materialCache[colors.left],
                        materialCache[colors.up],
                        materialCache[colors.down],
                        materialCache[colors.front],
                        materialCache[colors.back]
                    ];
                    
                    const cubie = cubies.find(c => 
                        c.userData.originalPos.x === x * offset && 
                        c.userData.originalPos.y === y * offset && 
                        c.userData.originalPos.z === z * offset
                    );
                    if (cubie) {
                        cubie.material = matArray;
                    }
                }
            }
        }
    }

    // Анимация вращения при клике
    let isAnimating = false;
    let animProgress = 0;
    let startRot = { x: 0, y: 0, z: 0 };
    let endRot = { x: 0, y: 0, z: 0 };

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