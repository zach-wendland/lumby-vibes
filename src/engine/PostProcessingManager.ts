/**
 * PostProcessingManager - Manages post-processing effects for 64-bit HDR rendering
 * Includes HDR bloom, SSAO, color grading, and other advanced effects
 * TypeScript version with full type safety
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/**
 * Post-processing passes interface
 */
interface PostProcessingPasses {
    render?: RenderPass;
    ssao?: SSAOPass;
    bloom?: UnrealBloomPass;
    fxaa?: ShaderPass;
    output?: OutputPass;
}

/**
 * PostProcessingManager class - Manages post-processing effects
 */
export class PostProcessingManager {
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private composer: EffectComposer | null;
    private passes: PostProcessingPasses;
    private enabled: boolean;

    constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.composer = null;
        this.passes = {};
        this.enabled = true;
    }

    /**
     * Initialize the post-processing pipeline
     */
    init(): void {
        // Create composer with HDR render target
        const renderTarget = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                type: THREE.HalfFloatType, // 64-bit HDR
                format: THREE.RGBAFormat,
                colorSpace: THREE.LinearSRGBColorSpace,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                generateMipmaps: false
            }
        );

        this.composer = new EffectComposer(this.renderer, renderTarget);
        this.composer.setSize(window.innerWidth, window.innerHeight);

        // Add render pass (base scene rendering)
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        this.passes.render = renderPass;

        // Add SSAO (Screen Space Ambient Occlusion) for better depth perception
        if (this.renderer.capabilities.isWebGL2) {
            const ssaoPass = new SSAOPass(
                this.scene,
                this.camera,
                window.innerWidth,
                window.innerHeight
            );
            ssaoPass.kernelRadius = 8;
            ssaoPass.minDistance = 0.005;
            ssaoPass.maxDistance = 0.1;
            // Set output mode if available (may not exist in all Three.js versions)
            if ((SSAOPass as unknown as { OUTPUT?: { Default: number } }).OUTPUT) {
                ssaoPass.output = (SSAOPass as unknown as { OUTPUT: { Default: number } }).OUTPUT.Default;
            }
            this.composer.addPass(ssaoPass);
            this.passes.ssao = ssaoPass;
            console.log('SSAO pass enabled');
        }

        // Add HDR bloom effect
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.8,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
        this.passes.bloom = bloomPass;
        console.log('HDR Bloom pass enabled');

        // Add FXAA (Fast Approximate Anti-Aliasing)
        const fxaaPass = new ShaderPass(FXAAShader);
        const pixelRatio = this.renderer.getPixelRatio();
        fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
        fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
        this.composer.addPass(fxaaPass);
        this.passes.fxaa = fxaaPass;
        console.log('FXAA pass enabled');

        // Add output pass for proper color space conversion
        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);
        this.passes.output = outputPass;

        console.log('Post-processing pipeline initialized with 64-bit HDR support');
    }

    /**
     * Update post-processing effects
     */
    update(delta: number): void {
        // Update any time-based effects here if needed
    }

    /**
     * Render the post-processing pipeline
     */
    render(): void {
        if (this.enabled && this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Handle window resize
     */
    onResize(width: number, height: number): void {
        if (this.composer) {
            this.composer.setSize(width, height);
        }

        // Update FXAA resolution
        if (this.passes.fxaa) {
            const pixelRatio = this.renderer.getPixelRatio();
            this.passes.fxaa.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
            this.passes.fxaa.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
        }

        // Update SSAO resolution
        if (this.passes.ssao) {
            this.passes.ssao.setSize(width, height);
        }
    }

    /**
     * Enable/disable post-processing
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Configure bloom parameters
     */
    setBloomParams(strength: number, radius: number, threshold: number): void {
        if (this.passes.bloom) {
            this.passes.bloom.strength = strength;
            this.passes.bloom.radius = radius;
            this.passes.bloom.threshold = threshold;
        }
    }

    /**
     * Configure SSAO parameters
     */
    setSSAOParams(kernelRadius: number, minDistance: number, maxDistance: number): void {
        if (this.passes.ssao) {
            this.passes.ssao.kernelRadius = kernelRadius;
            this.passes.ssao.minDistance = minDistance;
            this.passes.ssao.maxDistance = maxDistance;
        }
    }

    /**
     * Get bloom pass for direct manipulation
     */
    getBloomPass(): UnrealBloomPass | undefined {
        return this.passes.bloom;
    }

    /**
     * Get SSAO pass for direct manipulation
     */
    getSSAOPass(): SSAOPass | undefined {
        return this.passes.ssao;
    }

    /**
     * Dispose of all resources
     */
    dispose(): void {
        if (this.composer) {
            this.composer.renderTarget1.dispose();
            this.composer.renderTarget2.dispose();
        }
    }
}
