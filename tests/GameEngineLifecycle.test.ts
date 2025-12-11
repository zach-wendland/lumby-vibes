import { GameEngine } from '../src/engine/GameEngine';

const mockRendererDispose = jest.fn();
const mockRendererForceContextLoss = jest.fn();

const mockPostProcessingDispose = jest.fn();
const mockPostProcessingInit = jest.fn();

jest.mock('../src/engine/PostProcessingManager', () => ({
    PostProcessingManager: jest.fn().mockImplementation(() => ({
        init: mockPostProcessingInit,
        render: jest.fn(),
        onResize: jest.fn(),
        dispose: mockPostProcessingDispose
    }))
}));

jest.mock('three', () => {
    class Scene {
        public children: unknown[] = [];
        public background: unknown = null;
        public fog: unknown = null;
        clear = jest.fn();
        add = jest.fn((child: unknown) => this.children.push(child));
        remove = jest.fn((child: unknown) => {
            this.children = this.children.filter((c) => c !== child);
        });
    }

    class PerspectiveCamera {
        public aspect = 1;
        public position = { set: jest.fn() } as const;
        public lookAt = jest.fn();
        public updateProjectionMatrix = jest.fn();
    }

    class WebGLRenderer {
        public shadowMap = { enabled: false, type: null as unknown };
        public outputColorSpace: unknown = null;
        public toneMapping: unknown = null;
        public toneMappingExposure = 0;
        public capabilities = { isWebGL2: true };
        public setSize = jest.fn();
        public setPixelRatio = jest.fn();
        public render = jest.fn();
        public getPixelRatio = jest.fn(() => 1);
        public dispose = mockRendererDispose;
        public forceContextLoss = mockRendererForceContextLoss;
        constructor(_options?: unknown) {}
    }

    class Clock {
        public getDelta = jest.fn(() => 0.016);
    }

    class Raycaster {
        public setFromCamera = jest.fn();
        public intersectObjects = jest.fn(() => []);
    }

    class Vector2 {
        public x = 0;
        public y = 0;
    }

    class Vector3 {
        public x: number;
        public y: number;
        public z: number;
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }

    class Color {
        public value: number;
        constructor(value: number) {
            this.value = value;
        }
    }

    class Fog {
        public color: number;
        public near: number;
        public far: number;
        constructor(color: number, near: number, far: number) {
            this.color = color;
            this.near = near;
            this.far = far;
        }
    }

    class AmbientLight {
        public color: number;
        public intensity: number;
        constructor(color: number, intensity: number) {
            this.color = color;
            this.intensity = intensity;
        }
    }

    class DirectionalLight {
        public position = { set: jest.fn() } as const;
        public castShadow = false;
        public shadow = {
            mapSize: { width: 0, height: 0 },
            camera: { near: 0, far: 0, left: 0, right: 0, top: 0, bottom: 0 },
            bias: 0,
            radius: 0
        };
        public color: number;
        public intensity: number;
        constructor(color: number, intensity: number) {
            this.color = color;
            this.intensity = intensity;
        }
    }

    class HemisphereLight {
        public skyColor: number;
        public groundColor: number;
        public intensity: number;
        constructor(skyColor: number, groundColor: number, intensity: number) {
            this.skyColor = skyColor;
            this.groundColor = groundColor;
            this.intensity = intensity;
        }
    }

    return {
        Scene,
        PerspectiveCamera,
        WebGLRenderer,
        Clock,
        Raycaster,
        Vector2,
        Vector3,
        Color,
        Fog,
        AmbientLight,
        DirectionalLight,
        HemisphereLight,
        VSMShadowMap: 'VSMShadowMap',
        SRGBColorSpace: 'SRGBColorSpace',
        ACESFilmicToneMapping: 'ACESFilmicToneMapping',
        LinearSRGBColorSpace: 'LinearSRGBColorSpace',
        RGBAFormat: 'RGBAFormat',
        HalfFloatType: 'HalfFloatType'
    };
});

describe('GameEngine lifecycle safeguards', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    test('throws a descriptive error when the game canvas is missing', async () => {
        const engine = new GameEngine();
        await expect(engine.init()).rejects.toThrow(/game canvas element/i);
    });

    test('removes listeners and disposes rendering resources on dispose', async () => {
        document.body.innerHTML = '<canvas id="game-canvas"></canvas>';
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        const canvasRemoveSpy = jest.spyOn(canvas, 'removeEventListener');
        const canvasAddSpy = jest.spyOn(canvas, 'addEventListener');
        const windowRemoveSpy = jest.spyOn(window, 'removeEventListener');
        const windowAddSpy = jest.spyOn(window, 'addEventListener');

        const engine = new GameEngine();
        await engine.init();

        expect(windowAddSpy.mock.calls.map((call) => call[0])).toContain('resize');
        expect(canvasAddSpy.mock.calls.map((call) => call[0])).toEqual(
            expect.arrayContaining(['mousemove', 'click', 'contextmenu'])
        );

        engine.dispose();

        expect(windowRemoveSpy.mock.calls.map((call) => call[0])).toContain('resize');
        expect(canvasRemoveSpy.mock.calls.map((call) => call[0])).toEqual(
            expect.arrayContaining(['mousemove', 'click', 'contextmenu'])
        );
        expect(mockRendererForceContextLoss).toHaveBeenCalled();
        expect(mockRendererDispose).toHaveBeenCalled();
        expect(mockPostProcessingDispose).toHaveBeenCalled();
        expect((engine as unknown as { entities: unknown[] }).entities).toHaveLength(0);
        expect((engine as unknown as { renderCallbacks: unknown[] }).renderCallbacks).toHaveLength(0);
    });
});
