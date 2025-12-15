/**
 * EffectsManager Service Tests
 * Tests for visual effects like damage splashes
 */

import * as THREE from 'three';
import { EffectsManager } from '../../src/services/EffectsManager';

// Mock canvas for sprite creation
const mockContext = {
    fillStyle: '',
    font: '',
    textAlign: '',
    fillText: jest.fn()
};

const mockCanvas = {
    width: 0,
    height: 0,
    getContext: jest.fn().mockReturnValue(mockContext)
};

// Store original createElement
const originalCreateElement = document.createElement.bind(document);

describe('EffectsManager', () => {
    let effectsManager: EffectsManager;
    let mockScene: THREE.Scene;

    beforeEach(() => {
        mockScene = new THREE.Scene();
        effectsManager = new EffectsManager(mockScene);

        // Mock document.createElement for canvas
        jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
            if (tagName === 'canvas') {
                return mockCanvas as unknown as HTMLCanvasElement;
            }
            return originalCreateElement(tagName);
        });

        // Reset mock
        mockContext.fillText.mockClear();
    });

    afterEach(() => {
        effectsManager.dispose();
        jest.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with null scene', () => {
            const manager = new EffectsManager();
            expect(manager).toBeDefined();
            manager.dispose();
        });

        it('should accept scene in constructor', () => {
            const scene = new THREE.Scene();
            const manager = new EffectsManager(scene);
            expect(manager).toBeDefined();
            manager.dispose();
        });
    });

    describe('setScene', () => {
        it('should set scene reference for lazy initialization', () => {
            const manager = new EffectsManager();
            const scene = new THREE.Scene();

            manager.setScene(scene);
            manager.createDamageSplash(new THREE.Vector3(0, 0, 0), 10);

            // Scene should have the sprite
            expect(scene.children.length).toBe(1);
            manager.dispose();
        });
    });

    describe('createDamageSplash', () => {
        it('should add sprite to scene', () => {
            const position = new THREE.Vector3(5, 0, 5);

            effectsManager.createDamageSplash(position, 15);

            expect(mockScene.children.length).toBe(1);
            expect(mockScene.children[0]).toBeInstanceOf(THREE.Sprite);
        });

        it('should position sprite above the damage position', () => {
            const position = new THREE.Vector3(10, 2, 10);

            effectsManager.createDamageSplash(position, 20);

            const sprite = mockScene.children[0] as THREE.Sprite;
            expect(sprite.position.x).toBe(10);
            expect(sprite.position.y).toBeGreaterThan(2);
            expect(sprite.position.z).toBe(10);
        });

        it('should show damage number for hits', () => {
            effectsManager.createDamageSplash(new THREE.Vector3(0, 0, 0), 25);

            expect(mockContext.fillText).toHaveBeenCalledWith('25', expect.any(Number), expect.any(Number));
            expect(mockContext.fillStyle).toBe('#FF0000'); // Red for damage
        });

        it('should show "Miss" text for zero damage', () => {
            effectsManager.createDamageSplash(new THREE.Vector3(0, 0, 0), 0);

            expect(mockContext.fillText).toHaveBeenCalledWith('Miss', expect.any(Number), expect.any(Number));
            expect(mockContext.fillStyle).toBe('#0099FF'); // Blue for miss
        });

        it('should handle no scene gracefully', () => {
            const manager = new EffectsManager();

            expect(() => {
                manager.createDamageSplash(new THREE.Vector3(0, 0, 0), 10);
            }).not.toThrow();

            manager.dispose();
        });

        it('should handle null context gracefully', () => {
            const nullContextCanvas = {
                width: 0,
                height: 0,
                getContext: jest.fn().mockReturnValue(null)
            };
            jest.spyOn(document, 'createElement').mockReturnValue(nullContextCanvas as unknown as HTMLCanvasElement);

            expect(() => {
                effectsManager.createDamageSplash(new THREE.Vector3(0, 0, 0), 10);
            }).not.toThrow();
        });

        it('should create multiple splashes', () => {
            // Reset mock to return valid context for each call
            mockCanvas.getContext = jest.fn().mockReturnValue(mockContext);
            jest.spyOn(document, 'createElement').mockReturnValue(mockCanvas as unknown as HTMLCanvasElement);

            effectsManager.createDamageSplash(new THREE.Vector3(0, 0, 0), 10);
            effectsManager.createDamageSplash(new THREE.Vector3(5, 0, 5), 20);
            effectsManager.createDamageSplash(new THREE.Vector3(10, 0, 10), 30);

            expect(mockScene.children.length).toBe(3);
        });
    });

    describe('update', () => {
        beforeEach(() => {
            // Reset canvas mock
            mockCanvas.getContext = jest.fn().mockReturnValue(mockContext);
        });

        it('should animate splashes upward', () => {
            effectsManager.createDamageSplash(new THREE.Vector3(0, 0, 0), 10);
            const sprite = mockScene.children[0] as THREE.Sprite;
            const initialY = sprite.position.y;

            // Simulate time passing
            jest.advanceTimersByTime(500);
            effectsManager.update(0.016);

            expect(sprite.position.y).toBeGreaterThan(initialY);
        });

        it('should fade splashes over time', () => {
            effectsManager.createDamageSplash(new THREE.Vector3(0, 0, 0), 10);
            const sprite = mockScene.children[0] as THREE.Sprite;

            // Simulate time passing
            jest.advanceTimersByTime(500);
            effectsManager.update(0.016);

            expect(sprite.material.opacity).toBeLessThan(1);
        });

        it('should remove splashes after duration', () => {
            effectsManager.createDamageSplash(new THREE.Vector3(0, 0, 0), 10);
            expect(mockScene.children.length).toBe(1);

            // Simulate full duration passing
            jest.advanceTimersByTime(2000);
            effectsManager.update(0.016);

            expect(mockScene.children.length).toBe(0);
        });

        it('should dispose texture and material on removal', () => {
            effectsManager.createDamageSplash(new THREE.Vector3(0, 0, 0), 10);
            const sprite = mockScene.children[0] as THREE.Sprite;
            const disposeMaterialSpy = jest.spyOn(sprite.material, 'dispose');

            // Simulate full duration
            jest.advanceTimersByTime(2000);
            effectsManager.update(0.016);

            expect(disposeMaterialSpy).toHaveBeenCalled();
        });

        it('should handle multiple splashes with different timings', () => {
            effectsManager.createDamageSplash(new THREE.Vector3(0, 0, 0), 10);

            jest.advanceTimersByTime(500);
            effectsManager.createDamageSplash(new THREE.Vector3(5, 0, 5), 20);

            expect(mockScene.children.length).toBe(2);

            // First splash expires
            jest.advanceTimersByTime(1100);
            effectsManager.update(0.016);

            expect(mockScene.children.length).toBe(1);

            // Second splash expires
            jest.advanceTimersByTime(500);
            effectsManager.update(0.016);

            expect(mockScene.children.length).toBe(0);
        });

        it('should handle update with no splashes', () => {
            expect(() => {
                effectsManager.update(0.016);
            }).not.toThrow();
        });
    });

    describe('dispose', () => {
        beforeEach(() => {
            mockCanvas.getContext = jest.fn().mockReturnValue(mockContext);
        });

        it('should remove all splashes from scene', () => {
            effectsManager.createDamageSplash(new THREE.Vector3(0, 0, 0), 10);
            effectsManager.createDamageSplash(new THREE.Vector3(5, 0, 5), 20);

            expect(mockScene.children.length).toBe(2);

            effectsManager.dispose();

            expect(mockScene.children.length).toBe(0);
        });

        it('should dispose all textures and materials', () => {
            effectsManager.createDamageSplash(new THREE.Vector3(0, 0, 0), 10);
            const sprite = mockScene.children[0] as THREE.Sprite;
            const disposeMaterialSpy = jest.spyOn(sprite.material, 'dispose');

            effectsManager.dispose();

            expect(disposeMaterialSpy).toHaveBeenCalled();
        });

        it('should handle dispose with no scene', () => {
            const manager = new EffectsManager();

            expect(() => {
                manager.dispose();
            }).not.toThrow();
        });

        it('should handle dispose with no splashes', () => {
            expect(() => {
                effectsManager.dispose();
            }).not.toThrow();
        });

        it('should be safe to call dispose multiple times', () => {
            effectsManager.createDamageSplash(new THREE.Vector3(0, 0, 0), 10);

            expect(() => {
                effectsManager.dispose();
                effectsManager.dispose();
            }).not.toThrow();
        });
    });
});

// Use fake timers for time-based tests
beforeEach(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});
