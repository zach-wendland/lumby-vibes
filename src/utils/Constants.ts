/**
 * Game Constants - RuneScape Lumbridge
 * TypeScript version with full type safety
 */

import type { OSRSItem, CameraSettings, GameColors, SkillName, EquipmentSlot } from '../types/index';

// ============ WORLD CONSTANTS ============

export const WORLD_SIZE: number = 300;
export const TILE_SIZE: number = 2;

// ============ MOVEMENT SPEEDS ============

export const PLAYER_SPEED: number = 10;
export const NPC_SPEED: number = 3;
export const ENEMY_SPEED: number = 5;

// ============ COMBAT CONSTANTS ============

export const COMBAT_RANGE: number = 5;
export const ATTACK_COOLDOWN: number = 2.4; // seconds (RuneScape tick speed)
export const MAX_HIT: number = 10;

// ============ XP TABLE ============

/**
 * OSRS XP Table - Index is (level - 1)
 * Index 0 = Level 1 (0 XP), Index 98 = Level 99 (13,034,431 XP)
 */
export const XP_TABLE: readonly number[] = [
    0, 83, 174, 276, 388, 512, 650, 801, 969, 1154, 1358,
    1584, 1833, 2107, 2411, 2746, 3115, 3523, 3973, 4470, 5018,
    5624, 6291, 7028, 7842, 8740, 9730, 10824, 12031, 13363, 14833,
    16456, 18247, 20224, 22406, 24815, 27473, 30408, 33648, 37224, 41171,
    45529, 50339, 55649, 61512, 67983, 75127, 83014, 91721, 101333, 111945,
    123660, 136594, 150872, 166636, 184040, 203254, 224466, 247886, 273742, 302288,
    333804, 368599, 407015, 449428, 496254, 547953, 605032, 668051, 737627, 814445,
    899257, 992895, 1096278, 1210421, 1336443, 1475581, 1629200, 1798808, 1986068, 2192818,
    2421087, 2673114, 2951373, 3258594, 3597792, 3972294, 4385776, 4842295, 5346332, 5902831,
    6517253, 7195629, 7944614, 8771558, 9684577, 10692629, 11805606, 13034431, 14391160, 15889109,
    17542976, 19368992, 21385073, 23611006, 26068632, 28782069, 31777943, 35085654, 38737661, 42769801,
    47221641, 52136869, 57563718, 63555443, 70170840, 77474828, 85539082, 94442737, 104273167
] as const;

// ============ SKILLS ============

export const SKILLS: Record<Uppercase<SkillName>, SkillName> = {
    ATTACK: 'attack',
    STRENGTH: 'strength',
    DEFENCE: 'defence',
    HITPOINTS: 'hitpoints',
    RANGED: 'ranged',
    PRAYER: 'prayer',
    MAGIC: 'magic',
    COOKING: 'cooking',
    WOODCUTTING: 'woodcutting',
    FISHING: 'fishing',
    FIREMAKING: 'firemaking',
    CRAFTING: 'crafting',
    SMITHING: 'smithing',
    MINING: 'mining'
} as const;

// ============ ITEMS ============

export const ITEMS: Record<string, OSRSItem> = {
    // Currency
    COINS: { id: 995, name: 'Coins', stackable: true, value: 1 },
    // Bones
    BONES: { id: 526, name: 'Bones', stackable: true, value: 31 },
    // Food drops
    RAW_CHICKEN: { id: 2138, name: 'Raw chicken', stackable: true, value: 24 },
    RAW_BEEF: { id: 2132, name: 'Raw beef', stackable: true, value: 70 },
    RAW_RAT_MEAT: { id: 2134, name: 'Raw rat meat', stackable: true, value: 5 },
    RAW_MUTTON: { id: 2138, name: 'Raw mutton', stackable: true, value: 40 },
    // Materials
    FEATHER: { id: 314, name: 'Feather', stackable: true, value: 3 },
    FEATHERS: { id: 314, name: 'Feather', stackable: true, value: 3 }, // Alias for loot system
    COWHIDE: { id: 1739, name: 'Cowhide', stackable: true, value: 150 },
    WOOL: { id: 1737, name: 'Wool', stackable: true, value: 60 },
    BALL_OF_WOOL: { id: 1759, name: 'Ball of wool', stackable: true, value: 80 },
    LOGS: { id: 1511, name: 'Logs', stackable: true, value: 50 },
    COPPER_ORE: { id: 436, name: 'Copper ore', stackable: true, value: 30 },
    TIN_ORE: { id: 438, name: 'Tin ore', stackable: true, value: 25 },
    RAW_SHRIMPS: { id: 317, name: 'Raw shrimps', stackable: true, value: 15 },
    // Weapons
    BRONZE_SWORD: { id: 1277, name: 'Bronze sword', stackable: false, value: 25 },
    BRONZE_AXE: { id: 1351, name: 'Bronze axe', stackable: false, value: 16 },
    BRONZE_PICKAXE: { id: 1265, name: 'Bronze pickaxe', stackable: false, value: 16 },
    BRONZE_DAGGER: { id: 1205, name: 'Bronze dagger', stackable: false, value: 20 },
    BRONZE_SPEAR: { id: 1237, name: 'Bronze spear', stackable: false, value: 30 },
    IRON_AXE: { id: 1349, name: 'Iron axe', stackable: false, value: 112 },
    IRON_PICKAXE: { id: 1267, name: 'Iron pickaxe', stackable: false, value: 175 },
    STEEL_AXE: { id: 1353, name: 'Steel axe', stackable: false, value: 560 },
    MITHRIL_AXE: { id: 1355, name: 'Mithril axe', stackable: false, value: 1248 },
    ADAMANT_AXE: { id: 1357, name: 'Adamant axe', stackable: false, value: 2912 },
    RUNE_AXE: { id: 1359, name: 'Rune axe', stackable: false, value: 20992 },
    // Armor
    BRONZE_FULL_HELM: { id: 1155, name: 'Bronze full helm', stackable: false, value: 40 },
    BRONZE_SQUARE_SHIELD: { id: 1173, name: 'Bronze square shield', stackable: false, value: 25 },
    GOBLIN_MAIL: { id: 288, name: 'Goblin mail', stackable: false, value: 12 },
    WOODEN_SHIELD: { id: 1171, name: 'Wooden shield', stackable: false, value: 10 },
    LEATHER_BOOTS: { id: 1061, name: 'Leather boots', stackable: false, value: 20 },
    LEATHER_GLOVES: { id: 1059, name: 'Leather gloves', stackable: false, value: 15 },
    // Tools
    SMALL_FISHING_NET: { id: 303, name: 'Small fishing net', stackable: false, value: 5 },
    SHEARS: { id: 1735, name: 'Shears', stackable: false, value: 1 },
    BUCKET: { id: 1925, name: 'Bucket', stackable: false, value: 2 },
    BUCKET_OF_MILK: { id: 1927, name: 'Bucket of milk', stackable: false, value: 10 },
    POT: { id: 1931, name: 'Pot', stackable: false, value: 1 },
    POT_OF_FLOUR: { id: 1933, name: 'Pot of flour', stackable: false, value: 5 },
    EGG: { id: 1944, name: 'Egg', stackable: false, value: 8 },
    JUG: { id: 1935, name: 'Jug', stackable: false, value: 1 },
    TINDERBOX: { id: 590, name: 'Tinderbox', stackable: false, value: 1 },
    CHISEL: { id: 1755, name: 'Chisel', stackable: false, value: 1 },
    HAMMER: { id: 2347, name: 'Hammer', stackable: false, value: 1 },
    ROPE: { id: 954, name: 'Rope', stackable: false, value: 18 },
    // Quest items
    AIR_TALISMAN: { id: 1438, name: 'Air talisman', stackable: false, value: 10 },
    AMULET_OF_GHOSTSPEAK: { id: 552, name: 'Amulet of ghostspeak', stackable: false, value: 100 },
    GHOST_SKULL: { id: 553, name: "Ghost's skull", stackable: false, value: 1 },
    // Consumables
    BEER: { id: 1917, name: 'Beer', stackable: false, value: 2 },
    GRAPES: { id: 1987, name: 'Grapes', stackable: true, value: 15 },
    // Runes
    CHAOS_RUNE: { id: 562, name: 'Chaos rune', stackable: true, value: 100 },
    NATURE_RUNE: { id: 561, name: 'Nature rune', stackable: true, value: 200 },
    LAW_RUNE: { id: 563, name: 'Law rune', stackable: true, value: 180 },
    DEATH_RUNE: { id: 560, name: 'Death rune', stackable: true, value: 250 },
    // Rare items
    RUNE_JAVELIN: { id: 830, name: 'Rune javelin', stackable: true, value: 500 },
    RUNE_DAGGER: { id: 1213, name: 'Rune dagger', stackable: false, value: 5000 },
    RUNE_2H_SWORD: { id: 1319, name: 'Rune 2h sword', stackable: false, value: 38000 },
    DRAGON_MED_HELM: { id: 1149, name: 'Dragon med helm', stackable: false, value: 59000 },
    SHIELD_LEFT_HALF: { id: 2366, name: 'Shield left half', stackable: false, value: 65000000 },
    DRAGON_SPEAR: { id: 1249, name: 'Dragon spear', stackable: false, value: 37000 },
    // Misc
    BRONZE_ARROW: { id: 882, name: 'Bronze arrow', stackable: true, value: 2 },
    NEWCOMER_MAP: { id: 550, name: 'Newcomer map', stackable: false, value: 1 },
    // Cooked food
    COOKED_CHICKEN: { id: 2140, name: 'Cooked chicken', stackable: false, value: 35 },
    COOKED_MEAT: { id: 2142, name: 'Cooked meat', stackable: false, value: 80 },
    BREAD: { id: 2309, name: 'Bread', stackable: false, value: 25 },
    SHRIMPS: { id: 315, name: 'Shrimps', stackable: false, value: 20 }
} as const;

// ============ EQUIPMENT SLOT MAPPING ============

/**
 * Maps item IDs to equipment slots
 */
export const EQUIPMENT_SLOTS: Record<number, EquipmentSlot> = {
    // Head
    [ITEMS.BRONZE_FULL_HELM.id]: 'head',
    // Body
    [ITEMS.GOBLIN_MAIL.id]: 'body',
    // Shield
    [ITEMS.BRONZE_SQUARE_SHIELD.id]: 'shield',
    [ITEMS.WOODEN_SHIELD.id]: 'shield',
    // Weapons (1-handed)
    [ITEMS.BRONZE_SWORD.id]: 'weapon',
    [ITEMS.BRONZE_AXE.id]: 'weapon',
    [ITEMS.BRONZE_PICKAXE.id]: 'weapon',
    [ITEMS.BRONZE_DAGGER.id]: 'weapon',
    [ITEMS.BRONZE_SPEAR.id]: 'weapon',
    [ITEMS.IRON_AXE.id]: 'weapon',
    [ITEMS.IRON_PICKAXE.id]: 'weapon',
    [ITEMS.STEEL_AXE.id]: 'weapon',
    [ITEMS.MITHRIL_AXE.id]: 'weapon',
    [ITEMS.ADAMANT_AXE.id]: 'weapon',
    [ITEMS.RUNE_AXE.id]: 'weapon',
    [ITEMS.RUNE_DAGGER.id]: 'weapon',
    [ITEMS.RUNE_2H_SWORD.id]: 'weapon',
    [ITEMS.DRAGON_SPEAR.id]: 'weapon',
    // Hands
    [ITEMS.LEATHER_GLOVES.id]: 'hands',
    // Feet
    [ITEMS.LEATHER_BOOTS.id]: 'feet',
    // Neck
    [ITEMS.AMULET_OF_GHOSTSPEAK.id]: 'neck',
    // Head (dragon)
    [ITEMS.DRAGON_MED_HELM.id]: 'head',
    // Ammo
    [ITEMS.BRONZE_ARROW.id]: 'ammo',
    [ITEMS.RUNE_JAVELIN.id]: 'ammo'
};

// ============ FOOD HEALING ============

/**
 * Maps food item IDs to HP healed
 */
export const FOOD_HEALING: Record<number, number> = {
    [ITEMS.SHRIMPS.id]: 3,
    [ITEMS.COOKED_CHICKEN.id]: 3,
    [ITEMS.COOKED_MEAT.id]: 3,
    [ITEMS.BREAD.id]: 5,
    [ITEMS.BEER.id]: 1,
    [ITEMS.GRAPES.id]: 2
};

// ============ EQUIPMENT BONUSES ============

/**
 * Maps item IDs to attack/strength/defence bonuses
 */
export const EQUIPMENT_BONUSES: Record<number, { attack?: number; strength?: number; defence?: number }> = {
    // Weapons
    [ITEMS.BRONZE_SWORD.id]: { attack: 4, strength: 3 },
    [ITEMS.BRONZE_DAGGER.id]: { attack: 2, strength: 1 },
    [ITEMS.BRONZE_AXE.id]: { attack: 3, strength: 2 },
    [ITEMS.BRONZE_PICKAXE.id]: { attack: 2, strength: 1 },
    [ITEMS.BRONZE_SPEAR.id]: { attack: 3, strength: 3 },
    [ITEMS.IRON_AXE.id]: { attack: 6, strength: 4 },
    [ITEMS.IRON_PICKAXE.id]: { attack: 5, strength: 3 },
    [ITEMS.STEEL_AXE.id]: { attack: 10, strength: 8 },
    [ITEMS.MITHRIL_AXE.id]: { attack: 15, strength: 12 },
    [ITEMS.ADAMANT_AXE.id]: { attack: 22, strength: 18 },
    [ITEMS.RUNE_AXE.id]: { attack: 32, strength: 26 },
    [ITEMS.RUNE_DAGGER.id]: { attack: 25, strength: 14 },
    [ITEMS.RUNE_2H_SWORD.id]: { attack: 69, strength: 70 },
    [ITEMS.DRAGON_SPEAR.id]: { attack: 55, strength: 60 },
    // Armor
    [ITEMS.BRONZE_FULL_HELM.id]: { defence: 4 },
    [ITEMS.BRONZE_SQUARE_SHIELD.id]: { defence: 5 },
    [ITEMS.WOODEN_SHIELD.id]: { defence: 2 },
    [ITEMS.GOBLIN_MAIL.id]: { defence: 2 },
    [ITEMS.LEATHER_BOOTS.id]: { defence: 1 },
    [ITEMS.LEATHER_GLOVES.id]: { defence: 1 },
    [ITEMS.DRAGON_MED_HELM.id]: { defence: 33 }
};

// ============ NPC TYPES ============

export const NPC_TYPES = {
    DUKE_HORACIO: 'Duke Horacio',
    HANS: 'Hans',
    BOB: 'Bob',
    COOK: 'Cook',
    FATHER_AERECK: 'Father Aereck',
    DONIE: 'Donie',
    GUARD: 'Guard',
    FARMER: 'Farmer',
    VILLAGER: 'Villager'
} as const;

export type NPCTypeName = typeof NPC_TYPES[keyof typeof NPC_TYPES];

// ============ ENEMY TYPES ============

export interface EnemyTypeInfo {
    name: string;
    level: number;
    hp: number;
    xp: number;
}

export const ENEMY_TYPES: Record<string, EnemyTypeInfo> = {
    CHICKEN: { name: 'Chicken', level: 1, hp: 3, xp: 5 },
    COW: { name: 'Cow', level: 2, hp: 8, xp: 8 },
    GOBLIN_2: { name: 'Goblin', level: 2, hp: 5, xp: 6 },
    GOBLIN_5: { name: 'Goblin', level: 5, hp: 13, xp: 12 },
    GIANT_RAT: { name: 'Giant rat', level: 3, hp: 6, xp: 6 }
} as const;

// ============ BUILDINGS ============

export const BUILDINGS = {
    LUMBRIDGE_CASTLE: 'Lumbridge Castle',
    CHURCH: 'Church',
    GENERAL_STORE: 'General Store',
    BOBS_AXES: "Bob's Brilliant Axes",
    CHICKEN_FARM: 'Chicken Farm',
    SHEEP_FARM: 'Sheep Farm',
    COW_FIELD: 'Cow Field',
    GOBLIN_HOUSE: 'Goblin House'
} as const;

export type BuildingName = typeof BUILDINGS[keyof typeof BUILDINGS];

// ============ COLORS ============

export const COLORS: GameColors = {
    // Terrain
    GRASS: 0x6B8E23,
    DIRT: 0x8B7355,
    STONE: 0x708090,
    WATER: 0x4682B4,
    SAND: 0xC2B280,
    // Buildings
    CASTLE_STONE: 0x696969,
    WOOD: 0x8B4513,
    ROOF_RED: 0xB22222,
    ROOF_GRAY: 0x778899,
    // UI
    UI_YELLOW: 0xFFFF00,
    UI_GREEN: 0x00FF00,
    UI_RED: 0xFF0000,
    UI_BLUE: 0x0099CC,
    // Characters
    PLAYER_BLUE: 0x1E90FF,
    NPC_YELLOW: 0xFFD700,
    ENEMY_RED: 0xDC143C
} as const;

// ============ CAMERA ============

export const CAMERA: CameraSettings = {
    DEFAULT_DISTANCE: 30,
    DEFAULT_HEIGHT: 25,
    DEFAULT_ANGLE: Math.PI / 4,
    MIN_DISTANCE: 15,
    MAX_DISTANCE: 60,
    ROTATION_SPEED: 0.05,
    ZOOM_SPEED: 2
} as const;

// ============ DEFAULT EXPORT ============

export default {
    WORLD_SIZE,
    TILE_SIZE,
    PLAYER_SPEED,
    NPC_SPEED,
    ENEMY_SPEED,
    COMBAT_RANGE,
    ATTACK_COOLDOWN,
    MAX_HIT,
    XP_TABLE,
    SKILLS,
    ITEMS,
    NPC_TYPES,
    ENEMY_TYPES,
    BUILDINGS,
    COLORS,
    CAMERA
};
