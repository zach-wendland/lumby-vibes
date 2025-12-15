/**
 * CameraController - Handles camera orbit, zoom, and positioning
 * Extracted from GameLogic to reduce god object complexity
 */

import * as THREE from 'three';
import { CAMERA } from '../utils/Constants';

/**
 * Camera Controller interface for dependency injection
 */
export interface ICameraController {
    setupControls(): void;
    updateCamera(playerPosition: THREE.Vector3): void;
    dispose(): void;
}

/**
 * CameraController class - Handles camera controls
 */
export class CameraController implements ICameraController {
    private camera: THREE.PerspectiveCamera | null = null;
    private cameraDistance: number;
    private cameraAngle: number;
    private cameraRotation: number;

    // Mouse state for camera rotation
    private mouseDown: boolean = false;
    private lastMouseX: number = 0;
    private lastMouseY: number = 0;

    // Event handler references for cleanup
    private handleMouseDown: (e: MouseEvent) => void;
    private handleMouseUp: (e: MouseEvent) => void;
    private handleMouseMove: (e: MouseEvent) => void;
    private handleWheel: (e: WheelEvent) => void;

    constructor(camera: THREE.PerspectiveCamera | null = null) {
        this.camera = camera;
        this.cameraDistance = CAMERA.DEFAULT_DISTANCE;
        this.cameraAngle = CAMERA.DEFAULT_ANGLE;
        this.cameraRotation = 0;

        // Initialize event handlers
        this.handleMouseDown = (e: MouseEvent) => {
            if (e.button === 1) { // Middle mouse button
                this.mouseDown = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                e.preventDefault();
            }
        };

        this.handleMouseUp = (e: MouseEvent) => {
            if (e.button === 1) {
                this.mouseDown = false;
            }
        };

        this.handleMouseMove = (e: MouseEvent) => {
            if (this.mouseDown) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;

                this.cameraRotation -= deltaX * 0.005;
                this.cameraAngle = Math.max(0.1, Math.min(Math.PI / 2.5, this.cameraAngle + deltaY * 0.005));

                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        };

        this.handleWheel = (e: WheelEvent) => {
            this.cameraDistance = Math.max(
                CAMERA.MIN_DISTANCE,
                Math.min(CAMERA.MAX_DISTANCE, this.cameraDistance + e.deltaY * 0.01)
            );
        };
    }

    /**
     * Set the camera reference (for lazy initialization)
     */
    setCamera(camera: THREE.PerspectiveCamera): void {
        this.camera = camera;
    }

    /**
     * Setup camera mouse controls
     */
    setupControls(): void {
        if (typeof window === 'undefined') return;

        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('wheel', this.handleWheel);
    }

    /**
     * Update camera position based on player position
     */
    updateCamera(playerPosition: THREE.Vector3): void {
        if (!this.camera) return;

        const height = this.cameraDistance * Math.sin(this.cameraAngle);
        const distance = this.cameraDistance * Math.cos(this.cameraAngle);

        this.camera.position.x = playerPosition.x + Math.sin(this.cameraRotation) * distance;
        this.camera.position.y = height;
        this.camera.position.z = playerPosition.z + Math.cos(this.cameraRotation) * distance;

        this.camera.lookAt(playerPosition);
    }

    /**
     * Dispose of resources and remove event listeners
     */
    dispose(): void {
        if (typeof window === 'undefined') return;

        window.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('wheel', this.handleWheel);

        this.camera = null;
    }
}

export default CameraController;
