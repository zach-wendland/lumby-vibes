/**
 * Player - Main player character
 * TypeScript version with full type safety
 */

import * as THREE from 'three';
import { PLAYER_SPEED, SKILLS, COLORS } from '../utils/Constants';
import { XPCalculator } from '../utils/XPCalculator';
import type { SkillName, Skills, SkillData, Equipment, OSRSItem, EquipmentSlot } from '../types/index';

/**
 * Inventory item with count for stacking
 */
interface InventoryItem extends OSRSItem {
    count: number;
}

/**
 * Equipment bonuses from worn items
 */
interface EquipmentBonuses {
    attack: number;
    strength: number;
    defence: number;
}

/**
 * Body parts for animations
 */
interface BodyParts {
    leftLeg: THREE.Mesh;
    rightLeg: THREE.Mesh;
    leftArm: THREE.Mesh;
    rightArm: THREE.Mesh;
}

/**
 * Player class - Main player character entity
 */
export class Player {
    // Identity
    name: string;
    isMember: boolean;

    // Position and movement
    position: THREE.Vector3;
    rotation: number;
    targetPosition: THREE.Vector3 | null;
    isMoving: boolean;
    speed: number;

    // Skills
    skills: Record<SkillName, SkillData>;

    // Current stats
    currentHP: number;
    currentPrayer: number;

    // Equipment
    equipmentBonuses: EquipmentBonuses;
    inventory: (InventoryItem | null)[];
    equipment: Record<EquipmentSlot, OSRSItem | null>;

    // Combat
    inCombat: boolean;
    target: unknown | null;
    lastAttackTime: number;

    // 3D
    mesh: THREE.Group | null;
    bodyParts: BodyParts | null;

    constructor(x: number = 0, z: number = 0) {
        this.name = 'Player';
        this.isMember = false; // F2P by default
        this.position = new THREE.Vector3(x, 0, z);
        this.rotation = 0;
        this.targetPosition = null;
        this.isMoving = false;
        this.speed = PLAYER_SPEED;

        // RuneScape skills
        this.skills = {
            attack: { level: 1, xp: 0 },
            strength: { level: 1, xp: 0 },
            defence: { level: 1, xp: 0 },
            hitpoints: { level: 10, xp: 1154 },
            ranged: { level: 1, xp: 0 },
            prayer: { level: 1, xp: 0 },
            magic: { level: 1, xp: 0 },
            cooking: { level: 1, xp: 0 },
            woodcutting: { level: 1, xp: 0 },
            fishing: { level: 1, xp: 0 },
            firemaking: { level: 1, xp: 0 },
            crafting: { level: 1, xp: 0 },
            smithing: { level: 1, xp: 0 },
            mining: { level: 1, xp: 0 }
        };

        // Current HP
        this.currentHP = this.skills.hitpoints.level;
        this.currentPrayer = this.skills.prayer.level;

        // Equipment bonuses
        this.equipmentBonuses = {
            attack: 0,
            strength: 0,
            defence: 0
        };

        // Inventory (28 slots)
        this.inventory = Array(28).fill(null);

        // Equipment (11 slots)
        this.equipment = {
            head: null,
            cape: null,
            neck: null,
            weapon: null,
            body: null,
            shield: null,
            legs: null,
            hands: null,
            feet: null,
            ring: null,
            ammo: null
        };

        // Combat state
        this.inCombat = false;
        this.target = null;
        this.lastAttackTime = 0;

        // 3D mesh
        this.mesh = null;
        this.bodyParts = null;

        // Create 3D mesh
        this.createMesh();
    }

    /**
     * Create 3D player mesh with PBR materials for 64-bit HDR rendering
     */
    createMesh(): void {
        const group = new THREE.Group();

        // Body (blue tunic) - PBR material
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.6);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.PLAYER_BLUE,
            roughness: 0.8,
            metalness: 0.0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.2;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Head (skin color) - PBR material
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFDBB5,
            roughness: 0.9,
            metalness: 0.0
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.2;
        head.castShadow = true;
        head.receiveShadow = true;
        group.add(head);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 2.25, 0.35);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 2.25, 0.35);
        group.add(rightEye);

        // Legs - PBR material
        const legGeometry = new THREE.BoxGeometry(0.3, 0.9, 0.3);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            roughness: 0.7,
            metalness: 0.0
        });

        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.25, 0.45, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.25, 0.45, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);

        // Arms - PBR material
        const armGeometry = new THREE.BoxGeometry(0.25, 0.9, 0.25);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.PLAYER_BLUE,
            roughness: 0.8,
            metalness: 0.0
        });

        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.55, 1.3, 0);
        leftArm.castShadow = true;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.55, 1.3, 0);
        rightArm.castShadow = true;
        group.add(rightArm);

        // Name tag
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            canvas.width = 256;
            canvas.height = 64;
            context.fillStyle = '#FFFF00';
            context.font = 'Bold 32px Arial';
            context.textAlign = 'center';
            context.fillText('Player', 128, 40);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.y = 3.5;
            sprite.scale.set(2, 0.5, 1);
            group.add(sprite);
        }

        group.position.copy(this.position);
        this.mesh = group;
        this.mesh.userData.entity = this;
        this.mesh.userData.type = 'player';

        // Store references to body parts for animations
        this.bodyParts = {
            leftLeg,
            rightLeg,
            leftArm,
            rightArm
        };
    }

    /**
     * Move to target position
     */
    moveTo(x: number, z: number): void {
        this.targetPosition = new THREE.Vector3(x, 0, z);
        this.isMoving = true;
    }

    /**
     * Stop movement
     */
    stop(): void {
        this.isMoving = false;
        this.targetPosition = null;
    }

    /**
     * Add XP to skill
     * @returns true if level up occurred
     */
    addXP(skill: SkillName, amount: number): boolean {
        if (!this.skills[skill]) return false;

        const oldLevel = this.skills[skill].level;
        this.skills[skill].xp += amount;
        const newLevel = XPCalculator.getLevelFromXP(this.skills[skill].xp);

        if (newLevel > oldLevel) {
            this.skills[skill].level = newLevel;

            // Update HP if hitpoints leveled up
            if (skill === SKILLS.HITPOINTS) {
                this.currentHP = newLevel;
            }

            // Emit level up event
            window.dispatchEvent(new CustomEvent('levelUp', {
                detail: { skill, level: newLevel }
            }));

            return true;
        }

        return false;
    }

    /**
     * Get combat level
     */
    getCombatLevel(): number {
        const skills = {
            attack: this.skills.attack.level,
            strength: this.skills.strength.level,
            defence: this.skills.defence.level,
            hitpoints: this.skills.hitpoints.level,
            ranged: this.skills.ranged.level,
            prayer: this.skills.prayer.level,
            magic: this.skills.magic.level
        };
        return XPCalculator.calculateCombatLevel(skills);
    }

    /**
     * Heal player
     */
    heal(amount: number): void {
        this.currentHP = Math.min(this.currentHP + amount, this.skills.hitpoints.level);
    }

    /**
     * Take damage
     * @returns true if player died
     */
    takeDamage(amount: number): boolean {
        this.currentHP = Math.max(0, this.currentHP - amount);
        return this.currentHP <= 0;
    }

    /**
     * Update player (called every frame)
     */
    update(delta: number): void {
        // Movement
        if (this.isMoving && this.targetPosition) {
            const direction = new THREE.Vector3()
                .subVectors(this.targetPosition, this.position)
                .normalize();

            const distance = this.position.distanceTo(this.targetPosition);

            if (distance < 0.5) {
                this.position.copy(this.targetPosition);
                this.isMoving = false;
                this.targetPosition = null;
            } else {
                this.position.addScaledVector(direction, this.speed * delta);

                // Update rotation to face movement direction
                this.rotation = Math.atan2(direction.x, direction.z);

                // Animate walking
                if (this.bodyParts) {
                    const walkSpeed = 10;
                    const leftLegRotation = Math.sin(Date.now() * 0.01 * walkSpeed) * 0.5;
                    const rightLegRotation = -leftLegRotation;

                    this.bodyParts.leftLeg.rotation.x = leftLegRotation;
                    this.bodyParts.rightLeg.rotation.x = rightLegRotation;
                    this.bodyParts.leftArm.rotation.x = -leftLegRotation * 0.5;
                    this.bodyParts.rightArm.rotation.x = -rightLegRotation * 0.5;
                }
            }
        } else {
            // Reset limb positions
            if (this.bodyParts) {
                this.bodyParts.leftLeg.rotation.x = 0;
                this.bodyParts.rightLeg.rotation.x = 0;
                this.bodyParts.leftArm.rotation.x = 0;
                this.bodyParts.rightArm.rotation.x = 0;
            }
        }

        // Update mesh position and rotation
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.rotation.y = this.rotation;
        }
    }

    /**
     * Add item to inventory
     * @returns true if item was added successfully
     */
    addItem(item: OSRSItem, count: number = 1): boolean {
        // Check if item is stackable and already in inventory
        if (item.stackable) {
            for (let i = 0; i < this.inventory.length; i++) {
                const invItem = this.inventory[i];
                if (invItem && invItem.id === item.id) {
                    invItem.count += count;
                    return true;
                }
            }
        }

        // Find empty slot
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] === null) {
                this.inventory[i] = { ...item, count };
                return true;
            }
        }

        return false; // Inventory full
    }

    /**
     * Remove item from inventory
     * @returns the removed item or null
     */
    removeItem(slot: number): InventoryItem | null {
        if (slot >= 0 && slot < this.inventory.length) {
            const item = this.inventory[slot];
            this.inventory[slot] = null;
            return item;
        }
        return null;
    }

    /**
     * Get inventory count (number of filled slots)
     */
    getInventoryCount(): number {
        return this.inventory.filter(item => item !== null).length;
    }

    /**
     * Check if player has a specific item
     */
    hasItem(itemId: number, quantity: number = 1): boolean {
        let count = 0;
        for (const invItem of this.inventory) {
            if (invItem && invItem.id === itemId) {
                count += invItem.count;
                if (count >= quantity) return true;
            }
        }
        return false;
    }

    /**
     * Get skill level
     */
    getSkillLevel(skill: SkillName): number {
        return this.skills[skill]?.level ?? 1;
    }

    /**
     * Get skill XP
     */
    getSkillXP(skill: SkillName): number {
        return this.skills[skill]?.xp ?? 0;
    }

    /**
     * Check if player is dead
     */
    isDead(): boolean {
        return this.currentHP <= 0;
    }

    /**
     * Respawn player at position
     */
    respawn(x: number = 0, z: number = 0): void {
        this.position.set(x, 0, z);
        this.currentHP = this.skills.hitpoints.level;
        this.currentPrayer = this.skills.prayer.level;
        this.inCombat = false;
        this.target = null;
        this.isMoving = false;
        this.targetPosition = null;
    }
}

export default Player;
