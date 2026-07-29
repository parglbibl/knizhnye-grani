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

    function openGran(colorName, gx, gy) {
        gx = Math.min(2, Math.max(0, gx));
        gy = Math.min(2, Math.max(0, gy));
        if (window.openBookGran) {
            window.openBookGran(colorName, gx, gy);
        }
    }

    // ===== КЛИК МЫШКОЙ (компьютер) =====
    function onMouseClick(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

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
            
            openGran(colorName, gx, gy);
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
        onStart(e); // начинаем вращение
    }, { passive: false });

    canvas.addEventListener('touchmove', function(e) {
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - touchStartX);
        const dy = Math.abs(touch.clientY - touchStartY);
        if (dx > 10 || dy > 10) {
            touchMoved = true; // был свайп
        }
        onMove(e); // вращаем
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', function(e) {
        onEnd();
        if (!touchMoved) {
            // Это был тап без движения — вызываем клик
            onMouseClick(e.changedTouches[0]);
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