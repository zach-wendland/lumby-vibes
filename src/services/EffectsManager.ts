/**
 * EffectsManager - Handles visual effects like damage splashes
 * Extracted from GameLogic to reduce god object complexity
 */

import * as THREE from 'three';

/**
 * Damage splash interface
 */
interface DamageSplash {
    sprite: THREE.Sprite;
    startY: number;
    startTime: number;
    duration: number;
}

/**
 * Effects Manager interface for dependency injection
 */
export interface IEffectsManager {
    createDamageSplash(position: THREE.Vector3, damage: number): void;
    update(delta: number): void;
    dispose(): void;
}

/**
 * EffectsManager class - Handles visual effects
 */
export class EffectsManager implements IEffectsManager {
    private scene: THREE.Scene | null;
    private damageSplashes: DamageSplash[];

    constructor(scene: THREE.Scene | null = null) {
        this.scene = scene;
        this.damageSplashes = [];
    }

    /**
     * Set the scene reference (for lazy initialization)
     */
    setScene(scene: THREE.Scene): void {
        this.scene = scene;
    }

    /**
     * Create damage splash effect
     */
    createDamageSplash(position: THREE.Vector3, damage: number): void {
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
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.position.y += 3;
        sprite.scale.set(2, 1, 1);

        if (this.scene) {
            this.scene.add(sprite);
        }

        // Animate and remove
        const startY = sprite.position.y;
        const startTime = Date.now();

        this.damageSplashes.push({
            sprite,
            startY,
            startTime,
            duration: 1500
        });
    }

    /**
     * Update damage splashes (call every frame)
     */
    update(_delta: number): void {
        const now = Date.now();

        for (let i = this.damageSplashes.length - 1; i >= 0; i--) {
            const splash = this.damageSplashes[i];
            const elapsed = now - splash.startTime;

            if (elapsed >= splash.duration) {
                if (this.scene) {
                    this.scene.remove(splash.sprite);
                }
                // Dispose texture and material to prevent memory leaks
                if (splash.sprite.material.map) {
                    splash.sprite.material.map.dispose();
                }
                splash.sprite.material.dispose();
                this.damageSplashes.splice(i, 1);
            } else {
                const progress = elapsed / splash.duration;
                splash.sprite.position.y = splash.startY + progress * 2;
                splash.sprite.material.opacity = 1 - progress;
            }
        }
    }

    /**
     * Dispose of all resources
     */
    dispose(): void {
        // Clean up all remaining damage splashes
        for (const splash of this.damageSplashes) {
            if (this.scene) {
                this.scene.remove(splash.sprite);
            }
            if (splash.sprite.material.map) {
                splash.sprite.material.map.dispose();
            }
            splash.sprite.material.dispose();
        }
        this.damageSplashes = [];
        this.scene = null;
    }
}

export default EffectsManager;
