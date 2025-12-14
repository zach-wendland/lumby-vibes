/**
 * Lumbridge - World environment and terrain
 * TypeScript version with full type safety
 */

import * as THREE from 'three';
import { WORLD_SIZE, TILE_SIZE, COLORS, BUILDINGS, NPC_TYPES, ENEMY_TYPES } from '../utils/Constants';
import { NPC } from '../entities/NPC';
import { Enemy } from '../entities/Enemy';
import { NPC_DATA } from '../data/NPCData';
import { ENEMY_DATA, SPAWN_LOCATIONS } from '../data/EnemyData';
import type { Player } from '../entities/Player';
import type { GameEngine } from '../engine/GameEngine';

/**
 * Resource interface for gathering nodes
 */
interface Resource {
    type: string;
    name: string;
    levelRequired: number;
    hp: number;
    maxHP: number;
    xpReward: number;
    depleted: boolean;
    respawnTime: number;
    respawnTimer: number;
    deplete(): void;
    respawn(): void;
}

/**
 * NPC spawn position interface
 */
interface NPCSpawn {
    x: number;
    z: number;
}

/**
 * Lumbridge class - Creates the game world
 */
export class Lumbridge {
    private engine: GameEngine;
    private terrain: THREE.Mesh | null;
    private buildings: THREE.Group[];
    public npcs: NPC[];
    public enemies: Enemy[];
    private resources: Resource[];

    constructor(engine: GameEngine) {
        this.engine = engine;
        this.terrain = null;
        this.buildings = [];
        this.npcs = [];
        this.enemies = [];
        this.resources = [];
    }

    /**
     * Create the Lumbridge world
     */
    create(): void {
        this.createTerrain();
        this.createRiver();
        this.createBuildings();
        this.createNPCs();
        this.createEnemies();
        this.createResources();
        this.createDecorations();
    }

    /**
     * Create terrain (grass ground)
     */
    createTerrain(): void {
        const geometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 100, 100);
        const material = new THREE.MeshStandardMaterial({
            color: COLORS.GRASS,
            side: THREE.DoubleSide,
            roughness: 0.9,
            metalness: 0.0
        });

        // Add some variation to terrain height
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const y = Math.random() * 0.5;
            positions.setY(i, y);
        }
        geometry.computeVertexNormals();

        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        this.terrain.userData.type = 'terrain';

        this.engine.scene!.add(this.terrain);
    }

    /**
     * Create River Lum
     */
    createRiver(): void {
        const riverGeometry = new THREE.PlaneGeometry(15, 200);
        const riverMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.WATER,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,  // Very smooth for water
            metalness: 0.3   // Slightly reflective
        });

        const river = new THREE.Mesh(riverGeometry, riverMaterial);
        river.rotation.x = -Math.PI / 2;
        river.position.set(20, 0.1, 0);
        river.userData.type = 'river';

        this.engine.scene!.add(river);

        // Bridge over river
        this.createBridge(20, 0);
    }

    /**
     * Create bridge
     */
    createBridge(x: number, z: number): void {
        const bridgeGroup = new THREE.Group();

        // Bridge deck
        const deckGeometry = new THREE.BoxGeometry(16, 0.5, 12);
        const deckMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.WOOD,
            roughness: 0.8,
            metalness: 0.0
        });
        const deck = new THREE.Mesh(deckGeometry, deckMaterial);
        deck.position.y = 0.5;
        deck.castShadow = true;
        deck.receiveShadow = true;
        bridgeGroup.add(deck);

        // Railings
        const railingGeometry = new THREE.BoxGeometry(0.3, 1.5, 12);
        const railingMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            roughness: 0.7,
            metalness: 0.0
        });

        const leftRailing = new THREE.Mesh(railingGeometry, railingMaterial);
        leftRailing.position.set(-7.5, 1.25, 0);
        leftRailing.castShadow = true;
        bridgeGroup.add(leftRailing);

        const rightRailing = new THREE.Mesh(railingGeometry, railingMaterial);
        rightRailing.position.set(7.5, 1.25, 0);
        rightRailing.castShadow = true;
        bridgeGroup.add(rightRailing);

        bridgeGroup.position.set(x, 0, z);
        this.engine.scene!.add(bridgeGroup);
    }

    /**
     * Create buildings
     */
    createBuildings(): void {
        // Lumbridge Castle
        this.createCastle(-30, -30);

        // Church
        this.createChurch(-10, 25);

        // General Store
        this.createGenericBuilding(-50, 10, COLORS.ROOF_RED, 'General Store');

        // Bob's Axes
        this.createGenericBuilding(-20, 40, COLORS.ROOF_RED, "Bob's Axes");

        // Houses
        this.createGenericBuilding(-60, -20, COLORS.ROOF_RED);
        this.createGenericBuilding(-40, -5, COLORS.ROOF_RED);
        this.createGenericBuilding(-55, 30, COLORS.ROOF_RED);

        // Farm buildings
        this.createGenericBuilding(-80, 10, COLORS.WOOD, 'Farm');
        this.createGenericBuilding(-75, -30, COLORS.WOOD, 'Farm');

        // Goblin house (east of river)
        this.createGenericBuilding(50, 20, 0x4A4A4A, 'Goblin House');
    }

    /**
     * Create Lumbridge Castle
     */
    createCastle(x: number, z: number): void {
        const castleGroup = new THREE.Group();

        // Main castle body
        const bodyGeometry = new THREE.BoxGeometry(25, 20, 20);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.CASTLE_STONE,
            roughness: 0.85,
            metalness: 0.0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 10;
        body.castShadow = true;
        body.receiveShadow = true;
        castleGroup.add(body);

        // Towers (4 corners)
        const towerPositions: [number, number][] = [
            [-12, -9], [12, -9], [-12, 9], [12, 9]
        ];

        for (const [tx, tz] of towerPositions) {
            const tower = this.createTower();
            tower.position.set(tx, 0, tz);
            castleGroup.add(tower);
        }

        // Castle door
        const doorGeometry = new THREE.BoxGeometry(4, 7, 0.5);
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0x3E2723,
            roughness: 0.8,
            metalness: 0.0
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 3.5, 10.2);
        door.castShadow = true;
        castleGroup.add(door);

        // Windows
        const windowGeometry = new THREE.BoxGeometry(1.5, 2, 0.3);
        const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB });

        for (let i = -2; i <= 2; i++) {
            if (i === 0) continue; // Skip center (door)
            const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
            window1.position.set(i * 5, 12, 10.1);
            castleGroup.add(window1);
        }

        castleGroup.position.set(x, 0, z);
        castleGroup.userData.type = 'building';
        castleGroup.userData.buildingType = BUILDINGS.LUMBRIDGE_CASTLE;

        this.engine.scene!.add(castleGroup);
        this.buildings.push(castleGroup);
    }

    /**
     * Create castle tower
     */
    createTower(): THREE.Group {
        const towerGroup = new THREE.Group();

        // Tower body
        const bodyGeometry = new THREE.CylinderGeometry(3, 3, 25, 12);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x696969,
            roughness: 0.85,
            metalness: 0.0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 12.5;
        body.castShadow = true;
        towerGroup.add(body);

        // Cone roof
        const roofGeometry = new THREE.ConeGeometry(4, 5, 12);
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.ROOF_RED,
            roughness: 0.7,
            metalness: 0.0
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 27.5;
        roof.castShadow = true;
        towerGroup.add(roof);

        return towerGroup;
    }

    /**
     * Create church
     */
    createChurch(x: number, z: number): void {
        const churchGroup = new THREE.Group();

        // Main body
        const bodyGeometry = new THREE.BoxGeometry(12, 10, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.STONE,
            roughness: 0.85,
            metalness: 0.0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 5;
        body.castShadow = true;
        churchGroup.add(body);

        // Roof
        const roofGeometry = new THREE.ConeGeometry(9, 6, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.ROOF_GRAY,
            roughness: 0.7,
            metalness: 0.0
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 13;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        churchGroup.add(roof);

        // Cross
        const crossBeamH = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.3, 0.3),
            new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                roughness: 0.2,
                metalness: 0.8  // Gold is metallic
            })
        );
        crossBeamH.position.y = 17;
        churchGroup.add(crossBeamH);

        const crossBeamV = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 2, 0.3),
            new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                roughness: 0.2,
                metalness: 0.8  // Gold is metallic
            })
        );
        crossBeamV.position.y = 16.5;
        churchGroup.add(crossBeamV);

        churchGroup.position.set(x, 0, z);
        churchGroup.userData.type = 'building';
        churchGroup.userData.buildingType = BUILDINGS.CHURCH;

        this.engine.scene!.add(churchGroup);
        this.buildings.push(churchGroup);
    }

    /**
     * Create generic building
     */
    createGenericBuilding(x: number, z: number, roofColor: number, name: string = 'Building'): void {
        const buildingGroup = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.BoxGeometry(8, 7, 6);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xD2B48C,
            roughness: 0.8,
            metalness: 0.0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 3.5;
        body.castShadow = true;
        buildingGroup.add(body);

        // Roof
        const roofGeometry = new THREE.ConeGeometry(6, 4, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: roofColor,
            roughness: 0.7,
            metalness: 0.0
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 9;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        buildingGroup.add(roof);

        // Door
        const doorGeometry = new THREE.BoxGeometry(2, 4, 0.3);
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0x3E2723,
            roughness: 0.8,
            metalness: 0.0
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 2, 3.1);
        buildingGroup.add(door);

        buildingGroup.position.set(x, 0, z);
        buildingGroup.userData.type = 'building';
        buildingGroup.userData.buildingName = name;

        this.engine.scene!.add(buildingGroup);
        this.buildings.push(buildingGroup);
    }

    /**
     * Create NPCs using authentic OSRS data
     */
    createNPCs(): void {
        // Define NPC spawn positions based on OSRS Lumbridge
        const npcSpawns: Record<string, NPCSpawn> = {
            DUKE_HORACIO: { x: -25, z: -25 },
            HANS: { x: -30, z: -30 },
            COOK: { x: -28, z: -32 },
            FATHER_AERECK: { x: -10, z: 25 },
            BOB: { x: -20, z: 40 },
            DONIE: { x: -50, z: 10 },
            FRED_THE_FARMER: { x: -80, z: 10 },
            LUMBRIDGE_GUIDE: { x: 0, z: 0 },
            COMBAT_INSTRUCTOR: { x: 5, z: 5 },
            MAGIC_INSTRUCTOR: { x: -5, z: 5 },
        };

        // Create NPCs from NPC_DATA
        for (const [npcKey, npcData] of Object.entries(NPC_DATA)) {
            const spawnPos = npcSpawns[npcKey];

            if (spawnPos) {
                const npc = new NPC(spawnPos.x, spawnPos.z, npcKey, npcData.name);
                npc.npcId = npcKey; // Store the NPC ID for quest system
                npc.npcData = npcData; // Store full data for dialogue
                this.npcs.push(npc);
            }
        }

        // Add guards (4 guards around castle)
        const guardPositions: NPCSpawn[] = [
            { x: -20, z: -35 },
            { x: -40, z: -35 },
            { x: -20, z: -20 },
            { x: -40, z: -20 }
        ];

        for (const pos of guardPositions) {
            const guard = new NPC(pos.x, pos.z, NPC_TYPES.GUARD, 'Guard');
            this.npcs.push(guard);
        }

        // Add wandering villagers (men and women)
        for (let i = 0; i < 5; i++) {
            const x = -60 + Math.random() * 40;
            const z = -10 + Math.random() * 40;
            const man = new NPC(x, z, 'MAN', 'Man');
            this.npcs.push(man);
        }

        for (let i = 0; i < 5; i++) {
            const x = -60 + Math.random() * 40;
            const z = -10 + Math.random() * 40;
            const woman = new NPC(x, z, 'WOMAN', 'Woman');
            this.npcs.push(woman);
        }

        // Add NPCs to scene
        for (const npc of this.npcs) {
            if (npc.mesh) {
                this.engine.scene!.add(npc.mesh);
            }
        }
    }

    /**
     * Create enemies using authentic OSRS spawn data
     */
    createEnemies(): void {
        // Spawn enemies based on SPAWN_LOCATIONS from EnemyData
        for (const [enemyType, locations] of Object.entries(SPAWN_LOCATIONS)) {
            for (const location of locations) {
                const { x, z, count } = location;

                // Spawn the specified number of enemies in this location
                for (let i = 0; i < count; i++) {
                    // Add some random spread around the spawn point
                    const spawnX = x + (Math.random() - 0.5) * 20;
                    const spawnZ = z + (Math.random() - 0.5) * 20;

                    this.enemies.push(new Enemy(spawnX, spawnZ, enemyType));
                }
            }
        }

        // Add enemies to scene
        for (const enemy of this.enemies) {
            if (enemy.mesh) {
                this.engine.scene!.add(enemy.mesh);
            }
        }
    }

    /**
     * Create resources (trees, rocks, fishing spots)
     */
    createResources(): void {
        // Trees (scattered around)
        const treePositions: [number, number][] = [
            [-65, -15], [-70, -10], [-75, -5],
            [-45, 15], [-50, 20], [-55, 25],
            [-85, 25], [-90, 30], [-82, 35],
            [35, -20], [40, -25], [45, -30]
        ];

        for (const [x, z] of treePositions) {
            this.createTree(x, z);
        }

        // Rocks (mining spots)
        const rockPositions: [number, number][] = [
            [-70, 50], [-75, 52], [-80, 48],
            [55, -15], [60, -18]
        ];

        for (const [x, z] of rockPositions) {
            this.createRock(x, z);
        }

        // Fishing spots (by river)
        this.createFishingSpot(20, -30);
        this.createFishingSpot(20, -20);
        this.createFishingSpot(20, 30);
    }

    /**
     * Create tree
     */
    createTree(x: number, z: number): void {
        const treeGroup = new THREE.Group();

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.0
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Foliage
        const foliageGeometry = new THREE.SphereGeometry(2.5, 12, 12);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x228B22,
            roughness: 0.9,
            metalness: 0.0
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 5;
        foliage.scale.set(1, 1.2, 1);
        foliage.castShadow = true;
        treeGroup.add(foliage);

        treeGroup.position.set(x, 0, z);
        treeGroup.userData.type = 'resource';
        treeGroup.userData.resourceType = 'normal_tree';

        const resource: Resource = {
            type: 'normal_tree',
            name: 'Tree',
            levelRequired: 1,
            hp: 3,
            maxHP: 3,
            xpReward: 25,
            depleted: false,
            respawnTime: 30,
            respawnTimer: 0,
            deplete(): void {
                this.depleted = true;
                this.respawnTimer = this.respawnTime;
                foliage.visible = false;
            },
            respawn(): void {
                this.depleted = false;
                this.hp = this.maxHP;
                foliage.visible = true;
            }
        };

        treeGroup.userData.resource = resource;

        this.engine.scene!.add(treeGroup);
        this.resources.push(resource);
    }

    /**
     * Create rock (mining)
     */
    createRock(x: number, z: number): void {
        const rockGeometry = new THREE.DodecahedronGeometry(1.2, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.95,
            metalness: 0.0
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, 0.8, z);
        rock.castShadow = true;
        rock.userData.type = 'resource';
        rock.userData.resourceType = 'copper_rock';

        const resource: Resource = {
            type: 'copper_rock',
            name: 'Copper rock',
            levelRequired: 1,
            hp: 3,
            maxHP: 3,
            xpReward: 17.5,
            depleted: false,
            respawnTime: 20,
            respawnTimer: 0,
            deplete(): void {
                this.depleted = true;
                this.respawnTimer = this.respawnTime;
                rock.visible = false;
            },
            respawn(): void {
                this.depleted = false;
                this.hp = this.maxHP;
                rock.visible = true;
            }
        };

        rock.userData.resource = resource;

        this.engine.scene!.add(rock);
        this.resources.push(resource);
    }

    /**
     * Create fishing spot
     */
    createFishingSpot(x: number, z: number): void {
        const geometry = new THREE.CylinderGeometry(1, 1, 0.2, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x4682B4,
            transparent: true,
            opacity: 0.5
        });
        const spot = new THREE.Mesh(geometry, material);
        spot.position.set(x, 0.1, z);
        spot.userData.type = 'resource';
        spot.userData.resourceType = 'shrimp_spot';

        const resource: Resource = {
            type: 'shrimp_spot',
            name: 'Fishing spot',
            levelRequired: 1,
            hp: 999,
            maxHP: 999,
            xpReward: 10,
            depleted: false,
            respawnTime: 0,
            respawnTimer: 0,
            deplete(): void {},
            respawn(): void {}
        };

        spot.userData.resource = resource;

        this.engine.scene!.add(spot);
        this.resources.push(resource);
    }

    /**
     * Create decorations (fences, paths, etc.)
     */
    createDecorations(): void {
        // Paths (dirt paths)
        this.createPath(-30, -30, -30, 30); // Castle to south
        this.createPath(-30, -30, 20, -30); // Castle to bridge
        this.createPath(-50, 10, -30, 10); // Store to castle area

        // Fences around farms
        this.createFence(-90, 0, 20, 'horizontal');
        this.createFence(-90, 20, 20, 'vertical');
    }

    /**
     * Create path
     */
    createPath(x1: number, z1: number, x2: number, z2: number): void {
        const length = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
        const geometry = new THREE.PlaneGeometry(3, length);
        const material = new THREE.MeshStandardMaterial({
            color: COLORS.DIRT,
            roughness: 0.9,
            metalness: 0.0
        });

        const path = new THREE.Mesh(geometry, material);
        path.rotation.x = -Math.PI / 2;
        path.position.set((x1 + x2) / 2, 0.05, (z1 + z2) / 2);

        const angle = Math.atan2(z2 - z1, x2 - x1);
        path.rotation.z = angle - Math.PI / 2;

        this.engine.scene!.add(path);
    }

    /**
     * Create fence
     */
    createFence(x: number, z: number, length: number, direction: 'horizontal' | 'vertical'): void {
        const fenceGroup = new THREE.Group();
        const postCount = Math.floor(length / 2) + 1;

        for (let i = 0; i < postCount; i++) {
            const post = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 1.5, 0.2),
                new THREE.MeshStandardMaterial({
                    color: 0x654321,
                    roughness: 0.8,
                    metalness: 0.0
                })
            );

            if (direction === 'horizontal') {
                post.position.set(i * 2, 0.75, 0);
            } else {
                post.position.set(0, 0.75, i * 2);
            }

            post.castShadow = true;
            fenceGroup.add(post);
        }

        fenceGroup.position.set(x, 0, z);
        this.engine.scene!.add(fenceGroup);
    }

    /**
     * Get all resources in the world
     */
    getResources(): Resource[] {
        return this.resources;
    }

    /**
     * Update world (called every frame)
     */
    update(delta: number, player: Player): void {
        // Update NPCs
        for (const npc of this.npcs) {
            npc.update(delta);
        }

        // Update enemies
        for (const enemy of this.enemies) {
            enemy.update(delta, player);
        }
    }

    /**
     * Dispose of resources and clean up
     */
    dispose(): void {
        // Remove terrain from scene
        if (this.terrain && this.terrain.parent) {
            this.terrain.parent.remove(this.terrain);
            this.terrain = null;
        }

        // Remove buildings from scene
        for (const building of this.buildings) {
            if (building.parent) {
                building.parent.remove(building);
            }
        }
        this.buildings = [];

        // Remove NPC meshes from scene and clear array
        for (const npc of this.npcs) {
            if (npc.mesh && npc.mesh.parent) {
                npc.mesh.parent.remove(npc.mesh);
            }
        }
        this.npcs = [];

        // Remove enemy meshes from scene and clear array
        for (const enemy of this.enemies) {
            if (enemy.mesh && enemy.mesh.parent) {
                enemy.mesh.parent.remove(enemy.mesh);
            }
        }
        this.enemies = [];

        // Clear resources array
        this.resources = [];
    }
}

export default Lumbridge;
