/**
 * CameraController Service Tests
 * Tests for camera orbit, zoom, and positioning
 */

import * as THREE from 'three';
import { CameraController } from '../../src/services/CameraController';
import { CAMERA } from '../../src/utils/Constants';

describe('CameraController', () => {
    let cameraController: CameraController;
    let mockCamera: THREE.PerspectiveCamera;

    beforeEach(() => {
        mockCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        cameraController = new CameraController(mockCamera);
    });

    afterEach(() => {
        cameraController.dispose();
    });

    describe('constructor', () => {
        it('should initialize with default camera values', () => {
            const controller = new CameraController();
            // Internal state is private, but we can test behavior
            expect(controller).toBeDefined();
            controller.dispose();
        });

        it('should accept camera in constructor', () => {
            const camera = new THREE.PerspectiveCamera();
            const controller = new CameraController(camera);
            expect(controller).toBeDefined();
            controller.dispose();
        });
    });

    describe('setCamera', () => {
        it('should set camera reference for lazy initialization', () => {
            const controller = new CameraController();
            const camera = new THREE.PerspectiveCamera();

            controller.setCamera(camera);
            controller.updateCamera(new THREE.Vector3(0, 0, 0));

            // Camera should be positioned
            expect(camera.position.y).toBeGreaterThan(0);
            controller.dispose();
        });
    });

    describe('setupControls', () => {
        it('should add mouse event listeners to window', () => {
            const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

            cameraController.setupControls();

            expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('wheel', expect.any(Function));

            addEventListenerSpy.mockRestore();
        });
    });

    describe('updateCamera', () => {
        it('should position camera relative to player', () => {
            const playerPosition = new THREE.Vector3(10, 0, 10);

            cameraController.updateCamera(playerPosition);

            // Camera should be elevated above player
            expect(mockCamera.position.y).toBeGreaterThan(0);
        });

        it('should make camera look at player position', () => {
            const playerPosition = new THREE.Vector3(5, 0, 5);

            // Get initial quaternion
            const initialQuaternion = mockCamera.quaternion.clone();

            cameraController.updateCamera(playerPosition);

            // Camera orientation should change to look at player
            expect(mockCamera.quaternion.equals(initialQuaternion)).toBe(false);
        });

        it('should handle origin position', () => {
            const playerPosition = new THREE.Vector3(0, 0, 0);

            expect(() => {
                cameraController.updateCamera(playerPosition);
            }).not.toThrow();

            expect(mockCamera.position.y).toBeGreaterThan(0);
        });

        it('should handle no camera gracefully', () => {
            const controller = new CameraController();

            expect(() => {
                controller.updateCamera(new THREE.Vector3(0, 0, 0));
            }).not.toThrow();

            controller.dispose();
        });
    });

    describe('mouse wheel zoom', () => {
        beforeEach(() => {
            cameraController.setupControls();
        });

        it('should zoom out when scrolling down', () => {
            const playerPosition = new THREE.Vector3(0, 0, 0);
            cameraController.updateCamera(playerPosition);
            const initialDistance = mockCamera.position.length();

            // Simulate wheel scroll down (positive deltaY = zoom out)
            const wheelEvent = new WheelEvent('wheel', { deltaY: 100 });
            window.dispatchEvent(wheelEvent);
            cameraController.updateCamera(playerPosition);

            expect(mockCamera.position.length()).toBeGreaterThan(initialDistance);
        });

        it('should zoom in when scrolling up', () => {
            const playerPosition = new THREE.Vector3(0, 0, 0);
            cameraController.updateCamera(playerPosition);
            const initialDistance = mockCamera.position.length();

            // Simulate wheel scroll up (negative deltaY = zoom in)
            const wheelEvent = new WheelEvent('wheel', { deltaY: -100 });
            window.dispatchEvent(wheelEvent);
            cameraController.updateCamera(playerPosition);

            expect(mockCamera.position.length()).toBeLessThan(initialDistance);
        });

        it('should respect minimum zoom distance', () => {
            const playerPosition = new THREE.Vector3(0, 0, 0);

            // Zoom in a lot
            for (let i = 0; i < 100; i++) {
                const wheelEvent = new WheelEvent('wheel', { deltaY: -100 });
                window.dispatchEvent(wheelEvent);
            }
            cameraController.updateCamera(playerPosition);

            const distance = mockCamera.position.length();
            expect(distance).toBeGreaterThanOrEqual(CAMERA.MIN_DISTANCE * 0.9); // Allow small margin
        });

        it('should respect maximum zoom distance', () => {
            const playerPosition = new THREE.Vector3(0, 0, 0);

            // Zoom out a lot
            for (let i = 0; i < 100; i++) {
                const wheelEvent = new WheelEvent('wheel', { deltaY: 100 });
                window.dispatchEvent(wheelEvent);
            }
            cameraController.updateCamera(playerPosition);

            const distance = mockCamera.position.length();
            expect(distance).toBeLessThanOrEqual(CAMERA.MAX_DISTANCE * 1.1); // Allow small margin
        });
    });

    describe('middle mouse button rotation', () => {
        beforeEach(() => {
            cameraController.setupControls();
        });

        it('should rotate camera when middle mouse is dragged', () => {
            const playerPosition = new THREE.Vector3(0, 0, 0);
            cameraController.updateCamera(playerPosition);
            const initialX = mockCamera.position.x;
            const initialZ = mockCamera.position.z;

            // Simulate middle mouse down
            const mouseDownEvent = new MouseEvent('mousedown', {
                button: 1,
                clientX: 100,
                clientY: 100
            });
            window.dispatchEvent(mouseDownEvent);

            // Simulate mouse move
            const mouseMoveEvent = new MouseEvent('mousemove', {
                clientX: 200,
                clientY: 100
            });
            window.dispatchEvent(mouseMoveEvent);

            cameraController.updateCamera(playerPosition);

            // Camera X or Z should change (rotation around Y axis)
            const positionChanged =
                Math.abs(mockCamera.position.x - initialX) > 0.01 ||
                Math.abs(mockCamera.position.z - initialZ) > 0.01;

            expect(positionChanged).toBe(true);
        });

        it('should not rotate when middle mouse is not pressed', () => {
            const playerPosition = new THREE.Vector3(0, 0, 0);
            cameraController.updateCamera(playerPosition);
            const initialX = mockCamera.position.x;
            const initialZ = mockCamera.position.z;

            // Simulate mouse move without middle button
            const mouseMoveEvent = new MouseEvent('mousemove', {
                clientX: 200,
                clientY: 100
            });
            window.dispatchEvent(mouseMoveEvent);

            cameraController.updateCamera(playerPosition);

            expect(mockCamera.position.x).toBeCloseTo(initialX, 5);
            expect(mockCamera.position.z).toBeCloseTo(initialZ, 5);
        });

        it('should stop rotating when middle mouse is released', () => {
            const playerPosition = new THREE.Vector3(0, 0, 0);

            // Start dragging
            window.dispatchEvent(new MouseEvent('mousedown', { button: 1, clientX: 100, clientY: 100 }));

            // Release
            window.dispatchEvent(new MouseEvent('mouseup', { button: 1 }));

            // Update camera
            cameraController.updateCamera(playerPosition);
            const positionAfterRelease = mockCamera.position.clone();

            // Move mouse (should not affect camera now)
            window.dispatchEvent(new MouseEvent('mousemove', { clientX: 500, clientY: 500 }));
            cameraController.updateCamera(playerPosition);

            expect(mockCamera.position.x).toBeCloseTo(positionAfterRelease.x, 5);
            expect(mockCamera.position.z).toBeCloseTo(positionAfterRelease.z, 5);
        });

        it('should adjust camera angle with vertical drag', () => {
            const playerPosition = new THREE.Vector3(0, 0, 0);
            cameraController.updateCamera(playerPosition);
            const initialY = mockCamera.position.y;

            // Simulate middle mouse down and vertical drag
            window.dispatchEvent(new MouseEvent('mousedown', { button: 1, clientX: 100, clientY: 100 }));
            window.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 200 }));
            cameraController.updateCamera(playerPosition);

            // Camera height should change
            expect(mockCamera.position.y).not.toBeCloseTo(initialY, 1);
        });
    });

    describe('dispose', () => {
        it('should remove all event listeners', () => {
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

            cameraController.setupControls();
            cameraController.dispose();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('wheel', expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });

        it('should null camera reference', () => {
            cameraController.dispose();

            // After dispose, updateCamera should not throw
            expect(() => {
                cameraController.updateCamera(new THREE.Vector3(0, 0, 0));
            }).not.toThrow();
        });
    });
});
