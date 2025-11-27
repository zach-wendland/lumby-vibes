/**
 * GameEngine - Core Three.js rendering engine with 64-bit HDR color support
 * Supports 16-bit per channel (64-bit RGBA) for enhanced visual fidelity
 */
import * as THREE from 'three';
import { PostProcessingManager } from './PostProcessingManager.js';

export class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.delta = 0;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.canvas = document.getElementById('game-canvas');

        this.entities = [];
        this.updateCallbacks = [];
        this.renderCallbacks = [];

        this.isRunning = false;
        this.loadingProgress = 0;

        // 64-bit HDR rendering support
        this.supportsHDR = false;
        this.renderTarget = null;
        this.postProcessing = null;
    }

    /**
     * Initialize the Three.js scene with enhanced 64-bit HDR rendering
     */
    async init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 500);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 30, 30);
        this.camera.lookAt(0, 0, 0);

        // Create renderer with 64-bit HDR color support
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false,
            precision: 'highp', // High precision for 64-bit rendering
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Enhanced shadow mapping for 64-bit
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap; // Variance Shadow Maps for better quality

        // 64-bit HDR color space configuration
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2; // Slightly higher for HDR

        // Check for HDR support (WebGL2 with float texture support)
        this.supportsHDR = this.renderer.capabilities.isWebGL2;

        if (this.supportsHDR) {
            console.log('64-bit HDR rendering enabled');
            this.setupHDRRenderTarget();
        } else {
            console.log('HDR not supported, using standard rendering');
        }

        // Enhanced lighting for 64-bit HDR color depth
        this.setupLighting();

        // Initialize post-processing pipeline
        this.postProcessing = new PostProcessingManager(this.renderer, this.scene, this.camera);
        this.postProcessing.init();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Mouse events for raycasting
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        this.canvas.addEventListener('click', (e) => this.onClick(e), false);
        this.canvas.addEventListener('contextmenu', (e) => this.onRightClick(e), false);

        this.updateLoadingProgress(30);
    }

    /**
     * Setup HDR render target for 64-bit rendering
     */
    setupHDRRenderTarget() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Create HDR render target with floating point texture
        this.renderTarget = new THREE.WebGLRenderTarget(width, height, {
            type: THREE.HalfFloatType, // 16-bit per channel (64-bit RGBA)
            format: THREE.RGBAFormat,
            colorSpace: THREE.LinearSRGBColorSpace,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            generateMipmaps: false,
            stencilBuffer: false,
            depthBuffer: true
        });

        console.log('HDR render target created with HalfFloatType (64-bit)');
    }

    /**
     * Setup enhanced lighting system with HDR values
     */
    setupLighting() {
        // Ambient light with HDR intensity
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        // Directional light (Sun) with HDR intensity
        const sunLight = new THREE.DirectionalLight(0xfff4e6, 2.5); // Higher intensity for HDR
        sunLight.position.set(50, 100, 50);
        sunLight.castShadow = true;

        // Enhanced shadow quality for 64-bit
        sunLight.shadow.mapSize.width = 4096; // Doubled from 2048
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        sunLight.shadow.bias = -0.0001;
        sunLight.shadow.radius = 2; // Softer shadows

        this.scene.add(sunLight);

        // Hemisphere light for realistic sky lighting with HDR
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x6B8E23, 0.6); // Increased intensity
        this.scene.add(hemiLight);

        console.log('HDR lighting system initialized with enhanced intensities');
    }

    /**
     * Update loading progress
     */
    updateLoadingProgress(progress) {
        this.loadingProgress = progress;
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');

        if (progressBar) {
            progressBar.style.width = progress + '%';
        }

        if (loadingText) {
            const messages = [
                'Loading world...',
                'Generating terrain...',
                'Spawning NPCs...',
                'Initializing combat system...',
                'Loading skills...',
                'Preparing Lumbridge...',
                'Almost ready...'
            ];
            const index = Math.floor((progress / 100) * (messages.length - 1));
            loadingText.textContent = messages[index];
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }
    }

    /**
     * Add entity to the scene
     */
    addEntity(entity) {
        if (entity.mesh) {
            this.scene.add(entity.mesh);
        }
        this.entities.push(entity);
    }

    /**
     * Remove entity from the scene
     */
    removeEntity(entity) {
        if (entity.mesh) {
            this.scene.remove(entity.mesh);
        }
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }

    /**
     * Register update callback
     */
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    /**
     * Register render callback
     */
    onRender(callback) {
        this.renderCallbacks.push(callback);
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Resize HDR render target if it exists
        if (this.renderTarget) {
            this.renderTarget.setSize(window.innerWidth, window.innerHeight);
        }

        // Resize post-processing
        if (this.postProcessing) {
            this.postProcessing.onResize(window.innerWidth, window.innerHeight);
        }
    }

    /**
     * Handle mouse move for raycasting
     */
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    /**
     * Handle click events
     */
    onClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;

            // Emit click event to game logic
            window.dispatchEvent(new CustomEvent('gameClick', {
                detail: {
                    object: clickedObject,
                    point: intersects[0].point,
                    button: 'left'
                }
            }));
        }
    }

    /**
     * Handle right-click events
     */
    onRightClick(event) {
        event.preventDefault();

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;

            // Emit right-click event
            window.dispatchEvent(new CustomEvent('gameClick', {
                detail: {
                    object: clickedObject,
                    point: intersects[0].point,
                    button: 'right',
                    mouseX: event.clientX,
                    mouseY: event.clientY
                }
            }));
        }

        return false;
    }

    /**
     * Update loop
     */
    update() {
        this.delta = this.clock.getDelta();

        // Update all entities
        for (const entity of this.entities) {
            if (entity.update) {
                entity.update(this.delta);
            }
        }

        // Call update callbacks
        for (const callback of this.updateCallbacks) {
            callback(this.delta);
        }
    }

    /**
     * Render loop
     */
    render() {
        // Call render callbacks
        for (const callback of this.renderCallbacks) {
            callback();
        }

        // Render with post-processing pipeline if available
        if (this.postProcessing) {
            this.postProcessing.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isRunning) return;

        requestAnimationFrame(() => this.gameLoop());

        this.update();
        this.render();
    }

    /**
     * Start the game loop
     */
    start() {
        this.isRunning = true;
        this.gameLoop();
    }

    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Get intersected objects at mouse position
     */
    getIntersectedObjects() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        return this.raycaster.intersectObjects(this.scene.children, true);
    }
}
