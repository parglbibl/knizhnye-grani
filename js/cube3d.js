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
                    gridX: x, gridY: y, gridZ: z,
                    materials: matArray
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

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function getColorName(materialColor) {
        const colorHex = materialColor.getHex();
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
        mouse.y