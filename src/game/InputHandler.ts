/**
 * InputHandler - Handles keyboard and mouse input
 * Extracted from GameLogic for better separation of concerns
 */

import type { Player } from '../entities/Player';
import type { CombatSystem } from '../systems/CombatSystem';

/**
 * Key state map
 */
export type KeyState = Record<string, boolean>;

/**
 * Input handler configuration
 */
export interface InputHandlerConfig {
    getPlayer: () => Player | null;
    getCombatSystem: () => CombatSystem | null;
    onCameraRotate: (deltaX: number, deltaY: number) => void;
    onCameraZoom: (delta: number) => void;
    onMovement?: () => void;
}

/**
 * InputHandler class - Manages all input events
 */
export class InputHandler {
    private keys: KeyState;
    private mouseDown: boolean;
    private lastMouseX: number;
    private lastMouseY: number;
    private config: InputHandlerConfig;

    // Bound event handlers for cleanup
    private boundKeyDown: (e: KeyboardEvent) => void;
    private boundKeyUp: (e: KeyboardEvent) => void;
    private boundMouseDown: (e: MouseEvent) => void;
    private boundMouseUp: (e: MouseEvent) => void;
    private boundMouseMove: (e: MouseEvent) => void;
    private boundWheel: (e: WheelEvent) => void;

    constructor(config: InputHandlerConfig) {
        this.keys = {};
        this.mouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.config = config;

        // Bind event handlers
        this.boundKeyDown = this.handleKeyDown.bind(this);
        this.boundKeyUp = this.handleKeyUp.bind(this);
        this.boundMouseDown = this.handleMouseDown.bind(this);
        this.boundMouseUp = this.handleMouseUp.bind(this);
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundWheel = this.handleWheel.bind(this);
    }

    /**
     * Setup all event listeners
     */
    setup(): void {
        window.addEventListener('keydown', this.boundKeyDown);
        window.addEventListener('keyup', this.boundKeyUp);
        window.addEventListener('mousedown', this.boundMouseDown);
        window.addEventListener('mouseup', this.boundMouseUp);
        window.addEventListener('mousemove', this.boundMouseMove);
        window.addEventListener('wheel', this.boundWheel);
    }

    /**
     * Get current key state
     */
    getKeys(): KeyState {
        return this.keys;
    }

    /**
     * Check if a specific key is pressed
     */
    isKeyPressed(code: string): boolean {
        return this.keys[code] === true;
    }

    /**
     * Handle keyboard movement
     */
    handleMovement(delta: number): void {
        const player = this.config.getPlayer();
        const combatSystem = this.config.getCombatSystem();
        if (!player || !combatSystem) return;

        let dx = 0;
        let dz = 0;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) dz -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dz += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

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
            if (newX > -bound && newX < bound && newZ > -bound && newZ < bound) {
                player.position.x = newX;
                player.position.z = newZ;
                player.rotation = Math.atan2(dx, dz);

                // Stop combat when moving manually
                if (player.inCombat && player.target) {
                    combatSystem.stopCombat();
                }

                // Notify movement for tutorial tracking
                this.config.onMovement?.();
            }
        }
    }

    private handleKeyDown(e: KeyboardEvent): void {
        this.keys[e.code] = true;
    }

    private handleKeyUp(e: KeyboardEvent): void {
        this.keys[e.code] = false;
    }

    private handleMouseDown(e: MouseEvent): void {
        if (e.button === 1) { // Middle mouse button
            this.mouseDown = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            e.preventDefault();
        }
    }

    private handleMouseUp(e: MouseEvent): void {
        if (e.button === 1) {
            this.mouseDown = false;
        }
    }

    private handleMouseMove(e: MouseEvent): void {
        if (this.mouseDown) {
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;

            this.config.onCameraRotate(deltaX, deltaY);

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        }
    }

    private handleWheel(e: WheelEvent): void {
        this.config.onCameraZoom(e.deltaY);
    }

    /**
     * Dispose of input handler and remove event listeners
     */
    dispose(): void {
        window.removeEventListener('keydown', this.boundKeyDown);
        window.removeEventListener('keyup', this.boundKeyUp);
        window.removeEventListener('mousedown', this.boundMouseDown);
        window.removeEventListener('mouseup', this.boundMouseUp);
        window.removeEventListener('mousemove', this.boundMouseMove);
        window.removeEventListener('wheel', this.boundWheel);
        this.keys = {};
        this.mouseDown = false;
    }
}

export default InputHandler;
