import * as THREE from 'three';

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    // Сцена с прозрачным фоном
    const scene = new THREE.Scene();
    scene.background = null; // прозрачный фон

    // Камера — строго спереди, без наклона
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(2.5, 0, 3.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true для прозрачности
    renderer.setSize(250, 250);
    renderer.setClearColor(0x000000, 0); // полностью прозрачный фон
    container.appendChild(renderer.domElement);

    // Группа для кубика
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    // Цвета граней
    const colors = {
        white: 0xffffff,
        yellow: 0xffd966,
        red: 0xff4d4d,
        orange: 0xffa64d,
        blue: 0x4da6ff,
        green: 0x66cc66
    };

    // Материалы для граней
    const materials = {
        right: new THREE.MeshStandardMaterial({ color: colors.orange, roughness: 0.3, metalness: 0.05 }),
        left: new THREE.MeshStandardMaterial({ color: colors.red, roughness: 0.3, metalness: 0.05 }),
        up: new THREE.MeshStandardMaterial({ color: colors.white, roughness: 0.3, metalness: 0.05 }),
        down: new THREE.MeshStandardMaterial({ color: colors.yellow, roughness: 0.3, metalness: 0.05 }),
        front: new THREE.MeshStandardMaterial({ color: colors.green, roughness: 0.3, metalness: 0.05 }),
        back: new THREE.MeshStandardMaterial({ color: colors.blue, roughness: 0.3, metalness: 0.05 })
    };

    // Создание 27 маленьких кубиков (3x3x3) — собранное состояние
    const cubies = [];
    const offset = 1;
    const size = 0.96;

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const geometry = new THREE.BoxGeometry(size, size, size);
                const materialArray = [];
                
                materialArray.push(x === 1 ? materials.right : null);
                materialArray.push(x === -1 ? materials.left : null);
                materialArray.push(y === 1 ? materials.up : null);
                materialArray.push(y === -1 ? materials.down : null);
                materialArray.push(z === 1 ? materials.front : null);
                materialArray.push(z === -1 ? materials.back : null);
                
                const finalMaterials = materialArray.map(mat => mat || new THREE.MeshStandardMaterial({ color: 0x111111 }));
                
                const cubie = new THREE.Mesh(geometry, finalMaterials);
                cubie.position.set(x * offset, y * offset, z * offset);
                cubeGroup.add(cubie);
                cubies.push(cubie);
            }
        }
    }

    // Освещение — мягкое, чтобы цвета выглядели естественно
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(1, 2, 2);
    scene.add(mainLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-1, 1, -1);
    scene.add(fillLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 0, -2);
    scene.add(backLight);

    let isScrambled = false;
    let animating = false;
    let animationProgress = 0;
    let startRotation = { x: 0, y: 0, z: 0 };
    let endRotation = { x: 0, y: 0, z: 0 };
    let originalPositions = cubies.map(cubie => ({
        x: cubie.position.x,
        y: cubie.position.y,
        z: cubie.position.z
    }));

    // Анимация поворота при клике
    function animateRotation() {
        if (animating) {
            animationProgress += 0.1;
            if (animationProgress >= 1) {
                animationProgress = 1;
                animating = false;
            }
            const t = Math.sin(animationProgress * Math.PI / 2);
            cubeGroup.rotation.x = startRotation.x + (endRotation.x - startRotation.x) * t;
            cubeGroup.rotation.y = startRotation.y + (endRotation.y - startRotation.y) * t;
            cubeGroup.rotation.z = startRotation.z + (endRotation.z - startRotation.z) * t;
        }
        requestAnimationFrame(animateRotation);
    }
    
    animateRotation();

    // Обработка клика на кубик
    container.addEventListener('click', () => {
        if (animating) return;
        
        startRotation = {
            x: cubeGroup.rotation.x,
            y: cubeGroup.rotation.y,
            z: cubeGroup.rotation.z
        };
        
        if (!isScrambled) {
            // Перемешиваем
            cubies.forEach((cubie, index) => {
                cubie.position.x = originalPositions[index].x + (Math.random() - 0.5) * 1.2;
                cubie.position.y = originalPositions[index].y + (Math.random() - 0.5) * 1.2;
                cubie.position.z = originalPositions[index].z + (Math.random() - 0.5) * 1.2;
            });
            isScrambled = true;
        } else {
            // Собираем обратно
            cubies.forEach((cubie, index) => {
                cubie.position.x = originalPositions[index].x;
                cubie.position.y = originalPositions[index].y;
                cubie.position.z = originalPositions[index].z;
            });
            isScrambled = false;
        }
        
        endRotation = {
            x: startRotation.x + (Math.random() - 0.5) * Math.PI * 1.2,
            y: startRotation.y + (Math.random() - 0.5) * Math.PI * 1.2,
            z: startRotation.z + (Math.random() - 0.5) * Math.PI * 0.6
        };
        animationProgress = 0;
        animating = true;
    });

    // Адаптация под размер
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
    
    function render() {
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();
}