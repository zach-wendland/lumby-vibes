/**
 * DamageSplashManager - Handles floating damage number effects
 * Extracted from GameLogic for better separation of concerns
 */

import * as THREE from 'three';

/**
 * Damage splash data
 */
interface DamageSplash {
    sprite: THREE.Sprite;
    startY: number;
    startTime: number;
    duration: number;
}

/**
 * DamageSplashManager class - Manages damage number effects
 */
export class DamageSplashManager {
    private splashes: DamageSplash[];
    private scene: THREE.Scene | null;

    constructor() {
        this.splashes = [];
        this.scene = null;
    }

    /**
     * Set the scene reference
     */
    setScene(scene: THREE.Scene): void {
        this.scene = scene;
    }

    /**
     * Create a damage splash effect at position
     */
    create(position: THREE.Vector3, damage: number): void {
        if (!this.scene) return;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = 128;
        canvas.height = 64;

        const color = damage === 0 ? '#0099FF' : '#FF0000';
        const text = damage === 0 ? 'Miss' : damage.toString();

        context.fillStyle = color;
        context.font = 'Bold 32px Arial';
        context.textAlign = 'center';
        context.fillText(text, 64, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.position.y += 3;
        sprite.scale.set(2, 1, 1);

        this.scene.add(sprite);

        this.splashes.push({
            sprite,
            startY: sprite.position.y,
            startTime: Date.now(),
            duration: 1500
        });
    }

    /**
     * Update all damage splashes (call every frame)
     */
    update(): void {
        const now = Date.now();

        for (let i = this.splashes.length - 1; i >= 0; i--) {
            const splash = this.splashes[i];
            const elapsed = now - splash.startTime;

            if (elapsed >= splash.duration) {
                this.removeSplash(i);
            } else {
                const progress = elapsed / splash.duration;
                splash.sprite.position.y = splash.startY + progress * 2;
                splash.sprite.material.opacity = 1 - progress;
            }
        }
    }

    /**
     * Remove a splash by index
     */
    private removeSplash(index: number): void {
        const splash = this.splashes[index];

        if (this.scene) {
            this.scene.remove(splash.sprite);
        }

        // Dispose texture and material to prevent memory leaks
        if (splash.sprite.material.map) {
            splash.sprite.material.map.dispose();
        }
        splash.sprite.material.dispose();

        this.splashes.splice(index, 1);
    }

    /**
     * Get count of active splashes
     */
    getCount(): number {
        return this.splashes.length;
    }

    /**
     * Dispose of all splashes and cleanup
     */
    dispose(): void {
        // Remove all splashes
        for (let i = this.splashes.length - 1; i >= 0; i--) {
            this.removeSplash(i);
        }
        this.splashes = [];
        this.scene = null;
    }
}

export default DamageSplashManager;
