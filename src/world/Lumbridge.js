/**
 * Lumbridge - World environment and terrain
 */

import { WORLD_SIZE, TILE_SIZE, COLORS, BUILDINGS, NPC_TYPES, ENEMY_TYPES } from '../utils/Constants.js';
import { NPC } from '../entities/NPC.js';
import { Enemy } from '../entities/Enemy.js';

export class Lumbridge {
    constructor(engine) {
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
    create() {
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
    createTerrain() {
        const geometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 100, 100);
        const material = new THREE.MeshLambertMaterial({
            color: COLORS.GRASS,
            side: THREE.DoubleSide
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

        this.engine.scene.add(this.terrain);
    }

    /**
     * Create River Lum
     */
    createRiver() {
        const riverGeometry = new THREE.PlaneGeometry(15, 200);
        const riverMaterial = new THREE.MeshPhongMaterial({
            color: COLORS.WATER,
            transparent: true,
            opacity: 0.7,
            shininess: 100
        });

        const river = new THREE.Mesh(riverGeometry, riverMaterial);
        river.rotation.x = -Math.PI / 2;
        river.position.set(20, 0.1, 0);
        river.userData.type = 'river';

        this.engine.scene.add(river);

        // Bridge over river
        this.createBridge(20, 0);
    }

    /**
     * Create bridge
     */
    createBridge(x, z) {
        const bridgeGroup = new THREE.Group();

        // Bridge deck
        const deckGeometry = new THREE.BoxGeometry(16, 0.5, 12);
        const deckMaterial = new THREE.MeshLambertMaterial({ color: COLORS.WOOD });
        const deck = new THREE.Mesh(deckGeometry, deckMaterial);
        deck.position.y = 0.5;
        deck.castShadow = true;
        deck.receiveShadow = true;
        bridgeGroup.add(deck);

        // Railings
        const railingGeometry = new THREE.BoxGeometry(0.3, 1.5, 12);
        const railingMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });

        const leftRailing = new THREE.Mesh(railingGeometry, railingMaterial);
        leftRailing.position.set(-7.5, 1.25, 0);
        leftRailing.castShadow = true;
        bridgeGroup.add(leftRailing);

        const rightRailing = new THREE.Mesh(railingGeometry, railingMaterial);
        rightRailing.position.set(7.5, 1.25, 0);
        rightRailing.castShadow = true;
        bridgeGroup.add(rightRailing);

        bridgeGroup.position.set(x, 0, z);
        this.engine.scene.add(bridgeGroup);
    }

    /**
     * Create buildings
     */
    createBuildings() {
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
    createCastle(x, z) {
        const castleGroup = new THREE.Group();

        // Main castle body
        const bodyGeometry = new THREE.BoxGeometry(25, 20, 20);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: COLORS.CASTLE_STONE });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 10;
        body.castShadow = true;
        body.receiveShadow = true;
        castleGroup.add(body);

        // Towers (4 corners)
        const towerPositions = [
            [-12, -9], [12, -9], [-12, 9], [12, 9]
        ];

        for (const [tx, tz] of towerPositions) {
            const tower = this.createTower();
            tower.position.set(tx, 0, tz);
            castleGroup.add(tower);
        }

        // Castle door
        const doorGeometry = new THREE.BoxGeometry(4, 7, 0.5);
        const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
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

        this.engine.scene.add(castleGroup);
        this.buildings.push(castleGroup);
    }

    /**
     * Create castle tower
     */
    createTower() {
        const towerGroup = new THREE.Group();

        // Tower body
        const bodyGeometry = new THREE.CylinderGeometry(3, 3, 25, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 12.5;
        body.castShadow = true;
        towerGroup.add(body);

        // Cone roof
        const roofGeometry = new THREE.ConeGeometry(4, 5, 12);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: COLORS.ROOF_RED });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 27.5;
        roof.castShadow = true;
        towerGroup.add(roof);

        return towerGroup;
    }

    /**
     * Create church
     */
    createChurch(x, z) {
        const churchGroup = new THREE.Group();

        // Main body
        const bodyGeometry = new THREE.BoxGeometry(12, 10, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: COLORS.STONE });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 5;
        body.castShadow = true;
        churchGroup.add(body);

        // Roof
        const roofGeometry = new THREE.ConeGeometry(9, 6, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: COLORS.ROOF_GRAY });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 13;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        churchGroup.add(roof);

        // Cross
        const crossBeamH = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.3, 0.3),
            new THREE.MeshLambertMaterial({ color: 0xFFD700 })
        );
        crossBeamH.position.y = 17;
        churchGroup.add(crossBeamH);

        const crossBeamV = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 2, 0.3),
            new THREE.MeshLambertMaterial({ color: 0xFFD700 })
        );
        crossBeamV.position.y = 16.5;
        churchGroup.add(crossBeamV);

        churchGroup.position.set(x, 0, z);
        churchGroup.userData.type = 'building';
        churchGroup.userData.buildingType = BUILDINGS.CHURCH;

        this.engine.scene.add(churchGroup);
        this.buildings.push(churchGroup);
    }

    /**
     * Create generic building
     */
    createGenericBuilding(x, z, roofColor, name = 'Building') {
        const buildingGroup = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.BoxGeometry(8, 7, 6);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 3.5;
        body.castShadow = true;
        buildingGroup.add(body);

        // Roof
        const roofGeometry = new THREE.ConeGeometry(6, 4, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: roofColor });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 9;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        buildingGroup.add(roof);

        // Door
        const doorGeometry = new THREE.BoxGeometry(2, 4, 0.3);
        const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 2, 3.1);
        buildingGroup.add(door);

        buildingGroup.position.set(x, 0, z);
        buildingGroup.userData.type = 'building';
        buildingGroup.userData.buildingName = name;

        this.engine.scene.add(buildingGroup);
        this.buildings.push(buildingGroup);
    }

    /**
     * Create NPCs
     */
    createNPCs() {
        // Castle NPCs
        this.npcs.push(new NPC(-25, -25, NPC_TYPES.DUKE_HORACIO, 'Duke Horacio'));
        this.npcs.push(new NPC(-30, -30, NPC_TYPES.HANS, 'Hans'));
        this.npcs.push(new NPC(-28, -32, NPC_TYPES.COOK, 'Cook'));

        // Guards
        this.npcs.push(new NPC(-20, -35, NPC_TYPES.GUARD, 'Guard'));
        this.npcs.push(new NPC(-40, -35, NPC_TYPES.GUARD, 'Guard'));
        this.npcs.push(new NPC(-20, -20, NPC_TYPES.GUARD, 'Guard'));
        this.npcs.push(new NPC(-40, -20, NPC_TYPES.GUARD, 'Guard'));

        // Church
        this.npcs.push(new NPC(-10, 25, NPC_TYPES.FATHER_AERECK, 'Father Aereck'));

        // Shops
        this.npcs.push(new NPC(-50, 10, NPC_TYPES.DONIE, 'Shop keeper'));
        this.npcs.push(new NPC(-20, 40, NPC_TYPES.BOB, 'Bob'));

        // Farmers
        this.npcs.push(new NPC(-80, 10, NPC_TYPES.FARMER, 'Fred the Farmer'));

        // Villagers
        for (let i = 0; i < 10; i++) {
            const x = -60 + Math.random() * 40;
            const z = -10 + Math.random() * 40;
            this.npcs.push(new NPC(x, z, NPC_TYPES.VILLAGER, 'Villager'));
        }

        // Add NPCs to scene
        for (const npc of this.npcs) {
            if (npc.mesh) {
                this.engine.scene.add(npc.mesh);
            }
        }
    }

    /**
     * Create enemies
     */
    createEnemies() {
        // Chickens (west side, near farms)
        for (let i = 0; i < 8; i++) {
            const x = -85 + Math.random() * 20;
            const z = 5 + Math.random() * 15;
            this.enemies.push(new Enemy(x, z, 'CHICKEN'));
        }

        // Cows (northwest fields)
        for (let i = 0; i < 6; i++) {
            const x = -85 + Math.random() * 15;
            const z = -35 + Math.random() * 15;
            this.enemies.push(new Enemy(x, z, 'COW'));
        }

        // Goblins level 2 (east of river)
        for (let i = 0; i < 6; i++) {
            const x = 40 + Math.random() * 25;
            const z = 10 + Math.random() * 25;
            this.enemies.push(new Enemy(x, z, 'GOBLIN_2'));
        }

        // Goblins level 5 (further east)
        for (let i = 0; i < 4; i++) {
            const x = 60 + Math.random() * 20;
            const z = 15 + Math.random() * 20;
            this.enemies.push(new Enemy(x, z, 'GOBLIN_5'));
        }

        // Add enemies to scene
        for (const enemy of this.enemies) {
            if (enemy.mesh) {
                this.engine.scene.add(enemy.mesh);
            }
        }
    }

    /**
     * Create resources (trees, rocks, fishing spots)
     */
    createResources() {
        // Trees (scattered around)
        const treePositions = [
            [-65, -15], [-70, -10], [-75, -5],
            [-45, 15], [-50, 20], [-55, 25],
            [-85, 25], [-90, 30], [-82, 35],
            [35, -20], [40, -25], [45, -30]
        ];

        for (const [x, z] of treePositions) {
            this.createTree(x, z);
        }

        // Rocks (mining spots)
        const rockPositions = [
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
    createTree(x, z) {
        const treeGroup = new THREE.Group();

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Foliage
        const foliageGeometry = new THREE.SphereGeometry(2.5, 12, 12);
        const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 5;
        foliage.scale.set(1, 1.2, 1);
        foliage.castShadow = true;
        treeGroup.add(foliage);

        treeGroup.position.set(x, 0, z);
        treeGroup.userData.type = 'resource';
        treeGroup.userData.resourceType = 'normal_tree';
        treeGroup.userData.resource = {
            type: 'normal_tree',
            name: 'Tree',
            levelRequired: 1,
            hp: 3,
            maxHP: 3,
            xpReward: 25,
            depleted: false,
            respawnTime: 30,
            respawnTimer: 0,
            deplete: function() {
                this.depleted = true;
                this.respawnTimer = this.respawnTime;
                foliage.visible = false;
            },
            respawn: function() {
                this.depleted = false;
                this.hp = this.maxHP;
                foliage.visible = true;
            }
        };

        this.engine.scene.add(treeGroup);
        this.resources.push(treeGroup.userData.resource);
    }

    /**
     * Create rock (mining)
     */
    createRock(x, z) {
        const rockGeometry = new THREE.DodecahedronGeometry(1.2, 0);
        const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, 0.8, z);
        rock.castShadow = true;
        rock.userData.type = 'resource';
        rock.userData.resourceType = 'copper_rock';
        rock.userData.resource = {
            type: 'copper_rock',
            name: 'Copper rock',
            levelRequired: 1,
            hp: 3,
            maxHP: 3,
            xpReward: 17.5,
            depleted: false,
            respawnTime: 20,
            respawnTimer: 0,
            deplete: function() {
                this.depleted = true;
                this.respawnTimer = this.respawnTime;
                rock.visible = false;
            },
            respawn: function() {
                this.depleted = false;
                this.hp = this.maxHP;
                rock.visible = true;
            }
        };

        this.engine.scene.add(rock);
        this.resources.push(rock.userData.resource);
    }

    /**
     * Create fishing spot
     */
    createFishingSpot(x, z) {
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
        spot.userData.resource = {
            type: 'shrimp_spot',
            name: 'Fishing spot',
            levelRequired: 1,
            hp: 999,
            maxHP: 999,
            xpReward: 10,
            depleted: false,
            respawnTime: 0,
            respawnTimer: 0,
            deplete: function() {},
            respawn: function() {}
        };

        this.engine.scene.add(spot);
        this.resources.push(spot.userData.resource);
    }

    /**
     * Create decorations (fences, paths, etc.)
     */
    createDecorations() {
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
    createPath(x1, z1, x2, z2) {
        const length = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
        const geometry = new THREE.PlaneGeometry(3, length);
        const material = new THREE.MeshLambertMaterial({ color: COLORS.DIRT });

        const path = new THREE.Mesh(geometry, material);
        path.rotation.x = -Math.PI / 2;
        path.position.set((x1 + x2) / 2, 0.05, (z1 + z2) / 2);

        const angle = Math.atan2(z2 - z1, x2 - x1);
        path.rotation.z = angle - Math.PI / 2;

        this.engine.scene.add(path);
    }

    /**
     * Create fence
     */
    createFence(x, z, length, direction) {
        const fenceGroup = new THREE.Group();
        const postCount = Math.floor(length / 2) + 1;

        for (let i = 0; i < postCount; i++) {
            const post = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 1.5, 0.2),
                new THREE.MeshLambertMaterial({ color: 0x654321 })
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
        this.engine.scene.add(fenceGroup);
    }

    /**
     * Update world (called every frame)
     */
    update(delta, player) {
        // Update NPCs
        for (const npc of this.npcs) {
            npc.update(delta);
        }

        // Update enemies
        for (const enemy of this.enemies) {
            enemy.update(delta, player);
        }
    }
}

export default Lumbridge;
