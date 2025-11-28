/**
 * Enemy - Hostile creatures (Chickens, Cows, Goblins, etc.)
 * TypeScript version with full type safety
 */

import * as THREE from 'three';
import { ENEMY_SPEED, ENEMY_TYPES, ITEMS } from '../utils/Constants';
import { ENEMY_DATA } from '../data/EnemyData';
import type { EnemyData, OSRSItem } from '../types/index';
import type { Player } from './Player';

/**
 * Drop table entry
 */
interface DropEntry {
    item: OSRSItem;
    chance: number;
    max?: number;
}

/**
 * Loot result
 */
interface LootItem {
    item: OSRSItem;
    count: number;
}

/**
 * Enemy body parts for animation
 */
interface EnemyBodyParts {
    body?: THREE.Mesh;
    leftLeg?: THREE.Mesh;
    rightLeg?: THREE.Mesh;
}

/**
 * Enemy class - Hostile creatures
 */
export class Enemy {
    // Position and movement
    position: THREE.Vector3;
    startPosition: THREE.Vector3;
    rotation: number;
    speed: number;
    targetPosition: THREE.Vector3 | null;
    isWandering: boolean;

    // Identity
    enemyType: string;
    enemyId: string;
    name: string;
    level: number;
    enemyData: EnemyData | Record<string, unknown>;

    // Health
    maxHP: number;
    currentHP: number;
    xpReward: number;

    // Combat state
    inCombat: boolean;
    target: Player | null;
    lastAttackTime: number;
    isDead: boolean;
    respawnTime: number;
    respawnTimer: number;

    // Behavior
    wanderRadius: number;
    wanderTimer: number;
    wanderCooldown: number;
    aggressive: boolean;
    aggroRange: number;

    // Loot
    dropTable: DropEntry[];

    // 3D
    mesh: THREE.Group | null;
    bodyParts: EnemyBodyParts;
    hpBarBg: THREE.Mesh | null;
    hpBarFill: THREE.Mesh | null;
    nameSprite: THREE.Sprite | null;

    constructor(x: number, z: number, enemyType: string) {
        this.position = new THREE.Vector3(x, 0, z);
        this.startPosition = this.position.clone();
        this.rotation = 0;
        this.enemyType = enemyType;
        this.enemyId = enemyType;

        // Get stats from ENEMY_DATA (fallback to ENEMY_TYPES for compatibility)
        const stats = ENEMY_DATA[enemyType] || ENEMY_TYPES[enemyType] || {};
        this.name = (stats as EnemyData).name || 'Unknown';
        this.level = (stats as EnemyData).level || 1;
        this.maxHP = (stats as EnemyData).hitpoints || (stats as { hp?: number }).hp || 10;
        this.currentHP = this.maxHP;

        // Calculate XP reward
        const enemyStats = stats as EnemyData;
        if (enemyStats.xpRewards) {
            this.xpReward = (
                (enemyStats.xpRewards.attack || 0) +
                (enemyStats.xpRewards.strength || 0) +
                (enemyStats.xpRewards.defence || 0)
            ) / 3;
        } else {
            this.xpReward = (stats as { xp?: number }).xp || 10;
        }

        this.speed = ENEMY_SPEED;
        this.enemyData = stats;

        // Combat state
        this.inCombat = false;
        this.target = null;
        this.lastAttackTime = 0;
        this.isDead = false;
        this.respawnTime = 30;
        this.respawnTimer = 0;

        // Wander behavior
        this.wanderRadius = 15;
        this.wanderTimer = 0;
        this.wanderCooldown = Math.random() * 3 + 2;
        this.targetPosition = null;
        this.isWandering = false;

        // Aggression (from ENEMY_DATA)
        this.aggressive = (stats as EnemyData).aggressive || false;
        this.aggroRange = (stats as EnemyData).aggroRange || 10;

        // Drop table
        this.dropTable = this.getDropTable();

        // 3D
        this.mesh = null;
        this.bodyParts = {};
        this.hpBarBg = null;
        this.hpBarFill = null;
        this.nameSprite = null;

        this.createMesh();
    }

    /**
     * Get drop table for enemy type
     */
    private getDropTable(): DropEntry[] {
        switch (this.enemyType) {
            case 'CHICKEN':
                return [
                    { item: ITEMS.BONES, chance: 1.0 },
                    { item: ITEMS.FEATHER, chance: 0.5, max: 15 },
                    { item: ITEMS.RAW_CHICKEN, chance: 1.0 }
                ];
            case 'COW':
                return [
                    { item: ITEMS.BONES, chance: 1.0 },
                    { item: ITEMS.COWHIDE, chance: 1.0 },
                    { item: ITEMS.RAW_BEEF, chance: 1.0 }
                ];
            case 'GOBLIN_LEVEL_2':
            case 'GOBLIN_LEVEL_5':
                return [
                    { item: ITEMS.BONES, chance: 1.0 },
                    { item: ITEMS.COINS, chance: 0.8, max: 15 }
                ];
            default:
                return [
                    { item: ITEMS.BONES, chance: 1.0 }
                ];
        }
    }

    /**
     * Create 3D enemy mesh
     */
    createMesh(): void {
        const group = new THREE.Group();

        // Use color and size from ENEMY_DATA
        const bodyColor = (this.enemyData as EnemyData).color || 0xFF0000;
        const size = (this.enemyData as EnemyData).size || 0.6;

        // Determine which mesh to create based on enemy type
        if (this.enemyType.includes('CHICKEN')) {
            this.createChickenMesh(group, size);
        } else if (this.enemyType.includes('COW')) {
            this.createCowMesh(group, size);
        } else if (this.enemyType.includes('GOBLIN')) {
            this.createGoblinMesh(group, size);
        } else {
            this.createGenericMesh(group, bodyColor, size);
        }

        // HP bar (above creature)
        this.createHPBar(group);

        // Name tag
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            canvas.width = 256;
            canvas.height = 64;
            context.fillStyle = this.aggressive ? '#FF0000' : '#FFFF00';
            context.font = 'Bold 20px Arial';
            context.textAlign = 'center';
            context.fillText(`${this.name} (${this.level})`, 128, 40);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.y = 2.5;
            sprite.scale.set(2, 0.5, 1);
            group.add(sprite);
            this.nameSprite = sprite;
        }

        group.position.copy(this.position);
        this.mesh = group;
        this.mesh.userData.entity = this;
        this.mesh.userData.type = 'enemy';
        this.mesh.userData.enemyType = this.enemyType;
    }

    /**
     * Create chicken mesh
     */
    private createChickenMesh(group: THREE.Group, size: number): void {
        const bodyGeometry = new THREE.SphereGeometry(size * 0.6, 12, 12);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFCC,
            roughness: 0.9,
            metalness: 0.0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = size * 0.7;
        body.scale.set(1, 1.2, 1);
        body.castShadow = true;
        group.add(body);

        const headGeometry = new THREE.SphereGeometry(size * 0.3, 10, 10);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, size * 1.1, size * 0.4);
        head.castShadow = true;
        group.add(head);

        const beakGeometry = new THREE.ConeGeometry(size * 0.1, size * 0.2, 8);
        const beakMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF6347,
            roughness: 0.6,
            metalness: 0.0
        });
        const beak = new THREE.Mesh(beakGeometry, beakMaterial);
        beak.position.set(0, size * 1.0, size * 0.65);
        beak.rotation.x = Math.PI / 2;
        group.add(beak);

        this.bodyParts = { body };
    }

    /**
     * Create cow mesh
     */
    private createCowMesh(group: THREE.Group, size: number): void {
        const bodyGeometry = new THREE.BoxGeometry(size * 1.2, size * 0.8, size * 0.8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xA0826D,
            roughness: 0.8,
            metalness: 0.0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = size * 0.8;
        body.castShadow = true;
        group.add(body);

        const headGeometry = new THREE.BoxGeometry(size * 0.6, size * 0.5, size * 0.5);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, size * 0.9, size * 0.9);
        head.castShadow = true;
        group.add(head);

        const legGeometry = new THREE.CylinderGeometry(size * 0.15, size * 0.15, size * 0.6, 8);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            roughness: 0.7,
            metalness: 0.0
        });

        const positions: [number, number, number][] = [
            [-size * 0.4, size * 0.3, -size * 0.3],
            [size * 0.4, size * 0.3, -size * 0.3],
            [-size * 0.4, size * 0.3, size * 0.3],
            [size * 0.4, size * 0.3, size * 0.3]
        ];

        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            group.add(leg);
        });

        this.bodyParts = { body };
    }

    /**
     * Create goblin mesh
     */
    private createGoblinMesh(group: THREE.Group, size: number): void {
        const bodyGeometry = new THREE.BoxGeometry(size * 0.7, size, size * 0.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x6B8E23,
            roughness: 0.7,
            metalness: 0.0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = size * 1.0;
        body.castShadow = true;
        group.add(body);

        const headGeometry = new THREE.SphereGeometry(size * 0.35, 12, 12);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0x8FBC8F,
            roughness: 0.8,
            metalness: 0.0
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = size * 1.8;
        head.castShadow = true;
        group.add(head);

        const eyeGeometry = new THREE.SphereGeometry(size * 0.08, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-size * 0.15, size * 1.85, size * 0.3);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(size * 0.15, size * 1.85, size * 0.3);
        group.add(rightEye);

        const legGeometry = new THREE.BoxGeometry(size * 0.25, size * 0.8, size * 0.25);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x6B8E23 });

        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-size * 0.2, size * 0.4, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(size * 0.2, size * 0.4, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);

        this.bodyParts = { leftLeg, rightLeg, body };
    }

    /**
     * Create generic mesh
     */
    private createGenericMesh(group: THREE.Group, color: number, size: number): void {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.0
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = size / 2;
        mesh.castShadow = true;
        group.add(mesh);
        this.bodyParts = { body: mesh };
    }

    /**
     * Create HP bar
     */
    private createHPBar(group: THREE.Group): void {
        const bgGeometry = new THREE.PlaneGeometry(1.5, 0.2);
        const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x8B0000 });
        const bgBar = new THREE.Mesh(bgGeometry, bgMaterial);
        bgBar.position.y = 2.2;
        group.add(bgBar);

        const fillGeometry = new THREE.PlaneGeometry(1.5, 0.2);
        const fillMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
        const fillBar = new THREE.Mesh(fillGeometry, fillMaterial);
        fillBar.position.set(0, 2.21, 0.01);
        group.add(fillBar);

        this.hpBarBg = bgBar;
        this.hpBarFill = fillBar;
    }

    /**
     * Update HP bar
     */
    updateHPBar(): void {
        if (!this.hpBarFill) return;

        const hpPercent = this.currentHP / this.maxHP;
        this.hpBarFill.scale.x = hpPercent;
        this.hpBarFill.position.x = -(1.5 * (1 - hpPercent)) / 2;

        const material = this.hpBarFill.material as THREE.MeshBasicMaterial;
        if (hpPercent > 0.5) {
            material.color.setHex(0x00FF00);
        } else if (hpPercent > 0.25) {
            material.color.setHex(0xFFFF00);
        } else {
            material.color.setHex(0xFF0000);
        }
    }

    /**
     * Take damage
     * @returns true if enemy died
     */
    takeDamage(amount: number): boolean {
        this.currentHP = Math.max(0, this.currentHP - amount);
        this.updateHPBar();

        if (this.currentHP <= 0) {
            this.die();
            return true;
        }
        return false;
    }

    /**
     * Die and start respawn timer
     */
    die(): LootItem[] {
        this.isDead = true;
        this.inCombat = false;
        this.target = null;
        this.respawnTimer = this.respawnTime;

        if (this.mesh) {
            this.mesh.visible = false;
        }

        return this.generateLoot();
    }

    /**
     * Generate loot drops
     */
    generateLoot(): LootItem[] {
        const loot: LootItem[] = [];
        for (const drop of this.dropTable) {
            if (Math.random() < drop.chance) {
                const count = drop.max ? Math.floor(Math.random() * drop.max) + 1 : 1;
                loot.push({ item: drop.item, count });
            }
        }
        return loot;
    }

    /**
     * Respawn enemy
     */
    respawn(): void {
        this.isDead = false;
        this.currentHP = this.maxHP;
        this.position.copy(this.startPosition);
        this.updateHPBar();

        if (this.mesh) {
            this.mesh.visible = true;
            this.mesh.position.copy(this.position);
        }
    }

    /**
     * Update enemy (called every frame)
     */
    update(delta: number, player?: Player): void {
        // Respawn logic
        if (this.isDead) {
            this.respawnTimer -= delta;
            if (this.respawnTimer <= 0) {
                this.respawn();
            }
            return;
        }

        // Aggression check
        if (this.aggressive && player && !this.inCombat) {
            const distance = this.position.distanceTo(player.position);
            if (distance < this.aggroRange) {
                this.target = player;
                this.inCombat = true;
            }
        }

        // Combat movement
        if (this.inCombat && this.target) {
            const direction = new THREE.Vector3()
                .subVectors(this.target.position, this.position)
                .normalize();

            const distance = this.position.distanceTo(this.target.position);

            if (distance > 1.5) {
                this.position.addScaledVector(direction, this.speed * delta);
                this.rotation = Math.atan2(direction.x, direction.z);

                if (this.bodyParts.leftLeg && this.bodyParts.rightLeg) {
                    const walkSpeed = 10;
                    const leftLegRotation = Math.sin(Date.now() * 0.01 * walkSpeed) * 0.4;
                    this.bodyParts.leftLeg.rotation.x = leftLegRotation;
                    this.bodyParts.rightLeg.rotation.x = -leftLegRotation;
                }
            } else if (distance > 20) {
                this.inCombat = false;
                this.target = null;
            }
        } else {
            // Wander behavior
            this.wanderTimer += delta;

            if (this.wanderTimer >= this.wanderCooldown) {
                const angle = Math.random() * Math.PI * 2;
                const wanderDistance = Math.random() * this.wanderRadius;
                const targetX = this.startPosition.x + Math.cos(angle) * wanderDistance;
                const targetZ = this.startPosition.z + Math.sin(angle) * wanderDistance;

                this.targetPosition = new THREE.Vector3(targetX, 0, targetZ);
                this.isWandering = true;
                this.wanderTimer = 0;
                this.wanderCooldown = Math.random() * 3 + 2;
            }

            if (this.isWandering && this.targetPosition) {
                const direction = new THREE.Vector3()
                    .subVectors(this.targetPosition, this.position)
                    .normalize();

                const distance = this.position.distanceTo(this.targetPosition);

                if (distance < 0.3) {
                    this.isWandering = false;
                    this.targetPosition = null;

                    if (this.bodyParts.leftLeg && this.bodyParts.rightLeg) {
                        this.bodyParts.leftLeg.rotation.x = 0;
                        this.bodyParts.rightLeg.rotation.x = 0;
                    }
                } else {
                    this.position.addScaledVector(direction, (this.speed * 0.5) * delta);
                    this.rotation = Math.atan2(direction.x, direction.z);

                    if (this.bodyParts.leftLeg && this.bodyParts.rightLeg) {
                        const walkSpeed = 8;
                        const leftLegRotation = Math.sin(Date.now() * 0.01 * walkSpeed) * 0.3;
                        this.bodyParts.leftLeg.rotation.x = leftLegRotation;
                        this.bodyParts.rightLeg.rotation.x = -leftLegRotation;
                    }
                }
            }
        }

        // Update mesh position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.rotation.y = this.rotation;

            // Make HP bar and name face camera
            const gameCamera = (window as unknown as { gameCamera?: THREE.Camera }).gameCamera;
            if (gameCamera) {
                if (this.hpBarBg && this.hpBarFill) {
                    this.hpBarBg.lookAt(gameCamera.position);
                    this.hpBarFill.lookAt(gameCamera.position);
                }
                if (this.nameSprite) {
                    this.nameSprite.lookAt(gameCamera.position);
                }
            }
        }
    }

    /**
     * Check if enemy is alive
     */
    isAlive(): boolean {
        return !this.isDead && this.currentHP > 0;
    }

    /**
     * Start combat with target
     */
    startCombat(target: Player): void {
        this.inCombat = true;
        this.target = target;
    }

    /**
     * Stop combat
     */
    stopCombat(): void {
        this.inCombat = false;
        this.target = null;
    }
}

export default Enemy;
