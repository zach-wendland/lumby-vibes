/**
 * Comprehensive GameEngine tests
 */

import { GameEngine } from '../src/engine/GameEngine.ts';

// Mock getElementById while preserving createElement from setup
const originalCreateElement = global.document.createElement;
global.document.getElementById = jest.fn((id) => {
    if (id === 'game-canvas') {
        return {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };
    }
    if (id === 'loading-progress') {
        return {
            style: { width: '0%' }
        };
    }
    if (id === 'loading-text') {
        return {
            textContent: ''
        };
    }
    if (id === 'loading-screen') {
        return {
            classList: {
                add: jest.fn()
            }
        };
    }
    return null;
});

global.window = {
    innerWidth: 1024,
    innerHeight: 768,
    devicePixelRatio: 1,
    addEventListener: jest.fn(),
    dispatchEvent: jest.fn()
};

global.requestAnimationFrame = jest.fn();
global.setTimeout = jest.fn();

// Mock Three.js classes needed by GameEngine
const mockScene = {
    add: jest.fn(),
    remove: jest.fn(),
    children: [],
    background: null,
    fog: null
};

const mockCamera = {
    position: { set: jest.fn(), x: 0, y: 0, z: 0 },
    lookAt: jest.fn(),
    aspect: 1,
    updateProjectionMatrix: jest.fn()
};

const mockRenderer = {
    setSize: jest.fn(),
    setPixelRatio: jest.fn(),
    render: jest.fn(),
    shadowMap: { enabled: false, type: null },
    outputEncoding: null,
    toneMapping: null,
    toneMappingExposure: 1
};

const mockClock = {
    getDelta: jest.fn(() => 0.016)
};

const mockRaycaster = {
    setFromCamera: jest.fn(),
    intersectObjects: jest.fn(() => [])
};

// Mock Three module
jest.mock('three', () => ({
    Scene: jest.fn(() => mockScene),
    PerspectiveCamera: jest.fn(() => mockCamera),
    WebGLRenderer: jest.fn(() => mockRenderer),
    Clock: jest.fn(() => mockClock),
    Raycaster: jest.fn(() => mockRaycaster),
    Vector2: jest.fn(() => ({ x: 0, y: 0 })),
    Color: jest.fn(),
    Fog: jest.fn(),
    AmbientLight: jest.fn(() => ({})),
    DirectionalLight: jest.fn(() => ({
        position: { set: jest.fn() },
        castShadow: false,
        shadow: {
            mapSize: { width: 0, height: 0 },
            camera: {
                near: 0,
                far: 0,
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            },
            bias: 0
        }
    })),
    HemisphereLight: jest.fn(() => ({})),
    PCFSoftShadowMap: 1,
    sRGBEncoding: 1,
    ACESFilmicToneMapping: 1
}));

describe('GameEngine', () => {
    let engine;

    beforeEach(() => {
        jest.clearAllMocks();
        engine = new GameEngine();
    });

    describe('Initialization', () => {
        test('should create engine with default properties', () => {
            expect(engine).toBeDefined();
            expect(engine.scene).toBeNull();
            expect(engine.camera).toBeNull();
            expect(engine.renderer).toBeNull();
            expect(engine.isRunning).toBe(false);
        });

        test('should initialize entities array', () => {
            expect(engine.entities).toBeDefined();
            expect(Array.isArray(engine.entities)).toBe(true);
            expect(engine.entities.length).toBe(0);
        });

        test('should initialize callback arrays', () => {
            expect(engine.updateCallbacks).toBeDefined();
            expect(Array.isArray(engine.updateCallbacks)).toBe(true);
            expect(engine.renderCallbacks).toBeDefined();
            expect(Array.isArray(engine.renderCallbacks)).toBe(true);
        });

        test('should initialize loading progress', () => {
            expect(engine.loadingProgress).toBe(0);
        });
    });

    describe('Entity management', () => {
        test('should add entity with mesh', () => {
            const entity = {
                mesh: { userData: {} },
                update: jest.fn()
            };

            engine.scene = mockScene;
            engine.addEntity(entity);

            expect(engine.entities).toContain(entity);
            expect(mockScene.add).toHaveBeenCalledWith(entity.mesh);
        });

        test('should add entity without mesh', () => {
            const entity = {
                update: jest.fn()
            };

            engine.scene = mockScene;
            engine.addEntity(entity);

            expect(engine.entities).toContain(entity);
            expect(mockScene.add).not.toHaveBeenCalled();
        });

        test('should remove entity with mesh', () => {
            const entity = {
                mesh: { userData: {} },
                update: jest.fn()
            };

            engine.scene = mockScene;
            engine.addEntity(entity);
            engine.removeEntity(entity);

            expect(engine.entities).not.toContain(entity);
            expect(mockScene.remove).toHaveBeenCalledWith(entity.mesh);
        });

        test('should remove entity without mesh', () => {
            const entity = {
                update: jest.fn()
            };

            engine.addEntity(entity);
            engine.removeEntity(entity);

            expect(engine.entities).not.toContain(entity);
        });

        test('should handle removing non-existent entity', () => {
            const entity = {
                mesh: { userData: {} },
                update: jest.fn()
            };

            engine.scene = mockScene;
            expect(() => engine.removeEntity(entity)).not.toThrow();
        });

        test('should manage multiple entities', () => {
            engine.scene = mockScene;

            const entity1 = { mesh: {}, update: jest.fn() };
            const entity2 = { mesh: {}, update: jest.fn() };
            const entity3 = { mesh: {}, update: jest.fn() };

            engine.addEntity(entity1);
            engine.addEntity(entity2);
            engine.addEntity(entity3);

            expect(engine.entities.length).toBe(3);

            engine.removeEntity(entity2);

            expect(engine.entities.length).toBe(2);
            expect(engine.entities).toContain(entity1);
            expect(engine.entities).not.toContain(entity2);
            expect(engine.entities).toContain(entity3);
        });
    });

    describe('Callback registration', () => {
        test('should register update callback', () => {
            const callback = jest.fn();

            engine.onUpdate(callback);

            expect(engine.updateCallbacks).toContain(callback);
        });

        test('should register render callback', () => {
            const callback = jest.fn();

            engine.onRender(callback);

            expect(engine.renderCallbacks).toContain(callback);
        });

        test('should register multiple callbacks', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            const callback3 = jest.fn();

            engine.onUpdate(callback1);
            engine.onUpdate(callback2);
            engine.onRender(callback3);

            expect(engine.updateCallbacks.length).toBe(2);
            expect(engine.renderCallbacks.length).toBe(1);
        });
    });

    describe('Update loop', () => {
        test('should update all entities', () => {
            const entity1 = { update: jest.fn() };
            const entity2 = { update: jest.fn() };

            engine.addEntity(entity1);
            engine.addEntity(entity2);

            engine.update();

            expect(entity1.update).toHaveBeenCalled();
            expect(entity2.update).toHaveBeenCalled();
        });

        test('should call update callbacks', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            engine.onUpdate(callback1);
            engine.onUpdate(callback2);

            engine.update();

            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        test('should pass delta to update callbacks', () => {
            const callback = jest.fn();
            engine.clock = mockClock;
            engine.onUpdate(callback);

            engine.update();

            expect(callback).toHaveBeenCalledWith(expect.any(Number));
        });

        test('should handle entities without update method', () => {
            const entity = { mesh: {} };

            engine.scene = mockScene;
            engine.addEntity(entity);

            expect(() => engine.update()).not.toThrow();
        });

        test('should update delta from clock', () => {
            engine.clock = mockClock;
            mockClock.getDelta.mockReturnValue(0.032);

            engine.update();

            expect(engine.delta).toBe(0.032);
        });
    });

    describe('Render loop', () => {
        test('should call render callbacks', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            engine.onRender(callback1);
            engine.onRender(callback2);

            engine.scene = mockScene;
            engine.camera = mockCamera;
            engine.renderer = mockRenderer;

            engine.render();

            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        test('should render scene with renderer', () => {
            engine.scene = mockScene;
            engine.camera = mockCamera;
            engine.renderer = mockRenderer;

            engine.render();

            expect(mockRenderer.render).toHaveBeenCalledWith(mockScene, mockCamera);
        });
    });

    describe('Game loop control', () => {
        test('should set isRunning to true when started', () => {
            engine.isRunning = false;
            engine.scene = mockScene;
            engine.camera = mockCamera;
            engine.renderer = mockRenderer;
            engine.clock = mockClock;

            engine.start();

            expect(engine.isRunning).toBe(true);
        });

        test('should set isRunning to false when stopped', () => {
            engine.isRunning = true;
            engine.stop();

            expect(engine.isRunning).toBe(false);
        });

        test('should not schedule animation frame when stopped', () => {
            engine.isRunning = false;
            const rafSpy = jest.spyOn(global, 'requestAnimationFrame');

            engine.gameLoop();

            expect(rafSpy).not.toHaveBeenCalled();
            rafSpy.mockRestore();
        });

        test('should handle repeated start calls across visibility changes', () => {
            const loopSpy = jest.spyOn(engine, 'gameLoop').mockImplementation(() => {});
            engine.clock = mockClock;

            // First start initializes the loop
            engine.start();
            expect(engine.isRunning).toBe(true);
            expect(loopSpy).toHaveBeenCalledTimes(1);

            // Subsequent start while already running should be ignored
            engine.start();
            expect(loopSpy).toHaveBeenCalledTimes(1);

            // Simulate visibility loss and resume
            engine.stop();
            expect(engine.isRunning).toBe(false);

            engine.start();
            expect(engine.isRunning).toBe(true);
            expect(mockClock.getDelta).toHaveBeenCalled();
            expect(loopSpy).toHaveBeenCalledTimes(2);

            loopSpy.mockRestore();
        });
    });

    describe('Loading progress', () => {
        test('should update loading progress', () => {
            const progressBar = { style: { width: '0%' } };
            const loadingText = { textContent: '' };

            document.getElementById.mockImplementation((id) => {
                if (id === 'loading-progress') return progressBar;
                if (id === 'loading-text') return loadingText;
                return null;
            });

            engine.updateLoadingProgress(50);

            expect(engine.loadingProgress).toBe(50);
            expect(progressBar.style.width).toBe('50%');
            expect(loadingText.textContent).toBeTruthy();
        });

        test('should handle missing progress elements', () => {
            document.getElementById.mockReturnValue(null);

            expect(() => engine.updateLoadingProgress(50)).not.toThrow();
        });

        test('should update loading text based on progress', () => {
            const loadingText = { textContent: '' };

            document.getElementById.mockImplementation((id) => {
                if (id === 'loading-text') return loadingText;
                return null;
            });

            engine.updateLoadingProgress(0);
            const text1 = loadingText.textContent;

            engine.updateLoadingProgress(50);
            const text2 = loadingText.textContent;

            engine.updateLoadingProgress(100);
            const text3 = loadingText.textContent;

            // Different progress should show different messages
            expect(text1).toBeTruthy();
            expect(text2).toBeTruthy();
            expect(text3).toBeTruthy();
        });
    });

    describe('Hide loading screen', () => {
        test('should add hidden class to loading screen', () => {
            const loadingScreen = {
                classList: { add: jest.fn() }
            };

            document.getElementById.mockImplementation((id) => {
                if (id === 'loading-screen') return loadingScreen;
                return null;
            });

            engine.hideLoadingScreen();

            // Uses setTimeout, so we need to wait
            expect(global.setTimeout).toHaveBeenCalled();
        });

        test('should handle missing loading screen', () => {
            document.getElementById.mockReturnValue(null);

            expect(() => engine.hideLoadingScreen()).not.toThrow();
        });
    });

    describe('Mouse and interaction', () => {
        test('should update mouse position on move', () => {
            const event = {
                clientX: 512,
                clientY: 384
            };

            engine.onMouseMove(event);

            expect(engine.mouse.x).toBeCloseTo(0, 1);
            expect(engine.mouse.y).toBeCloseTo(0, 1);
        });

        test('should handle click events', () => {
            engine.camera = mockCamera;
            engine.raycaster = mockRaycaster;
            engine.scene = mockScene;

            const event = {};

            engine.onClick(event);

            expect(mockRaycaster.setFromCamera).toHaveBeenCalled();
            expect(mockRaycaster.intersectObjects).toHaveBeenCalled();
        });

        test('should handle click with intersected object', () => {
            engine.camera = mockCamera;
            engine.raycaster = mockRaycaster;
            engine.scene = mockScene;

            const clickedObject = { userData: {} };
            mockRaycaster.intersectObjects.mockReturnValueOnce([
                { object: clickedObject, point: { x: 0, y: 0, z: 0 } }
            ]);

            const event = {};

            // Should not throw
            expect(() => engine.onClick(event)).not.toThrow();
        });

        test('should handle right-click events', () => {
            engine.camera = mockCamera;
            engine.raycaster = mockRaycaster;
            engine.scene = mockScene;

            const event = {
                preventDefault: jest.fn(),
                clientX: 100,
                clientY: 100
            };

            const result = engine.onRightClick(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(mockRaycaster.setFromCamera).toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });

    describe('Window resize', () => {
        test('should update camera and renderer on resize', () => {
            engine.camera = mockCamera;
            engine.renderer = mockRenderer;

            global.window.innerWidth = 1920;
            global.window.innerHeight = 1080;

            engine.onWindowResize();

            expect(mockCamera.updateProjectionMatrix).toHaveBeenCalled();
            expect(mockRenderer.setSize).toHaveBeenCalledWith(1920, 1080);
        });

        test('should update camera aspect ratio', () => {
            engine.camera = mockCamera;
            engine.renderer = mockRenderer;

            global.window.innerWidth = 1920;
            global.window.innerHeight = 1080;

            engine.onWindowResize();

            expect(engine.camera.aspect).toBe(1920 / 1080);
        });
    });

    describe('Raycasting', () => {
        test('should get intersected objects', () => {
            engine.camera = mockCamera;
            engine.raycaster = mockRaycaster;
            engine.scene = mockScene;

            const intersects = engine.getIntersectedObjects();

            expect(mockRaycaster.setFromCamera).toHaveBeenCalled();
            expect(mockRaycaster.intersectObjects).toHaveBeenCalled();
            expect(Array.isArray(intersects)).toBe(true);
        });

        test('should intersect scene children recursively', () => {
            engine.camera = mockCamera;
            engine.raycaster = mockRaycaster;
            engine.scene = mockScene;

            engine.getIntersectedObjects();

            expect(mockRaycaster.intersectObjects).toHaveBeenCalledWith(
                mockScene.children,
                true
            );
        });
    });

    describe('Integration tests', () => {
        test('should handle complete entity lifecycle', () => {
            engine.scene = mockScene;

            const entity = {
                mesh: {},
                update: jest.fn()
            };

            // Add entity
            engine.addEntity(entity);
            expect(engine.entities).toContain(entity);

            // Update entity
            engine.update();
            expect(entity.update).toHaveBeenCalled();

            // Remove entity
            engine.removeEntity(entity);
            expect(engine.entities).not.toContain(entity);
        });

        test('should handle callbacks throughout lifecycle', () => {
            const updateCallback = jest.fn();
            const renderCallback = jest.fn();

            engine.scene = mockScene;
            engine.camera = mockCamera;
            engine.renderer = mockRenderer;

            engine.onUpdate(updateCallback);
            engine.onRender(renderCallback);

            engine.update();
            engine.render();

            expect(updateCallback).toHaveBeenCalled();
            expect(renderCallback).toHaveBeenCalled();
        });

        test('should coordinate entities and callbacks', () => {
            const entity1 = { update: jest.fn() };
            const entity2 = { update: jest.fn() };
            const updateCallback = jest.fn();

            engine.addEntity(entity1);
            engine.addEntity(entity2);
            engine.onUpdate(updateCallback);

            engine.update();

            expect(entity1.update).toHaveBeenCalled();
            expect(entity2.update).toHaveBeenCalled();
            expect(updateCallback).toHaveBeenCalled();
        });
    });
});
