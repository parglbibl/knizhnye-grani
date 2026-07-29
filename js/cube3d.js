import * as THREE from 'three';

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
    camera.position.set(3.5, 2.5, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(320, 320);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    // ===== ЗАГРУЗКА ТЕКСТУР (ТВОИ 6 КАРТИНОК) =====
    const textureLoader = new THREE.TextureLoader();
    
    const textureFiles = {
        red: '/images/cube_textures/red.jpg',
        blue: '/images/cube_textures/blue.jpg',
        yellow: '/images/cube_textures/yellow.jpg',
        green: '/images/cube_textures/green.jpg',
        white: '/images/cube_textures/white.jpg',
        orange: '/images/cube_textures/orange.jpg'
    };

    // Карта цветов для определения тем
    const colorMap = {
        'red': 'red',
        'blue': 'blue',
        'yellow': 'yellow',
        'green': 'green',
        'white': 'white',
        'orange': 'orange'
    };

    // Создаём единый куб с натянутыми текстурами
    const size = 1.8;
    // Слегка скругляем углы для мягкости, но делаем блок цельным
    // Чтобы зазоров не было, мы не используем 27 кубиков
    
    // Материалы для 6 граней (по одной текстуре на грань)
    const materials = [
        textureLoader.load(textureFiles.red),   // Правая (+X)
        textureLoader.load(textureFiles.orange), // Левая (-X)
        textureLoader.load(textureFiles.white),  // Верхняя (+Y)
        textureLoader.load(textureFiles.yellow), // Нижняя (-Y)
        textureLoader.load(textureFiles.green),  // Передняя (+Z)
        textureLoader.load(textureFiles.blue)    // Задняя (-Z)
    ].map(texture => new THREE.MeshStandardMaterial({ 
        map: texture, 
        roughness: 0.2, 
        metalness: 0.05 
    }));

    // Один большой скруглённый куб
    const geometry = new THREE.BoxGeometry(size, size, size);
    const cube = new THREE.Mesh(geometry, materials);
    cube.userData = { isMainCube: true };
    cubeGroup.add(cube);

    // Добавляем тонкие линии-разделители, чтобы было видно квадратики (визуальный эффект)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.15 });
    const lineOffset = 0.6;
    
    for (let i = -1; i <= 1; i++) {
        // Вертикальные линии по X
        const pointsX = [
            new THREE.Vector3(i * lineOffset, -1.0, -1.0),
            new THREE.Vector3(i * lineOffset, -1.0, 1.0),
            new THREE.Vector3(i * lineOffset, 1.0, 1.0),
            new THREE.Vector3(i * lineOffset, 1.0, -1.0),
            new THREE.Vector3(i * lineOffset, -1.0, -1.0)
        ];
        const lineX = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsX), lineMaterial);
        cubeGroup.add(lineX);

        // Горизонтальные линии по Y
        const pointsY = [
            new THREE.Vector3(-1.0, i * lineOffset, -1.0),
            new THREE.Vector3(1.0, i * lineOffset, -1.0),
            new THREE.Vector3(1.0, i * lineOffset, 1.0),
            new THREE.Vector3(-1.0, i * lineOffset, 1.0),
            new THREE.Vector3(-1.0, i * lineOffset, -1.0)
        ];
        const lineY = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsY), lineMaterial);
        cubeGroup.add(lineY);

        // Линии по Z (для глубины)
        const pointsZ = [
            new THREE.Vector3(-1.0, -1.0, i * lineOffset),
            new THREE.Vector3(1.0, -1.0, i * lineOffset),
            new THREE.Vector3(1.0, 1.0, i * lineOffset),
            new THREE.Vector3(-1.0, 1.0, i * lineOffset),
            new THREE.Vector3(-1.0, -1.0, i * lineOffset)
        ];
        const lineZ = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsZ), lineMaterial);
        cubeGroup.add(lineZ);
    }

    // Освещение
    const ambientLight = new THREE.AmbientLight(0x606080, 1.0);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(2, 4, 3);
    scene.add(mainLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-2, 1, 2);
    scene.add(fillLight);

    // ===== ЛОГИКА КЛИКА (РАБОТАЕТ ПО КООРДИНАТАМ ПОВЕРХНОСТИ) =====
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function getColorName(materialIndex) {
        const colorKeys = ['red', 'orange', 'white', 'yellow', 'green', 'blue'];
        return colorKeys[materialIndex] || 'unknown';
    }

    function openGran(colorName, gx, gy) {
        gx = Math.min(2, Math.max(0, gx));
        gy = Math.min(2, Math.max(0, gy));
        if (window.openBookGran) {
            window.openBookGran(colorName, gx, gy);
        }
    }

    function onMouseClick(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cubeGroup.children, true);

        if (intersects.length > 0) {
            const hit = intersects[0];
            // Определяем грань по нормали (faceIndex)
            const faceIndex = hit.faceIndex;
            const materialIndex = Math.floor(faceIndex / 2);
            
            const colorName = getColorName(materialIndex);
            
            // Получаем координаты UV (от 0 до 1) на текстуре
            const uv = hit.uv;
            if (uv) {
                // Преобразуем UV (0..1) в координаты сетки 3x3 (0, 1, 2)
                const gx = Math.min(2, Math.floor(uv.x * 3));
                const gy = Math.min(2, Math.floor((1 - uv.y) * 3));
                openGran(colorName, gx, gy);
            }
        }
    }

    const canvas = renderer.domElement;
    canvas.addEventListener('click', onMouseClick);

    // ===== ВРАЩЕНИЕ МЫШКОЙ =====
    let isDragging = false;
    let lastX = 0, lastY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    function getXY(e) {
        if (e.touches) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function onStart(e) {
        isDragging = true;
        const coords = getXY(e);
        lastX = coords.x;
        lastY = coords.y;
        container.style.cursor = 'grabbing';
    }

    function onMove(e) {
        if (!isDragging) return;
        const coords = getXY(e);
        const deltaX = coords.x - lastX;
        const deltaY = coords.y - lastY;
        
        if (deltaX !== 0 || deltaY !== 0) {
            targetRotationY += deltaX * 0.008;
            targetRotationX += deltaY * 0.008;
            cubeGroup.rotation.x = targetRotationX;
            cubeGroup.rotation.y = targetRotationY;
            lastX = coords.x;
            lastY = coords.y;
        }
    }

    function onEnd() {
        isDragging = false;
        container.style.cursor = 'pointer';
    }

    container.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    // ===== ДЛЯ ТЕЛЕФОНА: ВРАЩЕНИЕ + КЛИК =====
    let touchStartX = 0, touchStartY = 0;
    let touchMoved = false;

    canvas.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchMoved = false;
        onStart(e);
    }, { passive: false });

    canvas.addEventListener('touchmove', function(e) {
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - touchStartX);
        const dy = Math.abs(touch.clientY - touchStartY);
        if (dx > 10 || dy > 10) {
            touchMoved = true;
        }
        onMove(e);
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', function(e) {
        onEnd();
        if (!touchMoved) {
            // Эмулируем клик для тапа без движения
            const touch = e.changedTouches[0];
            const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
            onMouseClick(fakeEvent);
        }
    }, { passive: true });

    // ===== ЗУМ =====
    let currentZoom = 4.5;

    container.addEventListener('wheel', function(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.5 : -0.5;
        currentZoom = Math.min(7, Math.max(2.5, currentZoom + delta));
        updateCamera();
    }, { passive: false });

    let lastTouchDist = 0;
    canvas.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDist = Math.sqrt(dx*dx + dy*dy);
        }
    }, { passive: true });

    canvas.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const delta = (dist - lastTouchDist) * 0.02;
            currentZoom = Math.min(7, Math.max(2.5, currentZoom - delta));
            updateCamera();
            lastTouchDist = dist;
        }
    }, { passive: false });

    function updateCamera() {
        camera.position.set(currentZoom * 0.7, currentZoom * 0.5, currentZoom * 0.9);
        camera.lookAt(0, 0, 0);
    }

    // ===== АНИМАЦИЯ =====
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