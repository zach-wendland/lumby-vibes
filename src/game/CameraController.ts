/**
 * CameraController - Handles camera positioning and movement
 * Extracted from GameLogic for better separation of concerns
 */

import * as THREE from 'three';
import { CAMERA } from '../utils/Constants';
import type { Player } from '../entities/Player';

/**
 * Camera controller configuration
 */
export interface CameraControllerConfig {
    camera: THREE.PerspectiveCamera;
    getPlayer: () => Player | null;
}

/**
 * CameraController class - Manages camera behavior
 */
export class CameraController {
    private camera: THREE.PerspectiveCamera;
    private getPlayer: () => Player | null;

    private distance: number;
    private angle: number;
    private rotation: number;

    constructor(config: CameraControllerConfig) {
        this.camera = config.camera;
        this.getPlayer = config.getPlayer;

        this.distance = CAMERA.DEFAULT_DISTANCE;
        this.angle = CAMERA.DEFAULT_ANGLE;
        this.rotation = 0;
    }

    /**
     * Get the camera instance
     */
    getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    /**
     * Get current camera distance
     */
    getDistance(): number {
        return this.distance;
    }

    /**
     * Get current camera angle
     */
    getAngle(): number {
        return this.angle;
    }

    /**
     * Get current camera rotation
     */
    getRotation(): number {
        return this.rotation;
    }

    /**
     * Handle camera rotation from mouse drag
     */
    rotate(deltaX: number, deltaY: number): void {
        this.rotation -= deltaX * 0.005;
        this.angle = Math.max(0.1, Math.min(Math.PI / 2.5, this.angle + deltaY * 0.005));
        this.update();
    }

    /**
     * Handle camera zoom from mouse wheel
     */
    zoom(delta: number): void {
        this.distance = Math.max(
            CAMERA.MIN_DISTANCE,
            Math.min(CAMERA.MAX_DISTANCE, this.distance + delta * 0.01)
        );
        this.update();
    }

    /**
     * Update camera position to follow player
     */
    update(): void {
        const player = this.getPlayer();
        if (!player) return;

        const height = this.distance * Math.sin(this.angle);
        const horizontalDistance = this.distance * Math.cos(this.angle);

        this.camera.position.x = player.position.x + Math.sin(this.rotation) * horizontalDistance;
        this.camera.position.y = height;
        this.camera.position.z = player.position.z + Math.cos(this.rotation) * horizontalDistance;

        this.camera.lookAt(player.position);
    }

    /**
     * Reset camera to default position
     */
    reset(): void {
        this.distance = CAMERA.DEFAULT_DISTANCE;
        this.angle = CAMERA.DEFAULT_ANGLE;
        this.rotation = 0;
        this.update();
    }

    /**
     * Set camera distance directly
     */
    setDistance(distance: number): void {
        this.distance = Math.max(CAMERA.MIN_DISTANCE, Math.min(CAMERA.MAX_DISTANCE, distance));
        this.update();
    }

    /**
     * Set camera angle directly
     */
    setAngle(angle: number): void {
        this.angle = Math.max(0.1, Math.min(Math.PI / 2.5, angle));
        this.update();
    }

    /**
     * Set camera rotation directly
     */
    setRotation(rotation: number): void {
        this.rotation = rotation;
        this.update();
    }
}

export default CameraController;
