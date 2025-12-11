/**
 * NPC - Non-player characters in Lumbridge
 * TypeScript version with full type safety
 */

import * as THREE from 'three';
import { NPC_SPEED, NPC_TYPES, COLORS } from '../utils/Constants';
import { NPC_DATA } from '../data/NPCData';
import type { NPCData, NPCDialogue } from '../types/index';

/**
 * NPC body parts for animation
 */
interface NPCBodyParts {
    leftLeg: THREE.Mesh;
    rightLeg: THREE.Mesh;
}

/**
 * NPC class - Non-player characters
 */
export class NPC {
    // Position and movement
    position: THREE.Vector3;
    startPosition: THREE.Vector3;
    rotation: number;
    speed: number;
    targetPosition: THREE.Vector3 | null;
    isWandering: boolean;

    // Identity
    type: string;
    name: string;
    npcId: string;
    npcData: NPCData | null;

    // Behavior
    wanderRadius: number;
    roaming: boolean;
    wanderTimer: number;
    wanderCooldown: number;

    // Dialogue
    dialogues: string[];
    currentDialogue: number;

    // State
    questGiver: boolean;
    shopkeeper: boolean;

    // 3D
    mesh: THREE.Group | null;
    bodyParts: NPCBodyParts | null;

    constructor(x: number, z: number, npcType: string, name?: string) {
        this.position = new THREE.Vector3(x, 0, z);
        this.startPosition = this.position.clone();
        this.rotation = 0;
        this.type = npcType;
        this.name = name || npcType;
        this.speed = NPC_SPEED;

        // Store NPC data if available
        this.npcData = NPC_DATA[npcType] || null;
        this.npcId = npcType;

        // Wander behavior (use data from NPC_DATA if available)
        this.wanderRadius = this.npcData?.wanderRadius ?? 10;
        this.roaming = this.npcData?.roaming !== false;
        this.wanderTimer = 0;
        this.wanderCooldown = Math.random() * 5 + 3; // 3-8 seconds
        this.targetPosition = null;
        this.isWandering = false;

        // Dialogue
        this.dialogues = this.getDialogues();
        this.currentDialogue = 0;

        // Quest state (from NPC_DATA if available)
        this.questGiver = this.npcData?.questGiver
            ? Array.isArray(this.npcData.questGiver) && this.npcData.questGiver.length > 0
            : false;
        this.shopkeeper = typeof this.npcData?.shop === 'string';

        // 3D
        this.mesh = null;
        this.bodyParts = null;

        this.setupNPCType();
        this.createMesh();
    }

    /**
     * Setup NPC-specific properties
     */
    private setupNPCType(): void {
        switch (this.type) {
            case NPC_TYPES.DUKE_HORACIO:
                this.questGiver = true;
                this.wanderRadius = 5;
                break;
            case NPC_TYPES.HANS:
                this.wanderRadius = 30;
                break;
            case NPC_TYPES.BOB:
                this.shopkeeper = true;
                this.wanderRadius = 3;
                break;
            case NPC_TYPES.DONIE:
                this.shopkeeper = true;
                this.wanderRadius = 3;
                break;
            case NPC_TYPES.GUARD:
                this.wanderRadius = 8;
                break;
            default:
                this.wanderRadius = 10;
        }
    }

    /**
     * Get NPC dialogues (use NPCData if available)
     */
    private getDialogues(): string[] {
        // If NPC has data from NPCData.ts, use the greeting dialogue
        if (this.npcData?.dialogue?.greeting) {
            return this.npcData.dialogue.greeting;
        }

        // Fallback to hardcoded dialogues for compatibility
        const dialogueMap: Record<string, string[]> = {
            [NPC_TYPES.DUKE_HORACIO]: [
                "Greetings! Welcome to my castle.",
                "I am the Duke of Lumbridge.",
                "How may I help you today?"
            ],
            [NPC_TYPES.HANS]: [
                "Hello there, adventurer!",
                "I've been a servant in this castle for many years.",
                "Feel free to explore Lumbridge!"
            ],
            [NPC_TYPES.BOB]: [
                "Welcome to Bob's Brilliant Axes!",
                "I sell the finest axes in Lumbridge.",
                "Need anything?"
            ],
            [NPC_TYPES.COOK]: [
                "Hello! I'm the castle cook.",
                "I'm always looking for ingredients.",
                "Can you help me?"
            ],
            [NPC_TYPES.FATHER_AERECK]: [
                "Welcome to the church.",
                "May Saradomin bless you.",
                "Come pray with us."
            ],
            [NPC_TYPES.DONIE]: [
                "Welcome to the General Store!",
                "We sell a bit of everything.",
                "Take a look around!"
            ]
        };

        return dialogueMap[this.type] || [
            "Hello there!",
            "Nice day, isn't it?",
            "Enjoy your stay in Lumbridge."
        ];
    }

    /**
     * Create 3D NPC mesh
     */
    createMesh(): void {
        const group = new THREE.Group();

        // Get color based on NPC type
        let bodyColor = COLORS.NPC_YELLOW;
        if (this.type === NPC_TYPES.GUARD) bodyColor = 0xB22222;
        else if (this.type === NPC_TYPES.DUKE_HORACIO) bodyColor = 0x9400D3;
        else if (this.type === NPC_TYPES.FATHER_AERECK) bodyColor = 0x808080;

        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.7, 1.1, 0.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: bodyColor,
            roughness: 0.8,
            metalness: 0.0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.15;
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.35, 12, 12);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFDBB5,
            roughness: 0.9,
            metalness: 0.0
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.0;
        head.castShadow = true;
        group.add(head);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.06, 6, 6);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.12, 2.05, 0.3);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.12, 2.05, 0.3);
        group.add(rightEye);

        // Legs
        const legGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            roughness: 0.7,
            metalness: 0.0
        });

        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2, 0.4, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2, 0.4, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);

        // Name tag
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            canvas.width = 256;
            canvas.height = 64;
            context.fillStyle = '#FFFF00';
            context.font = 'Bold 24px Arial';
            context.textAlign = 'center';
            context.fillText(this.name, 128, 40);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.y = 3.0;
            sprite.scale.set(2, 0.5, 1);
            group.add(sprite);
        }

        group.position.copy(this.position);
        this.mesh = group;
        this.mesh.userData.entity = this;
        this.mesh.userData.type = 'npc';
        this.mesh.userData.npcType = this.type;

        this.bodyParts = { leftLeg, rightLeg };
    }

    /**
     * Talk to NPC - returns next dialogue line
     */
    talk(): string {
        const dialogue = this.dialogues[this.currentDialogue];
        this.currentDialogue = (this.currentDialogue + 1) % this.dialogues.length;
        return dialogue;
    }

    /**
     * Get specific dialogue by key
     */
    getDialogue(key: string): string[] | undefined {
        return this.npcData?.dialogue[key];
    }

    /**
     * Check if NPC has a specific quest
     */
    hasQuest(questId: string): boolean {
        if (!this.npcData?.questGiver) return false;
        return Array.isArray(this.npcData.questGiver) && this.npcData.questGiver.includes(questId);
    }

    /**
     * Update NPC (called every frame)
     */
    update(delta: number): void {
        // Wander behavior
        this.wanderTimer += delta;

        if (this.wanderTimer >= this.wanderCooldown) {
            // Pick random point within wander radius
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.wanderRadius;
            const targetX = this.startPosition.x + Math.cos(angle) * distance;
            const targetZ = this.startPosition.z + Math.sin(angle) * distance;

            this.targetPosition = new THREE.Vector3(targetX, 0, targetZ);
            this.isWandering = true;
            this.wanderTimer = 0;
            this.wanderCooldown = Math.random() * 5 + 3;
        }

        // Move to target
        if (this.isWandering && this.targetPosition && this.bodyParts) {
            const direction = new THREE.Vector3()
                .subVectors(this.targetPosition, this.position)
                .normalize();

            const distance = this.position.distanceTo(this.targetPosition);

            if (distance < 0.3) {
                this.isWandering = false;
                this.targetPosition = null;
            } else {
                this.position.addScaledVector(direction, this.speed * delta);
                this.rotation = Math.atan2(direction.x, direction.z);

                // Animate walking
                const walkSpeed = 8;
                const leftLegRotation = Math.sin(Date.now() * 0.01 * walkSpeed) * 0.4;
                this.bodyParts.leftLeg.rotation.x = leftLegRotation;
                this.bodyParts.rightLeg.rotation.x = -leftLegRotation;
            }
        } else if (this.bodyParts) {
            // Reset leg positions
            this.bodyParts.leftLeg.rotation.x = 0;
            this.bodyParts.rightLeg.rotation.x = 0;
        }

        // Update mesh
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.rotation.y = this.rotation;
        }
    }

    /**
     * Face a specific direction
     */
    faceDirection(x: number, z: number): void {
        const dx = x - this.position.x;
        const dz = z - this.position.z;
        this.rotation = Math.atan2(dx, dz);
        if (this.mesh) {
            this.mesh.rotation.y = this.rotation;
        }
    }

    /**
     * Stop wandering
     */
    stopWandering(): void {
        this.isWandering = false;
        this.targetPosition = null;
    }

    /**
     * Dispose of NPC resources (geometries, materials, textures)
     */
    dispose(): void {
        if (this.mesh) {
            this.mesh.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                } else if (object instanceof THREE.Sprite) {
                    if (object.material.map) {
                        object.material.map.dispose();
                    }
                    object.material.dispose();
                }
            });
            this.mesh = null;
        }
        this.bodyParts = null;
    }
}

export default NPC;
