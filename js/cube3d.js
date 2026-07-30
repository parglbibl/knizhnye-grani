import * as THREE from 'three';
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

        // ===== ЛОГИКА КЛИКА =====
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

        // ===== ОБРАБОТЧИКИ МЫШИ (ПК) =====
        let isMouseDown = false;
        let mouseDownX = 0, mouseDownY = 0;
        let mouseLastX = 0, mouseLastY = 0;
        let mouseMovedThreshold = false;

        function onMouseDown(e) {
            const coords = getXY(e);
            isMouseDown = true;
            mouseDownX = coords.x;
            mouseDownY = coords.y;
            mouseLastX = coords.x;
            mouseLastY = coords.y;
            mouseMovedThreshold = false;
            container.style.cursor = 'grabbing';
        }

        function onMouseMove(e) {
            if (!isMouseDown) return;
            const coords = getXY(e);
            const deltaX = coords.x - mouseLastX;
            const deltaY = coords.y - mouseLastY;
            
            if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
                if (Math.abs(coords.x - mouseDownX) > 6 || Math.abs(coords.y - mouseDownY) > 6) {
                    mouseMovedThreshold = true;
                }
                cubeGroup.rotation.y += deltaX * 0.008;
                cubeGroup.rotation.x += deltaY * 0.008;
                mouseLastX = coords.x;
                mouseLastY = coords.y;
            }
        }

        function onMouseUp(e) {
            isMouseDown = false;
            container.style.cursor = 'pointer';
            
            if (!mouseMovedThreshold) {
                onMouseClick(e);
            }
        }

        container.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        // ===== ОБРАБОТЧИКИ ТАЧА (ТЕЛЕФОН) =====
        let touchStartX = 0, touchStartY = 0;
        let touchLastX = 0, touchLastY = 0;
        let touchMovedThreshold = false;

        function onTouchStart(e) {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchLastX = touch.clientX;
            touchLastY = touch.clientY;
            touchMovedThreshold = false;
        }

        function onTouchMove(e) {
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchLastX;
            const deltaY = touch.clientY - touchLastY;
            
            if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
                if (Math.abs(touch.clientX - touchStartX) > 10 || Math.abs(touch.clientY - touchStartY) > 10) {
                    touchMovedThreshold = true;
                }
                cubeGroup.rotation.y += deltaX * 0.008;
                cubeGroup.rotation.x += deltaY * 0.008;
                touchLastX = touch.clientX;
                touchLastY = touch.clientY;
            }
        }

        function onTouchEnd(e) {
            if (!touchMovedThreshold) {
                onMouseClick(e);
            }
        }

        const el = renderer.domElement;
        el.addEventListener('touchstart', onTouchStart, { passive: false });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd, { passive: true });

        // ===== ЗУМ =====
        let currentZoom = 4.5;

        container.addEventListener('wheel', function(e) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.5 : -0.5;
            currentZoom = Math.min(7, Math.max(2.5, currentZoom + delta));
            updateCamera();
        }, { passive: false });

        let lastTouchDist = 0;
        el.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDist = Math.sqrt(dx*dx + dy*dy);
            }
        }, { passive: true });

        el.addEventListener('touchmove', function(e) {
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
            const rect = container.getBoundingClientRect();
            const newSize = Math.min(rect.width, rect.height);
            renderer.setSize(newSize, newSize);
            camera.aspect = 1;
            camera.updateProjectionMatrix();
        });
    }
}
