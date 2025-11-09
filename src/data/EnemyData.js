/**
 * Complete Enemy Data for Lumbridge - OSRS
 */

export const ENEMY_DATA = {
    // ========== CHICKENS ==========
    CHICKEN: {
        id: 'chicken',
        name: 'Chicken',
        level: 1,
        hitpoints: 3,
        maxHit: 1,
        attackSpeed: 4, // ticks
        aggressive: false,
        poisonous: false,
        attackStyle: 'melee',
        xpRewards: {
            hitpoints: 1.33,
            attack: 4,
            strength: 4,
            defence: 4
        },
        slayerXP: 0,
        combatStats: {
            attack: 1,
            strength: 1,
            defence: 1,
            magic: 1,
            ranged: 1
        },
        examine: 'A Chicken.',
        respawnTime: 30,
        size: 0.5,
        color: 0xFFFFCC
    },

    // ========== COWS ==========
    COW: {
        id: 'cow',
        name: 'Cow',
        level: 2,
        hitpoints: 8,
        maxHit: 1,
        attackSpeed: 4,
        aggressive: false,
        poisonous: false,
        attackStyle: 'melee',
        xpRewards: {
            hitpoints: 2.66,
            attack: 8,
            strength: 8,
            defence: 8
        },
        combatStats: {
            attack: 3,
            strength: 3,
            defence: 3,
            magic: 1,
            ranged: 1
        },
        examine: 'A cow.',
        respawnTime: 25,
        size: 1.2,
        color: 0xA0826D
    },

    COW_CALF: {
        id: 'cow_calf',
        name: 'Cow calf',
        level: 1,
        hitpoints: 4,
        maxHit: 0,
        attackSpeed: 4,
        aggressive: false,
        poisonous: false,
        attackStyle: 'melee',
        xpRewards: {
            hitpoints: 1.33,
            attack: 4,
            strength: 4,
            defence: 4
        },
        combatStats: {
            attack: 1,
            strength: 1,
            defence: 1
        },
        examine: 'A young cow.',
        respawnTime: 30,
        size: 0.8,
        color: 0xB8976D
    },

    // ========== GOBLINS ==========
    GOBLIN_LEVEL_2: {
        id: 'goblin_level_2',
        name: 'Goblin',
        level: 2,
        hitpoints: 5,
        maxHit: 1,
        attackSpeed: 4,
        aggressive: false,
        poisonous: false,
        attackStyle: 'melee',
        xpRewards: {
            hitpoints: 1.66,
            attack: 5,
            strength: 5,
            defence: 5
        },
        slayerXP: 0,
        combatStats: {
            attack: 3,
            strength: 3,
            defence: 3,
            magic: 1,
            ranged: 1
        },
        examine: 'An ugly green creature.',
        respawnTime: 30,
        size: 0.8,
        color: 0x6B8E23,
        variants: ['unarmed', 'sword', 'spear']
    },

    GOBLIN_LEVEL_5: {
        id: 'goblin_level_5',
        name: 'Goblin',
        level: 5,
        hitpoints: 13,
        maxHit: 2,
        attackSpeed: 4,
        aggressive: true, // Higher level goblins can be aggressive
        aggroRange: 10,
        poisonous: false,
        attackStyle: 'melee',
        xpRewards: {
            hitpoints: 4.33,
            attack: 13,
            strength: 13,
            defence: 13
        },
        slayerXP: 0,
        combatStats: {
            attack: 6,
            strength: 6,
            defence: 6,
            magic: 1,
            ranged: 1
        },
        examine: 'An ugly green creature.',
        respawnTime: 25,
        size: 0.9,
        color: 0x5A7A13,
        variants: ['sword', 'spear', 'armor']
    },

    // ========== RATS ==========
    RAT: {
        id: 'rat',
        name: 'Rat',
        level: 1,
        hitpoints: 3,
        maxHit: 1,
        attackSpeed: 4,
        aggressive: false,
        poisonous: false,
        attackStyle: 'melee',
        xpRewards: {
            hitpoints: 1,
            attack: 3,
            strength: 3,
            defence: 3
        },
        combatStats: {
            attack: 1,
            strength: 1,
            defence: 1
        },
        examine: 'A dirty rat.',
        respawnTime: 30,
        size: 0.3,
        color: 0x696969
    },

    GIANT_RAT_LEVEL_3: {
        id: 'giant_rat_level_3',
        name: 'Giant rat',
        level: 3,
        hitpoints: 6,
        maxHit: 1,
        attackSpeed: 4,
        aggressive: false,
        poisonous: false,
        attackStyle: 'melee',
        xpRewards: {
            hitpoints: 2,
            attack: 6,
            strength: 6,
            defence: 6
        },
        combatStats: {
            attack: 3,
            strength: 3,
            defence: 3
        },
        examine: 'A large rat.',
        respawnTime: 30,
        size: 0.6,
        color: 0x4A4A4A
    },

    GIANT_RAT_LEVEL_6: {
        id: 'giant_rat_level_6',
        name: 'Giant rat',
        level: 6,
        hitpoints: 8,
        maxHit: 2,
        attackSpeed: 4,
        aggressive: false,
        poisonous: false,
        attackStyle: 'melee',
        xpRewards: {
            hitpoints: 2.66,
            attack: 8,
            strength: 8,
            defence: 8
        },
        combatStats: {
            attack: 6,
            strength: 6,
            defence: 6
        },
        examine: 'A large rat with sharp teeth.',
        respawnTime: 25,
        size: 0.7,
        color: 0x3A3A3A
    },

    // ========== SPIDERS ==========
    SPIDER: {
        id: 'spider',
        name: 'Spider',
        level: 2,
        hitpoints: 5,
        maxHit: 1,
        attackSpeed: 4,
        aggressive: false,
        poisonous: false,
        attackStyle: 'melee',
        xpRewards: {
            hitpoints: 1.66,
            attack: 5,
            strength: 5,
            defence: 5
        },
        combatStats: {
            attack: 3,
            strength: 3,
            defence: 3
        },
        examine: 'An eight-legged pest.',
        respawnTime: 30,
        size: 0.4,
        color: 0x2F1F1F
    },

    // ========== MEN/WOMEN ==========
    MAN: {
        id: 'man',
        name: 'Man',
        level: 2,
        hitpoints: 7,
        maxHit: 1,
        attackSpeed: 4,
        aggressive: false,
        poisonous: false,
        attackStyle: 'melee',
        xpRewards: {
            hitpoints: 2.33,
            attack: 7,
            strength: 7,
            defence: 7
        },
        combatStats: {
            attack: 3,
            strength: 3,
            defence: 3
        },
        examine: 'One of Lumbridge\'s citizens.',
        respawnTime: 25,
        size: 1.0,
        color: 0x8B7355
    },

    WOMAN: {
        id: 'woman',
        name: 'Woman',
        level: 2,
        hitpoints: 7,
        maxHit: 1,
        attackSpeed: 4,
        aggressive: false,
        poisonous: false,
        attackStyle: 'melee',
        xpRewards: {
            hitpoints: 2.33,
            attack: 7,
            strength: 7,
            defence: 7
        },
        combatStats: {
            attack: 3,
            strength: 3,
            defence: 3
        },
        examine: 'One of Lumbridge\'s citizens.',
        respawnTime: 25,
        size: 1.0,
        color: 0x9B8365
    },

    // ========== SHEEP ==========
    SHEEP_UNSHORN: {
        id: 'sheep_unshorn',
        name: 'Sheep',
        level: 1,
        hitpoints: 8,
        maxHit: 0, // Sheep don't attack
        attackSpeed: 0,
        aggressive: false,
        poisonous: false,
        attackStyle: 'none',
        xpRewards: {
            hitpoints: 2.66,
            attack: 8,
            strength: 8,
            defence: 8
        },
        combatStats: {
            attack: 1,
            strength: 1,
            defence: 1
        },
        examine: 'A fluffy sheep with wool.',
        respawnTime: 60,
        size: 0.9,
        color: 0xF5F5DC,
        canShear: true
    },

    SHEEP_SHORN: {
        id: 'sheep_shorn',
        name: 'Sheep',
        level: 1,
        hitpoints: 8,
        maxHit: 0,
        attackSpeed: 0,
        aggressive: false,
        poisonous: false,
        attackStyle: 'none',
        xpRewards: {
            hitpoints: 2.66,
            attack: 8,
            strength: 8,
            defence: 8
        },
        combatStats: {
            attack: 1,
            strength: 1,
            defence: 1
        },
        examine: 'A recently sheared sheep.',
        respawnTime: 60,
        size: 0.9,
        color: 0xD3D3D3,
        canShear: false,
        regrowWoolTime: 90 // seconds
    },

    // ========== QUEST ENEMIES ==========
    RESTLESS_GHOST: {
        id: 'restless_ghost',
        name: 'Restless ghost',
        level: 13,
        hitpoints: 0, // Cannot be killed
        maxHit: 0,
        attackSpeed: 0,
        aggressive: false,
        poisonous: false,
        attackStyle: 'none',
        xpRewards: {},
        combatStats: {
            attack: 1,
            strength: 1,
            defence: 999
        },
        examine: 'The spirit looks very unhappy.',
        respawnTime: 0,
        size: 1.0,
        color: 0xCCFFFF,
        isQuestNPC: true,
        quest: 'the_restless_ghost'
    },

    SKELETON_WARLOCK: {
        id: 'skeleton_warlock',
        name: 'Skeleton',
        level: 7,
        hitpoints: 15,
        maxHit: 2,
        attackSpeed: 4,
        aggressive: true,
        aggroRange: 3,
        poisonous: false,
        attackStyle: 'melee',
        xpRewards: {
            hitpoints: 5,
            attack: 15,
            strength: 15,
            defence: 15
        },
        combatStats: {
            attack: 7,
            strength: 7,
            defence: 7
        },
        examine: 'An animated skeleton.',
        respawnTime: 20,
        size: 1.0,
        color: 0xE8E8E8,
        isQuestNPC: true,
        quest: 'the_restless_ghost'
    },

    // ========== DUNGEON/CAVE ENEMIES ==========
    CAVE_GOBLIN: {
        id: 'cave_goblin',
        name: 'Cave goblin',
        level: 3,
        hitpoints: 7,
        maxHit: 1,
        attackSpeed: 4,
        aggressive: false,
        poisonous: false,
        attackStyle: 'melee',
        xpRewards: {
            hitpoints: 2.33,
            attack: 7,
            strength: 7,
            defence: 7
        },
        combatStats: {
            attack: 4,
            strength: 4,
            defence: 4
        },
        examine: 'A goblin from the caves below.',
        respawnTime: 30,
        size: 0.8,
        color: 0x5B6C42,
        isQuestNPC: true,
        quest: 'the_lost_tribe'
    },

    FROG: {
        id: 'frog',
        name: 'Frog',
        level: 1,
        hitpoints: 3,
        maxHit: 1,
        attackSpeed: 4,
        aggressive: false,
        poisonous: false,
        attackStyle: 'melee',
        xpRewards: {
            hitpoints: 1,
            attack: 3,
            strength: 3,
            defence: 3
        },
        combatStats: {
            attack: 1,
            strength: 1,
            defence: 1
        },
        examine: 'A small frog.',
        respawnTime: 30,
        size: 0.3,
        color: 0x228B22,
        location: 'Lumbridge Swamp'
    }
};

// Spawn locations for different enemy types
export const SPAWN_LOCATIONS = {
    CHICKEN: [
        { x: -85, z: 10, count: 8, area: 'Fred\'s Farm chicken pen' }
    ],
    COW: [
        { x: -85, z: -30, count: 6, area: 'Northwest cow field' },
        { x: 30, z: -40, count: 5, area: 'East cow field' }
    ],
    GOBLIN_LEVEL_2: [
        { x: 40, z: 15, count: 6, area: 'East of river' }
    ],
    GOBLIN_LEVEL_5: [
        { x: 60, z: 20, count: 4, area: 'Far east' }
    ],
    GIANT_RAT_LEVEL_3: [
        { x: -20, z: 80, count: 5, area: 'Lumbridge Swamp' }
    ],
    SHEEP_UNSHORN: [
        { x: -70, z: -15, count: 10, area: 'Fred\'s Farm' },
        { x: -50, z: 5, count: 8, area: 'Sheep pen' }
    ],
    RAT: [
        { x: -30, z: -30, count: 3, area: 'Lumbridge Castle basement' }
    ],
    SPIDER: [
        { x: -25, z: 75, count: 4, area: 'Lumbridge Swamp' }
    ],
    FROG: [
        { x: -30, z: 90, count: 6, area: 'Lumbridge Swamp' }
    ]
};

export function getEnemyData(enemyId) {
    return ENEMY_DATA[enemyId.toUpperCase()];
}

export function getEnemiesByLocation(location) {
    const enemies = [];
    for (const [enemyType, locations] of Object.entries(SPAWN_LOCATIONS)) {
        for (const loc of locations) {
            if (loc.area === location) {
                enemies.push({ type: enemyType, ...loc });
            }
        }
    }
    return enemies;
}

export default ENEMY_DATA;
