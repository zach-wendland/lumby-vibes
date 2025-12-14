/**
 * TutorialSystem - Guides new players through game basics
 */

import type { Player } from '../entities/Player';

/**
 * Tutorial step definition
 */
interface TutorialStep {
    id: string;
    title: string;
    message: string;
    hint: string;
    condition: (context: TutorialContext) => boolean;
    onComplete?: (context: TutorialContext) => void;
}

/**
 * Context passed to tutorial conditions
 */
export interface TutorialContext {
    player: Player;
    hasMoved: boolean;
    hasRotatedCamera: boolean;
    hasZoomedCamera: boolean;
    hasAttackedEnemy: boolean;
    hasKilledEnemy: boolean;
    hasTalkedToNPC: boolean;
    hasGatheredResource: boolean;
    hasOpenedInventory: boolean;
}

/**
 * Tutorial progress state
 */
export interface TutorialProgress {
    completed: boolean;
    currentStepIndex: number;
    stepsCompleted: string[];
}

/**
 * TutorialSystem class
 */
export class TutorialSystem {
    private steps: TutorialStep[];
    private currentStepIndex: number;
    private context: TutorialContext;
    private isActive: boolean;
    private onStepChange: ((step: TutorialStep | null) => void) | null;
    private onComplete: (() => void) | null;

    constructor(player: Player) {
        this.currentStepIndex = 0;
        this.isActive = true;
        this.onStepChange = null;
        this.onComplete = null;

        // Initialize tracking context
        this.context = {
            player,
            hasMoved: false,
            hasRotatedCamera: false,
            hasZoomedCamera: false,
            hasAttackedEnemy: false,
            hasKilledEnemy: false,
            hasTalkedToNPC: false,
            hasGatheredResource: false,
            hasOpenedInventory: false
        };

        // Define tutorial steps
        this.steps = [
            {
                id: 'welcome',
                title: 'Welcome to Lumbridge!',
                message: 'This tutorial will teach you the basics of the game.',
                hint: 'Press any movement key to continue (WASD or Arrow keys)',
                condition: (ctx) => ctx.hasMoved
            },
            {
                id: 'movement',
                title: 'Movement',
                message: 'You can move using WASD or Arrow keys. You can also click on the ground to walk there.',
                hint: 'Try moving around the area',
                condition: (ctx) => ctx.hasMoved
            },
            {
                id: 'camera',
                title: 'Camera Controls',
                message: 'Hold middle mouse button and drag to rotate the camera. Use scroll wheel to zoom.',
                hint: 'Rotate the camera or zoom in/out',
                condition: (ctx) => ctx.hasRotatedCamera || ctx.hasZoomedCamera
            },
            {
                id: 'combat',
                title: 'Combat',
                message: 'Click on an enemy to attack it. Look for chickens or goblins nearby.',
                hint: 'Find and attack an enemy (yellow/red names)',
                condition: (ctx) => ctx.hasAttackedEnemy
            },
            {
                id: 'kill',
                title: 'Defeat an Enemy',
                message: 'Keep attacking until the enemy is defeated. You\'ll earn XP and possibly loot!',
                hint: 'Defeat an enemy to continue',
                condition: (ctx) => ctx.hasKilledEnemy
            },
            {
                id: 'npc',
                title: 'Talk to NPCs',
                message: 'NPCs have yellow names. Click on them to talk and get information or quests.',
                hint: 'Find an NPC and talk to them',
                condition: (ctx) => ctx.hasTalkedToNPC
            },
            {
                id: 'gathering',
                title: 'Gathering Skills',
                message: 'You can gather resources like trees (woodcutting) and rocks (mining). Click on them to start.',
                hint: 'Gather from a tree or rock',
                condition: (ctx) => ctx.hasGatheredResource
            },
            {
                id: 'inventory',
                title: 'Inventory',
                message: 'Click the "Inventory" tab to see your items. You have 28 slots.',
                hint: 'Open your inventory tab',
                condition: (ctx) => ctx.hasOpenedInventory
            },
            {
                id: 'complete',
                title: 'Tutorial Complete!',
                message: 'You\'ve learned the basics! Explore Lumbridge, complete quests, and train your skills.',
                hint: 'Good luck on your adventure!',
                condition: () => true // Auto-complete
            }
        ];
    }

    /**
     * Get current tutorial step
     */
    getCurrentStep(): TutorialStep | null {
        if (!this.isActive || this.currentStepIndex >= this.steps.length) {
            return null;
        }
        return this.steps[this.currentStepIndex];
    }

    /**
     * Check if tutorial is active
     */
    isRunning(): boolean {
        return this.isActive;
    }

    /**
     * Check if tutorial is completed
     */
    isCompleted(): boolean {
        return this.currentStepIndex >= this.steps.length;
    }

    /**
     * Skip the tutorial
     */
    skip(): void {
        this.isActive = false;
        this.currentStepIndex = this.steps.length;
        this.onStepChange?.(null);
        this.onComplete?.();
    }

    /**
     * Set callback for step changes
     */
    setOnStepChange(callback: (step: TutorialStep | null) => void): void {
        this.onStepChange = callback;
        // Immediately call with current step
        callback(this.getCurrentStep());
    }

    /**
     * Set callback for tutorial completion
     */
    setOnComplete(callback: () => void): void {
        this.onComplete = callback;
    }

    /**
     * Track player movement
     */
    trackMovement(): void {
        if (!this.context.hasMoved) {
            this.context.hasMoved = true;
            this.checkCurrentStep();
        }
    }

    /**
     * Track camera rotation
     */
    trackCameraRotate(): void {
        if (!this.context.hasRotatedCamera) {
            this.context.hasRotatedCamera = true;
            this.checkCurrentStep();
        }
    }

    /**
     * Track camera zoom
     */
    trackCameraZoom(): void {
        if (!this.context.hasZoomedCamera) {
            this.context.hasZoomedCamera = true;
            this.checkCurrentStep();
        }
    }

    /**
     * Track enemy attack
     */
    trackAttack(): void {
        if (!this.context.hasAttackedEnemy) {
            this.context.hasAttackedEnemy = true;
            this.checkCurrentStep();
        }
    }

    /**
     * Track enemy kill
     */
    trackKill(): void {
        if (!this.context.hasKilledEnemy) {
            this.context.hasKilledEnemy = true;
            this.checkCurrentStep();
        }
    }

    /**
     * Track NPC conversation
     */
    trackNPCTalk(): void {
        if (!this.context.hasTalkedToNPC) {
            this.context.hasTalkedToNPC = true;
            this.checkCurrentStep();
        }
    }

    /**
     * Track resource gathering
     */
    trackGathering(): void {
        if (!this.context.hasGatheredResource) {
            this.context.hasGatheredResource = true;
            this.checkCurrentStep();
        }
    }

    /**
     * Track inventory open
     */
    trackInventoryOpen(): void {
        if (!this.context.hasOpenedInventory) {
            this.context.hasOpenedInventory = true;
            this.checkCurrentStep();
        }
    }

    /**
     * Check if current step is complete and advance if so
     */
    private checkCurrentStep(): void {
        if (!this.isActive) return;

        const currentStep = this.getCurrentStep();
        if (!currentStep) return;

        if (currentStep.condition(this.context)) {
            currentStep.onComplete?.(this.context);
            this.advanceStep();
        }
    }

    /**
     * Advance to next step
     */
    private advanceStep(): void {
        this.currentStepIndex++;

        if (this.currentStepIndex >= this.steps.length) {
            this.isActive = false;
            this.onStepChange?.(null);
            this.onComplete?.();
        } else {
            const newStep = this.getCurrentStep();
            this.onStepChange?.(newStep);

            // Auto-advance if next step is already complete
            if (newStep && newStep.condition(this.context)) {
                setTimeout(() => this.advanceStep(), 1500);
            }
        }
    }

    /**
     * Get progress for saving
     */
    getProgress(): TutorialProgress {
        return {
            completed: this.isCompleted(),
            currentStepIndex: this.currentStepIndex,
            stepsCompleted: this.steps
                .slice(0, this.currentStepIndex)
                .map(s => s.id)
        };
    }

    /**
     * Load progress from save
     */
    loadProgress(progress: TutorialProgress): void {
        if (progress.completed) {
            this.skip();
        } else {
            this.currentStepIndex = progress.currentStepIndex;
            // Restore context flags based on completed steps
            for (const stepId of progress.stepsCompleted) {
                switch (stepId) {
                    case 'welcome':
                    case 'movement':
                        this.context.hasMoved = true;
                        break;
                    case 'camera':
                        this.context.hasRotatedCamera = true;
                        break;
                    case 'combat':
                        this.context.hasAttackedEnemy = true;
                        break;
                    case 'kill':
                        this.context.hasKilledEnemy = true;
                        break;
                    case 'npc':
                        this.context.hasTalkedToNPC = true;
                        break;
                    case 'gathering':
                        this.context.hasGatheredResource = true;
                        break;
                    case 'inventory':
                        this.context.hasOpenedInventory = true;
                        break;
                }
            }
            this.onStepChange?.(this.getCurrentStep());
        }
    }

    /**
     * Dispose
     */
    dispose(): void {
        this.onStepChange = null;
        this.onComplete = null;
    }
}

export default TutorialSystem;
