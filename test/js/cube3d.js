import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const container = document.getElementById('cube-container');
if (!container) {
    console.error('Контейнер для кубика не найден');
} else {
    function getContainerSize() {
        const rect = container.getBoundingClientRect();
        return Math.min(rect.width, rect.height);
    }

    const size = getContainerSize();
    if (size === 0) {
        requestAnimationFrame(function wait() {
            const newSize = getContainerSize();
            if (newSize === 0) {
                requestAnimationFrame(wait);
            } else {
                initCube(newSize);
            }
        });
    } else {
        initCube(size);
    }

    function initCube(size) {
        // ============================
        // 1. Базовые настройки сцены (КАК В ОРИГИНАЛЕ)
        // ============================
        const scene = new THREE.Scene();
        scene.background = null;

        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
        camera.position.set(3.5, 2.5, 4.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(size, size);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const cubeGroup = new THREE.Group();
        scene.add(cubeGroup);

        // ============================
        // 2. ДОБАВЛЯЕМ OrbitControls (вращение мышкой без ограничений)
        // ============================
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.enableZoom = false;
        controls.rotateSpeed = 1.0;
        controls.target.set(0, 0, 0);
        controls.minPolarAngle = -Math.PI; // Разрешаем крутить кубик "вверх ногами"
        controls.maxPolarAngle = Math.PI;

        // ============================
        // 3. Текстуры (КАК В ОРИГИНАЛЕ)
        // ============================
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

        const glowMaterials = {
            red: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.red), roughness: 0.3, metalness: 0.2, emissive: 0xc41e3a, emissiveIntensity: 0.25 }),
            blue: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.blue), roughness: 0.3, metalness: 0.2, emissive: 0x0051ba, emissiveIntensity: 0.25 }),
            yellow: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.yellow), roughness: 0.3, metalness: 0.2, emissive: 0xffd700, emissiveIntensity: 0.25 }),
            green: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.green), roughness: 0.3, metalness: 0.2, emissive: 0x009e60, emissiveIntensity: 0.25 }),
            white: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.white), roughness: 0.3, metalness: 0.2, emissive: 0xffffff, emissiveIntensity: 0.15 }),
            orange: new THREE.MeshStandardMaterial({ map: loadTexture(textureFiles.orange), roughness: 0.3, metalness: 0.2, emissive: 0xff8c00, emissiveIntensity: 0.25 })
        };

        const fallbackMaterials = {
            red: new THREE.MeshStandardMaterial({ color: 0xc41e3a, roughness: 0.9, metalness: 0.0 }),
            blue: new THREE.MeshStandardMaterial({ color: 0x0051ba, roughness: 0.9, metalness: 0.0 }),
            yellow: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.9, metalness: 0.0 }),
            green: new THREE.MeshStandardMaterial({ color: 0x009e60, roughness: 0.9, metalness: 0.0 }),
            white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.0 }),
            orange: new THREE.MeshStandardMaterial({ color: 0xff8c00, roughness: 0.9, metalness: 0.0 })
        };

        // ============================
        // 4. Создание кубиков (КАК В ОРИГИНАЛЕ)
        // ============================
        const offset = 0.685;  
        const sizeCubie = 0.675;    
        const radius = 0.08;    
        const segments = 4;     

        const cubies = [];

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const faceNames = [
                        x === 1 ? 'red' : 'orange',
                        x === -1 ? 'orange' : 'red',
                        y === 1 ? 'white' : 'yellow',
                        y === -1 ? 'yellow' : 'white',
                        z === 1 ? 'green' : 'blue',
                        z === -1 ? 'blue' : 'green'
                    ];

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
                        gridX: x, gridY: y, gridZ: z,
                        materials: matArray,
                        faceNames: faceNames
                    };
                    cubie.position.set(x * offset, y * offset, z * offset);
                    cubeGroup.add(cubie);
                    cubies.push(cubie);
                }
            }
        }

        // ============================
        // 5. Подсветка (КАК В ОРИГИНАЛЕ)
        // ============================
        setTimeout(() => {
            try {
                const myProgress = JSON.parse(localStorage.getItem('myGranProgress') || '[]');
                if (myProgress.length > 0) {
                    cubies.forEach(cubie => {
                        const faces = cubie.userData.faceNames;
                        const matArray = cubie.material;
                        for (let i = 0; i < faces.length; i++) {
                            const color = faces[i];
                            const gx = (i === 0 || i === 1) ? (cubie.userData.gridY + 1) : (i === 2 || i === 3) ? (cubie.userData.gridX + 1) : (cubie.userData.gridX + 1);
                            const gy = (i === 0 || i === 1) ? (cubie.userData.gridZ + 1) : (i === 2 || i === 3) ? (cubie.userData.gridZ + 1) : (cubie.userData.gridY + 1);
                            const elementId = color + '_' + String(gx) + '_' + String(gy) + '_1';
                            
                            if (myProgress.includes(elementId)) {
                                if (glowMaterials[color]) {
                                    matArray[i] = glowMaterials[color];
                                }
                            }
                        }
                    });
                }
            } catch (e) {}
        }, 100);

        // ============================
        // 6. Свет (КАК В ОРИГИНАЛЕ)
        // ============================
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

        // ============================
        // 7. Логика клика (КАК В ОРИГИНАЛЕ)
        // ============================
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

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
                
                const normal = intersects[0].face.normal.clone();
                normal.applyQuaternion(clickedCubie.quaternion);
                
                let materialIndex = 0;
                const nx = Math.round(normal.x);
                const ny = Math.round(normal.y);
                const nz = Math.round(normal.z);
                
                if (nx === 1) materialIndex = 0;
                else if (nx === -1) materialIndex = 1;
                else if (ny === 1) materialIndex = 2;
                else if (ny === -1) materialIndex = 3;
                else if (nz === 1) materialIndex = 4;
                else if (nz === -1) materialIndex = 5;
                else materialIndex = 0;

                const colorName = clickedCubie.userData.faceNames[materialIndex];
                if (!colorName) return;
                
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

        // ============================
        // 8. Обработчики (Заменяем самописное вращение на OrbitControls)
        // ============================
        
        // Защита от ложных кликов (чтобы клик срабатывал, только если не двигали мышку)
        let pointerDownPos = { x: 0, y: 0 };
        let isClick = false;

        renderer.domElement.addEventListener('pointerdown', (e) => {
            pointerDownPos.x = e.clientX;
            pointerDownPos.y = e.clientY;
            isClick = true;
        });

        renderer.domElement.addEventListener('pointerup', (e) => {
            const dx = e.clientX - pointerDownPos.x;
            const dy = e.clientY - pointerDownPos.y;
            if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && isClick) {
                onMouseClick(e);
            }
            isClick = false;
        });

        // ============================
        // 9. Рендер (КАК В ОРИГИНАЛЕ)
        // ============================
        function render() {
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }
        render();

        window.addEventListener('resize', () => {
            const rect = container.getBoundingClientRect();
            const newSize = Math.min(rect.width, rect.height);
            renderer.setSize(newSize, newSize);
            camera.aspect = 1;
            camera.updateProjectionMatrix();
        });
    }
}
