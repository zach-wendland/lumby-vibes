/**
 * GameEngine - Core Three.js rendering engine with 64-bit HDR color support
 * Supports 16-bit per channel (64-bit RGBA) for enhanced visual fidelity
 * TypeScript version with full type safety
 */
import * as THREE from 'three';
import { PostProcessingManager } from './PostProcessingManager';

/**
 * Entity interface for game objects
 */
interface Entity {
    mesh?: THREE.Object3D | null;
    update?(delta: number): void;
}

/**
 * Update callback type
 */
type UpdateCallback = (delta: number) => void;

/**
 * Render callback type
 */
type RenderCallback = () => void;

/**
 * Click event detail interface
 */
interface GameClickDetail {
    object: THREE.Object3D;
    point: THREE.Vector3;
    button: 'left' | 'right';
    mouseX?: number;
    mouseY?: number;
}

/**
 * GameEngine class - Core Three.js rendering engine
 */
export class GameEngine {
    public scene!: THREE.Scene;
    public camera!: THREE.PerspectiveCamera;
    public renderer!: THREE.WebGLRenderer;
    public clock: THREE.Clock;
    public delta: number;
    public raycaster: THREE.Raycaster;
    public mouse: THREE.Vector2;
    public canvas: HTMLCanvasElement | null;

    private entities: Entity[];
    private updateCallbacks: UpdateCallback[];
    private renderCallbacks: RenderCallback[];

    private handleResize: () => void;
    private handleMouseMove: (event: MouseEvent) => void;
    private handleClick: (event: MouseEvent) => void;
    private handleContextMenu: (event: MouseEvent) => void;

    public isRunning: boolean;
    private loadingProgress: number;

    // 64-bit HDR rendering support
    private supportsHDR: boolean;
    private renderTarget: THREE.WebGLRenderTarget | null;
    private postProcessing: PostProcessingManager | null;

    constructor() {
        this.clock = new THREE.Clock();
        this.delta = 0;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
        this.scene = null as unknown as THREE.Scene;
        this.camera = null as unknown as THREE.PerspectiveCamera;
        this.renderer = null as unknown as THREE.WebGLRenderer;

        this.entities = [];
        this.updateCallbacks = [];
        this.renderCallbacks = [];

        this.isRunning = false;
        this.loadingProgress = 0;

        // 64-bit HDR rendering support
        this.supportsHDR = false;
        this.renderTarget = null;
        this.postProcessing = null;

        this.handleResize = () => this.onWindowResize();
        this.handleMouseMove = (event: MouseEvent) => this.onMouseMove(event);
        this.handleClick = (event: MouseEvent) => this.onClick(event);
        this.handleContextMenu = (event: MouseEvent) => this.onRightClick(event);
    }

    /**
     * Initialize the Three.js scene with enhanced 64-bit HDR rendering
     */
    async init(): Promise<void> {
        if (!this.canvas) {
            throw new Error('Game canvas element with id "game-canvas" not found');
        }

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
        window.addEventListener('resize', this.handleResize, false);

        // Mouse events for raycasting
        this.canvas.addEventListener('mousemove', this.handleMouseMove, false);
        this.canvas.addEventListener('click', this.handleClick, false);
        this.canvas.addEventListener('contextmenu', this.handleContextMenu, false);

        this.updateLoadingProgress(30);
    }

    /**
     * Setup HDR render target for 64-bit rendering
     */
    setupHDRRenderTarget(): void {
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
    setupLighting(): void {
        if (!this.scene) return;

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
    updateLoadingProgress(progress: number): void {
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
    hideLoadingScreen(): void {
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
    addEntity(entity: Entity): void {
        if (entity.mesh && this.scene) {
            this.scene.add(entity.mesh);
        }
        this.entities.push(entity);
    }

    /**
     * Remove entity from the scene
     */
    removeEntity(entity: Entity): void {
        if (entity.mesh && this.scene) {
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
    onUpdate(callback: UpdateCallback): void {
        this.updateCallbacks.push(callback);
    }

    /**
     * Register render callback
     */
    onRender(callback: RenderCallback): void {
        this.renderCallbacks.push(callback);
    }

    /**
     * Handle window resize
     */
    onWindowResize(): void {
        if (!this.camera || !this.renderer) return;

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
    onMouseMove(event: MouseEvent): void {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    /**
     * Handle click events
     */
    onClick(event: MouseEvent): void {
        if (!this.camera || !this.scene) return;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;

            // Emit click event to game logic
            window.dispatchEvent(new CustomEvent<GameClickDetail>('gameClick', {
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
    onRightClick(event: MouseEvent): boolean {
        event.preventDefault();

        if (!this.camera || !this.scene) return false;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;

            // Emit right-click event
            window.dispatchEvent(new CustomEvent<GameClickDetail>('gameClick', {
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
    update(): void {
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
    render(): void {
        // Call render callbacks
        for (const callback of this.renderCallbacks) {
            callback();
        }

        // Render with post-processing pipeline if available
        if (this.postProcessing) {
            this.postProcessing.render();
        } else if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Main game loop
     */
    gameLoop(): void {
        if (!this.isRunning) return;

        requestAnimationFrame(() => this.gameLoop());

        this.update();
        this.render();
    }

    /**
     * Start the game loop
     */
    start(): void {
        this.isRunning = true;
        this.gameLoop();
    }

    /**
     * Stop the game loop
     */
    stop(): void {
        this.isRunning = false;
    }

    /**
     * Dispose of resources and event listeners
     */
    dispose(): void {
        this.stop();

        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this.handleResize, false);
        }

        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.handleMouseMove, false);
            this.canvas.removeEventListener('click', this.handleClick, false);
            this.canvas.removeEventListener('contextmenu', this.handleContextMenu, false);
        }

        if (this.postProcessing) {
            this.postProcessing.dispose();
            this.postProcessing = null;
        }

        if (this.renderTarget) {
            this.renderTarget.dispose();
            this.renderTarget = null;
        }

        if (this.renderer) {
            if (typeof (this.renderer as { forceContextLoss?: () => void }).forceContextLoss === 'function') {
                (this.renderer as { forceContextLoss: () => void }).forceContextLoss();
            }
            this.renderer.dispose();
        }

        if (this.scene && typeof (this.scene as { clear?: () => void }).clear === 'function') {
            this.scene.clear();
        }

        this.entities = [];
        this.updateCallbacks = [];
        this.renderCallbacks = [];
        this.isRunning = false;
    }

    /**
     * Get intersected objects at mouse position
     */
    getIntersectedObjects(): THREE.Intersection[] {
        if (!this.camera || !this.scene) return [];

        this.raycaster.setFromCamera(this.mouse, this.camera);
        return this.raycaster.intersectObjects(this.scene.children, true);
    }
}
