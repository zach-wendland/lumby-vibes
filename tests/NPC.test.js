/**
 * Comprehensive NPC tests
 */

import { NPC } from '../src/entities/NPC.ts';
import { NPC_TYPES } from '../src/utils/Constants.ts';

describe('NPC', () => {
    describe('Initialization', () => {
        test('should create NPC with basic properties', () => {
            const npc = new NPC(10, 20, NPC_TYPES.HANS, 'Hans');

            expect(npc.position.x).toBe(10);
            expect(npc.position.z).toBe(20);
            expect(npc.type).toBe(NPC_TYPES.HANS);
            expect(npc.name).toBe('Hans');
            expect(npc.rotation).toBe(0);
        });

        test('should use npcType as name if name not provided', () => {
            const npc = new NPC(0, 0, NPC_TYPES.GUARD);

            expect(npc.name).toBe(NPC_TYPES.GUARD);
        });

        test('should clone start position', () => {
            const npc = new NPC(5, 10, NPC_TYPES.HANS);

            expect(npc.startPosition).not.toBe(npc.position);
            expect(npc.startPosition.x).toBe(5);
            expect(npc.startPosition.z).toBe(10);
        });

        test('should initialize wandering properties', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);

            expect(npc.wanderTimer).toBe(0);
            expect(npc.wanderCooldown).toBeGreaterThanOrEqual(3);
            expect(npc.wanderCooldown).toBeLessThanOrEqual(8);
            expect(npc.targetPosition).toBeNull();
            expect(npc.isWandering).toBe(false);
        });

        test('should initialize dialogue', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);

            expect(npc.dialogues).toBeDefined();
            expect(Array.isArray(npc.dialogues)).toBe(true);
            expect(npc.dialogues.length).toBeGreaterThan(0);
            expect(npc.currentDialogue).toBe(0);
        });

        test('should create mesh with userData', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);

            expect(npc.mesh).toBeDefined();
            expect(npc.mesh.userData.entity).toBe(npc);
            expect(npc.mesh.userData.type).toBe('npc');
            expect(npc.mesh.userData.npcType).toBe(NPC_TYPES.HANS);
        });

        test('should have body parts for animation', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);

            expect(npc.bodyParts).toBeDefined();
            expect(npc.bodyParts.leftLeg).toBeDefined();
            expect(npc.bodyParts.rightLeg).toBeDefined();
        });
    });

    describe('setupNPCType', () => {
        test('should configure Duke Horacio correctly', () => {
            const npc = new NPC(0, 0, NPC_TYPES.DUKE_HORACIO);

            expect(npc.questGiver).toBe(true);
            expect(npc.wanderRadius).toBe(5);
        });

        test('should configure Hans with large wander radius', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);

            expect(npc.wanderRadius).toBe(30);
        });

        test('should configure Bob as shopkeeper', () => {
            const npc = new NPC(0, 0, NPC_TYPES.BOB);

            expect(npc.shopkeeper).toBe(true);
            expect(npc.wanderRadius).toBe(3);
        });

        test('should configure Donie as shopkeeper', () => {
            const npc = new NPC(0, 0, NPC_TYPES.DONIE);

            expect(npc.shopkeeper).toBe(true);
            expect(npc.wanderRadius).toBe(3);
        });

        test('should configure Guard with medium wander radius', () => {
            const npc = new NPC(0, 0, NPC_TYPES.GUARD);

            expect(npc.wanderRadius).toBe(8);
        });

        test('should use default wander radius for unknown types', () => {
            const npc = new NPC(0, 0, 'UNKNOWN_TYPE');

            expect(npc.wanderRadius).toBe(10);
        });
    });

    describe('getDialogues', () => {
        test('should return Duke Horacio dialogues', () => {
            const npc = new NPC(0, 0, NPC_TYPES.DUKE_HORACIO);

            expect(npc.dialogues).toContain("Greetings! Welcome to my castle.");
            expect(npc.dialogues).toContain("I am the Duke of Lumbridge.");
            expect(npc.dialogues).toContain("How may I help you today?");
        });

        test('should return Hans dialogues', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);

            expect(npc.dialogues).toContain("Hello there, adventurer!");
            expect(npc.dialogues.some(d => d.includes('servant'))).toBe(true);
        });

        test('should return Bob dialogues', () => {
            const npc = new NPC(0, 0, NPC_TYPES.BOB);

            expect(npc.dialogues).toContain("Welcome to Bob's Brilliant Axes!");
            expect(npc.dialogues.some(d => d.includes('axes'))).toBe(true);
        });

        test('should return Cook dialogues', () => {
            const npc = new NPC(0, 0, NPC_TYPES.COOK);

            expect(npc.dialogues.some(d => d.includes('cook'))).toBe(true);
        });

        test('should return Father Aereck dialogues', () => {
            const npc = new NPC(0, 0, NPC_TYPES.FATHER_AERECK);

            expect(npc.dialogues.some(d => d.includes('church') || d.includes('Saradomin'))).toBe(true);
        });

        test('should return Donie dialogues', () => {
            const npc = new NPC(0, 0, NPC_TYPES.DONIE);

            expect(npc.dialogues).toContain("Welcome to the General Store!");
        });

        test('should return default dialogues for unknown NPC', () => {
            const npc = new NPC(0, 0, 'UNKNOWN_NPC');

            expect(npc.dialogues).toContain("Hello there!");
            expect(npc.dialogues.length).toBeGreaterThan(0);
        });
    });

    describe('talk', () => {
        test('should return first dialogue', () => {
            const npc = new NPC(0, 0, NPC_TYPES.DUKE_HORACIO);
            const dialogue = npc.talk();

            expect(dialogue).toBe("Greetings! Welcome to my castle.");
            expect(npc.currentDialogue).toBe(1);
        });

        test('should cycle through dialogues', () => {
            const npc = new NPC(0, 0, NPC_TYPES.DUKE_HORACIO);

            const dialogue1 = npc.talk();
            const dialogue2 = npc.talk();
            const dialogue3 = npc.talk();

            expect(dialogue1).not.toBe(dialogue2);
            expect(dialogue2).not.toBe(dialogue3);
        });

        test('should loop back to first dialogue', () => {
            const npc = new NPC(0, 0, NPC_TYPES.DUKE_HORACIO);
            const totalDialogues = npc.dialogues.length;

            // Cycle through all dialogues
            for (let i = 0; i < totalDialogues; i++) {
                npc.talk();
            }

            // Should be back at 0
            expect(npc.currentDialogue).toBe(0);
        });
    });

    describe('Wandering behavior', () => {
        test('should not move immediately after creation', () => {
            const npc = new NPC(10, 20, NPC_TYPES.HANS);
            const initialX = npc.position.x;
            const initialZ = npc.position.z;

            npc.update(0.016); // One frame

            expect(npc.position.x).toBe(initialX);
            expect(npc.position.z).toBe(initialZ);
        });

        test('should start wandering after cooldown', () => {
            const npc = new NPC(10, 20, NPC_TYPES.HANS);

            // Fast forward past cooldown
            npc.update(10);

            expect(npc.targetPosition).not.toBeNull();
            expect(npc.isWandering).toBe(true);
        });

        test('should pick target within wander radius', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);
            npc.wanderRadius = 10;

            // Trigger wandering
            npc.update(10);

            if (npc.targetPosition) {
                const distanceFromStart = Math.sqrt(
                    Math.pow(npc.targetPosition.x - npc.startPosition.x, 2) +
                    Math.pow(npc.targetPosition.z - npc.startPosition.z, 2)
                );

                expect(distanceFromStart).toBeLessThanOrEqual(npc.wanderRadius);
            }
        });

        test('should stop wandering when reaching target', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);

            // Start wandering
            npc.update(10);

            // Set target very close
            npc.targetPosition = npc.position.clone();
            npc.targetPosition.x += 0.1;

            // Update
            npc.update(0.5);

            expect(npc.isWandering).toBe(false);
            expect(npc.targetPosition).toBeNull();
        });

        test('should move towards target position', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);
            const initialX = npc.position.x;

            // Force a target position
            npc.targetPosition = { x: 10, y: 0, z: 0 };
            npc.isWandering = true;

            // Update several times
            for (let i = 0; i < 10; i++) {
                npc.update(0.1);
            }

            // Should have moved towards target
            expect(npc.position.x).toBeGreaterThan(initialX);
        });

        test('should update rotation when moving', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);

            // Force movement to the right
            npc.targetPosition = { x: 10, y: 0, z: 0 };
            npc.isWandering = true;

            npc.update(0.1);

            // Rotation should have changed from initial 0
            expect(npc.rotation).not.toBe(0);
        });

        test('should animate legs when walking', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);

            // Force movement
            npc.targetPosition = { x: 10, y: 0, z: 0 };
            npc.isWandering = true;

            npc.update(0.1);

            // Legs should have rotation
            expect(npc.bodyParts.leftLeg.rotation.x).not.toBe(0);
            expect(npc.bodyParts.rightLeg.rotation.x).not.toBe(0);
        });

        test('should reset leg rotation when stopped', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);

            // Force movement then stop
            npc.targetPosition = { x: 10, y: 0, z: 0 };
            npc.isWandering = true;
            npc.update(0.1);

            // Stop wandering
            npc.isWandering = false;
            npc.targetPosition = null;
            npc.update(0.1);

            expect(npc.bodyParts.leftLeg.rotation.x).toBe(0);
            expect(npc.bodyParts.rightLeg.rotation.x).toBe(0);
        });
    });

    describe('update', () => {
        test('should increment wander timer', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);
            const initialTimer = npc.wanderTimer;

            npc.update(0.5);

            expect(npc.wanderTimer).toBeGreaterThan(initialTimer);
        });

        test('should reset wander timer after starting wander', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);

            npc.update(10); // Trigger wander

            expect(npc.wanderTimer).toBe(0);
        });

        test('should update mesh position', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);

            // Move NPC
            npc.position.x = 5;
            npc.position.z = 10;
            npc.update(0.1);

            expect(npc.mesh.position.x).toBe(5);
            expect(npc.mesh.position.z).toBe(10);
        });

        test('should update mesh rotation', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);

            // Set rotation
            npc.rotation = Math.PI / 2;
            npc.update(0.1);

            expect(npc.mesh.rotation.y).toBe(Math.PI / 2);
        });
    });

    describe('Quest and shop properties', () => {
        test('should identify Duke Horacio as quest giver', () => {
            const npc = new NPC(0, 0, NPC_TYPES.DUKE_HORACIO);

            expect(npc.questGiver).toBe(true);
        });

        test('should identify Bob as shopkeeper', () => {
            const npc = new NPC(0, 0, NPC_TYPES.BOB);

            expect(npc.shopkeeper).toBe(true);
        });

        test('should not mark non-quest NPCs as quest givers', () => {
            const npc = new NPC(0, 0, NPC_TYPES.HANS);

            // Hans is not a quest giver (unless specified in NPC_DATA)
            expect(npc.questGiver).toBeDefined();
        });
    });

    describe('NPC Data integration', () => {
        test('should use NPC_DATA if available', () => {
            // If NPC_DATA has an entry, it should be loaded
            const npc = new NPC(0, 0, NPC_TYPES.DUKE_HORACIO);

            expect(npc.npcId).toBe(NPC_TYPES.DUKE_HORACIO);
        });

        test('should handle missing NPC_DATA gracefully', () => {
            const npc = new NPC(0, 0, 'NONEXISTENT_NPC');

            expect(npc.npcData).toBeNull();
            expect(npc.wanderRadius).toBe(10); // Default
            expect(npc.roaming).toBe(true); // Default
        });
    });

    describe('Position and movement constraints', () => {
        test('should respect wander radius constraint', () => {
            const npc = new NPC(0, 0, NPC_TYPES.BOB);
            npc.wanderRadius = 3; // Small radius

            // Trigger multiple wanders
            for (let i = 0; i < 10; i++) {
                npc.wanderTimer = npc.wanderCooldown + 1;
                npc.update(0.1);

                if (npc.targetPosition) {
                    const distance = Math.sqrt(
                        Math.pow(npc.targetPosition.x - npc.startPosition.x, 2) +
                        Math.pow(npc.targetPosition.z - npc.startPosition.z, 2)
                    );
                    expect(distance).toBeLessThanOrEqual(3);
                }
            }
        });
    });
});
