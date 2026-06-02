import * as THREE from 'three';

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    // Сцена, камера, рендерер
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfef9f0); // цвет фона как у сайта

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(2.5, 2, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(300, 300);
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
        right: new THREE.MeshStandardMaterial({ color: colors.orange, roughness: 0.3, metalness: 0.1 }),
        left: new THREE.MeshStandardMaterial({ color: colors.red, roughness: 0.3, metalness: 0.1 }),
        up: new THREE.MeshStandardMaterial({ color: colors.white, roughness: 0.3, metalness: 0.1 }),
        down: new THREE.MeshStandardMaterial({ color: colors.yellow, roughness: 0.3, metalness: 0.1 }),
        front: new THREE.MeshStandardMaterial({ color: colors.green, roughness: 0.3, metalness: 0.1 }),
        back: new THREE.MeshStandardMaterial({ color: colors.blue, roughness: 0.3, metalness: 0.1 })
    };

    // Создание 27 маленьких кубиков (3x3x3)
    const cubies = [];
    const offset = 1;
    const size = 0.96;

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const geometry = new THREE.BoxGeometry(size, size, size);
                const materialArray = [];
                
                // Определяем, какие грани рисовать
                materialArray.push(x === 1 ? materials.right : null);
                materialArray.push(x === -1 ? materials.left : null);
                materialArray.push(y === 1 ? materials.up : null);
                materialArray.push(y === -1 ? materials.down : null);
                materialArray.push(z === 1 ? materials.front : null);
                materialArray.push(z === -1 ? materials.back : null);
                
                // Заменяем null на чёрный материал для внутренних граней
                const finalMaterials = materialArray.map(mat => mat || new THREE.MeshStandardMaterial({ color: 0x222222 }));
                
                const cubie = new THREE.Mesh(geometry, finalMaterials);
                cubie.position.set(x * offset, y * offset, z * offset);
                cubeGroup.add(cubie);
                cubies.push(cubie);
            }
        }
    }

    // Освещение
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1, 2, 1);
    scene.add(dirLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-1, 1, -1);
    scene.add(backLight);

    let isScrambled = false;
    let targetRotation = { x: 0, y: 0, z: 0 };
    let currentRotation = { x: 0, y: 0, z: 0 };
    let animating = false;
    let animationProgress = 0;
    let startRotation = { x: 0, y: 0, z: 0 };
    let endRotation = { x: 0, y: 0, z: 0 };

    // Плавное вращение кубика
    function animateRotation() {
        if (animating) {
            animationProgress += 0.05;
            if (animationProgress >= 1) {
                animationProgress = 1;
                animating = false;
            }
            const t = Math.sin(animationProgress * Math.PI / 2);
            cubeGroup.rotation.x = startRotation.x + (endRotation.x - startRotation.x) * t;
            cubeGroup.rotation.y = startRotation.y + (endRotation.y - startRotation.y) * t;
            cubeGroup.rotation.z = startRotation.z + (endRotation.z - startRotation.z) * t;
        } else {
            // Постоянное медленное вращение
            cubeGroup.rotation.y += 0.005;
            cubeGroup.rotation.x += 0.003;
        }
        requestAnimationFrame(animateRotation);
    }
    
    animateRotation();

    // Обработка клика на кубик
    container.addEventListener('click', () => {
        if (animating) return;
        
        // Сохраняем начальное состояние вращения
        startRotation = {
            x: cubeGroup.rotation.x,
            y: cubeGroup.rotation.y,
            z: cubeGroup.rotation.z
        };
        
        if (!isScrambled) {
            // Перемешиваем: изменяем позиции кубиков
            cubies.forEach(cubie => {
                cubie.position.x += (Math.random() - 0.5) * 0.8;
                cubie.position.y += (Math.random() - 0.5) * 0.8;
                cubie.position.z += (Math.random() - 0.5) * 0.8;
            });
            isScrambled = true;
        } else {
            // Собираем обратно
            cubies.forEach(cubie => {
                cubie.position.x = Math.round(cubie.position.x / 1.05) * 1.05;
                cubie.position.y = Math.round(cubie.position.y / 1.05) * 1.05;
                cubie.position.z = Math.round(cubie.position.z / 1.05) * 1.05;
            });
            isScrambled = false;
        }
        
        // Плавный поворот при клике
        endRotation = {
            x: startRotation.x + (Math.random() - 0.5) * Math.PI * 2,
            y: startRotation.y + (Math.random() - 0.5) * Math.PI * 2,
            z: startRotation.z + (Math.random() - 0.5) * Math.PI * 2
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
    
    // Рендер-цикл
    function render() {
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();
}