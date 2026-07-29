import * as THREE from 'three';

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    camera.position.set(3.2, 2.5, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(320, 320);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    // Цвета
    const colorValues = {
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
        white: createMaterial(colorValues.white),
        yellow: createMaterial(colorValues.yellow),
        red: createMaterial(colorValues.red),
        orange: createMaterial(colorValues.orange),
        green: createMaterial(colorValues.green),
        blue: createMaterial(colorValues.blue)
    };

    // Создаём 27 кубиков
    const cubies = [];
    const cubiesMap = new Map();
    const offset = 0.72;
    const size = 0.68;

    // Маппинг цветов для тем
    const colorMap = {
        0xffffff: 'white',
        0xffd700: 'yellow',
        0xc41e3a: 'red',
        0xff8c00: 'orange',
        0x009e60: 'green',
        0x0051ba: 'blue'
    };

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
                cubie.userData = { 
                    originalPos: { x: x * offset, y: y * offset, z: z * offset },
                    gridX: x, gridY: y, gridZ: z
                };
                cubie.position.set(x * offset, y * offset, z * offset);
                cubeGroup.add(cubie);
                cubies.push(cubie);
                cubiesMap.set(`${x},${y},${z}`, cubie);
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

    // ===== ЛОГИКА КЛИКА =====
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function getColorName(colorHex) {
        return colorMap[colorHex] || 'unknown';
    }

    function getGridCoords(position) {
        const x = Math.round(position.x / offset);
        const y = Math.round(position.y / offset);
        const z = Math.round(position.z / offset);
        return { x, y, z };
    }

    function onCanvasClick(event) {
        event.stopPropagation();
        
        let clientX, clientY;
        if (event.touches) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
            event.preventDefault();
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cubies);

        if (intersects.length > 0) {
            const clickedCubie = intersects[0].object;
            const pos = clickedCubie.position;
            const coords = getGridCoords(pos);
            
            const faceIndex = intersects[0].faceIndex;
            const materialIndex = Math.floor(faceIndex / 2);
            const colorHex = clickedCubie.material[materialIndex].color.getHex();
            const colorName = getColorName(colorHex);
            
            let gx = 0, gy = 0;
            
            if (materialIndex === 0 || materialIndex === 1) {
                gx = coords.y + 1;
                gy = coords.z + 1;
            } else if (materialIndex === 2 || materialIndex === 3) {
                gx = coords.x + 1;
                gy = coords.z + 1;
            } else {
                gx = coords.x + 1;
                gy = coords.y + 1;
            }
            
            gx = Math.min(2, Math.max(0, gx));
            gy = Math.min(2, Math.max(0, gy));
            
            if (window.openBookGran) {
                window.openBookGran(colorName, gx, gy);
            }
        }
    }

    // ===== КЛИК И ТАЧ =====
    const canvas = renderer.domElement;
    canvas.addEventListener('click', onCanvasClick);

    // ===== ВРАЩЕНИЕ МЫШКОЙ И ПАЛЬЦЕМ =====
    let isDragging = false;
    let lastX = 0, lastY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    // Разделим движение на мобилке и на мышке
    function getTouchXY(e) {
        if (e.touches) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function onStart(e) {
        e.preventDefault();
        isDragging = true;
        const coords = getTouchXY(e);
        lastX = coords.x;
        lastY = coords.y;
        container.style.cursor = 'grabbing';
    }

    function onMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const coords = getTouchXY(e);
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

    function onEnd(e) {
        isDragging = false;
        container.style.cursor = 'pointer';
    }

    // Вращение с мыши (компьютер)
    container.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    
    // Вращение с пальца (мобильный) — используем ПЕРЕДВИЖЕНИЕ по canvas
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchend', onEnd, { passive: false });

    // ===== ОТДЕЛЬНЫЙ ОБРАБОТЧИК ДЛЯ ТАПА (НАЖАТИЕ БЕЗ ДВИЖЕНИЯ) НА МОБИЛЬНОМ =====
    // Это критично: если палец не двигался — считаем это кликом
    let touchStartPos = { x: 0, y: 0 };
    let touchMoved = false;

    canvas.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        touchStartPos.x = touch.clientX;
        touchStartPos.y = touch.clientY;
        touchMoved = false;
    }, { passive: true });

    canvas.addEventListener('touchmove', function(e) {
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - touchStartPos.x);
        const dy = Math.abs(touch.clientY - touchStartPos.y);
        if (dx > 10 || dy > 10) {
            touchMoved = true; // был свайп — не будет клика
        }
    }, { passive: true });

    canvas.addEventListener('touchend', function(e) {
        if (!touchMoved) {
            // Это был именно клик (тап) без движения
            const touch = e.changedTouches[0];
            // Искусственно генерируем событие
            const fakeEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                touches: e.touches,
                preventDefault: function() {}
            };
            onCanvasClick(fakeEvent);
        }
    }, { passive: true });

    // ===== АНИМАЦИЯ ВРАЩЕНИЯ =====
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