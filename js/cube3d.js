import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

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

    // ===== ЗАГРУЗКА ТЕКСТУР =====
    const textureLoader = new THREE.TextureLoader();
    
    const textureFiles = {
        red: '/images/cube_textures/red.jpg',
        blue: '/images/cube_textures/blue.jpg',
        yellow: '/images/cube_textures/yellow.jpg',
        green: '/images/cube_textures/green.jpg',
        white: '/images/cube_textures/white.jpg',
        orange: '/images/cube_textures/orange.jpg'
    };

    const loadTexture = (url) => {
        const tex = textureLoader.load(url);
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        return tex;
    };

    const textureMaterials = {
        red: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.red), roughness: 0.9, metalness: 0.0 }),
        blue: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.blue), roughness: 0.9, metalness: 0.0 }),
        yellow: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.yellow), roughness: 0.9, metalness: 0.0 }),
        green: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.green), roughness: 0.9, metalness: 0.0 }),
        white: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.white), roughness: 0.9, metalness: 0.0 }),
        orange: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.orange), roughness: 0.9, metalness: 0.0 })
    };

    const fallbackMaterials = {
        red: new THREE.MeshStandardMaterial({ color: 0xc41e3a, roughness: 0.9, metalness: 0.0 }),
        blue: new THREE.MeshStandardMaterial({ color: 0x0051ba, roughness: 0.9, metalness: 0.0 }),
        yellow: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.9, metalness: 0.0 }),
        green: new THREE.MeshStandardMaterial({ color: 0x009e60, roughness: 0.9, metalness: 0.0 }),
        white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.0 }),
        orange: new THREE.MeshStandardMaterial({ color: 0xff8c00, roughness: 0.9, metalness: 0.0 })
    };

    const colorMap = {
        0xc41e3a: 'red',
        0x0051ba: 'blue',
        0xffd700: 'yellow',
        0x009e60: 'green',
        0xffffff: 'white',
        0xff8c00: 'orange'
    };

    const offset = 0.685;  
    const sizeCubie = 0.675;    
    const radius = 0.08;    
    const segments = 4;     

    const cubies = [];

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const matArray = [
                    x === 1 ? textureMaterials.red || fallbackMaterials.red : (x === -1 ? textureMaterials.orange || fallbackMaterials.orange : textureMaterials.red || fallbackMaterials.red),
                    x === -1 ? textureMaterials.orange || fallbackMaterials.orange : (x === 1 ? textureMaterials.red || fallbackMaterials.red : textureMaterials.orange || fallbackMaterials.orange),
                    y === 1 ? textureMaterials.white || fallbackMaterials.white : (y === -1 ? textureMaterials.yellow || fallbackMaterials.yellow : textureMaterials.white || fallbackMaterials.white),
                    y === -1 ? textureMaterials.yellow || fallbackMaterials.yellow : (y === 1 ? textureMaterials.white || fallbackMaterials.white : textureMaterials.yellow || fallbackMaterials.yellow),
                    z === 1 ? textureMaterials.green || fallbackMaterials.green : (z === -1 ? textureMaterials.blue || fallbackMaterials.blue : textureMaterials.green || fallbackMaterials.green),
                    z === -1 ? textureMaterials.blue || fallbackMaterials.blue : (z === 1 ? textureMaterials.green || fallbackMaterials.green : textureMaterials.blue || fallbackMaterials.blue)
                ];
                
                const geometry = new RoundedBoxGeometry(sizeCubie, sizeCubie, sizeCubie, segments, radius);
                const cubie = new THREE.Mesh(geometry, matArray);
                cubie.userData = { 
                    originalPos: { x: x * offset, y: y * offset, z: z * offset },
                    gridX: x, gridY: y, gridZ: z
                };
                cubie.position.set(x * offset, y * offset, z * offset);
                cubeGroup.add(cubie);
                cubies.push(cubie);
            }
        }
    }

    const ambientLight = new THREE.AmbientLight(0x606080, 0.6);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(2, 4, 3);
    scene.add(mainLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-2, 1, 2);
    scene.add(fillLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
    backLight.position.set(0, 1, -3);
    scene.add(backLight);

    // ===== ЛОГИКА КЛИКА (ПО ИНДЕКСУ ТРЕУГОЛЬНИКА) =====
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

    // ===== ВРАЩЕНИЕ =====
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

    // ===== ДЛЯ ТЕЛЕФОНА =====
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
            onMouseClick(e.changedTouches[0]);
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