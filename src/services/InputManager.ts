/**
 * InputManager - Handles keyboard input and player movement
 * Extracted from GameLogic to reduce god object complexity
 */

import type { Player } from '../entities/Player';
import type { CombatSystem } from '../systems/CombatSystem';

/**
 * Input Manager interface for dependency injection
 */
export interface IInputManager {
    readonly keys: Record<string, boolean>;
    setupControls(): void;
    handleMovement(delta: number, player: Player, combatSystem: CombatSystem | null): void;
    dispose(): void;
}

/**
 * InputManager class - Handles keyboard input
 */
export class InputManager implements IInputManager {
    private _keys: Record<string, boolean> = {};

    // Event handler references for cleanup
    private handleKeyDown: (e: KeyboardEvent) => void;
    private handleKeyUp: (e: KeyboardEvent) => void;

    constructor() {
        // Initialize event handlers
        this.handleKeyDown = (e: KeyboardEvent) => {
            this._keys[e.code] = true;
        };

        this.handleKeyUp = (e: KeyboardEvent) => {
            this._keys[e.code] = false;
        };
    }

    /**
     * Get current key states (readonly)
     */
    get keys(): Record<string, boolean> {
        return this._keys;
    }

    /**
     * Setup keyboard controls
     */
    setupControls(): void {
        if (typeof window === 'undefined') return;

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    /**
     * Handle player movement from keyboard input
     */
    handleMovement(delta: number, player: Player, combatSystem: CombatSystem | null): void {
        if (!player) return;

        let dx = 0;
        let dz = 0;

        if (this._keys['KeyW'] || this._keys['ArrowUp']) dz -= 1;
        if (this._keys['KeyS'] || this._keys['ArrowDown']) dz += 1;
        if (this._keys['KeyA'] || this._keys['ArrowLeft']) dx -= 1;
        if (this._keys['KeyD'] || this._keys['ArrowRight']) dx += 1;

        if (dx !== 0 || dz !== 0) {
            // Normalize diagonal movement
            const length = Math.sqrt(dx * dx + dz * dz);
            dx /= length;
            dz /= length;

            // Move player
            const newX = player.position.x + dx * player.speed * delta;
            const newZ = player.position.z + dz * player.speed * delta;

            // Bounds check
            const bound = 140;
            if (Math.abs(newX) < bound && Math.abs(newZ) < bound) {
                player.position.x = newX;
                player.position.z = newZ;
                player.rotation = Math.atan2(dx, dz);

                // Stop combat when moving manually
                if (player.inCombat && player.target && combatSystem) {
                    combatSystem.stopCombat();
                }
            }
        }
    }

    /**
     * Dispose of resources and remove event listeners
     */
    dispose(): void {
        if (typeof window === 'undefined') return;

        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);

        this._keys = {};
    }
}

export default InputManager;
