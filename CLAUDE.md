# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a faithful recreation of RuneScape's Lumbridge using Three.js with enhanced 64-bit HDR graphics. The project features authentic OSRS mechanics including combat, skills, inventory, equipment, quests, NPCs, and enemies, with physically-based rendering and advanced post-processing effects.

## Development Commands

### Running the Game
```bash
npm run dev
```
Starts a Python HTTP server on port 8000. Navigate to `http://localhost:8000` in your browser.

### Testing
```bash
npm test                # Run all tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

The test suite uses Jest with jsdom environment and Babel for ES6+ module transpilation. Tests mock Three.js and DOM elements to avoid canvas/WebGL issues in the Node.js test environment.

**Coverage thresholds**: 70% for branches, functions, lines, and statements (configured in package.json).

## Architecture

### Core Game Loop
The game follows this initialization sequence:
1. `main.js` - Entry point, creates GameLogic instance
2. `GameLogic.init()` - Coordinates initialization of all systems
3. `GameEngine.init()` - Sets up Three.js renderer, scene, lights
4. Player, world, and systems are created and connected
5. UI is initialized and loading screen is hidden

### Module Organization

**Entry Point**
- `src/main.js` - Initializes GameLogic, handles page visibility

**Core Controller**
- `src/game/GameLogic.js` - Main game controller that integrates all systems, handles camera, controls, and update loop

**Rendering**
- `src/engine/GameEngine.js` - Three.js rendering engine with 64-bit HDR color, ACES tone mapping, VSM shadow maps (4096x4096)
- `src/engine/PostProcessingManager.js` - Post-processing pipeline with HDR bloom, SSAO, FXAA, and output passes

**Entities**
- `src/entities/Player.js` - Player character with skills (1-99), XP, inventory (28 slots), equipment (11 slots), combat state
- `src/entities/NPC.js` - Non-player characters with dialogue trees, quest associations, roaming behavior
- `src/entities/Enemy.js` - Hostile creatures with AI, respawning, loot drops

**Systems** (All systems receive GameLogic or Player reference in constructor)
- `src/systems/CombatSystem.js` - OSRS-style combat with accuracy/damage formulas, attack cooldown (2.4s), XP rewards
- `src/systems/SkillsSystem.js` - Skills like Mining, Woodcutting, Fishing with resource management
- `src/systems/QuestSystem.js` - Stage-based quest progression (6 quests implemented)
- `src/systems/LootSystem.js` - Probabilistic loot tables with Rare Drop Table (1/1000 chance)
- `src/systems/ShopSystem.js` - Buy/sell with auto-restocking (2 shops: Bob's Axes, General Store)

**World**
- `src/world/Lumbridge.js` - Creates terrain, river, buildings, spawns NPCs/enemies/resources

**Data**
- `src/data/NPCData.js` - 25+ NPCs with full dialogue trees and quest associations
- `src/data/EnemyData.js` - 15 enemy types with stats, loot tables, spawn locations

**Utilities**
- `src/utils/Constants.js` - Game constants: XP_TABLE (levels 1-99), SKILLS, ITEMS (70+ with OSRS IDs), ENEMY_TYPES, NPC_TYPES, etc.
- `src/utils/XPCalculator.js` - XP/level calculations, combat formulas (accuracy, max hit, damage)

**UI**
- `src/ui/UIManager.js` - Updates stats, inventory, equipment, minimap, chat messages

### System Integration Pattern

Systems are interconnected through GameLogic:
- GameLogic holds references to Player, World, all Systems, and UIManager
- Systems receive GameLogic (or Player) in constructor to access other components
- Example: CombatSystem accesses `this.gameLogic.ui.addMessage()` and `this.gameLogic.lootSystem.generateLoot()`

### Data-Driven Design

NPCs and Enemies are data-driven:
- **NPCData.js** defines dialogue trees, quest associations, roaming behavior
- **EnemyData.js** defines stats, loot tables with probabilities, spawn locations
- Entity classes (NPC.js, Enemy.js) consume this data in constructors
- IDs are used for cross-referencing (e.g., quests reference NPC IDs, loot system uses enemy IDs)

### XP and Leveling

The game uses the authentic OSRS XP table (exported as XP_TABLE in Constants.js):
- **XP_TABLE array**: Index 0 = level 1 (0 XP), Index 98 = level 99 (13,034,431 XP)
- **XPCalculator functions** operate on this table:
  - `getLevel(xp)` - Returns level for given XP
  - `getXPForLevel(level)` - Returns XP required for level (careful: array is 0-indexed, so level 1 = index 0)
  - `getXPToNextLevel(currentXP)` - Returns XP needed to next level
  - `getProgressToNextLevel(currentXP)` - Returns 0-1 progress percentage

**Critical**: When accessing XP_TABLE by level, use `XP_TABLE[level - 1]` because the array is 0-indexed but levels are 1-indexed.

### Combat Mechanics

Combat uses authentic OSRS formulas (in XPCalculator.js):
- **Accuracy**: Based on attacker's Attack level + bonuses vs defender's Defence level + bonuses
- **Max Hit**: Based on Strength level + strength bonus (formula: `floor((level + 8) * (64 + bonus) / 640)`)
- **Attack Cooldown**: 2.4 seconds (OSRS tick speed)
- **XP Rewards**: 4 XP per damage dealt in Attack/Strength/Defence, 1.33 XP per damage in Hitpoints

### Testing Patterns

Tests follow these patterns:
1. **Mock Three.js**: Tests spy on `Player.prototype.createMesh` and mock the mesh structure
2. **Mock GameLogic**: Tests create minimal mocks with only required references (player, ui.addMessage, etc.)
3. **Mock UI**: Tests mock `ui.addMessage` to prevent DOM access
4. **Integration tests** (Integration.test.js) verify multiple systems working together

When writing new tests:
- Always mock `Player.prototype.createMesh` before creating Player instances
- Mock GameLogic with structure: `{ player, ui: { addMessage: jest.fn() } }`
- Import constants from `src/utils/Constants.js` (don't hardcode values)

## Common Patterns

### Adding New NPCs
1. Add entry to `NPC_DATA` in `src/data/NPCData.js` with unique ID
2. Define dialogue tree (structure: `{ initial: string, responses: [{text, next}], special: {quest_id: {stage: {...}}} }`)
3. Spawn NPC in `src/world/Lumbridge.js` using `new NPC(x, z, 'NPC_ID')`

### Adding New Enemies
1. Add entry to `ENEMY_DATA` in `src/data/EnemyData.js` with unique ID
2. Define stats (level, hitpoints, xpReward) and loot table (array of `{item, chance}`)
3. Add spawn location to `SPAWN_LOCATIONS` array
4. Spawn enemy in `src/world/Lumbridge.js` using `new Enemy(x, z, 'ENEMY_ID')`

### Adding New Items
1. Add item to `ITEMS` in `src/utils/Constants.js` with OSRS item ID, name, stackable flag, value
2. Add item to loot tables in EnemyData.js if it should drop
3. Add item to shop inventories in ShopSystem if it should be sold

### Adding New Quests
1. Define quest in `QuestSystem.js` constructor (add to `this.quests` object)
2. Structure: `{ name, stages: [{description, completed, requirements, onComplete}] }`
3. Link NPCs to quest by adding special dialogue in NPCData.js (`special: { quest_id: { stage: {...} } }`)
4. Add quest checks in GameLogic click handlers (right-click menus)

## Browser Debugging

The game instance is exposed as `window.game` for debugging in the browser console:

```javascript
// Add XP to skills
window.game.player.addXP('attack', 10000);

// Add items to inventory
window.game.player.addItem(ITEMS.COINS, 1000);

// Stop combat
window.game.combatSystem.stopCombat();

// Check player stats
window.game.player.skills.attack; // { level: X, xp: Y }

// Access world objects
window.game.world.npcs; // Array of NPCs
window.game.world.enemies; // Array of enemies
```

## File Exclusions

The following files are excluded from test coverage (see package.json):
- `src/main.js` - Entry point
- `src/game/GameLogic.js` - Difficult to test (Three.js integration)
- `src/ui/UIManager.js` - DOM-heavy
- `src/world/Lumbridge.js` - Three.js mesh creation

## Key Technical Decisions

**Three.js Configuration**:
- 64-bit HDR color depth (HalfFloatType, 16-bit per channel)
- PBR materials using MeshStandardMaterial with roughness/metalness workflow
- `outputColorSpace: THREE.SRGBColorSpace` for proper color conversion
- ACES Filmic tone mapping with exposure 1.2 for HDR
- 4096x4096 VSM shadow maps for ultra-high quality shadows
- Post-processing pipeline: HDR Bloom, SSAO, FXAA, Output Pass
- 60 FPS target with optimized HDR rendering

**Module System**: ES6 modules with `type: "module"` in package.json. All imports use `.js` extensions.

**Test Environment**: Jest with `jest-environment-jsdom` for DOM access and `babel-jest` for ES6+ transpilation.

**No Build Step**: The game runs directly in the browser without bundling. A simple HTTP server is sufficient.
