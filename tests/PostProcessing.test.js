/**
 * PostProcessingManager Test
 *
 * Tests for 64-bit HDR post-processing pipeline
 */

import { PostProcessingManager } from '../src/engine/PostProcessingManager.ts';

// Mock Three.js
const mockRenderer = {
    getPixelRatio: jest.fn(() => 1),
    render: jest.fn(),
    capabilities: {
        isWebGL2: true
    }
};

const mockScene = {
    children: []
};

const mockCamera = {
    position: { x: 0, y: 0, z: 0 }
};

const mockComposer = {
    render: jest.fn(),
    setSize: jest.fn(),
    addPass: jest.fn(),
    renderTarget1: { dispose: jest.fn() },
    renderTarget2: { dispose: jest.fn() }
};

jest.mock('three', () => ({
    WebGLRenderTarget: jest.fn(() => ({
        setSize: jest.fn(),
        dispose: jest.fn()
    })),
    Vector2: jest.fn(),
    HalfFloatType: 'HalfFloatType',
    RGBAFormat: 'RGBAFormat',
    LinearSRGBColorSpace: 'LinearSRGBColorSpace',
    LinearFilter: 'LinearFilter'
}));

jest.mock('three/examples/jsm/postprocessing/EffectComposer.js', () => ({
    EffectComposer: jest.fn(() => mockComposer)
}));

jest.mock('three/examples/jsm/postprocessing/RenderPass.js', () => ({
    RenderPass: jest.fn()
}));

jest.mock('three/examples/jsm/postprocessing/UnrealBloomPass.js', () => ({
    UnrealBloomPass: jest.fn()
}));

jest.mock('three/examples/jsm/postprocessing/SSAOPass.js', () => ({
    SSAOPass: jest.fn(() => ({
        kernelRadius: 0,
        minDistance: 0,
        maxDistance: 0,
        output: 0,
        setSize: jest.fn()
    }))
}));

jest.mock('three/examples/jsm/postprocessing/ShaderPass.js', () => ({
    ShaderPass: jest.fn(() => ({
        material: {
            uniforms: {
                resolution: {
                    value: { x: 0, y: 0 }
                }
            }
        }
    }))
}));

jest.mock('three/examples/jsm/shaders/FXAAShader.js', () => ({
    FXAAShader: {}
}));

jest.mock('three/examples/jsm/postprocessing/OutputPass.js', () => ({
    OutputPass: jest.fn()
}));

describe('PostProcessingManager', () => {
    let ppManager;

    beforeEach(() => {
        ppManager = new PostProcessingManager(mockRenderer, mockScene, mockCamera);
        global.window = { innerWidth: 1920, innerHeight: 1080 };
        jest.clearAllMocks();
    });

    describe('TEST-007: Initialization', () => {
        test('should create post-processing manager', () => {
            expect(ppManager).toBeDefined();
            expect(ppManager.renderer).toBe(mockRenderer);
            expect(ppManager.scene).toBe(mockScene);
            expect(ppManager.camera).toBe(mockCamera);
        });

        test('should initialize composer with passes', () => {
            ppManager.init();

            expect(ppManager.composer).toBeDefined();
            expect(mockComposer.addPass).toHaveBeenCalled();
        });

        test('should be enabled by default', () => {
            expect(ppManager.enabled).toBe(true);
        });
    });

    describe('TEST-008: HDR Bloom', () => {
        test('should have bloom pass after initialization', () => {
            ppManager.init();

            expect(ppManager.passes.bloom).toBeDefined();
        });

        test('should allow configuring bloom parameters', () => {
            ppManager.init();

            ppManager.setBloomParams(1.5, 0.6, 0.9);

            expect(ppManager.passes.bloom.strength).toBe(1.5);
            expect(ppManager.passes.bloom.radius).toBe(0.6);
            expect(ppManager.passes.bloom.threshold).toBe(0.9);
        });

        test('should return bloom pass', () => {
            ppManager.init();

            const bloomPass = ppManager.getBloomPass();
            expect(bloomPass).toBe(ppManager.passes.bloom);
        });
    });

    describe('TEST-009: SSAO', () => {
        test('should have SSAO pass when WebGL2 is supported', () => {
            ppManager.init();

            expect(ppManager.passes.ssao).toBeDefined();
        });

        test('should allow configuring SSAO parameters', () => {
            ppManager.init();

            ppManager.setSSAOParams(10, 0.01, 0.2);

            expect(ppManager.passes.ssao.kernelRadius).toBe(10);
            expect(ppManager.passes.ssao.minDistance).toBe(0.01);
            expect(ppManager.passes.ssao.maxDistance).toBe(0.2);
        });

        test('should return SSAO pass', () => {
            ppManager.init();

            const ssaoPass = ppManager.getSSAOPass();
            expect(ssaoPass).toBe(ppManager.passes.ssao);
        });
    });

    describe('Rendering', () => {
        test('should render through composer when enabled', () => {
            ppManager.init();
            ppManager.render();

            expect(mockComposer.render).toHaveBeenCalled();
        });

        test('should render directly when disabled', () => {
            ppManager.init();
            ppManager.setEnabled(false);
            ppManager.render();

            expect(mockRenderer.render).toHaveBeenCalledWith(mockScene, mockCamera);
        });

        test('should toggle enabled state', () => {
            ppManager.setEnabled(false);
            expect(ppManager.enabled).toBe(false);

            ppManager.setEnabled(true);
            expect(ppManager.enabled).toBe(true);
        });
    });

    describe('Resize Handling', () => {
        test('should resize composer on window resize', () => {
            ppManager.init();
            ppManager.onResize(1920, 1080);

            expect(mockComposer.setSize).toHaveBeenCalledWith(1920, 1080);
        });

        test('should update FXAA resolution on resize', () => {
            ppManager.init();
            const fxaaPass = ppManager.passes.fxaa;

            ppManager.onResize(1920, 1080);

            expect(fxaaPass.material.uniforms.resolution.value.x).toBeGreaterThan(0);
            expect(fxaaPass.material.uniforms.resolution.value.y).toBeGreaterThan(0);
        });

        test('should update SSAO size on resize', () => {
            ppManager.init();
            const ssaoPass = ppManager.passes.ssao;

            ppManager.onResize(1920, 1080);

            expect(ssaoPass.setSize).toHaveBeenCalledWith(1920, 1080);
        });
    });

    describe('Resource Management', () => {
        test('should dispose of resources', () => {
            ppManager.init();
            ppManager.dispose();

            expect(mockComposer.renderTarget1.dispose).toHaveBeenCalled();
            expect(mockComposer.renderTarget2.dispose).toHaveBeenCalled();
        });
    });
});
