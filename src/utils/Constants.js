/**
 * Game Constants - RuneScape Lumbridge
 */

export const WORLD_SIZE = 300;
export const TILE_SIZE = 2;

// Movement speeds
export const PLAYER_SPEED = 10;
export const NPC_SPEED = 3;
export const ENEMY_SPEED = 5;

// Combat constants
export const COMBAT_RANGE = 5;
export const ATTACK_COOLDOWN = 2.4; // seconds (RuneScape tick speed)
export const MAX_HIT = 10;

// Skill XP rates (RuneScape-style)
export const XP_TABLE = [
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
];

// Skill names
export const SKILLS = {
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
};

// Item IDs
export const ITEMS = {
    BRONZE_SWORD: { id: 1, name: 'Bronze sword', stackable: false },
    BRONZE_AXE: { id: 2, name: 'Bronze axe', stackable: false },
    BRONZE_PICKAXE: { id: 3, name: 'Bronze pickaxe', stackable: false },
    SMALL_FISHING_NET: { id: 4, name: 'Small fishing net', stackable: false },
    LOGS: { id: 5, name: 'Logs', stackable: true },
    RAW_SHRIMPS: { id: 6, name: 'Raw shrimps', stackable: true },
    COPPER_ORE: { id: 7, name: 'Copper ore', stackable: true },
    TIN_ORE: { id: 8, name: 'Tin ore', stackable: true },
    BONES: { id: 9, name: 'Bones', stackable: true },
    FEATHER: { id: 10, name: 'Feather', stackable: true },
    RAW_CHICKEN: { id: 11, name: 'Raw chicken', stackable: true },
    COWHIDE: { id: 12, name: 'Cowhide', stackable: true },
    RAW_BEEF: { id: 13, name: 'Raw beef', stackable: true },
    COINS: { id: 14, name: 'Coins', stackable: true }
};

// NPC Types
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
};

// Enemy Types
export const ENEMY_TYPES = {
    CHICKEN: { name: 'Chicken', level: 1, hp: 3, xp: 5 },
    COW: { name: 'Cow', level: 2, hp: 8, xp: 8 },
    GOBLIN_2: { name: 'Goblin', level: 2, hp: 5, xp: 6 },
    GOBLIN_5: { name: 'Goblin', level: 5, hp: 13, xp: 12 },
    GIANT_RAT: { name: 'Giant rat', level: 3, hp: 6, xp: 6 }
};

// Building types
export const BUILDINGS = {
    LUMBRIDGE_CASTLE: 'Lumbridge Castle',
    CHURCH: 'Church',
    GENERAL_STORE: 'General Store',
    BOBS_AXES: "Bob's Brilliant Axes",
    CHICKEN_FARM: 'Chicken Farm',
    SHEEP_FARM: 'Sheep Farm',
    COW_FIELD: 'Cow Field',
    GOBLIN_HOUSE: 'Goblin House'
};

// Colors (32-bit RGBA)
export const COLORS = {
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
};

// Camera settings
export const CAMERA = {
    DEFAULT_DISTANCE: 30,
    DEFAULT_HEIGHT: 25,
    DEFAULT_ANGLE: Math.PI / 4,
    MIN_DISTANCE: 15,
    MAX_DISTANCE: 60,
    ROTATION_SPEED: 0.05,
    ZOOM_SPEED: 2
};

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
