import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { gsap } from 'gsap';
import GUI from 'lil-gui';

// Loading Brain 3D Manager
// Enhanced Loading Brain 3D Manager with Full Functionality
class LoadingBrain3D {
    constructor() {
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        
        // Brain model
        this.brainModel = null;
        this.brainParts = [];
        
        // Animation and progress
        this.colorProgress = 0;
        this.targetProgress = 0;
        this.regenerationActive = false;
        this.rotationSpeed = 0.01;
        
        // Loaders
        this.fbxLoader = new FBXLoader();
        
        // Lighting
        this.lights = [];
        
        // Performance optimization
        this.isVisible = true;
        this.lastUpdateTime = 0;
        this.updateInterval = 16; // ~60fps
        
        // FPS tracking
        this.fps = 0;
        this.frameCount = 0;
        this.lastFPSTime = 0;
    }

    async init() {
        const container = document.getElementById('loading-brain-3d');
        if (!container) {
            console.warn('Loading brain container not found');
            return;
        }

        // Setup 3D scene
        this.setupScene();
        this.setupCamera();
        this.setupRenderer(container);
        this.setupLighting();

        // Load brain model and setup animations
        try {
            console.log('🧠 Loading brain model for loading screen...');
            await this.loadBrainModel();
            console.log('✅ Brain model loaded successfully');
        } catch (error) {
            console.warn('⚠️ FBX brain not found, creating procedural brain');
            this.createProceduralBrain();
        }

        // Start animations (brain starts revolving immediately)
        this.startRegeneration(); // Make brain visible immediately
        this.animate();

        console.log('🎬 Loading brain 3D initialized successfully');
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.01);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        this.camera.position.set(0, 0, 12);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer(container) {
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(400, 400);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Key light for brain highlighting
        const directionalLight = new THREE.DirectionalLight(0xffff00, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        
        // Fill light for better visibility
        const fillLight = new THREE.PointLight(0xffffff, 0.3, 50);
        fillLight.position.set(-5, -5, 5);
        this.scene.add(fillLight);
        this.lights.push(fillLight);
        
        // Neural glow light
        const neuralLight = new THREE.PointLight(0x00ffff, 0.5, 30);
        neuralLight.position.set(0, 0, 8);
        this.scene.add(neuralLight);
        this.lights.push(neuralLight);
    }

    async loadBrainModel() {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                '/BRAIN.fbx',
                (model) => {
                    this.brainModel = model;
                    model.scale.setScalar(0.35); // Increased size even more
                    model.position.set(0, 0, 0);
                    
                    // Process model for progressive loading animation
                    this.brainParts = [];
                    model.traverse((child) => {
                        if (child.isMesh) {
                            // Store original properties
                            child.userData.originalPosition = child.position.clone();
                            child.userData.originalRotation = child.rotation.clone();
                            child.userData.originalScale = child.scale.clone();
                            
                            // Create purplish wireframe material for FBX brain
                            child.material = new THREE.LineBasicMaterial({
                                color: 0x6b46c1, // Darker purple color
                                transparent: true,
                                opacity: 0.8,
                                linewidth: 2
                            });
                            
                            // Convert mesh to wireframe lines
                            const wireframeGeometry = new THREE.WireframeGeometry(child.geometry);
                            const wireframeMesh = new THREE.LineSegments(wireframeGeometry, child.material);
                            
                            // Replace the mesh with wireframe lines
                            child.parent.add(wireframeMesh);
                            child.parent.remove(child);
                            
                            // Start parts at original position (no scattering)
                            wireframeMesh.position.copy(child.userData.originalPosition);
                            wireframeMesh.scale.copy(child.userData.originalScale);
                            
                            this.brainParts.push(wireframeMesh);
                        }
                    });
                    
                    this.scene.add(model);
                    resolve(model);
                },
                (progress) => {
                    console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
                },
                (error) => {
                    console.log('Could not load FBX brain model:', error);
                    reject(error);
                }
            );
        });
    }

    createProceduralBrain() {
        // Create a very simple brain structure with fewer lines and glow effect
        const brainGroup = new THREE.Group();
        
        // Simple brain base shape - very minimal segments for fewer lines
        const brainGeometry = new THREE.SphereGeometry(3.5, 6, 4); // Even fewer segments
        
        // Create basic walnut-like grooves - very simple
        const positions = brainGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Simple walnut groove pattern - just basic indentations
            const groove1 = Math.sin(x * 1.5) * 0.12; // Horizontal groove
            const groove2 = Math.sin(z * 1) * 0.08; // Vertical groove
            
            positions[i + 1] += groove1 + groove2;
        }
        
        brainGeometry.computeVertexNormals();
        
        // Create simple wireframe lines with glow effect
        const wireframeGeometry = new THREE.WireframeGeometry(brainGeometry);
        const brainMaterial = new THREE.LineBasicMaterial({
            color: 0x6b46c1, // Darker purple color
            transparent: true,
            opacity: 0,
            linewidth: 2
        });
        
        const brain = new THREE.LineSegments(wireframeGeometry, brainMaterial);
        
        // Add glow effect
        const glowGeometry = wireframeGeometry.clone();
        const glowMaterial = new THREE.LineBasicMaterial({
            color: 0x9966ff, // Lighter purple for glow
            transparent: true,
            opacity: 0,
            linewidth: 4
        });
        const glowBrain = new THREE.LineSegments(glowGeometry, glowMaterial);
        glowBrain.scale.setScalar(1.02);
        
        // Store as brain parts for progressive animation
        brain.userData.originalPosition = brain.position.clone();
        brain.userData.originalRotation = brain.rotation.clone();
        brain.userData.originalScale = brain.scale.clone();
        brain.userData.targetOpacity = 0.8;
        brain.userData.currentOpacity = 0;
        
        glowBrain.userData.originalPosition = glowBrain.position.clone();
        glowBrain.userData.originalRotation = glowBrain.rotation.clone();
        glowBrain.userData.originalScale = glowBrain.scale.clone();
        glowBrain.userData.targetOpacity = 0.3;
        glowBrain.userData.currentOpacity = 0;
        
        brain.position.copy(brain.userData.originalPosition);
        brain.scale.copy(brain.userData.originalScale);
        glowBrain.position.copy(glowBrain.userData.originalPosition);
        glowBrain.scale.copy(glowBrain.userData.originalScale);
        
        this.brainParts.push(brain);
        this.brainParts.push(glowBrain);
        
        brainGroup.add(brain);
        brainGroup.add(glowBrain);
        
        // Add very simple brain stem
        const stemGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.2, 4); // Very few segments
        const stemWireframeGeometry = new THREE.WireframeGeometry(stemGeometry);
        const stemMaterial = new THREE.LineBasicMaterial({
            color: 0x6b46c1,
            transparent: true,
            opacity: 0,
            linewidth: 2
        });
        const stem = new THREE.LineSegments(stemWireframeGeometry, stemMaterial);
        stem.position.set(0, -2.2, 0);
        
        stem.userData.originalPosition = stem.position.clone();
        stem.userData.originalRotation = stem.rotation.clone();
        stem.userData.originalScale = stem.scale.clone();
        stem.userData.targetOpacity = 0.8;
        stem.userData.currentOpacity = 0;
        
        stem.position.copy(stem.userData.originalPosition);
        stem.scale.copy(stem.userData.originalScale);
        this.brainParts.push(stem);
        
        brainGroup.add(stem);
        
        this.brainModel = brainGroup;
        this.scene.add(brainGroup);
        
        console.log('✅ Simple brain with progressive generation created');
    }

    createSimpleBrainGroove(brainGroup) {
        // Add a simple central groove line like a walnut
        const groovePoints = [
            new THREE.Vector3(0, 2.5, 0),    // Top of brain
            new THREE.Vector3(0, 1.5, 0.5),  // Upper curve
            new THREE.Vector3(0, 0, 1),      // Middle bulge
            new THREE.Vector3(0, -1, 0.5),   // Lower curve
            new THREE.Vector3(0, -2, 0)      // Bottom
        ];
        
        const grooveGeometry = new THREE.BufferGeometry().setFromPoints(groovePoints);
        const grooveMaterial = new THREE.LineBasicMaterial({
            color: 0x6b46c1, // Darker purple
            transparent: true,
            opacity: 0.9,
            linewidth: 3
        });
        
        const groove = new THREE.Line(grooveGeometry, grooveMaterial);
        brainGroup.add(groove);
        
        // Add a few simple horizontal lines for walnut-like texture
        for (let i = 0; i < 3; i++) {
            const y = 1.5 - i * 1.5; // Spacing them vertically
            const horizontalPoints = [
                new THREE.Vector3(-2.5, y, 0),
                new THREE.Vector3(-1, y, 0.8),
                new THREE.Vector3(1, y, 0.8),
                new THREE.Vector3(2.5, y, 0)
            ];
            
            const horizontalGeometry = new THREE.BufferGeometry().setFromPoints(horizontalPoints);
            const horizontalMaterial = new THREE.LineBasicMaterial({
                color: 0x6b46c1, // Darker purple
                transparent: true,
                opacity: 0.6,
                linewidth: 2
            });
            
            const horizontalLine = new THREE.Line(horizontalGeometry, horizontalMaterial);
            brainGroup.add(horizontalLine);
        }
    }

    startRegeneration() {
        this.regenerationActive = true;
        
        // Make all brain parts visible immediately
        if (this.brainParts.length > 0) {
            this.brainParts.forEach((part, index) => {
                part.material.opacity = 0.8; // Make all parts visible
            });
        }
        
        console.log('🧠 Brain parts now visible and revolving...');
    }

    animatePartAssembly(part, index) {
        // Simple immediate visibility - no complex assembly animation
        part.material.opacity = 0.8;
        console.log(`🧩 Brain part ${index + 1}/${this.brainParts.length} visible`);
    }

    updateProgress(progress) {
        this.targetProgress = Math.max(0, Math.min(1, progress));
        
        // Brain is always visible and rotating, just track progress
        console.log(`🧠 Loading progress: ${(this.targetProgress * 100).toFixed(1)}%`);
    }

    animate() {
        if (!this.isVisible) return;
        
        const currentTime = performance.now();
        if (currentTime - this.lastUpdateTime < this.updateInterval) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }
        this.lastUpdateTime = currentTime;
        
        // Smooth progress interpolation with clamping
        this.colorProgress = THREE.MathUtils.lerp(this.colorProgress, this.targetProgress, 0.05);
        
        // Progressive brain generation based on loading progress
        if (this.brainParts && this.brainParts.length > 0) {
            this.brainParts.forEach((part, index) => {
                if (part.userData && part.userData.targetOpacity !== undefined) {
                    const partProgress = Math.max(0, this.colorProgress - (index * 0.1));
                    const targetOpacity = partProgress > 0 ? part.userData.targetOpacity * partProgress : 0;
                    part.userData.currentOpacity = THREE.MathUtils.lerp(
                        part.userData.currentOpacity || 0, 
                        targetOpacity, 
                        0.1
                    );
                    if (part.material) {
                        part.material.opacity = part.userData.currentOpacity;
                    }
                }
            });
        }
        
        // Rotate brain immediately and continuously with null check
        if (this.brainModel) {
            this.brainModel.rotation.y += this.rotationSpeed * 1.5; // Faster rotation
            this.brainModel.rotation.x += this.rotationSpeed * 0.5;
        }
        
        // Render the scene with null checks
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    setVisible(visible) {
        this.isVisible = visible;
        if (visible && !this.animationId) {
            this.animate();
        }
    }

    dispose() {
        // Cancel animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Dispose of geometries and materials with proper cleanup
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => {
                            // Dispose textures if any
                            if (material.map) material.map.dispose();
                            if (material.normalMap) material.normalMap.dispose();
                            if (material.specularMap) material.specularMap.dispose();
                            material.dispose();
                        });
                    } else {
                        // Dispose textures if any
                        if (object.material.map) object.material.map.dispose();
                        if (object.material.normalMap) object.material.normalMap.dispose();
                        if (object.material.specularMap) object.material.specularMap.dispose();
                        object.material.dispose();
                    }
                }
            });
        }
        
        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
        
        // Clear references to prevent memory leaks
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.brainModel = null;
        this.brainParts = [];
        this.lights = [];
        
        console.log('🧹 Loading brain 3D disposed successfully');
    }
}

class GamePortfolio3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null;
        this.gui = null;
        this.clock = new THREE.Clock();
        
        // Loading brain instance
        this.loadingBrain = new LoadingBrain3D();
        
        // Game objects
        this.gameBrains = [];
        this.selectedGame = null;
        this.backgroundParticles = null;
        this.interactiveElements = [];
        this.particleTrails = [];
        this.centralBrain = null;
        this.electricalConnections = [];
        this.neuralPulses = [];
        
        // Interaction & Controls
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.hoveredCube = null;
        this.keys = {};
        this.flyMode = false;
        this.hoverTimeout = null; // Add hover timeout for stability
        this.hoverUpdateTimeout = null; // For throttling hover updates
        this.isHovering = false; // Track hovering state for performance
        
        // Accessibility
        this.announcer = document.getElementById('sr-announcements');
        
        // Audio System
        this.audioContext = null;
        this.audioEnabled = true; // Always enabled
        this.sounds = {};
        
        // FPS tracking for main portfolio
        this.fps = 0;
        this.frameCount = 0;
        this.lastFPSTime = 0;
        
        // Performance & Effects
        this.performanceMode = 'high'; // 'high' or 'low'
        this.easterEggActive = false;
        this.magicMode = false;
        this.animations = [];
        
        // Matrix Rain Easter Egg
        this.matrixRainActive = false;
        this.matrixDrops = [];
        this.matrixCameraInterval = null;
        
        // Camera shake
        this.cameraShake = { intensity: 0, decay: 0.95 };
        
        // Loaders
        this.gltfLoader = new GLTFLoader();
        this.objLoader = new OBJLoader();
        this.fbxLoader = new FBXLoader();
        
        // Games data - positioned around the brain (Real games)
        this.games = [
            {
                id: 'newcake',
                title: 'NewCake',
                description: 'An innovative web-based cake creation and customization game where players can design, bake, and decorate virtual cakes with realistic physics and stunning visual effects.',
                tags: ['Simulation', 'Creative', 'Web Game', 'Food'],
                url: 'https://newcake.vercel.app/',
                position: { x: -12, y: 8, z: 0 },
                color: 0xffff00,
                features: [
                    'Interactive cake design system',
                    'Realistic baking simulation',
                    'Creative decoration tools',
                    'Web-based gameplay',
                    'Modern UI/UX design'
                ],
                controls: {
                    'Mouse': 'Click and drag to design',
                    'Left Click': 'Select decoration tools',
                    'Right Click': 'Rotate cake view',
                    'Scroll': 'Zoom in/out'
                },
                gameplay: 'Design and create beautiful cakes with intuitive drag-and-drop interface, realistic physics, and extensive customization options.',
                status: 'Live',
                screenshots: []
            },
            {
                id: 'ninja-jump',
                title: 'Ninja Jump',
                description: 'A fast-paced platformer game featuring a skilled ninja character navigating through challenging levels with precise jumping mechanics and smooth controls.',
                tags: ['Platformer', 'Action', 'Ninja', 'Arcade'],
                url: 'http://baldgame.xyz',
                position: { x: 8, y: 10, z: -8 },
                color: 0xffff00,
                features: [
                    'Precise jumping mechanics',
                    'Challenging level design',
                    'Ninja-themed gameplay',
                    'Smooth character controls',
                    'Arcade-style action'
                ],
                controls: {
                    'Space': 'Jump',
                    'Arrow Keys': 'Move left/right',
                    'Double Space': 'Double jump',
                    'Down Arrow': 'Slide/crouch'
                },
                gameplay: 'Navigate through challenging levels as a ninja, using precise jumping and timing to overcome obstacles and reach the end goal.',
                status: 'Live',
                screenshots: []
            },
            {
                id: 'tower-defense',
                title: 'Tower Defense Pro',
                description: 'Strategic tower defense game with unique tower combinations, epic boss battles, and multiple difficulty levels.',
                tags: ['Strategy', 'Defense', 'Tactical'],
                url: '#tower-defense',
                position: { x: 15, y: -2, z: 6 },
                color: 0xffffff,
                features: [
                    'Strategic tower placement',
                    'Multiple tower types',
                    'Boss battles',
                    'Upgrade system'
                ],
                controls: {
                    'Left Click': 'Place/select towers',
                    'Right Click': 'Cancel selection',
                    'Mouse Hover': 'Preview tower range',
                    'Keyboard 1-5': 'Quick select tower types'
                },
                gameplay: 'Build and upgrade towers to defend against waves of enemies in this strategic defense game.',
                status: 'Coming Soon',
                screenshots: []
            },
            {
                id: 'rpg-adventure',
                title: 'Epic RPG Adventure',
                description: 'Open-world RPG with rich storytelling, character customization, and immersive quest systems in a fantasy realm.',
                tags: ['RPG', 'Fantasy', 'Open World'],
                url: '#rpg-adventure',
                position: { x: -10, y: -8, z: 12 },
                color: 0xffffff,
                features: [
                    'Open world exploration',
                    'Character customization',
                    'Quest system',
                    'Fantasy setting'
                ],
                controls: {
                    'WASD': 'Move character',
                    'Mouse': 'Look around',
                    'Left Click': 'Attack/interact',
                    'Tab': 'Open inventory'
                },
                gameplay: 'Explore a vast fantasy world, complete quests, and develop your character in this immersive RPG experience.',
                status: 'Coming Soon',
                screenshots: []
            },
            {
                id: 'platformer',
                title: 'Neon Platformer',
                description: 'Fast-paced 2D platformer with smooth controls, challenging levels, and a vibrant neon-styled aesthetic.',
                tags: ['Platformer', '2D', 'Arcade'],
                url: '#platformer',
                position: { x: 6, y: -6, z: -10 },
                color: 0xffffff,
                features: [
                    'Neon visual style',
                    'Smooth platforming',
                    'Challenging levels',
                    'Retro aesthetic'
                ],
                controls: {
                    'Arrow Keys': 'Move left/right',
                    'Up Arrow': 'Jump',
                    'Down Arrow': 'Crouch/slide',
                    'Shift': 'Run/dash'
                },
                gameplay: 'Navigate through neon-lit levels with precise platforming mechanics and vibrant visual effects.',
                status: 'Coming Soon',
                screenshots: []
            },
            {
                id: 'neural-sim',
                title: 'Neural Simulator',
                description: 'Experience consciousness simulation with advanced AI interactions and mind-bending reality puzzles.',
                tags: ['Simulation', 'AI', 'Consciousness'],
                url: '#neural-sim',
                position: { x: -6, y: 4, z: -12 },
                color: 0xffffff,
                features: [
                    'AI consciousness simulation',
                    'Reality puzzles',
                    'Neural network visualization',
                    'Mind-bending gameplay'
                ],
                controls: {
                    'Mouse': 'Navigate neural networks',
                    'Left Click': 'Connect nodes',
                    'Right Click': 'Analyze patterns',
                    'Keyboard': 'Input commands'
                },
                gameplay: 'Explore the mysteries of consciousness through AI-powered simulations and complex puzzles.',
                status: 'Coming Soon',
                screenshots: []
            }
        ];
        
        // Initialize performance tracking and optimizations
        this.initializePerformanceTracking();
        
        this.init();
    }

    initializePerformanceTracking() {
        // Enhanced performance tracking
        this.frameCount = 0;
        this.lastPerformanceCheck = performance.now();
        this.performanceHistory = [];
        this.memoryUsage = { initial: 0, current: 0 };
        
        // Monitor initial memory usage
        if (performance.memory) {
            this.memoryUsage.initial = performance.memory.usedJSHeapSize;
        }
        
        // Setup performance monitoring interval
        this.setupPerformanceMonitoring();
        
        // Enhanced error handling for WebGL context loss
        this.handleContextLoss();
        
        console.log('📊 Performance tracking initialized');
    }

    setupPerformanceMonitoring() {
        // Check performance every 5 seconds
        setInterval(() => {
            if (performance.memory) {
                this.memoryUsage.current = performance.memory.usedJSHeapSize;
                const memoryIncrease = this.memoryUsage.current - this.memoryUsage.initial;
                
                // Log memory usage if it increases significantly
                if (memoryIncrease > 50 * 1024 * 1024) { // 50MB threshold
                    console.warn('🧠 Memory usage increased by', Math.round(memoryIncrease / 1024 / 1024), 'MB');
                }
            }
            
            // Automatically adjust quality based on performance history
            this.autoAdjustQuality();
        }, 5000);
    }

    autoAdjustQuality() {
        if (this.performanceHistory.length > 10) {
            const averageFPS = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
            
            if (averageFPS < 30 && this.performanceMode === 'high') {
                this.performanceMode = 'low';
                console.log('🔧 Auto-switched to low performance mode (avg FPS:', Math.round(averageFPS), ')');
            } else if (averageFPS > 55 && this.performanceMode === 'low') {
                this.performanceMode = 'high';
                console.log('✨ Auto-switched to high performance mode (avg FPS:', Math.round(averageFPS), ')');
            }
            
            // Keep only recent history
            this.performanceHistory = this.performanceHistory.slice(-20);
        }
    }

    handleContextLoss() {
        if (this.renderer && this.renderer.domElement) {
            this.renderer.domElement.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                console.warn('🚨 WebGL context lost - attempting recovery');
                this.onContextLost();
            });
            
            this.renderer.domElement.addEventListener('webglcontextrestored', () => {
                console.log('✅ WebGL context restored');
                this.onContextRestored();
            });
        }
    }

    onContextLost() {
        // Pause animations and clear intervals
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Store current state for recovery
        this.contextLostState = {
            cameraPosition: this.camera ? this.camera.position.clone() : null,
            cameraTarget: this.controls ? this.controls.target.clone() : null,
            performanceMode: this.performanceMode
        };
    }

    onContextRestored() {
        // Restore renderer and scene
        try {
            this.setupScene();
            this.setupCamera();
            this.setupLighting();
            
            // Restore camera state
            if (this.contextLostState) {
                if (this.contextLostState.cameraPosition) {
                    this.camera.position.copy(this.contextLostState.cameraPosition);
                }
                if (this.contextLostState.cameraTarget) {
                    this.controls.target.copy(this.contextLostState.cameraTarget);
                }
                this.performanceMode = this.contextLostState.performanceMode;
            }
            
            // Restart animation loop
            this.animate();
            
        } catch (error) {
            console.error('Failed to restore WebGL context:', error);
        }
    }

    async init() {
        // Initialize 3D loading brain FIRST - before everything else
        await this.loadingBrain.init();
        this.loadingBrain.updateProgress(0.05); // Small initial progress
        
        // Update loading status
        this.updateLoadingStatus('Scanning Neural Fragments...');
        
        this.setupScene();
        this.loadingBrain.updateProgress(0.15);
        
        this.setupCamera();
        this.setupRenderer();
        this.loadingBrain.updateProgress(0.25);
        
        this.setupControls();
        this.setupPostProcessing();
        this.loadingBrain.updateProgress(0.35);
        
        this.setupGUI();
        this.setupAudio();
        this.setupEventListeners();
        this.updateLoadingStatus('Regenerating Brain Structure...');
        this.loadingBrain.updateProgress(0.45);
        
        this.updateLoadingStatus('Assembling Neural Networks...');
        await this.createPortfolio();
        this.loadingBrain.updateProgress(0.8);
        
        this.updateLoadingStatus('Connecting Synapses...');
        this.setupInteractions();
        this.loadingBrain.updateProgress(0.9);
        
        this.updateLoadingStatus('Brain Fully Regenerated!');
        this.animate();
        this.loadingBrain.updateProgress(1.0);
        
        // Hide loading screen with enhanced animation
        setTimeout(() => {
            this.updateLoadingStatus('Bald Verse Fully Operational!');
            setTimeout(() => {
                gsap.to('#loading', {
                    duration: 1.5,
                    opacity: 0,
                    scale: 0.8,
                    ease: "power2.inOut",
                    onComplete: () => {
                        document.getElementById('loading').style.display = 'none';
                        this.loadingBrain.dispose(); // Clean up loading brain
                    }
                });
            }, 500);
        }, 2000);
    }

    updateLoadingStatus(status) {
        const statusElement = document.querySelector('.loading-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0008);
        
        // Ambient lighting for soft illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Yellow accent light
        const yellowLight = new THREE.PointLight(0xffff00, 0.5, 50);
        yellowLight.position.set(-10, 5, 10);
        this.scene.add(yellowLight);
        
        // White fill light
        const whiteLight = new THREE.PointLight(0xffffff, 0.3, 30);
        whiteLight.position.set(15, -5, -10);
        this.scene.add(whiteLight);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 25); // Move camera further back
        this.camera.lookAt(0, 0, 0); // Ensure camera looks at center
        
        console.log('Camera position:', this.camera.position);
        console.log('Camera looking at:', this.camera.getWorldDirection(new THREE.Vector3()));
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.setClearColor(0x000000, 1);
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 100; // Allow zooming out more
        this.controls.minDistance = 5;
        this.controls.enablePan = false;
        this.controls.maxPolarAngle = Math.PI * 0.75;
        this.controls.minPolarAngle = Math.PI * 0.25;
        this.controls.target.set(0, 0, 0); // Make sure controls target the center
        
        console.log('Controls target:', this.controls.target);
    }

    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.4, 0.6, 0.7
        );
        this.composer.addPass(this.bloomPass);
        
        // Film grain effect for retro feel
        this.filmPass = new FilmPass(0.35, 0.5, 2048, false);
        this.composer.addPass(this.filmPass);
    }

    setupGUI() {
        this.gui = new GUI();
        this.gui.title('Portfolio Controls');
        
        const effectsFolder = this.gui.addFolder('Visual Effects');
        effectsFolder.add(this.bloomPass, 'strength', 0, 3, 0.1).name('Bloom Strength');
        effectsFolder.add(this.bloomPass, 'radius', 0, 1, 0.01).name('Bloom Radius');
        effectsFolder.add(this.filmPass.uniforms.intensity, 'value', 0, 1, 0.01).name('Film Grain');
        
        const interactionFolder = this.gui.addFolder('Interaction');
        interactionFolder.add(this, 'flyMode').name('Fly Mode').onChange((value) => {
            this.controls.enablePan = value;
            this.controls.enableRotate = !value;
        });
        interactionFolder.add(this, 'magicMode').name('Magic Mode');
        
        this.gui.close();
    }

    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (error) {
            console.log('Audio context not supported');
            this.audioEnabled = false;
        }
    }

    createSounds() {
        // Create procedural sounds
        this.sounds = {
            hover: this.createTone(800, 0.1, 0.05),
            click: this.createTone(1200, 0.15, 0.1),
            magic: this.createTone(600, 0.3, 0.2),
            whoosh: this.createNoise(0.1, 0.15)
        };
    }

    createTone(frequency, volume, duration) {
        return () => {
            if (!this.audioEnabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    createNoise(volume, duration) {
        return () => {
            if (!this.audioEnabled || !this.audioContext) return;
            
            const bufferSize = this.audioContext.sampleRate * duration;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            source.start(this.audioContext.currentTime);
        };
    }

    async createPortfolio() {
        this.createBackgroundParticles();
        this.loadingBrain.updateProgress(0.5);
        
        await this.createCentralBrain(); // Wait for central brain
        this.loadingBrain.updateProgress(0.65);
        
        await this.createGameBrains(); // Wait for brain models to load
        this.loadingBrain.updateProgress(0.75);
        
        this.createElectricalConnections();
        this.createFloatingElements();
        this.createInteractiveRings();
        this.createMagicalOrbs();
    }

    createBackgroundParticles() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            // Create particles in a spherical distribution
            positions[i] = (Math.random() - 0.5) * 200;
            positions[i + 1] = (Math.random() - 0.5) * 200;
            positions[i + 2] = (Math.random() - 0.5) * 200;
            
            // Mix of white and yellow particles
            const isYellow = Math.random() > 0.7;
            colors[i] = isYellow ? 1 : 1;
            colors[i + 1] = isYellow ? 1 : 1;
            colors[i + 2] = isYellow ? 0 : 1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.backgroundParticles = new THREE.Points(geometry, material);
        this.scene.add(this.backgroundParticles);
    }

    async createGameBrains() {
        this.updateLoadingStatus('Building Game Neural Nodes...');
        
        // Load the FBX brain model first
        let brainModel = null;
        try {
            const fbxBrain = await this.fbxLoader.loadAsync('/BRAIN.fbx');
            brainModel = fbxBrain;
            console.log('FBX brain model loaded successfully');
            this.updateLoadingStatus('Cloning Brain Networks...');
        } catch (error) {
            console.log('Could not load FBX brain model:', error);
            this.updateLoadingStatus('Using Neural Backup Systems...');
            return;
        }

        this.games.forEach((gameData, index) => {
            // Create brain group for each game
            const brainGroup = new THREE.Group();
            brainGroup.position.set(gameData.position.x, gameData.position.y, gameData.position.z);
            
            // Clone the loaded FBX brain model
            const clonedBrain = brainModel.clone();
            
            // Scale the brain to appropriate size (increased from 0.05 to match original circle size)
            clonedBrain.scale.setScalar(0.15);
            
            // Determine brain color based on game status
            const isLiveGame = gameData.status === 'Live';
            const brainColor = isLiveGame ? 0xffff00 : 0xffffff; // Yellow for live, white for coming soon
            
            // Make the brain as glowing wireframe outline with status-based color
            clonedBrain.traverse((child) => {
                if (child.isMesh) {
                    // Remove any existing materials and create new wireframe material
                    child.material = new THREE.MeshBasicMaterial({
                        color: brainColor,
                        wireframe: true, // Wireframe outline
                        transparent: true,
                        opacity: 0.4, // Reduced opacity for hollow effect
                        emissive: brainColor,
                        emissiveIntensity: 0.2
                    });
                    
                    // Store original color in userData for proper hover reset
                    child.userData.originalColor = brainColor;
                    
                    // Create a dark outline by adding a second mesh with line material
                    const outlineGeometry = child.geometry.clone();
                    const outlineMaterial = new THREE.LineBasicMaterial({
                        color: 0x000000, // Dark outline
                        transparent: true,
                        opacity: 0.8,
                        linewidth: 2
                    });
                    
                    // Create wireframe from geometry
                    const wireframeGeometry = new THREE.WireframeGeometry(outlineGeometry);
                    const outline = new THREE.LineSegments(wireframeGeometry, outlineMaterial);
                    child.add(outline);
                    
                    child.castShadow = false;
                    child.receiveShadow = false;
                }
            });
            
            brainGroup.add(clonedBrain);
            
            // Add floating particles around brain with status-based color
            this.createBrainParticles(brainGroup, brainColor);
            
            // Store game data
            brainGroup.userData = gameData;
            brainGroup.userData.originalPosition = brainGroup.position.clone();
            brainGroup.userData.mainBrain = clonedBrain;
            brainGroup.userData.originalColor = brainColor; // Store original color for hover reset
            
            // Add floating animation
            const floatOffset = Math.random() * Math.PI * 2;
            brainGroup.userData.floatOffset = floatOffset;
            
            this.gameBrains.push(brainGroup);
            this.scene.add(brainGroup);
            
            // Update loading progress
            this.updateLoadingStatus(`Creating brain ${index + 1} of ${this.games.length}...`);
        });
        
        this.updateLoadingStatus('Brain models created successfully!');
    }

    createBrainParticles(brain, color) {
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            const radius = 3 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = radius * Math.cos(phi);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.3,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(geometry, material);
        brain.add(particles);
        brain.userData.particles = particles;
    }

    createBrainHemisphere(offsetX, side) {
        // Create more realistic brain hemisphere shape
        const hemisphereGeometry = new THREE.SphereGeometry(1.2, 24, 16);
        
        // Modify geometry to create brain-like surface
        const positions = hemisphereGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Create brain fold patterns (sulci and gyri)
            const fold1 = Math.sin(x * 3) * Math.cos(y * 4) * 0.1;
            const fold2 = Math.sin(z * 4) * Math.cos(x * 3) * 0.08;
            const fold3 = Math.sin(y * 5) * Math.cos(z * 4) * 0.06;
            
            // Add surface irregularities
            const noise = (Math.random() - 0.5) * 0.05;
            
            positions[i] += fold1 + noise;
            positions[i + 1] += fold2 + noise;
            positions[i + 2] += fold3 + noise;
        }
        
        // Scale to brain proportions (wider than tall, longer front to back)
        hemisphereGeometry.scale(1.2, 0.9, 1.4);
        hemisphereGeometry.computeVertexNormals();
        
        const hemisphere = new THREE.Mesh(hemisphereGeometry);
        hemisphere.position.x = offsetX;
        
        return hemisphere;
    }

    addBrainFolds(brainGroup) {
        // Add realistic brain surface folds (sulci)
        for (let i = 0; i < 6; i++) {
            const foldCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    1 + (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 2
                ),
                new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    0.5 + (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 2
                ),
                new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    0 + (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 2
                ),
                new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    -0.5 + (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 2
                )
            ]);
            
            const points = foldCurve.getPoints(20);
            const foldGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const foldMaterial = new THREE.LineBasicMaterial({
                color: 0x884444,
                transparent: true,
                opacity: 0.4,
                linewidth: 2
            });
            
            const fold = new THREE.Line(foldGeometry, foldMaterial);
            brainGroup.add(fold);
        }
    }

    createFloatingElements() {
        // Create subtle geometric shapes floating in background
        for (let i = 0; i < 30; i++) {
            const shapes = [
                new THREE.TetrahedronGeometry(0.5),
                new THREE.OctahedronGeometry(0.4),
                new THREE.IcosahedronGeometry(0.3),
                new THREE.DodecahedronGeometry(0.35)
            ];
            
            const geometry = shapes[Math.floor(Math.random() * shapes.length)];
            const material = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0xffffff : 0xffff00,
                transparent: true,
                opacity: 0.15,
                wireframe: true
            });
            
            const shape = new THREE.Mesh(geometry, material);
            shape.position.set(
                (Math.random() - 0.5) * 150,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 150
            );
            
            shape.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                },
                originalOpacity: shape.material.opacity,
                pulseSpeed: 0.5 + Math.random() * 1.5
            };
            
            this.interactiveElements.push(shape);
            this.scene.add(shape);
        }
    }

    createInteractiveRings() {
        for (let i = 0; i < 5; i++) {
            const ringGeometry = new THREE.RingGeometry(8 + i * 3, 8.5 + i * 3, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: i % 2 === 0 ? 0xffff00 : 0xffffff,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = -15;
            
            ring.userData = {
                rotationSpeed: 0.002 + i * 0.001,
                pulsePhase: i * Math.PI / 3,
                originalOpacity: ring.material.opacity
            };
            
            this.interactiveElements.push(ring);
            this.scene.add(ring);
        }
    }

    createMagicalOrbs() {
        for (let i = 0; i < 8; i++) {
            const orbGeometry = new THREE.SphereGeometry(0.2, 16, 16);
            const orbMaterial = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.8,
                emissive: 0xffff00,
                emissiveIntensity: 0.5
            });
            
            const orb = new THREE.Mesh(orbGeometry, orbMaterial);
            const radius = 25 + Math.random() * 15;
            const angle = (i / 8) * Math.PI * 2;
            
            orb.position.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 20,
                Math.sin(angle) * radius
            );
            
            orb.userData = {
                orbitRadius: radius,
                orbitSpeed: 0.01 + Math.random() * 0.01,
                orbitAngle: angle,
                floatSpeed: 0.5 + Math.random() * 0.5,
                floatPhase: Math.random() * Math.PI * 2
            };
            
            this.interactiveElements.push(orb);
            this.scene.add(orb);
        }
    }

    async createCentralBrain() {
        // Load the FBX brain model for central brain
        await this.loadCentralBrainModel();
        
        // Ensure camera can see the brain
        console.log('Setting up camera to view central brain...');
        this.camera.position.set(0, 0, 30);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        
        // Debug the central brain
        if (this.centralBrain) {
            console.log('Central brain loaded successfully');
            console.log('Central brain position:', this.centralBrain.position);
            console.log('Central brain scale:', this.centralBrain.scale);
            console.log('Central brain children:', this.centralBrain.children.length);
            console.log('Central brain visible:', this.centralBrain.visible);
        } else {
            console.error('Central brain failed to load!');
        }
    }

    async loadCentralBrainModel() {
        this.updateLoadingStatus('Constructing Central Brain...');
        
        const brainGroup = new THREE.Group();
        
        try {
            // Load FBX brain model from root directory
            const fbxBrain = await this.fbxLoader.loadAsync('/BRAIN.fbx');
            const brainModel = fbxBrain;
            
            // Scale the central brain larger (increased from 0.12 to 0.3)
            brainModel.scale.setScalar(0.3);
            
            // Make the central brain as glowing yellow wireframe with hollow effect
            brainModel.traverse((child) => {
                if (child.isMesh) {
                    // Remove existing materials and create glowing wireframe
                    child.material = new THREE.MeshBasicMaterial({
                        color: 0xffff00, // Bright yellow
                        wireframe: true, // Wireframe outline
                        transparent: true,
                        opacity: 0.5, // Reduced opacity for hollow effect
                        emissive: 0xffff00, // Yellow glow
                        emissiveIntensity: 0.3
                    });
                    
                    // Create a dark outline
                    const outlineGeometry = child.geometry.clone();
                    const outlineMaterial = new THREE.LineBasicMaterial({
                        color: 0x000000, // Dark outline
                        transparent: true,
                        opacity: 0.9,
                        linewidth: 3
                    });
                    
                    const wireframeGeometry = new THREE.WireframeGeometry(outlineGeometry);
                    const outline = new THREE.LineSegments(wireframeGeometry, outlineMaterial);
                    child.add(outline);
                    
                    child.castShadow = false;
                    child.receiveShadow = false;
                }
            });
            
            brainGroup.add(brainModel);
            
            // Add energy core to loaded model
            this.createEnergyCore(brainGroup);
            
            console.log('Central FBX brain model loaded successfully');
            this.updateLoadingStatus('Neural Core Initialized!');
            
        } catch (error) {
            console.log('External brain model not found, creating procedural brain');
            this.updateLoadingStatus('Generating Procedural Brain...');
            this.createProceduralBrain(brainGroup);
        }
        
        // Position the brain at center
        brainGroup.position.set(0, 0, 0);
        
        this.centralBrain = brainGroup;
        this.scene.add(brainGroup);
        
        console.log('Central brain model added to scene');
        console.log('Central brain children count:', brainGroup.children.length);
        console.log('Central brain position:', brainGroup.position);
        console.log('Central brain scale:', brainGroup.scale);
    }

    createProceduralBrain(brainGroup) {
        // Create a more realistic central brain
        this.createRealisticBrainShape(brainGroup);
        
        // Create a sleek wireframe brain outline that looks professional
        this.createBrainOutline(brainGroup);
        
        // Add glowing neural nodes
        this.createNeuralNodes(brainGroup);
        
        // Add energy core
        this.createEnergyCore(brainGroup);
        
        // Scale appropriately
        brainGroup.scale.setScalar(1.5);
    }

    createRealisticBrainShape(brainGroup) {
        // Create left and right hemispheres with realistic proportions
        const leftHemisphere = this.createDetailedHemisphere(-1, 'left');
        const rightHemisphere = this.createDetailedHemisphere(1, 'right');
        
        brainGroup.add(leftHemisphere);
        brainGroup.add(rightHemisphere);
        
        // Add brain stem
        const stemGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.5, 12);
        const stemMaterial = new THREE.MeshPhongMaterial({
            color: 0xbb7777,
            transparent: true,
            opacity: 0.8,
            emissive: 0x441122,
            emissiveIntensity: 0.2
        });
        const brainStem = new THREE.Mesh(stemGeometry, stemMaterial);
        brainStem.position.set(0, -2, -0.5);
        brainGroup.add(brainStem);
        
        // Add cerebellum
        const cerebellumGeometry = new THREE.SphereGeometry(1, 16, 12);
        cerebellumGeometry.scale(1, 0.6, 1.2);
        
        // Add cerebellum folding texture
        const cerebellumPositions = cerebellumGeometry.attributes.position.array;
        for (let i = 0; i < cerebellumPositions.length; i += 3) {
            const x = cerebellumPositions[i];
            const z = cerebellumPositions[i + 2];
            const folds = Math.sin(x * 10) * Math.sin(z * 10) * 0.05;
            cerebellumPositions[i + 1] += folds;
        }
        cerebellumGeometry.computeVertexNormals();
        
        const cerebellumMaterial = new THREE.MeshPhongMaterial({
            color: 0xaa6666,
            transparent: true,
            opacity: 0.85,
            emissive: 0x331111,
            emissiveIntensity: 0.15
        });
        const cerebellum = new THREE.Mesh(cerebellumGeometry, cerebellumMaterial);
        cerebellum.position.set(0, -1.2, -2.5);
        brainGroup.add(cerebellum);
        
        console.log('Realistic Brain Shape Created');
    }

    createDetailedHemisphere(offsetX, side) {
        const hemisphereGeometry = new THREE.SphereGeometry(2, 32, 24);
        
        // Create realistic brain surface with sulci and gyri
        const positions = hemisphereGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Major brain folds (sulci)
            const centralSulcus = Math.sin(x * 2) * Math.cos(z * 1.5) * 0.15;
            const sylvianFissure = Math.sin(y * 1.5) * Math.cos(x * 2) * 0.12;
            const longitudinalFissure = Math.sin(z * 3) * Math.cos(y * 2) * 0.08;
            
            // Fine surface texture (gyri)
            const fineTexture = Math.sin(x * 8) * Math.sin(y * 8) * Math.sin(z * 8) * 0.03;
            
            positions[i] += centralSulcus + fineTexture;
            positions[i + 1] += sylvianFissure + fineTexture;
            positions[i + 2] += longitudinalFissure + fineTexture;
        }
        
        // Scale to proper brain proportions
        hemisphereGeometry.scale(1.3, 1, 1.6); // Wider, flatter, longer
        hemisphereGeometry.computeVertexNormals();
        
        const hemisphereMaterial = new THREE.MeshPhongMaterial({
            color: 0xcc9999,
            transparent: true,
            opacity: 0.9,
            emissive: 0x441122,
            emissiveIntensity: 0.2,
            shininess: 30
        });
        
        const hemisphere = new THREE.Mesh(hemisphereGeometry, hemisphereMaterial);
        hemisphere.position.x = offsetX;
        
        return hemisphere;
    }

    createBrainWireframeOutline(brainGroup) {
        // Create brain outline using lines and curves - wireframe style
        const brainOutlineGroup = new THREE.Group();
        
        // Main brain hemisphere outlines
        const leftHemisphere = this.createHemisphereWireframe(-1.5, 0x00ffff);
        const rightHemisphere = this.createHemisphereWireframe(1.5, 0x00ffff);
        
        brainOutlineGroup.add(leftHemisphere);
        brainOutlineGroup.add(rightHemisphere);
        
        // Cerebellum outline (back of brain)
        const cerebellumOutline = this.createCerebellumWireframe();
        brainOutlineGroup.add(cerebellumOutline);
        
        // Brain stem outline
        const brainStemOutline = this.createBrainStemWireframe();
        brainOutlineGroup.add(brainStemOutline);
        
        // Frontal lobe divisions
        const frontalDivisions = this.createFrontalLobeWireframe();
        brainOutlineGroup.add(frontalDivisions);
        
        brainGroup.add(brainOutlineGroup);
        
        // Add subtle pulsing animation
        brainOutlineGroup.userData.animationType = 'pulse';
    }

    createHemisphereWireframe(offsetX, color) {
        const hemisphereGroup = new THREE.Group();
        
        // Create brain outline curves
        const outlineCurves = [
            // Top curve
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(offsetX - 1.5, 1.8, 1.2),
                new THREE.Vector3(offsetX - 0.8, 2.2, 0.5),
                new THREE.Vector3(offsetX + 0.8, 2.2, 0.5),
                new THREE.Vector3(offsetX + 1.5, 1.8, 1.2)
            ]),
            // Side curve
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(offsetX + 1.5, 1.8, 1.2),
                new THREE.Vector3(offsetX + 2.0, 0.5, 0.8),
                new THREE.Vector3(offsetX + 1.8, -0.8, 0.2),
                new THREE.Vector3(offsetX + 1.2, -1.5, -0.5)
            ]),
            // Bottom curve
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(offsetX + 1.2, -1.5, -0.5),
                new THREE.Vector3(offsetX + 0.3, -1.8, -0.8),
                new THREE.Vector3(offsetX - 0.3, -1.8, -0.8),
                new THREE.Vector3(offsetX - 1.2, -1.5, -0.5)
            ]),
            // Back curve
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(offsetX - 1.2, -1.5, -0.5),
                new THREE.Vector3(offsetX - 1.8, -0.8, 0.2),
                new THREE.Vector3(offsetX - 2.0, 0.5, 0.8),
                new THREE.Vector3(offsetX - 1.5, 1.8, 1.2)
            ])
        ];
        
        // Create lines from curves
        outlineCurves.forEach((curve, index) => {
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8,
                linewidth: 2
            });
            
            const line = new THREE.Line(geometry, material);
            line.userData = {
                originalColor: color,
                animationOffset: index * 0.3
            };
            hemisphereGroup.add(line);
        });
        
        // Add brain folds (sulci) as additional wireframe details
        for (let i = 0; i < 6; i++) {
            const foldCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(offsetX + (Math.random() - 0.5) * 2, 1.5 + (Math.random() - 0.5) * 1, 0.8 + (Math.random() - 0.5) * 0.8),
                new THREE.Vector3(offsetX + (Math.random() - 0.5) * 2, 0.5 + (Math.random() - 0.5) * 1, 0.3 + (Math.random() - 0.5) * 0.8),
                new THREE.Vector3(offsetX + (Math.random() - 0.5) * 2, -0.5 + (Math.random() - 0.5) * 1, -0.2 + (Math.random() - 0.5) * 0.8),
                new THREE.Vector3(offsetX + (Math.random() - 0.5) * 2, -1.5 + (Math.random() - 0.5) * 1, -0.7 + (Math.random() - 0.5) * 0.8)
            ]);
            
            const points = foldCurve.getPoints(30);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.4,
                linewidth: 1
            });
            
            const fold = new THREE.Line(geometry, material);
            fold.userData = {
                originalColor: color,
                animationOffset: i * 0.5,
                isFold: true
            };
            hemisphereGroup.add(fold);
        }
        
        return hemisphereGroup;
    }

    createCerebellumWireframe() {
        const cerebellumGroup = new THREE.Group();
        
        // Cerebellum characteristic folded structure as wireframe
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 0.8 + Math.sin(i * 2) * 0.2;
            
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(Math.cos(angle) * radius, -2.0, Math.sin(angle) * radius - 1.8),
                new THREE.Vector3(Math.cos(angle + 0.3) * (radius + 0.2), -1.8, Math.sin(angle + 0.3) * (radius + 0.2) - 1.8),
                new THREE.Vector3(Math.cos(angle + 0.6) * radius, -1.6, Math.sin(angle + 0.6) * radius - 1.8),
                new THREE.Vector3(Math.cos(angle + 0.9) * (radius - 0.1), -1.9, Math.sin(angle + 0.9) * (radius - 0.1) - 1.8)
            ]);
            
            const points = curve.getPoints(40);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.6,
                linewidth: 1.5
            });
            
            const line = new THREE.Line(geometry, material);
            line.userData = {
                originalColor: 0xffff00,
                animationOffset: i * 0.2
            };
            cerebellumGroup.add(line);
        }
        
        return cerebellumGroup;
    }

    createBrainStemWireframe() {
        const stemGroup = new THREE.Group();
        
        // Brain stem as elegant connecting wireframe lines
        const stemCurves = [
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.2, -1.6, -0.2),
                new THREE.Vector3(-0.15, -2.2, -0.3),
                new THREE.Vector3(-0.1, -2.8, -0.2),
                new THREE.Vector3(0, -3.2, 0)
            ]),
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(0.2, -1.6, -0.2),
                new THREE.Vector3(0.15, -2.2, -0.3),
                new THREE.Vector3(0.1, -2.8, -0.2),
                new THREE.Vector3(0, -3.2, 0)
            ]),
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, -1.6, 0.2),
                new THREE.Vector3(0, -2.2, 0.1),
                new THREE.Vector3(0, -2.8, 0.05),
                new THREE.Vector3(0, -3.2, 0)
            ])
        ];
        
        stemCurves.forEach((curve, index) => {
            const points = curve.getPoints(40);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.7,
                linewidth: 2
            });
            
            const line = new THREE.Line(geometry, material);
            line.userData = {
                originalColor: 0xffffff,
                animationOffset: index * 0.4
            };
            stemGroup.add(line);
        });
        
        return stemGroup;
    }

    createFrontalLobeWireframe() {
        const frontalGroup = new THREE.Group();
        
        // Frontal lobe divisions as wireframe
        const divisions = [
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(-1.0, 1.5, 1.5),
                new THREE.Vector3(0, 1.8, 1.8),
                new THREE.Vector3(1.0, 1.5, 1.5)
            ]),
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.8, 1.2, 1.2),
                new THREE.Vector3(0, 1.4, 1.4),
                new THREE.Vector3(0.8, 1.2, 1.2)
            ])
        ];
        
        divisions.forEach((curve, index) => {
            const points = curve.getPoints(30);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.5,
                linewidth: 1
            });
            
            const line = new THREE.Line(geometry, material);
            line.userData = {
                originalColor: 0x00ffff,
                animationOffset: index * 0.6
            };
            frontalGroup.add(line);
        });
        
        return frontalGroup;
    }

    createNeuralPathways(brainGroup) {
        // Create neural pathways connecting different brain regions
        const pathwayGroup = new THREE.Group();
        
        // Define key brain regions
        const regions = [
            { pos: new THREE.Vector3(-1.5, 1.5, 0.8), name: 'frontal' },
            { pos: new THREE.Vector3(1.5, 1.5, 0.8), name: 'frontal_r' },
            { pos: new THREE.Vector3(-2.0, 0, 0), name: 'temporal' },
            { pos: new THREE.Vector3(2.0, 0, 0), name: 'temporal_r' },
            { pos: new THREE.Vector3(0, 1.8, -0.5), name: 'parietal' },
            { pos: new THREE.Vector3(0, -0.8, -1.5), name: 'occipital' },
            { pos: new THREE.Vector3(0, -1.8, -1.8), name: 'cerebellum' }
        ];
        
        // Create pathways between regions
        for (let i = 0; i < regions.length; i++) {
            for (let j = i + 1; j < regions.length; j++) {
                if (Math.random() > 0.6) { // Only create some connections
                    const curve = new THREE.CatmullRomCurve3([
                        regions[i].pos,
                        new THREE.Vector3(
                            (regions[i].pos.x + regions[j].pos.x) / 2 + (Math.random() - 0.5) * 1,
                            (regions[i].pos.y + regions[j].pos.y) / 2 + (Math.random() - 0.5) * 1,
                            (regions[i].pos.z + regions[j].pos.z) / 2 + (Math.random() - 0.5) * 1
                        ),
                        regions[j].pos
                    ]);
                    
                    const points = curve.getPoints(30);
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({
                        color: 0xffff00,
                        transparent: true,
                        opacity: 0.3,
                        linewidth: 1
                    });
                    
                    const pathway = new THREE.Line(geometry, material);
                    pathway.userData = {
                        originalColor: 0xffff00,
                        animationOffset: (i + j) * 0.3,
                        isPathway: true
                    };
                    pathwayGroup.add(pathway);
                }
            }
        }
        
        brainGroup.add(pathwayGroup);
    }

    createBrainNodes(brainGroup) {
        // Create glowing nodes at key brain regions
        const nodePositions = [
            { pos: [-1.5, 1.5, 0.8], color: 0xffff00, size: 0.08 },   // Left frontal
            { pos: [1.5, 1.5, 0.8], color: 0xffff00, size: 0.08 },    // Right frontal
            { pos: [-2.0, 0, 0], color: 0x00ffff, size: 0.06 },       // Left temporal
            { pos: [2.0, 0, 0], color: 0x00ffff, size: 0.06 },        // Right temporal
            { pos: [0, 1.8, -0.5], color: 0xffffff, size: 0.07 },     // Parietal
            { pos: [0, -0.8, -1.5], color: 0x00ffff, size: 0.06 },    // Occipital
            { pos: [0, -1.8, -1.8], color: 0xffff00, size: 0.05 },    // Cerebellum
            { pos: [0, 0, 0], color: 0xffffff, size: 0.1 }             // Central core
        ];
        
        nodePositions.forEach((nodeData, index) => {
            const geometry = new THREE.SphereGeometry(nodeData.size, 8, 6);
            const material = new THREE.MeshBasicMaterial({
                color: nodeData.color,
                emissive: nodeData.color,
                emissiveIntensity: 0.8,
                transparent: true,
                opacity: 0.9
            });
            
            const node = new THREE.Mesh(geometry, material);
            node.position.set(nodeData.pos[0], nodeData.pos[1], nodeData.pos[2]);
            node.userData = {
                originalColor: nodeData.color,
                animationOffset: index * 0.4,
                baseScale: 1,
                isNode: true
            };
            
            brainGroup.add(node);
        });
    }

    createBrainOutline(brainGroup) {
        // Create the main brain shape using clean geometric curves
        const brainOutline = new THREE.Group();
        
        // Wireframe material with neural glow
        const wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0x00ccff,
            transparent: true,
            opacity: 0.8,
            linewidth: 2
        });
        
        // Create brain profile curves
        const brainCurves = this.generateBrainCurves();
        
        brainCurves.forEach((curve, index) => {
            const points = curve.getPoints(100);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, wireframeMaterial.clone());
            
            // Add subtle animation offset for each curve
            line.userData = {
                animationOffset: index * 0.2,
                originalColor: 0x00ccff
            };
            
            brainOutline.add(line);
        });
        
        // Add cerebellum outline
        this.addCerebellumOutline(brainOutline, wireframeMaterial);
        
        // Add brain stem outline
        this.addBrainStemOutline(brainOutline, wireframeMaterial);
        
        brainGroup.add(brainOutline);
        brainGroup.userData.outline = brainOutline;
        
        // Add pulsing animation
        this.animateBrainOutline(brainOutline);
    }

    generateBrainCurves() {
        const curves = [];
        
        // Main brain outline (top view)
        const topCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-2.5, 1.5, 1.5),
            new THREE.Vector3(-1.8, 2.2, 0.8),
            new THREE.Vector3(0, 2.5, 0.5),
            new THREE.Vector3(1.8, 2.2, 0.8),
            new THREE.Vector3(2.5, 1.5, 1.5),
            new THREE.Vector3(2.2, 0.5, 2),
            new THREE.Vector3(1.5, -0.5, 1.8),
            new THREE.Vector3(0, -1, 1.5),
            new THREE.Vector3(-1.5, -0.5, 1.8),
            new THREE.Vector3(-2.2, 0.5, 2),
            new THREE.Vector3(-2.5, 1.5, 1.5)
        ], true);
        
        // Side brain outline (left hemisphere)
        const leftSideCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-2.5, 1.5, 1.5),
            new THREE.Vector3(-2.8, 1, 0),
            new THREE.Vector3(-2.5, 0, -1.5),
            new THREE.Vector3(-2, -1, -2),
            new THREE.Vector3(-1, -1.5, -1.8),
            new THREE.Vector3(0, -1.8, -1.5),
            new THREE.Vector3(1, -1.5, -1.8),
            new THREE.Vector3(2, -1, -2),
            new THREE.Vector3(2.5, 0, -1.5),
            new THREE.Vector3(2.8, 1, 0),
            new THREE.Vector3(2.5, 1.5, 1.5)
        ]);
        
        // Frontal lobe outline
        const frontalCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-1.5, 2, 2),
            new THREE.Vector3(0, 2.3, 2.2),
            new THREE.Vector3(1.5, 2, 2),
            new THREE.Vector3(1.8, 1.5, 1.5),
            new THREE.Vector3(1.5, 1, 1),
            new THREE.Vector3(0, 0.8, 0.8),
            new THREE.Vector3(-1.5, 1, 1),
            new THREE.Vector3(-1.8, 1.5, 1.5),
            new THREE.Vector3(-1.5, 2, 2)
        ], true);
        
        // Temporal lobe curves
        const leftTemporalCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-2.8, 1, 0),
            new THREE.Vector3(-3, 0, 0.5),
            new THREE.Vector3(-2.8, -0.8, 1),
            new THREE.Vector3(-2.2, -1.2, 0.8),
            new THREE.Vector3(-1.8, -0.8, 0.5),
            new THREE.Vector3(-2, 0, 0),
            new THREE.Vector3(-2.5, 0.8, -0.2),
            new THREE.Vector3(-2.8, 1, 0)
        ], true);
        
        const rightTemporalCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(2.8, 1, 0),
            new THREE.Vector3(3, 0, 0.5),
            new THREE.Vector3(2.8, -0.8, 1),
            new THREE.Vector3(2.2, -1.2, 0.8),
            new THREE.Vector3(1.8, -0.8, 0.5),
            new THREE.Vector3(2, 0, 0),
            new THREE.Vector3(2.5, 0.8, -0.2),
            new THREE.Vector3(2.8, 1, 0)
        ], true);
        
        curves.push(topCurve, leftSideCurve, frontalCurve, leftTemporalCurve, rightTemporalCurve);
        return curves;
    }

    addCerebellumOutline(brainOutline, material) {
        // Create cerebellum as segmented lines
        const cerebellumCurves = [];
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 1 + Math.sin(i * 2) * 0.2;
            
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(Math.cos(angle) * radius, -2.5, Math.sin(angle) * radius - 1.5),
                new THREE.Vector3(Math.cos(angle + 0.5) * (radius + 0.3), -2.2, Math.sin(angle + 0.5) * (radius + 0.3) - 1.5),
                new THREE.Vector3(Math.cos(angle + 1) * radius, -2, Math.sin(angle + 1) * radius - 1.5),
                new THREE.Vector3(Math.cos(angle + 1.5) * (radius - 0.2), -2.3, Math.sin(angle + 1.5) * (radius - 0.2) - 1.5)
            ]);
            
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material.clone());
            line.material.color.setHex(0x0099dd);
            
            brainOutline.add(line);
        }
    }

    addBrainStemOutline(brainOutline, material) {
        // Brain stem as elegant connecting lines
        const stemCurves = [
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.3, -1.8, 0),
                new THREE.Vector3(-0.2, -2.5, -0.2),
                new THREE.Vector3(-0.1, -3.2, -0.1),
                new THREE.Vector3(0, -3.8, 0)
            ]),
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(0.3, -1.8, 0),
                new THREE.Vector3(0.2, -2.5, -0.2),
                new THREE.Vector3(0.1, -3.2, -0.1),
                new THREE.Vector3(0, -3.8, 0)
            ]),
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, -1.8, 0.3),
                new THREE.Vector3(0, -2.5, 0.2),
                new THREE.Vector3(0, -3.2, 0.1),
                new THREE.Vector3(0, -3.8, 0)
            ])
        ];
        
        stemCurves.forEach(curve => {
            const points = curve.getPoints(30);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material.clone());
            line.material.color.setHex(0x0066aa);
            
            brainOutline.add(line);
        });
    }

    createNeuralNodes(brainGroup) {
        const nodeGeometry = new THREE.SphereGeometry(0.08, 8, 6);
        const nodeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.9
        });
        
        // Strategic node placement for neural network effect
        const nodePositions = [
            [0, 2.5, 0.5],      // Top center
            [-1.8, 1.5, 1],     // Left frontal
            [1.8, 1.5, 1],      // Right frontal
            [-2.5, 0, 0],       // Left temporal
            [2.5, 0, 0],        // Right temporal
            [0, 0, -2],         // Occipital
            [-1, -2.2, -1.5],   // Left cerebellum
            [1, -2.2, -1.5],    // Right cerebellum
            [0, -3.5, 0],       // Brain stem base
            [-1.5, 0.8, 0.5],   // Left parietal
            [1.5, 0.8, 0.5],    // Right parietal
            [0, -1, 1.5]        // Central
        ];
        
        nodePositions.forEach((pos, index) => {
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
            node.position.set(pos[0], pos[1], pos[2]);
            node.userData = {
                animationOffset: index * 0.3,
                baseScale: 1
            };
            
            brainGroup.add(node);
        });
        
        brainGroup.userData.nodes = brainGroup.children.filter(child => 
            child.geometry && child.geometry.type === 'SphereGeometry'
        );
    }

    animateBrainOutline(brainOutline) {
        const animate = () => {
            const time = Date.now() * 0.001;
            
            // Gentle rotation
            brainOutline.rotation.y = Math.sin(time * 0.2) * 0.05;
            brainOutline.rotation.x = Math.sin(time * 0.15) * 0.02;
            
            // Pulsing wireframe effect
            brainOutline.children.forEach((child, index) => {
                if (child.material && child.material.type === 'LineBasicMaterial') {
                    const phase = time * 2 + index * 0.5;
                    const intensity = 0.5 + Math.sin(phase) * 0.3;
                    child.material.opacity = intensity;
                    
                    // Color shifting
                    const hue = (Math.sin(time * 0.5 + index * 0.2) * 0.1 + 0.55) % 1;
                    child.material.color.setHSL(hue, 0.8, 0.6);
                }
            });
        };
        
        this.animations.push(animate);
    }

    createBrainHemisphere(brainGroup, offsetX, side) {
        // Create hemisphere base
        const hemisphereGeometry = new THREE.SphereGeometry(2.5, 32, 16, 0, Math.PI);
        
        // Add realistic brain surface details
        const positions = hemisphereGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Create brain fold patterns (gyri and sulci)
            const fold1 = Math.sin(x * 4) * Math.cos(y * 3) * 0.15;
            const fold2 = Math.sin(z * 5) * Math.cos(x * 4) * 0.1;
            const fold3 = Math.sin(y * 6) * Math.cos(z * 3) * 0.08;
            
            // Add surface texture
            const surface = Math.sin(x * 8) * Math.sin(y * 8) * Math.sin(z * 8) * 0.05;
            
            positions[i] += fold1 + surface;
            positions[i + 1] += fold2 + surface;
            positions[i + 2] += fold3 + surface;
        }
        hemisphereGeometry.computeVertexNormals();
        
        const hemisphereMaterial = new THREE.MeshPhongMaterial({
            color: 0xcc9999,
            transparent: true,
            opacity: 0.9,
            emissive: 0x441122,
            emissiveIntensity: 0.2,
            shininess: 30,
            bumpScale: 0.1
        });
        
        const hemisphere = new THREE.Mesh(hemisphereGeometry, hemisphereMaterial);
        hemisphere.position.x = offsetX;
        hemisphere.rotation.y = side === 'right' ? Math.PI : 0;
        
        brainGroup.add(hemisphere);
        
        // Add cortex details
        this.addCortexDetails(brainGroup, offsetX, side);
        
        return hemisphere;
    }

    addCortexDetails(brainGroup, offsetX, side) {
        // Add visible brain folds (sulci)
        for (let i = 0; i < 8; i++) {
            const foldGeometry = new THREE.CylinderGeometry(0.03, 0.03, 3, 6);
            const foldMaterial = new THREE.MeshBasicMaterial({
                color: 0x886666,
                transparent: true,
                opacity: 0.8
            });
            
            const fold = new THREE.Mesh(foldGeometry, foldMaterial);
            fold.position.set(
                offsetX + (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3
            );
            fold.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            brainGroup.add(fold);
        }
    }

    createBrainStem(brainGroup) {
        const stemGeometry = new THREE.CylinderGeometry(0.6, 0.8, 2.5, 12);
        const stemMaterial = new THREE.MeshPhongMaterial({
            color: 0xaa7777,
            emissive: 0x332211,
            emissiveIntensity: 0.3,
            shininess: 50
        });
        
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.set(0, -2.5, 0);
        brainGroup.add(stem);
        
        return stem;
    }

    createCerebellum(brainGroup) {
        const cerebellumGeometry = new THREE.SphereGeometry(1.2, 24, 12);
        
        // Add cerebellum's characteristic folded structure
        const positions = cerebellumGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Create fine parallel folds
            const folds = Math.sin(x * 15) * Math.sin(z * 15) * 0.1;
            positions[i + 1] += folds;
        }
        cerebellumGeometry.computeVertexNormals();
        
        const cerebellumMaterial = new THREE.MeshPhongMaterial({
            color: 0xbb8888,
            emissive: 0x221111,
            emissiveIntensity: 0.25,
            shininess: 40
        });
        
        const cerebellum = new THREE.Mesh(cerebellumGeometry, cerebellumMaterial);
        cerebellum.position.set(0, -1.5, -2);
        brainGroup.add(cerebellum);
        
        return cerebellum;
    }

    createNeuralNetwork(brainGroup) {
        // Create visible neural pathways
        const pathways = [];
        
        for (let i = 0; i < 15; i++) {
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4),
                new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4),
                new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4),
                new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4)
            ]);
            
            const points = curve.getPoints(50);
            const pathGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const pathMaterial = new THREE.LineBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.3,
                linewidth: 2
            });
            
            const pathway = new THREE.Line(pathGeometry, pathMaterial);
            pathway.userData = {
                pulseOffset: Math.random() * Math.PI * 2,
                originalOpacity: 0.3
            };
            
            pathways.push(pathway);
            brainGroup.add(pathway);
        }
        
        brainGroup.userData.pathways = pathways;
        return pathways;
    }

    createEnergyCore(brainGroup) {
        // Central energy core
        const coreGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
            emissive: 0xffffff,
            emissiveIntensity: 2
        });
        
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        brainGroup.add(core);
        
        // Energy rings around core
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.RingGeometry(0.8 + i * 0.3, 0.9 + i * 0.3, 16);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            ring.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                }
            };
            
            brainGroup.add(ring);
        }
        
        brainGroup.userData.core = core;
        brainGroup.userData.hemispheres = brainGroup.children.filter(child => 
            child.geometry && child.geometry.type === 'SphereGeometry' && child !== core
        );
        
        return core;
    }

    // Alternative method to load external brain model
    async loadExternalBrainModel() {
        try {
            // Example for loading GLTF model
            const gltf = await this.gltfLoader.loadAsync('/models/brain.gltf');
            const brainModel = gltf.scene;
            
            // Adjust materials for our theme
            brainModel.traverse((child) => {
                if (child.isMesh) {
                    child.material.emissive = new THREE.Color(0x441122);
                    child.material.emissiveIntensity = 0.2;
                    child.material.transparent = true;
                    child.material.opacity = 0.9;
                }
            });
            
            brainModel.scale.setScalar(3);
            return brainModel;
        } catch (error) {
            console.log('Could not load external brain model:', error);
            return null;
        }
    }

    createElectricalConnections() {
        this.gameBrains.forEach((brain, index) => {
            // Create electrical connection from brain to each game brain
            const connectionPoints = [];
            const brainPos = new THREE.Vector3(0, 0, 0);
            const cubePos = brain.position.clone();
            
            // Create a curved path with multiple points
            const midPoint1 = new THREE.Vector3().lerpVectors(brainPos, cubePos, 0.3);
            midPoint1.add(new THREE.Vector3(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6
            ));
            
            const midPoint2 = new THREE.Vector3().lerpVectors(brainPos, cubePos, 0.7);
            midPoint2.add(new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            ));
            
            // Create curve
            const curve = new THREE.CatmullRomCurve3([
                brainPos,
                midPoint1,
                midPoint2,
                cubePos
            ]);
            
            // Create electrical bolt geometry
            const points = curve.getPoints(50);
            const boltGeometry = new THREE.BufferGeometry().setFromPoints(points);
            
            const boltMaterial = new THREE.LineBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.8,
                linewidth: 3
            });
            
            const bolt = new THREE.Line(boltGeometry, boltMaterial);
            bolt.userData = {
                curve: curve,
                targetBrain: brain,
                pulseOffset: Math.random() * Math.PI * 2,
                originalOpacity: 0.8
            };
            
            this.electricalConnections.push(bolt);
            this.scene.add(bolt);
            
            // Create neural pulse particles that travel along the connection
            this.createNeuralPulse(curve, index);
        });
    }

    createNeuralPulse(curve, connectionIndex) {
        const pulseGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const pulseMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            emissive: 0xffffff,
            emissiveIntensity: 2
        });
        
        const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
        pulse.userData = {
            curve: curve,
            progress: 0,
            speed: 0.005 + Math.random() * 0.01,
            connectionIndex: connectionIndex,
            trailPositions: []
        };
        
        this.neuralPulses.push(pulse);
        this.scene.add(pulse);
        
        // Create pulse trail
        for (let i = 0; i < 10; i++) {
            const trailGeometry = new THREE.SphereGeometry(0.05, 6, 6);
            const trailMaterial = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.5 - (i * 0.05),
                emissive: 0xffff00,
                emissiveIntensity: 0.5
            });
            
            const trailParticle = new THREE.Mesh(trailGeometry, trailMaterial);
            pulse.userData.trailPositions.push(trailParticle);
            this.scene.add(trailParticle);
        }
    }

    setupInteractions() {
        // Cache cursor element for better performance
        this.cursor = document.getElementById('cursor');
        
        // Real-time mouse move handler for immediate hover response
        let mouseMoveThrottleId = null;
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Enhanced cursor tracking for better visibility
            this.isHovering = true;
            
            // Minimal throttling for real-time hover response
            if (!mouseMoveThrottleId) {
                mouseMoveThrottleId = setTimeout(() => {
                    this.updateHover();
                    mouseMoveThrottleId = null;
                }, 8); // Reduced to 8ms for ~120fps responsiveness
            }
            
            this.createMouseTrail(event.clientX, event.clientY);
        }, { passive: true }); // Use passive for better scroll performance

        // Enhanced mobile touch support
        this.setupMobileSupport();
        
        // Single mouse leave handler to ensure hover state is cleared when mouse leaves canvas
        document.addEventListener('mouseleave', () => {
            if (this.hoveredCube) {
                this.clearBrainHover(this.hoveredCube);
                this.hoveredCube = null;
            }
            this.isHovering = false;
            // Clear any pending throttled updates
            if (mouseMoveThrottleId) {
                clearTimeout(mouseMoveThrottleId);
                mouseMoveThrottleId = null;
            }
        });
        
        document.addEventListener('click', (event) => {
            // Enhanced click handling with proper event delegation
            const isUIClick = event.target.closest('.instructions-panel, .activity-indicator, #controlsHint, .game-info-panel, .tips-panel, .play-button, .close-button, button, input, select, textarea, [role="button"], [tabindex]');
            
            if (isUIClick) {
                // Add click feedback for UI elements
                this.addClickFeedback(event.target);
                return; // Don't handle clicks on UI elements
            }
            
            // Prevent event bubbling
            event.stopPropagation();
            
            // Auto-close game info when clicking on blank space with smooth animation
            const gameInfoPanel = document.getElementById('gameInfoPanel');
            if (gameInfoPanel && gameInfoPanel.classList.contains('visible') && !this.hoveredCube) {
                this.smoothHideGameInfo();
                this.clearSelection();
                return;
            }
            
            // Check if clicking on a brain or empty space
            if (this.hoveredCube) {
                // Enhanced brain click with immediate feedback
                this.handleCubeClick();
                this.createEnhancedClickEffect(event.clientX, event.clientY);
            } else {
                // Click on empty space - reset camera to overview
                this.resetCameraSmooth();
                this.clearSelection();
                
                // Visual feedback for reset action
                this.createEnhancedClickEffect(event.clientX, event.clientY);
                
                // Optional: Show brief hint about the reset action
                this.showResetHint();
                
                // Play audio feedback
                if (this.audioEnabled && this.sounds.whoosh) {
                    this.sounds.whoosh();
                }
                
                console.log('🔄 Camera reset - clicking empty space to zoom out');
            }
        });
        
        // Enhanced keyboard controls with accessibility features
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            // Add visual feedback for keyboard interactions
            this.addKeyboardFeedback(event.code);
            
            switch(event.code) {
                case 'Space':
                    event.preventDefault();
                    this.triggerMagicEffect();
                    break;
                case 'Enter':
                    // Activate hovered brain with Enter key
                    if (this.hoveredCube) {
                        this.selectGameAccessible(this.hoveredCube);
                        this.createEnhancedClickEffect();
                    }
                    break;
                case 'Tab':
                    // Cycle through brains with Tab
                    event.preventDefault();
                    this.cycleThroughBrains(event.shiftKey);
                    break;
                case 'KeyR':
                    this.resetCameraSmooth();
                    break;
                case 'KeyE':
                    this.triggerEasterEgg();
                    break;
                case 'KeyF':
                    this.toggleFlyMode();
                    break;
                case 'Escape':
                    // Close panels with smooth animation
                    this.closeAllPanelsSmooth();
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    // Navigate brains with arrow keys
                    event.preventDefault();
                    this.navigateWithArrows(event.code);
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.composer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupMobileSupport() {
        // Enhanced mobile detection
        const isMobile = () => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
        };

        if (isMobile()) {
            console.log('Mobile device detected - setting up touch controls');
            
            // Listen for mobile events from HTML
            window.addEventListener('mobileCameraMove', (e) => {
                if (this.flyMode && this.controls) {
                    // Apply camera movement for fly mode
                    const sensitivity = 0.002;
                    this.controls.object.rotation.y -= e.detail.dx * sensitivity;
                    this.controls.object.rotation.x -= e.detail.dy * sensitivity;
                    this.controls.object.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.controls.object.rotation.x));
                }
            });

            window.addEventListener('mobileTap', (e) => {
                if (e.detail.x && e.detail.y) {
                    // Convert touch coordinates to normalized device coordinates
                    this.mouse.x = (e.detail.x / window.innerWidth) * 2 - 1;
                    this.mouse.y = -(e.detail.y / window.innerHeight) * 2 + 1;
                    
                    // Trigger hover and click
                    this.updateHover();
                    this.handleCubeClick();
                }
            });

            // Disable cursor for mobile
            if (this.cursor) {
                this.cursor.style.display = 'none';
            }
        }
    }

    createMouseTrail(x, y) {
        if (Math.random() > 0.7) { // Only create trail sometimes
            const trail = document.createElement('div');
            trail.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background: #ffff00;
                border-radius: 50%;
                pointer-events: none;
                z-index: 999;
                animation: trailFade 1s ease-out forwards;
            `;
            
            // Add trail fade animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes trailFade {
                    to {
                        opacity: 0;
                        transform: scale(0);
                    }
                }
            `;
            if (!document.head.querySelector('style[data-trail]')) {
                style.setAttribute('data-trail', 'true');
                document.head.appendChild(style);
            }
            
            document.body.appendChild(trail);
            setTimeout(() => trail.remove(), 1000);
        }
    }

    createClickEffect() {
        if (this.audioEnabled) {
            this.sounds.click();
        }
        
        // Screen shake
        this.cameraShake.intensity = 0.5;
        
        // Visual click effect
        const clickEffect = document.createElement('div');
        clickEffect.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 100px;
            height: 100px;
            border: 2px solid #ffff00;
            border-radius: 50%;
            pointer-events: none;
            z-index: 999;
            animation: clickRipple 0.6s ease-out forwards;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes clickRipple {
                to {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(3);
                }
            }
        `;
        if (!document.head.querySelector('style[data-ripple]')) {
            style.setAttribute('data-ripple', 'true');
            document.head.appendChild(style);
        }
        
        document.body.appendChild(clickEffect);
        setTimeout(() => clickEffect.remove(), 600);
    }

    // Enhanced Accessibility Methods
    createEnhancedClickEffect(x = window.innerWidth / 2, y = window.innerHeight / 2) {
        if (this.audioEnabled) {
            this.sounds.click();
        }
        
        // Screen shake with easing
        gsap.to(this.cameraShake, {
            intensity: 0.8,
            duration: 0.1,
            ease: "power2.out",
            onComplete: () => {
                gsap.to(this.cameraShake, {
                    intensity: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });
        
        // Enhanced visual click effect with better animation
        const clickEffect = document.createElement('div');
        clickEffect.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            border: 3px solid #ffff00;
            border-radius: 50%;
            pointer-events: none;
            z-index: 999;
            opacity: 1;
            box-shadow: 0 0 20px #ffff00, 0 0 40px #ffff00;
        `;
        
        document.body.appendChild(clickEffect);
        
        // Smooth GSAP animation
        gsap.to(clickEffect, {
            scale: 4,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => clickEffect.remove()
        });
        
        // Add inner ripple effect
        const innerRipple = document.createElement('div');
        innerRipple.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%);
            width: 8px;
            height: 8px;
            background: #ffff00;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            opacity: 0.8;
        `;
        
        document.body.appendChild(innerRipple);
        gsap.to(innerRipple, {
            scale: 2,
            opacity: 0,
            duration: 0.3,
            ease: "power1.out",
            onComplete: () => innerRipple.remove()
        });
    }

    addClickFeedback(element) {
        // Provide visual feedback for UI clicks
        if (!element) return;
        
        // Add a subtle scale animation
        gsap.to(element, {
            scale: 0.95,
            duration: 0.1,
            ease: "power2.out",
            yoyo: true,
            repeat: 1
        });
        
        // Add glow effect
        const originalBoxShadow = element.style.boxShadow;
        element.style.boxShadow = '0 0 20px rgba(255, 255, 0, 0.5)';
        setTimeout(() => {
            element.style.boxShadow = originalBoxShadow;
        }, 200);
    }

    addKeyboardFeedback(keyCode) {
        // Visual feedback for keyboard interactions
        const feedback = document.createElement('div');
        feedback.textContent = keyCode.replace('Key', '').replace('Arrow', '');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 0, 0.8);
            color: black;
            padding: 8px 12px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 1000;
            pointer-events: none;
            font-size: 14px;
        `;
        
        document.body.appendChild(feedback);
        
        gsap.fromTo(feedback, 
            { opacity: 0, y: -20 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.2, 
                ease: "power2.out"
            }
        );
        
        setTimeout(() => {
            gsap.to(feedback, {
                opacity: 0,
                y: -20,
                duration: 0.2,
                onComplete: () => feedback.remove()
            });
        }, 1000);
    }

    cycleThroughBrains(reverse = false) {
        if (this.gameBrains.length === 0) return;
        
        let currentIndex = this.hoveredCube ? this.gameBrains.indexOf(this.hoveredCube) : -1;
        
        if (reverse) {
            currentIndex = currentIndex <= 0 ? this.gameBrains.length - 1 : currentIndex - 1;
        } else {
            currentIndex = currentIndex >= this.gameBrains.length - 1 ? 0 : currentIndex + 1;
        }
        
        const targetBrain = this.gameBrains[currentIndex];
        this.focusOnBrain(targetBrain);
    }

    focusOnBrain(brain) {
        // Clear previous hover
        if (this.hoveredCube && this.hoveredCube !== brain) {
            this.clearBrainHover(this.hoveredCube);
        }
        
        // Set new hover
        this.hoveredCube = brain;
        this.applyBrainHover(brain);
        
        // Smooth camera focus
        const targetPosition = brain.position.clone();
        targetPosition.z += 15; // Move camera back a bit
        
        gsap.to(this.camera.position, {
            x: targetPosition.x * 0.3,
            y: targetPosition.y * 0.3,
            duration: 1,
            ease: "power2.inOut"
        });
        
        // Show game info
        this.showGameInfo(brain.userData);
        
        // Audio feedback
        if (this.audioEnabled) {
            this.sounds.hover();
        }
        
        // Accessibility announcement
        if (brain && brain.userData) {
            const gameTitle = brain.userData.title || 'Unknown Game';
            const gameDescription = brain.userData.description || 'No description available';
            this.announceToScreenReader(`Focused on ${gameTitle}. ${gameDescription}`);
        }
    }

    navigateWithArrows(keyCode) {
        if (this.gameBrains.length === 0) return;
        
        let targetBrain = null;
        const currentBrain = this.hoveredCube;
        
        if (!currentBrain) {
            // If no brain is hovered, select the first one
            targetBrain = this.gameBrains[0];
        } else {
            // Find closest brain in the direction of arrow key
            const currentPos = currentBrain.position;
            let closestDistance = Infinity;
            
            this.gameBrains.forEach(brain => {
                if (brain === currentBrain) return;
                
                const pos = brain.position;
                const dx = pos.x - currentPos.x;
                const dy = pos.y - currentPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                let isValidDirection = false;
                switch (keyCode) {
                    case 'ArrowLeft':
                        isValidDirection = dx < -2; // Brain is to the left
                        break;
                    case 'ArrowRight':
                        isValidDirection = dx > 2; // Brain is to the right
                        break;
                    case 'ArrowUp':
                        isValidDirection = dy > 2; // Brain is above
                        break;
                    case 'ArrowDown':
                        isValidDirection = dy < -2; // Brain is below
                        break;
                }
                
                if (isValidDirection && distance < closestDistance) {
                    closestDistance = distance;
                    targetBrain = brain;
                }
            });
            
            // If no brain found in that direction, wrap around
            if (!targetBrain) {
                switch (keyCode) {
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        targetBrain = this.gameBrains[this.gameBrains.length - 1];
                        break;
                    case 'ArrowRight':
                    case 'ArrowDown':
                        targetBrain = this.gameBrains[0];
                        break;
                }
            }
        }
        
        if (targetBrain) {
            this.focusOnBrain(targetBrain);
        }
    }

    smoothHideGameInfo() {
        const gameInfoPanel = document.getElementById('gameInfoPanel');
        if (gameInfoPanel && gameInfoPanel.classList.contains('visible')) {
            gsap.to(gameInfoPanel, {
                opacity: 0,
                scale: 0.9,
                duration: 0.3,
                ease: "power2.inOut",
                onComplete: () => {
                    this.hideGameInfo();
                }
            });
        }
    }

    clearSelection() {
        if (this.selectedGame) {
            this.clearBrainHover(this.selectedGame);
            this.selectedGame = null;
        }
        
        // Also clear any hovered brain
        if (this.hoveredCube) {
            this.clearBrainHover(this.hoveredCube);
            this.hoveredCube = null;
        }
    }

    closeAllPanelsSmooth() {
        // Close game panel
        const gameInfoPanel = document.getElementById('gameInfoPanel');
        if (gameInfoPanel && gameInfoPanel.classList.contains('visible')) {
            this.smoothHideGameInfo();
        }
        
        // Close controls panel
        const controlsHint = document.getElementById('controlsHint');
        const controlsToggle = document.getElementById('controlsToggle');
        if (controlsHint && controlsHint.classList.contains('visible')) {
            gsap.to(controlsHint, {
                opacity: 0,
                y: 20,
                duration: 0.3,
                ease: "power2.inOut",
                onComplete: () => {
                    controlsHint.classList.remove('visible');
                    if (controlsToggle) controlsToggle.classList.remove('active');
                }
            });
        }
        
        // Clear all brain states (both selected and hovered)
        this.clearAllBrainStates();
        
        // Reset camera to default position
        this.resetCameraSmooth();
        
        // Clear cursor hover state
        if (this.cursor) {
            this.cursor.classList.remove('hover');
        }
        
        // Force hover detection re-activation after panels close
        setTimeout(() => {
            console.log('🔄 Re-enabling hover detection after panel close');
            this.isHovering = true;
            this.updateHover(); // Force hover check
        }, 200);
        
        // Announce to screen readers
        this.announceToScreenReader('All panels closed, view reset');
    }

    clearAllBrainStates() {
        // Temporarily disable hovering during state clearing
        this.isHovering = false;
        
        // Clear hovered brain
        if (this.hoveredCube) {
            this.clearBrainHover(this.hoveredCube);
            this.hoveredCube = null;
        }
        
        // Clear selected brain
        if (this.selectedGame) {
            this.clearBrainHover(this.selectedGame);
            this.selectedGame = null;
        }
        
        // Reset all brain colors to their original status-based colors
        this.gameBrains.forEach(brain => {
            if (brain.userData.mainBrain) {
                const isLiveGame = brain.userData.status === 'Live';
                const originalColor = isLiveGame ? { r: 1, g: 1, b: 0 } : { r: 1, g: 1, b: 1 };
                
                // Reset scale
                gsap.to(brain.scale, {
                    x: 1, y: 1, z: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
                
                // Reset colors
                brain.userData.mainBrain.traverse((child) => {
                    if (child.isMesh && child.material) {
                        gsap.to(child.material.color, {
                            r: originalColor.r, 
                            g: originalColor.g, 
                            b: originalColor.b,
                            duration: 0.2,
                            ease: "power1.out"
                        });
                        gsap.to(child.material.emissive, {
                            r: originalColor.r, 
                            g: originalColor.g, 
                            b: originalColor.b,
                            duration: 0.2,
                            ease: "power1.out"
                        });
                        gsap.to(child.material, {
                            emissiveIntensity: 0.2,
                            duration: 0.2,
                            ease: "power1.out"
                        });
                    }
                });
            }
        });
    }

    showResetHint() {
        // Create a subtle hint that appears briefly when resetting
        const hint = document.createElement('div');
        hint.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: #ffff00;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 0.9em;
            z-index: 1000;
            pointer-events: none;
            border: 1px solid rgba(255, 255, 0, 0.3);
            opacity: 0;
        `;
        hint.textContent = '🔄 Camera Reset';
        document.body.appendChild(hint);
        
        // Animate the hint
        gsap.to(hint, {
            duration: 0.3,
            opacity: 1,
            ease: "power2.out",
            onComplete: () => {
                gsap.to(hint, {
                    duration: 0.5,
                    opacity: 0,
                    delay: 1,
                    ease: "power2.in",
                    onComplete: () => hint.remove()
                });
            }
        });
    }

    resetCameraSmooth() {
        // Clear hover state when resetting camera
        if (this.hoveredCube) {
            this.clearBrainHover(this.hoveredCube);
            this.hoveredCube = null;
        }
        
        // Hide game info panel
        this.hideGameInfo();
        
        // Clear selected game state
        this.selectedGame = null;
        
        gsap.to(this.camera.position, {
            x: 0,
            y: 0,
            z: 25,
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                // Ensure controls are properly updated after animation
                this.controls.update();
            }
        });
        
        gsap.to(this.controls.target, {
            x: 0,
            y: 0,
            z: 0,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => this.controls.update(),
            onComplete: () => {
                // Force controls update and enable hover detection
                this.controls.update();
                this.isHovering = true; // Re-enable hover detection immediately
                
                // Force a hover update after camera reset to detect current mouse position
                setTimeout(() => {
                    console.log('🔄 Forcing hover update after camera reset');
                    this.updateHover();
                }, 150); // Small delay to ensure camera animation is complete
            }
        });
    }

    applyBrainHover(brain) {
        if (!brain) return;
        
        // Instant scale animation for immediate feedback
        gsap.to(brain.scale, {
            x: 1.2, y: 1.2, z: 1.2,
            duration: 0.05, // Much faster scale
            ease: "power2.out"
        });
        
        // Instant color change - no delay for immediate purple glow
        if (brain.userData.mainBrain) {
            brain.userData.mainBrain.traverse((child) => {
                if (child.isMesh && child.material) {
                    // Instant purple glow - no transition delay
                    child.material.color.setRGB(0.8, 0.2, 1.0); // Purple
                    child.material.emissive.setRGB(0.6, 0.1, 0.8); // Purple emissive
                    child.material.emissiveIntensity = 0.5;
                }
            });
        }
        
        // Add cursor hover class
        if (this.cursor) {
            this.cursor.classList.add('hover');
        }
    }

    clearBrainHover(brain) {
        if (!brain) return;
        
        // Instant scale reset for immediate feedback
        gsap.to(brain.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.05, // Much faster scale reset
            ease: "power2.out"
        });
        
        // Instant color reset - no delay for immediate return to normal
        if (brain.userData.mainBrain) {
            brain.userData.mainBrain.traverse((child) => {
                if (child.isMesh && child.material) {
                    // Get the original color from userData, fallback to white if not found
                    const originalColor = child.userData.originalColor || brain.userData.originalColor || 0xffffff;
                    let r, g, b;
                    
                    if (typeof originalColor === 'number') {
                        r = ((originalColor >> 16) & 255) / 255;
                        g = ((originalColor >> 8) & 255) / 255;
                        b = (originalColor & 255) / 255;
                    } else {
                        r = originalColor.r || 1;
                        g = originalColor.g || 1;
                        b = originalColor.b || 1;
                    }
                    
                    // Instant color reset - no transition delay
                    child.material.color.setRGB(r, g, b);
                    child.material.emissive.setRGB(r * 0.2, g * 0.2, b * 0.2);
                    child.material.emissiveIntensity = 0.1;
                }
            });
        }
        
        // Remove cursor hover class
        if (this.cursor) {
            this.cursor.classList.remove('hover');
        }
    }

    // Accessibility Helper Methods
    announceToScreenReader(message, priority = 'polite') {
        if (this.announcer) {
            this.announcer.setAttribute('aria-live', priority);
            this.announcer.textContent = message;
            
            // Clear the message after a delay to allow for re-announcements
            setTimeout(() => {
                this.announcer.textContent = '';
            }, 1000);
        }
    }

    // Enhanced game selection with accessibility feedback
    selectGameAccessible(brain) {
        if (!brain || !brain.userData) return;
        
        this.selectGame(brain);
        
        // Provide screen reader feedback
        const gameTitle = brain.userData.title || 'Unknown Game';
        const gameStatus = brain.userData.status || 'Unknown Status';
        this.announceToScreenReader(`Selected ${gameTitle}. Status: ${gameStatus}. Press Enter to play or Tab to navigate to other games.`);
    }

    // Enhanced focus management
    focusOnBrainAccessible(brain) {
        this.focusOnBrain(brain);
        
        if (brain && brain.userData) {
            const gameTitle = brain.userData.title || 'Unknown Game';
            const gameDescription = brain.userData.description || 'No description available';
            this.announceToScreenReader(`Focused on ${gameTitle}. ${gameDescription}`);
        }
    }

    updateHover() {
        // Enhanced hover detection with better performance and accessibility
        // Check if hovering is enabled before proceeding
        if (!this.isHovering) {
            return; // Skip hover updates when disabled
        }
        
        // Cache UI elements for better performance
        if (!this.cachedUIElements) {
            this.cachedUIElements = {
                gameInfoPanel: document.getElementById('gameInfoPanel'),
                controlsHint: document.getElementById('controlsHint'),
                instructionsPanel: document.getElementById('instructionsPanel')
            };
        }
        
        const { gameInfoPanel, controlsHint, instructionsPanel } = this.cachedUIElements;
        
        if (!gameInfoPanel) return; // Early exit if essential elements not found
        
        const mouseX = (this.mouse.x + 1) / 2 * window.innerWidth;
        const mouseY = (-this.mouse.y + 1) / 2 * window.innerHeight;
        
        // Check if over game info panel
        const panelRect = gameInfoPanel.getBoundingClientRect();
        const isOverGamePanel = mouseX >= panelRect.left && 
                               mouseX <= panelRect.right && 
                               mouseY >= panelRect.top && 
                               mouseY <= panelRect.bottom;
        
        // Check if over controls panel
        let isOverControlsPanel = false;
        if (controlsHint && controlsHint.classList.contains('visible')) {
            const controlsRect = controlsHint.getBoundingClientRect();
            isOverControlsPanel = mouseX >= controlsRect.left && 
                                 mouseX <= controlsRect.right && 
                                 mouseY >= controlsRect.top && 
                                 mouseY <= controlsRect.bottom;
        }
        
        // Check if over instructions panel
        let isOverInstructionsPanel = false;
        if (instructionsPanel && instructionsPanel.classList.contains('open')) {
            const instructionsRect = instructionsPanel.getBoundingClientRect();
            isOverInstructionsPanel = mouseX >= instructionsRect.left && 
                                     mouseX <= instructionsRect.right && 
                                     mouseY >= instructionsRect.top && 
                                     mouseY <= instructionsRect.bottom;
        }
        
        const isOverPanel = isOverGamePanel || isOverControlsPanel || isOverInstructionsPanel;
        
        // Enhanced panel hover handling
        if ((isOverGamePanel && gameInfoPanel.classList.contains('visible')) || 
            isOverControlsPanel || 
            isOverInstructionsPanel) {
            if (this.cursor) {
                this.cursor.classList.add('hover');
            }
            return;
        } else {
            if (this.cursor) {
                this.cursor.classList.remove('hover');
            }
        }
        
        // Clear hover timeout for better responsiveness
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
        
        // Enhanced raycaster setup for precision
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.raycaster.params.Points.threshold = 0.01; // Increased threshold for better detection
        this.raycaster.params.Line.threshold = 0.01;
        this.raycaster.params.Mesh.threshold = 0.01; // Add mesh threshold
        
        // Only check intersections if we have brains to check
        if (!this.gameBrains || this.gameBrains.length === 0) return;
        
        const intersects = this.raycaster.intersectObjects(this.gameBrains, true);
        
        // Debug log for troubleshooting
        if (intersects.length > 0) {
            console.log('Intersections found:', intersects.length, 'First target:', intersects[0].object);
        }
        
        // Reset previous hover state using enhanced method
        if (this.hoveredCube && (!intersects.length || !this.gameBrains.includes(intersects[0].object.parent || intersects[0].object))) {
            this.clearBrainHover(this.hoveredCube);
            this.hoveredCube = null;
        }
        
        if (intersects.length > 0) {
            // Find the brain group (parent) more reliably
            let target = intersects[0].object;
            while (target.parent && !this.gameBrains.includes(target)) {
                target = target.parent;
            }
            
            if (this.gameBrains.includes(target)) {
                // Only apply hover if it's a different brain
                if (this.hoveredCube !== target) {
                    // Clear previous hover
                    if (this.hoveredCube) {
                        this.clearBrainHover(this.hoveredCube);
                    }
                    
                    // Set new hover with enhanced method
                    this.hoveredCube = target;
                    this.applyBrainHover(target);
                    
                    // Audio feedback with null check
                    if (this.audioEnabled && this.sounds && this.sounds.hover) {
                        this.sounds.hover();
                    }
                    
                    // Create enhanced hover particles
                    this.createEnhancedHoverParticles(target.position);
                }
                
                // Show game info with enhanced animation - ensure userData exists
                if (target.userData && target.userData.title) {
                    console.log('Showing game info for:', target.userData.title); // Debug log
                    this.showGameInfo(target.userData);
                } else {
                    console.warn('Brain target missing userData:', target); // Debug warning
                }
            }
        } else if (!isOverPanel) {
            // Clear hover when not over any brain or panel
            if (this.hoveredCube) {
                this.clearBrainHover(this.hoveredCube);
                this.hoveredCube = null;
            }
            
            // Hide game info when not hovering and no selection
            if (!this.selectedGame) {
                this.hideGameInfo();
            }
        }
    }

    createHoverParticles(position) {
        if (this.performanceMode === 'low') return;
        
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.SphereGeometry(0.05, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            particle.position.add(new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            ));
            
            this.scene.add(particle);
            
            gsap.to(particle.position, {
                duration: 1,
                x: particle.position.x + (Math.random() - 0.5) * 6,
                y: particle.position.y + Math.random() * 3,
                z: particle.position.z + (Math.random() - 0.5) * 6,
                ease: "power2.out"
            });
            
            gsap.to(particle.material, {
                duration: 1,
                opacity: 0,
                onComplete: () => {
                    this.scene.remove(particle);
                }
            });
        }
    }

    createEnhancedHoverParticles(position) {
        if (this.performanceMode === 'low') return;
        
        // Create more sophisticated particle effects
        const particleCount = 8;
        const colors = [0xffff00, 0xff6600, 0xffffff];
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.03 + Math.random() * 0.04, 6, 6);
            const material = new THREE.MeshBasicMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                transparent: true,
                opacity: 0.9,
                emissive: colors[Math.floor(Math.random() * colors.length)],
                emissiveIntensity: 0.3
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            
            // Create spiral pattern
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 2 + Math.random() * 2;
            particle.position.add(new THREE.Vector3(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 3,
                Math.sin(angle) * radius
            ));
            
            this.scene.add(particle);
            
            // Enhanced animation with rotation
            const endPos = particle.position.clone();
            endPos.add(new THREE.Vector3(
                Math.cos(angle) * (radius + 4),
                Math.random() * 5,
                Math.sin(angle) * (radius + 4)
            ));
            
            gsap.to(particle.position, {
                duration: 1.2,
                x: endPos.x,
                y: endPos.y,
                z: endPos.z,
                ease: "power2.out"
            });
            
            gsap.to(particle.rotation, {
                duration: 1.2,
                x: Math.random() * Math.PI * 2,
                y: Math.random() * Math.PI * 2,
                z: Math.random() * Math.PI * 2,
                ease: "none"
            });
            
            gsap.to(particle.material, {
                duration: 1.2,
                opacity: 0,
                emissiveIntensity: 0,
                onComplete: () => {
                    this.scene.remove(particle);
                    if (particle.geometry) particle.geometry.dispose();
                    if (particle.material) particle.material.dispose();
                }
            });
        }
    }

    handleCubeClick() {
        if (this.hoveredCube) {
            this.selectGame(this.hoveredCube);
        }
    }

    selectGame(brain) {
        // Reset previous selection
        if (this.selectedGame) {
            gsap.to(this.selectedGame.scale, {
                duration: 0.5,
                x: 1, y: 1, z: 1
            });
            
            // Reset brain color back to yellow
            if (this.selectedGame.userData.mainBrain) {
                this.selectedGame.userData.mainBrain.traverse((child) => {
                    if (child.isMesh && child.material) {
                        gsap.to(child.material.color, {
                            duration: 0.5,
                            r: 1, g: 1, b: 0, // Yellow color
                            ease: "power2.out"
                        });
                        gsap.to(child.material.emissive, {
                            duration: 0.5,
                            r: 1, g: 1, b: 0, // Yellow emissive
                            ease: "power2.out"
                        });
                        gsap.to(child.material, {
                            duration: 0.5,
                            emissiveIntensity: 0.2,
                            ease: "power2.out"
                        });
                    }
                });
            }
        }
        
        this.selectedGame = brain;
        
        // Highlight selected brain
        gsap.to(brain.scale, {
            duration: 0.5,
            x: 1.4, y: 1.4, z: 1.4,
            ease: "back.out(1.7)"
        });
        
        // Keep purple highlight for selected brain
        if (brain.userData.mainBrain) {
            brain.userData.mainBrain.traverse((child) => {
                if (child.isMesh && child.material) {
                    gsap.to(child.material.color, {
                        duration: 0.5,
                        r: 0.6, g: 0.2, b: 0.8, // Purple color
                        ease: "power2.out"
                    });
                    gsap.to(child.material.emissive, {
                        duration: 0.5,
                        r: 0.6, g: 0.2, b: 0.8, // Purple emissive
                        ease: "power2.out"
                    });
                    gsap.to(child.material, {
                        duration: 0.5,
                        emissiveIntensity: 0.7,
                        ease: "power2.out"
                    });
                }
            });
        }
        
        // Highlight the electrical connection to this brain
        const connectionIndex = this.gameBrains.indexOf(brain);
        if (this.electricalConnections[connectionIndex]) {
            gsap.to(this.electricalConnections[connectionIndex].material, {
                duration: 0.5,
                opacity: 1.5,
                yoyo: true,
                repeat: 3
            });
        }
        
        // Central brain responds to selection
        if (this.centralBrain) {
            const core = this.centralBrain.userData.core;
            if (core) {
                gsap.to(core.scale, {
                    duration: 0.3,
                    x: 1.5, y: 1.5, z: 1.5,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });
            }
        }
        
        // Focus camera on selected brain
        this.focusOnCube(brain);
        this.showGameInfo(brain.userData, true);
    }

    focusOnCube(cube) {
        const targetPosition = cube.position.clone();
        targetPosition.add(new THREE.Vector3(0, 0, 12));
        
        gsap.to(this.camera.position, {
            duration: 1.5,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            ease: "power2.inOut"
        });
        
        gsap.to(this.controls.target, {
            duration: 1.5,
            x: cube.position.x,
            y: cube.position.y,
            z: cube.position.z,
            ease: "power2.inOut"
        });
    }

    showGameInfo(gameData, isSelected = false) {
        const panel = document.getElementById('gameInfoPanel');
        const title = document.getElementById('gameTitle');
        const description = document.getElementById('gameDescription');
        const tags = document.getElementById('gameTags');
        const playButton = document.getElementById('playButton');
        
        // Ensure panel is visible immediately
        if (!panel.classList.contains('visible')) {
            panel.classList.add('visible');
        }
        
        // Enhanced title with animation
        title.textContent = gameData.title;
        gsap.fromTo(title, 
            { opacity: 0, y: -10 }, 
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
        
        // Enhanced description with simplified animation to prevent text corruption
        if (description.textContent !== gameData.description) {
            this.animateTextContent(description, gameData.description);
        }
        
        // Enhanced tags with staggered animation
        tags.innerHTML = '';
        gameData.tags.forEach((tag, index) => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag enhanced-tag';
            tagElement.textContent = tag;
            tagElement.style.opacity = '0';
            tagElement.style.transform = 'translateY(10px)';
            tags.appendChild(tagElement);
            
            // Staggered animation for tags
            gsap.to(tagElement, {
                opacity: 1,
                y: 0,
                duration: 0.3,
                delay: index * 0.1,
                ease: "back.out(1.7)"
            });
        });
        
        // Enhanced features section with icons
        if (gameData.features && gameData.features.length > 0) {
            const featuresSection = document.createElement('div');
            featuresSection.className = 'features-section enhanced-section';
            featuresSection.innerHTML = `
                <h4><span class="section-icon">⭐</span> Key Features:</h4>
                <ul class="features-list enhanced-list">
                    ${gameData.features.map((feature, index) => 
                        `<li class="feature-item" style="opacity: 0; transform: translateX(-20px);">
                            <span class="feature-bullet">●</span>
                            <span class="feature-text">${feature}</span>
                        </li>`
                    ).join('')}
                </ul>
            `;
            
            // Remove existing features section
            const existingFeatures = panel.querySelector('.features-section');
            if (existingFeatures) {
                existingFeatures.remove();
            }
            description.parentNode.insertBefore(featuresSection, tags);
            
            // Animate features with stagger
            const featureItems = featuresSection.querySelectorAll('.feature-item');
            gsap.to(featureItems, {
                opacity: 1,
                x: 0,
                duration: 0.4,
                stagger: 0.1,
                delay: 0.3,
                ease: "power2.out"
            });
        }
        
        // Enhanced controls section with better styling
        if (gameData.controls && Object.keys(gameData.controls).length > 0) {
            const controlsSection = document.createElement('div');
            controlsSection.className = 'controls-section enhanced-section';
            controlsSection.innerHTML = `
                <h4><span class="section-icon">🎮</span> Controls:</h4>
                <div class="controls-grid">
                    ${Object.entries(gameData.controls).map(([key, action], index) => 
                        `<div class="control-item enhanced-control" style="opacity: 0; transform: scale(0.9);">
                            <div class="control-key-wrapper">
                                <span class="control-key">${key}</span>
                            </div>
                            <span class="control-action">${action}</span>
                        </div>`
                    ).join('')}
                </div>
            `;
            
            // Remove existing controls section
            const existingControls = panel.querySelector('.controls-section');
            if (existingControls) {
                existingControls.remove();
            }
            tags.parentNode.insertBefore(controlsSection, playButton);
            
            // Animate controls
            const controlItems = controlsSection.querySelectorAll('.enhanced-control');
            gsap.to(controlItems, {
                opacity: 1,
                scale: 1,
                duration: 0.3,
                stagger: 0.08,
                delay: 0.5,
                ease: "back.out(1.7)"
            });
        }
        
        // Enhanced gameplay section with better formatting
        if (gameData.gameplay) {
            const gameplaySection = document.createElement('div');
            gameplaySection.className = 'gameplay-section enhanced-section';
            gameplaySection.innerHTML = `
                <h4><span class="section-icon">🕹️</span> Gameplay:</h4>
                <div class="gameplay-content">
                    <p class="gameplay-text">${gameData.gameplay}</p>
                </div>
            `;
            
            // Remove existing gameplay section
            const existingGameplay = panel.querySelector('.gameplay-section');
            if (existingGameplay) {
                existingGameplay.remove();
            }
            tags.parentNode.insertBefore(gameplaySection, playButton);
            
            // Animate gameplay section
            gsap.fromTo(gameplaySection, 
                { opacity: 0, y: 20 }, 
                { opacity: 1, y: 0, duration: 0.5, delay: 0.6, ease: "power2.out" }
            );
        }
        
        // Enhanced status indicator with glow effect
        if (gameData.status) {
            const statusSection = document.createElement('div');
            statusSection.className = 'status-section enhanced-status';
            const statusClass = gameData.status.toLowerCase().replace(' ', '-');
            const statusIcon = gameData.status === 'Live' ? '🟢' : '🔶';
            statusSection.innerHTML = `
                <div class="status-wrapper">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="status-indicator status-${statusClass}">
                        ${gameData.status}
                    </span>
                    <div class="status-glow"></div>
                </div>
            `;
            
            // Remove existing status section
            const existingStatus = panel.querySelector('.status-section');
            if (existingStatus) {
                existingStatus.remove();
            }
            title.parentNode.insertBefore(statusSection, description);
            
            // Animate status with pulse effect
            gsap.fromTo(statusSection, 
                { opacity: 0, scale: 0.8 }, 
                { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
            );
        }
        
        // Enhanced play button with hover effects
        this.enhancePlayButton(playButton, gameData);
        
        // Add interactive elements for better UX
        this.addInteractiveElements(panel, gameData);
        
        // Add section hover effects
        this.addSectionHoverEffects(panel);
        
        // Add dynamic content loading simulation for Coming Soon games
        if (gameData.status === 'Coming Soon') {
            this.addDevelopmentUpdates(panel, gameData);
        }
        
        // Reset scroll position to top when showing new content
        panel.scrollTop = 0;
        
        // Enhanced panel visibility animation
        if (!panel.classList.contains('visible')) {
            panel.classList.add('visible');
            gsap.fromTo(panel, 
                { opacity: 0, x: 50, scale: 0.95 }, 
                { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: "power2.out" }
            );
        }
        
        // Store current game for play button
        window.currentGameUrl = gameData.url;
        
        // Ensure content stays within bounds
        this.ensurePanelContentBounds(panel);
        
        // Add dynamic background based on game status
        this.updatePanelTheme(panel, gameData);
    }

    animateTextContent(element, newText) {
        // Simplified text animation to prevent scrambling
        const currentText = element.textContent;
        if (currentText === newText) return;
        
        gsap.to(element, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                // Set text directly to prevent character corruption
                element.textContent = newText;
                gsap.to(element, {
                    opacity: 1,
                    duration: 0.3
                });
            }
        });
    }

    enhancePlayButton(playButton, gameData) {
        // Remove existing enhancements
        const existingWrapper = playButton.parentNode.querySelector('.play-button-wrapper');
        if (existingWrapper) {
            existingWrapper.remove();
        }
        
        // Create enhanced button wrapper
        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'play-button-wrapper';
        
        if (gameData.url.startsWith('http')) {
            playButton.textContent = '🚀 Play Game';
            playButton.className = 'play-button live-game';
            buttonWrapper.innerHTML = `
                <div class="button-glow live-glow"></div>
                <div class="button-particles"></div>
            `;
        } else {
            playButton.textContent = '⏳ Coming Soon';
            playButton.className = 'play-button coming-soon';
            buttonWrapper.innerHTML = `
                <div class="button-glow soon-glow"></div>
            `;
        }
        
        // Wrap the button
        playButton.parentNode.insertBefore(buttonWrapper, playButton);
        buttonWrapper.appendChild(playButton);
        
        // Enhanced button onclick with animation
        playButton.onclick = (e) => {
            e.preventDefault();
            
            // Button click animation
            gsap.to(playButton, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });
            
            // Create click ripple effect
            this.createButtonRipple(e, playButton);
            
            setTimeout(() => {
                this.playGame(gameData.url);
            }, 200);
        };
        
        // Add hover effects
        playButton.addEventListener('mouseenter', () => {
            gsap.to(playButton, {
                scale: 1.05,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        });
        
        playButton.addEventListener('mouseleave', () => {
            gsap.to(playButton, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }

    createButtonRipple(event, button) {
        const ripple = document.createElement('div');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            pointer-events: none;
            z-index: 1;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        gsap.to(ripple, {
            scale: 2,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => ripple.remove()
        });
    }

    addInteractiveElements(panel, gameData) {
        // Add floating particles in the background
        if (!panel.querySelector('.panel-particles')) {
            const particlesContainer = document.createElement('div');
            particlesContainer.className = 'panel-particles';
            
            for (let i = 0; i < 5; i++) {
                const particle = document.createElement('div');
                particle.className = 'floating-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: ${gameData.status === 'Live' ? '#ffff00' : '#ffffff'};
                    border-radius: 50%;
                    opacity: 0.3;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    pointer-events: none;
                `;
                particlesContainer.appendChild(particle);
                
                // Animate particles
                gsap.to(particle, {
                    y: '-=20',
                    x: `+=${(Math.random() - 0.5) * 40}`,
                    opacity: 0,
                    duration: 3 + Math.random() * 2,
                    repeat: -1,
                    ease: "power1.out",
                    delay: Math.random() * 2
                });
            }
            
            panel.appendChild(particlesContainer);
        }
        
        // Add progress indicator for Coming Soon games
        if (gameData.status === 'Coming Soon') {
            const progressSection = document.createElement('div');
            progressSection.className = 'progress-section';
            const randomProgress = Math.floor(Math.random() * 40) + 20; // 20-60%
            progressSection.innerHTML = `
                <h4><span class="section-icon">📊</span> Development Progress:</h4>
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%;"></div>
                    </div>
                    <span class="progress-text">0%</span>
                </div>
            `;
            
            const existingProgress = panel.querySelector('.progress-section');
            if (existingProgress) {
                existingProgress.remove();
            }
            
            const playButton = panel.querySelector('.play-button-wrapper') || panel.querySelector('#playButton');
            playButton.parentNode.insertBefore(progressSection, playButton);
            
            // Animate progress bar
            const progressFill = progressSection.querySelector('.progress-fill');
            const progressText = progressSection.querySelector('.progress-text');
            
            gsap.to(progressFill, {
                width: `${randomProgress}%`,
                duration: 2,
                delay: 1,
                ease: "power2.out"
            });
            
            gsap.to(progressText, {
                innerHTML: `${randomProgress}%`,
                duration: 2,
                delay: 1,
                ease: "power2.out"
            });
        }
    }

    updatePanelTheme(panel, gameData) {
        // Dynamic background gradient based on game status
        if (gameData.status === 'Live') {
            panel.style.background = `
                linear-gradient(135deg, 
                    rgba(255, 255, 0, 0.1) 0%,
                    rgba(0, 0, 0, 0.95) 50%,
                    rgba(255, 255, 0, 0.05) 100%
                )
            `;
            panel.style.borderColor = 'rgba(255, 255, 0, 0.3)';
        } else {
            panel.style.background = `
                linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.1) 0%,
                    rgba(0, 0, 0, 0.95) 50%,
                    rgba(255, 255, 255, 0.05) 100%
                )
            `;
            panel.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }
        
        // Add subtle animation to the background
        gsap.to(panel, {
            backgroundPosition: '200% 200%',
            duration: 10,
            repeat: -1,
            ease: "none"
        });
    }

    addSectionHoverEffects(panel) {
        // Add hover effects to all enhanced sections
        const sections = panel.querySelectorAll('.enhanced-section');
        sections.forEach(section => {
            section.addEventListener('mouseenter', () => {
                gsap.to(section, {
                    scale: 1.02,
                    y: -2,
                    duration: 0.3,
                    ease: "power2.out"
                });
                
                // Add subtle glow effect
                section.style.boxShadow = '0 10px 30px rgba(255, 255, 0, 0.15)';
            });
            
            section.addEventListener('mouseleave', () => {
                gsap.to(section, {
                    scale: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
                
                section.style.boxShadow = 'none';
            });
        });
        
        // Add interactive effects to feature items
        const featureItems = panel.querySelectorAll('.feature-item');
        featureItems.forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                // Create ripple effect
                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: absolute;
                    left: 0;
                    top: 50%;
                    width: 4px;
                    height: 4px;
                    background: rgba(255, 255, 0, 0.6);
                    border-radius: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                `;
                
                item.style.position = 'relative';
                item.appendChild(ripple);
                
                gsap.to(ripple, {
                    scale: 10,
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.out",
                    onComplete: () => ripple.remove()
                });
            });
        });
    }

    addDevelopmentUpdates(panel, gameData) {
        // Simulate development updates for Coming Soon games
        const updates = [
            'Core gameplay mechanics implemented',
            'Character design phase completed',
            'Level design in progress',
            'Sound effects being recorded',
            'Beta testing phase initiated',
            'UI/UX optimization ongoing',
            'Performance improvements added'
        ];
        
        const updatesSection = document.createElement('div');
        updatesSection.className = 'development-updates enhanced-section';
        updatesSection.innerHTML = `
            <h4><span class="section-icon">📝</span> Recent Updates:</h4>
            <div class="updates-list">
                ${updates.slice(0, 3).map((update, index) => 
                    `<div class="update-item" style="opacity: 0; transform: translateY(10px);">
                        <span class="update-date">${this.getRandomDate()}</span>
                        <span class="update-text">${update}</span>
                    </div>`
                ).join('')}
            </div>
        `;
        
        const existingUpdates = panel.querySelector('.development-updates');
        if (existingUpdates) {
            existingUpdates.remove();
        }
        
        const progressSection = panel.querySelector('.progress-section');
        if (progressSection) {
            progressSection.parentNode.insertBefore(updatesSection, progressSection.nextSibling);
        }
        
        // Animate updates
        const updateItems = updatesSection.querySelectorAll('.update-item');
        gsap.to(updateItems, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            delay: 1.5,
            ease: "power2.out"
        });
    }

    getRandomDate() {
        const dates = [
            '2 days ago',
            '1 week ago',
            '2 weeks ago',
            '3 weeks ago',
            '1 month ago'
        ];
        return dates[Math.floor(Math.random() * dates.length)];
    }

    ensurePanelContentBounds(panel) {
        // Check if content overflows and handle gracefully
        setTimeout(() => {
            const panelHeight = panel.offsetHeight;
            const contentHeight = panel.scrollHeight;
            
            if (contentHeight > panelHeight) {
                // Content overflows - ensure smooth scrolling is enabled
                panel.style.scrollBehavior = 'smooth';
                
                // Add scroll indicator if not already present
                if (!panel.querySelector('.scroll-indicator')) {
                    const scrollIndicator = document.createElement('div');
                    scrollIndicator.className = 'scroll-indicator';
                    scrollIndicator.style.cssText = `
                        position: absolute;
                        bottom: 10px;
                        right: 15px;
                        color: rgba(255, 255, 0, 0.6);
                        font-size: 0.7em;
                        pointer-events: none;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    `;
                    scrollIndicator.innerHTML = '⬇ Scroll for more';
                    panel.appendChild(scrollIndicator);
                    
                    // Show scroll indicator briefly
                    setTimeout(() => {
                        scrollIndicator.style.opacity = '1';
                        setTimeout(() => {
                            scrollIndicator.style.opacity = '0';
                        }, 2000);
                    }, 500);
                }
            }
        }, 100);
    }

    hideGameInfo() {
        const panel = document.getElementById('gameInfoPanel');
        panel.classList.remove('visible');
    }

    playGame(url) {
        // Handle real game URLs
        if (url.startsWith('http')) {
            window.open(url, '_blank');
        } else {
            // For placeholder URLs, show a coming soon message
            alert('This game is still in development. Stay tuned for updates!');
        }
    }

    setupEventListeners() {
        // Global function for play button
        window.playSelectedGame = () => {
            if (window.currentGameUrl) {
                this.playGame(window.currentGameUrl);
            }
        };

        // Global function for close button
        window.closeGamePanel = () => {
            console.log('Close game panel clicked');
            this.hideGameInfo();
            this.resetCamera(); // Reset to overview state
        };

        // Global function for controls toggle
        window.toggleControls = () => {
            const controlsHint = document.getElementById('controlsHint');
            const controlsToggle = document.getElementById('controlsToggle');
            
            if (controlsHint && controlsToggle) {
                const isVisible = controlsHint.classList.contains('visible');
                
                if (isVisible) {
                    controlsHint.classList.remove('visible');
                    controlsToggle.classList.remove('active');
                } else {
                    controlsHint.classList.add('visible');
                    controlsToggle.classList.add('active');
                }
            }
        };
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // FPS tracking with performance monitoring
        this.fpsFrameCount++;
        const currentTime = performance.now();
        if (currentTime - this.fpsLastTime >= 1000) {
            this.currentFPS = Math.round(this.fpsFrameCount * 1000 / (currentTime - this.fpsLastTime));
            this.fpsFrameCount = 0;
            this.fpsLastTime = currentTime;
            
            // Add to performance history for auto-adjustment
            this.performanceHistory.push(this.currentFPS);
            
            // Update FPS display
            const fpsCounter = document.getElementById('fpsCounter');
            if (fpsCounter) {
                fpsCounter.textContent = `FPS: ${this.currentFPS}`;
                // Color coding based on FPS
                if (this.currentFPS >= 50) {
                    fpsCounter.style.color = '#00ff00'; // Green for good FPS
                } else if (this.currentFPS >= 30) {
                    fpsCounter.style.color = '#ffff00'; // Yellow for okay FPS
                } else {
                    fpsCounter.style.color = '#ff4444'; // Red for poor FPS
                    // Automatically reduce quality if FPS is too low
                    if (this.performanceMode === 'high' && this.currentFPS < 25) {
                        this.performanceMode = 'low';
                        console.log('🔧 Auto-switching to performance mode due to low FPS');
                    }
                }
            }
        }
        
        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        
        // Skip frame if deltaTime is too high (tab was inactive) to prevent jarring animations
        if (deltaTime > 0.1) return;
        
        // Optimize by limiting updates based on performance mode
        const updateFrequency = this.performanceMode === 'high' ? 1 : 2;
        if (this.frameCount % updateFrequency !== 0) {
            this.frameCount++;
            return;
        }
        
        // Update controls with null check
        if (this.controls) {
            this.controls.update();
        }
        
        // Update fly controls with null check
        if (this.flyMode) {
            this.updateFlyControls();
        }
        
        // Update camera shake with null check
        if (this.cameraShake && this.cameraShake.intensity > 0) {
            this.updateCameraShake();
        }
        
        // Animate central brain with performance optimization
        if (this.centralBrain && this.frameCount % 2 === 0) {
            const time = elapsedTime * 0.5;
            
            // Gentle rotation
            this.centralBrain.rotation.y = Math.sin(time * 0.3) * 0.1;
            this.centralBrain.rotation.x = Math.sin(time * 0.2) * 0.05;
            
            // Animate brain components with reduced frequency
            let componentCount = 0;
            this.centralBrain.traverse((child) => {
                if (child.userData.animationOffset !== undefined && componentCount < 20) {
                    componentCount++;
                    const phase = time + child.userData.animationOffset;
                    
                    if (child.userData.isNode) {
                        // Pulse brain nodes
                        const pulse = 1 + Math.sin(phase * 3) * 0.3;
                        child.scale.setScalar(pulse);
                        
                        // Vary node opacity
                        child.material.opacity = 0.7 + Math.sin(phase * 2) * 0.3;
                    } else if (child.userData.isPathway) {
                        // Animate neural pathways
                        const intensity = 0.2 + Math.sin(phase * 2) * 0.2;
                        child.material.opacity = intensity;
                    } else if (child.userData.isFold) {
                        // Subtle brain fold animation
                        const intensity = 0.3 + Math.sin(phase * 1.5) * 0.2;
                        child.material.opacity = intensity;
                    } else if (child.material && child.material.type === 'LineBasicMaterial') {
                        // Main brain outline animation
                        const intensity = 0.6 + Math.sin(phase * 1.2) * 0.3;
                        child.material.opacity = intensity;
                        
                        // Color shifting for neural effect
                        if (child.userData.originalColor === 0x00ffff) {
                            const hue = 0.5 + Math.sin(phase * 0.8) * 0.1;
                            child.material.color.setHSL(hue, 1, 0.7);
                        } else if (child.userData.originalColor === 0xffff00) {
                            const hue = 0.16 + Math.sin(phase * 0.6) * 0.05;
                            child.material.color.setHSL(hue, 1, 0.8);
                        }
                    }
                }
            });
        }

        // Animate electrical connections with reduced frequency
        if (this.frameCount % 3 === 0 && this.electricalConnections && this.electricalConnections.length > 0) {
            this.electricalConnections.forEach((connection, index) => {
                const pulse = Math.sin(elapsedTime * 4 + connection.userData.pulseOffset) * 0.4 + 0.8;
                connection.material.opacity = connection.userData.originalOpacity * pulse;
            });
        }
        
        // Animate neural pulses with performance optimization
        if (this.neuralPulses && this.neuralPulses.length > 0) {
            this.neuralPulses.forEach((pulse) => {
                pulse.userData.progress += pulse.userData.speed;
                
                if (pulse.userData.progress > 1) {
                    pulse.userData.progress = 0;
                    
                    // Trigger arrival effect at game cube
                    const targetBrain = this.gameBrains[pulse.userData.connectionIndex];
                    if (targetBrain) {
                        this.createArrivalEffect(targetBrain.position);
                    }
                }
                
                // Update pulse position along curve
                const position = pulse.userData.curve.getPointAt(pulse.userData.progress);
                pulse.position.copy(position);
                
                // Update trail positions with reduced frequency
                if (pulse.userData.trailPositions && this.frameCount % 2 === 0) {
                    pulse.userData.trailPositions.forEach((trailParticle, index) => {
                        const trailProgress = Math.max(0, pulse.userData.progress - (index + 1) * 0.05);
                        if (trailProgress > 0) {
                            const trailPos = pulse.userData.curve.getPointAt(trailProgress);
                            trailParticle.position.copy(trailPos);
                            trailParticle.visible = true;
                        } else {
                            trailParticle.visible = false;
                        }
                    });
                }
            });
        }
        
        // Animate game brains with performance optimization
        if (this.gameBrains && this.gameBrains.length > 0) {
            this.gameBrains.forEach((brainGroup, index) => {
                // Floating animation with reduced frequency
                if (this.frameCount % 2 === 0) {
                    const floatY = Math.sin(elapsedTime * 0.5 + brainGroup.userData.floatOffset) * 0.5;
                    brainGroup.position.y = brainGroup.userData.originalPosition.y + floatY;
                }
                
                // Gentle brain rotation
                const rotSpeed = this.magicMode ? 0.015 : 0.003;
                brainGroup.rotation.y += rotSpeed;
                
                // Slightly tilt the brain for natural movement (reduced frequency)
                if (this.frameCount % 3 === 0) {
                    brainGroup.rotation.x = Math.sin(elapsedTime * 0.3 + index) * 0.1;
                    brainGroup.rotation.z = Math.cos(elapsedTime * 0.4 + index) * 0.05;
                }
                
                // Animate particles around brain
                if (brainGroup.userData.particles) {
                    brainGroup.userData.particles.rotation.y += 0.02;
                }
                
                // Magic mode pulsing for brain - but don't override hover colors
                if (this.magicMode && brainGroup.userData.mainBrain && this.hoveredCube !== brainGroup && this.frameCount % 2 === 0) {
                    const pulse = Math.sin(elapsedTime * 3 + index) * 0.3 + 0.5;
                    brainGroup.userData.mainBrain.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.emissiveIntensity = pulse;
                        }
                    });
                }
                
                // Animate brain folds (children meshes) with reduced frequency
                if (this.frameCount % 4 === 0) {
                    brainGroup.children.forEach((child, childIndex) => {
                        if (child.geometry && child.geometry.type === 'TorusGeometry') {
                            child.rotation.x += 0.001 * (childIndex % 2 === 0 ? 1 : -1);
                            child.rotation.y += 0.002 * (childIndex % 3 === 0 ? 1 : -1);
                        }
                    });
                }
            });
        }
        
        // Animate background particles with reduced frequency
        if (this.backgroundParticles && this.frameCount % 5 === 0) {
            this.backgroundParticles.rotation.y += 0.0005;
            this.backgroundParticles.rotation.x += 0.0002;
        }
        
        // Animate interactive elements with performance optimization
        if (this.interactiveElements && this.interactiveElements.length > 0 && this.frameCount % 2 === 0) {
            this.interactiveElements.forEach((element, index) => {
                if (element.userData.rotationSpeed) {
                    element.rotation.x += element.userData.rotationSpeed.x;
                    element.rotation.y += element.userData.rotationSpeed.y;
                    element.rotation.z += element.userData.rotationSpeed.z;
                }
                
                // Pulsing opacity for wireframe elements
                if (element.userData.pulseSpeed) {
                    const pulse = Math.sin(elapsedTime * element.userData.pulseSpeed) * 0.1 + 0.15;
                    element.material.opacity = element.userData.originalOpacity + pulse;
                }
                
                // Ring rotation
                if (element.userData.rotationSpeed && element.geometry.type === 'RingGeometry') {
                    element.rotation.z += element.userData.rotationSpeed;
                    const pulse = Math.sin(elapsedTime * 2 + element.userData.pulsePhase) * 0.05 + 0.1;
                    element.material.opacity = element.userData.originalOpacity + pulse;
                }
                
                // Orb orbiting
                if (element.userData.orbitRadius) {
                    element.userData.orbitAngle += element.userData.orbitSpeed;
                    const x = Math.cos(element.userData.orbitAngle) * element.userData.orbitRadius;
                    const z = Math.sin(element.userData.orbitAngle) * element.userData.orbitRadius;
                    const y = Math.sin(elapsedTime * element.userData.floatSpeed + element.userData.floatPhase) * 5;
                    element.position.set(x, y, z);
                }
            });
        }
        
        // Update Matrix Rain effect (Easter Egg) with reduced frequency
        if (this.easterEggActive && this.frameCount % 2 === 0) {
            this.updateMatrixRain();
        }
        
        // Update controls and render with null checks
        if (this.controls) {
            this.controls.update();
        }
        if (this.composer && this.scene && this.camera) {
            this.composer.render();
        }
        
        this.frameCount++;
    }

    createArrivalEffect(position) {
        // Create small explosion when neural pulse reaches game cube
        for (let i = 0; i < 8; i++) {
            const geometry = new THREE.SphereGeometry(0.05, 6, 6);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 1,
                emissive: 0xffff00,
                emissiveIntensity: 2
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            particle.position.add(new THREE.Vector3(
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 1
            ));
            
            this.scene.add(particle);
            
            gsap.to(particle.position, {
                duration: 0.5,
                x: particle.position.x + (Math.random() - 0.5) * 3,
                y: particle.position.y + (Math.random() - 0.5) * 3,
                z: particle.position.z + (Math.random() - 0.5) * 3,
                ease: "power2.out"
            });
            
            gsap.to(particle.material, {
                duration: 0.5,
                opacity: 0,
                onComplete: () => {
                    this.scene.remove(particle);
                }
            });
        }
    }

    triggerMagicEffect() {
        if (this.audioEnabled) {
            this.sounds.magic();
        }
        
        this.magicMode = !this.magicMode;
        this.cameraShake.intensity = 1.0;
        
        // Brain activation effect
        if (this.centralBrain) {
            const brain = this.centralBrain.userData.brain;
            const core = this.centralBrain.userData.core;
            
            if (this.magicMode) {
                gsap.to(brain.material, {
                    duration: 1,
                    emissiveIntensity: 0.8
                });
                gsap.to(core.material, {
                    duration: 1,
                    emissiveIntensity: 3
                });
            } else {
                gsap.to(brain.material, {
                    duration: 1,
                    emissiveIntensity: 0.3
                });
                gsap.to(core.material, {
                    duration: 1,
                    emissiveIntensity: 1
                });
            }
        }
        
        // Electrical surge through connections
        this.electricalConnections.forEach((connection, index) => {
            gsap.to(connection.material, {
                duration: 0.5,
                opacity: this.magicMode ? 1.5 : 0.8,
                yoyo: true,
                repeat: 3,
                delay: index * 0.1
            });
        });
        
        // Magic particle explosion from brain
        const brainCenter = new THREE.Vector3(0, 0, 0);
        
        for (let i = 0; i < 30; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0xffff00 : 0xffffff,
                transparent: true,
                opacity: 1
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(brainCenter);
            this.scene.add(particle);
            
            const direction = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize();
            
            gsap.to(particle.position, {
                duration: 2,
                x: particle.position.x + direction.x * 15,
                y: particle.position.y + direction.y * 15,
                z: particle.position.z + direction.z * 15,
                ease: "power2.out"
            });
            
            gsap.to(particle.material, {
                duration: 2,
                opacity: 0,
                onComplete: () => {
                    this.scene.remove(particle);
                }
            });
        }
        
        // Make all brains respond to brain activity
        this.gameBrains.forEach((brain, index) => {
            gsap.to(brain.rotation, {
                duration: 1,
                x: brain.rotation.x + Math.PI * 2,
                y: brain.rotation.y + Math.PI * 2,
                ease: "power2.inOut",
                delay: index * 0.1
            });
        });
    }

    resetCamera() {
        if (this.audioEnabled) {
            this.sounds.whoosh();
        }
        
        // Clear hover state when resetting camera
        if (this.hoveredCube) {
            this.clearBrainHover(this.hoveredCube);
            this.hoveredCube = null;
        }
        
        // Hide game info panel
        this.hideGameInfo();
        
        // Clear selected game state
        this.selectedGame = null;
        
        // Focus on the brain when resetting - better overview
        gsap.to(this.camera.position, {
            duration: 1.5,
            x: 0, y: 0, z: 30,
            ease: "power2.inOut",
            onComplete: () => {
                // Ensure controls are properly updated after animation
                this.controls.update();
                this.isHovering = true; // Re-enable hover detection immediately
                
                // Force a hover update after camera reset to detect current mouse position
                setTimeout(() => {
                    console.log('🔄 Forcing hover update after camera reset');
                    this.updateHover();
                }, 150); // Small delay to ensure camera animation is complete
            }
        });
        
        gsap.to(this.controls.target, {
            duration: 1.5,
            x: 0, y: 0, z: 0,
            ease: "power2.inOut",
            onUpdate: () => this.controls.update()
        });
    }

    triggerEasterEgg() {
        this.easterEggActive = !this.easterEggActive;
        
        if (this.easterEggActive) {
            console.log('🎉 Matrix Mode Activated! Enter the Neural Network...');
            
            // Create digital rain effect
            this.createMatrixRain();
            
            // Transform brain materials to green digital glow
            this.gameBrains.forEach((brain, index) => {
                if (brain.userData.mainBrain) {
                    // Green matrix glow
                    gsap.to(brain.userData.mainBrain.material.color, {
                        duration: 1.5,
                        r: 0, g: 1, b: 0.3,
                        ease: "power2.inOut"
                    });
                    
                    // Add pulsing emissive effect
                    gsap.to(brain.userData.mainBrain.material, {
                        duration: 1.5,
                        emissiveIntensity: 0.4,
                        ease: "power2.inOut"
                    });
                    
                    brain.userData.mainBrain.material.emissive.setHex(0x004400);
                }
            });
            
            // Transform particle systems to matrix style
            if (this.neuralParticleSystem) {
                this.neuralParticleSystem.material.color.setHex(0x00ff44);
                this.neuralParticleSystem.material.size = 8;
            }
            
            // Dark green fog for matrix atmosphere
            gsap.to(this.scene.fog.color, {
                duration: 2,
                r: 0, g: 0.05, b: 0.02,
                ease: "power2.inOut"
            });
            
            // Animate camera with subtle matrix-style movement
            this.startMatrixCameraEffect();
            
        } else {
            console.log('🔄 Exiting Matrix Mode... Reality restored.');
            
            // Clean up matrix rain
            this.cleanupMatrixRain();
            
            // Return brains to normal colors
            this.gameBrains.forEach((brain) => {
                const originalColor = brain.userData.color;
                if (brain.userData.mainBrain) {
                    gsap.to(brain.userData.mainBrain.material.color, {
                        duration: 2,
                        r: (originalColor >> 16 & 255) / 255,
                        g: (originalColor >> 8 & 255) / 255,
                        b: (originalColor & 255) / 255,
                        ease: "power2.inOut"
                    });
                    
                    // Remove emissive effect
                    gsap.to(brain.userData.mainBrain.material, {
                        duration: 2,
                        emissiveIntensity: 0,
                        ease: "power2.inOut"
                    });
                    
                    brain.userData.mainBrain.material.emissive.setHex(0x000000);
                }
            });
            
            // Restore particle systems
            if (this.neuralParticleSystem) {
                this.neuralParticleSystem.material.color.setHex(0xffff00);
                this.neuralParticleSystem.material.size = 4;
            }
            
            // Restore normal fog
            gsap.to(this.scene.fog.color, {
                duration: 2,
                r: 0, g: 0, b: 0,
                ease: "power2.inOut"
            });
            
            // Stop matrix camera effect
            this.stopMatrixCameraEffect();
        }
    }

    // Matrix Rain Effect Methods
    createMatrixRain() {
        if (!this.matrixRainActive) {
            this.matrixRainActive = true;
            this.matrixDrops = [];
            
            // Create digital rain columns
            const columnCount = 50;
            for (let i = 0; i < columnCount; i++) {
                const x = (Math.random() - 0.5) * 200;
                const z = (Math.random() - 0.5) * 200;
                
                // Create column of digital characters
                const columnHeight = 15 + Math.random() * 10;
                for (let j = 0; j < columnHeight; j++) {
                    const geometry = new THREE.PlaneGeometry(1, 1);
                    
                    // Create texture with digital characters
                    const canvas = document.createElement('canvas');
                    canvas.width = canvas.height = 32;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#00ff44';
                    ctx.font = '24px Courier New';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // Random digital characters (Matrix style)
                    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    const char = chars.charAt(Math.floor(Math.random() * chars.length));
                    ctx.fillText(char, 16, 16);
                    
                    const texture = new THREE.CanvasTexture(canvas);
                    const material = new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        opacity: Math.max(0.1, 1 - j * 0.08),
                        side: THREE.DoubleSide
                    });
                    
                    const drop = new THREE.Mesh(geometry, material);
                    drop.position.set(x, 50 - j * 4, z);
                    drop.lookAt(this.camera.position);
                    
                    drop.userData = {
                        speed: 0.3 + Math.random() * 0.4,
                        originalY: drop.position.y,
                        resetY: 50,
                        char: char,
                        column: i,
                        index: j
                    };
                    
                    this.scene.add(drop);
                    this.matrixDrops.push(drop);
                }
            }
            
            console.log(`🌧️ Matrix Rain Started: ${this.matrixDrops.length} digital drops`);
        }
    }
    
    cleanupMatrixRain() {
        if (this.matrixRainActive) {
            this.matrixRainActive = false;
            
            if (this.matrixDrops) {
                this.matrixDrops.forEach(drop => {
                    this.scene.remove(drop);
                    if (drop.material.map) drop.material.map.dispose();
                    drop.material.dispose();
                    drop.geometry.dispose();
                });
                this.matrixDrops = [];
            }
            
            console.log('🧹 Matrix Rain Cleaned Up');
        }
    }
    
    updateMatrixRain() {
        if (this.matrixRainActive && this.matrixDrops) {
            this.matrixDrops.forEach(drop => {
                // Move drop downward
                drop.position.y -= drop.userData.speed;
                
                // Reset when it goes too low
                if (drop.position.y < -60) {
                    drop.position.y = drop.userData.resetY + Math.random() * 20;
                    
                    // Change character occasionally
                    if (Math.random() < 0.1) {
                        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                        const newChar = chars.charAt(Math.floor(Math.random() * chars.length));
                        
                        const canvas = document.createElement('canvas');
                        canvas.width = canvas.height = 32;
                        const ctx = canvas.getContext('2d');
                        ctx.fillStyle = '#00ff44';
                        ctx.font = '24px Courier New';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(newChar, 16, 16);
                        
                        drop.material.map.dispose();
                        drop.material.map = new THREE.CanvasTexture(canvas);
                        drop.userData.char = newChar;
                    }
                }
                
                // Make drops face the camera
                drop.lookAt(this.camera.position);
            });
        }
    }
    
    startMatrixCameraEffect() {
        if (!this.matrixCameraInterval) {
            this.matrixCameraInterval = setInterval(() => {
                if (this.easterEggActive) {
                    // Subtle matrix-style camera glitch
                    const glitchX = (Math.random() - 0.5) * 0.1;
                    const glitchY = (Math.random() - 0.5) * 0.1;
                    
                    gsap.to(this.camera.position, {
                        duration: 0.1,
                        x: this.camera.position.x + glitchX,
                        y: this.camera.position.y + glitchY,
                        ease: "power2.out"
                    });
                    
                    // Quick return
                    gsap.to(this.camera.position, {
                        duration: 0.2,
                        x: this.camera.position.x - glitchX,
                        y: this.camera.position.y - glitchY,
                        delay: 0.1,
                        ease: "power2.out"
                    });
                }
            }, 2000 + Math.random() * 3000); // Random intervals
        }
    }
    
    stopMatrixCameraEffect() {
        if (this.matrixCameraInterval) {
            clearInterval(this.matrixCameraInterval);
            this.matrixCameraInterval = null;
        }
    }

    toggleFlyMode() {
        this.flyMode = !this.flyMode;
        this.controls.enablePan = this.flyMode;
        this.controls.enableRotate = !this.flyMode;
        
        const hint = document.createElement('div');
        hint.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: #ffff00;
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 1.2em;
            z-index: 1000;
            border: 1px solid rgba(255, 255, 0, 0.3);
        `;
        hint.textContent = `Fly Mode: ${this.flyMode ? 'ON' : 'OFF'}`;
        document.body.appendChild(hint);
        
        setTimeout(() => hint.remove(), 2000);
    }

    updateFlyControls() {
        if (!this.flyMode) return;
        
        const speed = 0.5;
        const direction = new THREE.Vector3();
        
        if (this.keys['KeyW']) direction.z -= speed;
        if (this.keys['KeyS']) direction.z += speed;
        if (this.keys['KeyA']) direction.x -= speed;
        if (this.keys['KeyD']) direction.x += speed;
        if (this.keys['KeyQ']) direction.y += speed;
        if (this.keys['KeyE']) direction.y -= speed;
        
        if (direction.length() > 0) {
            direction.applyQuaternion(this.camera.quaternion);
            this.camera.position.add(direction);
        }
    }

    updateCameraShake() {
        if (this.cameraShake.intensity > 0) {
            this.camera.position.x += (Math.random() - 0.5) * this.cameraShake.intensity;
            this.camera.position.y += (Math.random() - 0.5) * this.cameraShake.intensity;
            this.cameraShake.intensity *= this.cameraShake.decay;
            
            if (this.cameraShake.intensity < 0.01) {
                this.cameraShake.intensity = 0;
            }
        }
    }

    // Helper function to log model loading instructions
    logModelInstructions() {
        console.log(`
BRAIN MODEL SETUP INSTRUCTIONS:

1. Download a brain model from:
   - Sketchfab: https://sketchfab.com/3d-models?q=brain&features=downloadable
   - NIH 3D Print: https://3dprint.nih.gov/discover/3dpx-000539
   - Free3D: https://free3d.com/3d-models/brain

2. Save the model file as:
   - /public/models/brain.gltf (preferred)
   - /public/models/brain.glb
   - /public/models/brain.obj

3. Refresh the page to see your realistic brain model!

Currently using: Procedural brain (fallback)
For better visuals, add a real 3D brain model to /public/models/
        `);
    }

    // Enhanced cleanup and disposal method
    dispose() {
        console.log('🧹 Starting comprehensive cleanup...');
        
        // Cancel animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clear all intervals
        if (this.matrixCameraInterval) {
            clearInterval(this.matrixCameraInterval);
            this.matrixCameraInterval = null;
        }
        
        // Dispose loading brain
        if (this.loadingBrain) {
            this.loadingBrain.dispose();
        }
        
        // Clean up matrix rain
        this.cleanupMatrixRain();
        
        // Dispose of all scene objects
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => {
                            this.disposeMaterial(material);
                        });
                    } else {
                        this.disposeMaterial(object.material);
                    }
                }
            });
            this.scene.clear();
        }
        
        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
        
        // Dispose composer
        if (this.composer) {
            this.composer.dispose();
        }
        
        // Close GUI
        if (this.gui) {
            this.gui.destroy();
        }
        
        // Close audio context
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        
        // Clear arrays and references
        this.gameBrains = [];
        this.interactiveElements = [];
        this.electricalConnections = [];
        this.neuralPulses = [];
        this.matrixDrops = [];
        this.performanceHistory = [];
        
        console.log('✅ Cleanup completed successfully');
    }

    disposeMaterial(material) {
        // Dispose all textures
        if (material.map) material.map.dispose();
        if (material.normalMap) material.normalMap.dispose();
        if (material.specularMap) material.specularMap.dispose();
        if (material.envMap) material.envMap.dispose();
        if (material.lightMap) material.lightMap.dispose();
        if (material.bumpMap) material.bumpMap.dispose();
        if (material.displacementMap) material.displacementMap.dispose();
        if (material.roughnessMap) material.roughnessMap.dispose();
        if (material.metalnessMap) material.metalnessMap.dispose();
        if (material.alphaMap) material.alphaMap.dispose();
        if (material.aoMap) material.aoMap.dispose();
        if (material.emissiveMap) material.emissiveMap.dispose();
        
        // Dispose the material itself
        material.dispose();
    }
}

// Initialize the game portfolio
const gamePortfolio = new GamePortfolio3D();

// Enhanced cleanup on page unload
window.addEventListener('beforeunload', () => {
    gamePortfolio.dispose();
});

// Cleanup on page visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause heavy operations when tab is not visible
        if (gamePortfolio.performanceMode === 'high') {
            gamePortfolio.performanceMode = 'low';
            console.log('🔧 Tab hidden - switching to low performance mode');
        }
    } else {
        // Resume when tab becomes visible again
        setTimeout(() => {
            if (gamePortfolio.performanceMode === 'low') {
                gamePortfolio.performanceMode = 'high';
                console.log('✨ Tab visible - resuming high performance mode');
            }
        }, 1000);
    }
});

// Error handling for uncaught errors
window.addEventListener('error', (event) => {
    console.error('🚨 Uncaught error in brain portfolio:', event.error);
    
    // Attempt graceful degradation
    if (gamePortfolio && gamePortfolio.performanceMode === 'high') {
        gamePortfolio.performanceMode = 'low';
        console.log('🔧 Error detected - switching to low performance mode for stability');
    }
});

console.log('🧠 Brain Portfolio 3D - Enhanced with performance optimizations and robustness improvements!');
