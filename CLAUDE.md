# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a RuneScape-inspired 3D browser game recreating Lumbridge using Three.js. The project implements basic OSRS-style mechanics including combat, skills, inventory, equipment, quests, NPCs, and enemies. It uses modern WebGL rendering with PBR materials and post-processing.

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

**Note**: Main game files (GameLogic, UIManager, Lumbridge, PostProcessingManager) are excluded from coverage as they're difficult to test in isolation. Current test suite covers system logic and entity behavior with 70% coverage thresholds.

## Architecture

### Core Game Loop
The game follows this initialization sequence:
1. `main.ts` - Entry point, creates GameLogic instance
2. `GameLogic.init()` - Coordinates initialization of all systems
3. `GameEngine.init()` - Sets up Three.js renderer, scene, lights
4. Player, world, and systems are created and connected
5. UI is initialized and loading screen is hidden

### Module Organization

**Entry Point**
- `src/main.ts` - Initializes GameLogic, handles page visibility

**Core Controller**
- `src/game/GameLogic.ts` - Main game controller that integrates all systems, handles camera, controls, and update loop

**Rendering**
- `src/engine/GameEngine.ts` - Three.js rendering engine with 64-bit HDR color, ACES tone mapping, VSM shadow maps (4096x4096)
- `src/engine/PostProcessingManager.ts` - Post-processing pipeline with HDR bloom, SSAO, FXAA, and output passes

**Entities**
- `src/entities/Player.ts` - Player character with skills (1-99), XP, inventory (28 slots), equipment (11 slots), combat state
- `src/entities/NPC.ts` - Non-player characters with dialogue trees, quest associations, roaming behavior
- `src/entities/Enemy.ts` - Hostile creatures with AI, respawning, loot drops

**Systems** (All systems receive GameLogic or Player reference in constructor)
- `src/systems/CombatSystem.ts` - OSRS-style combat with accuracy/damage formulas, attack cooldown (2.4s), XP rewards
- `src/systems/SkillsSystem.ts` - Skills like Mining, Woodcutting, Fishing with resource management
- `src/systems/QuestSystem.ts` - Stage-based quest progression (6 quests implemented)
- `src/systems/LootSystem.ts` - Probabilistic loot tables with Rare Drop Table (1/1000 chance)
- `src/systems/ShopSystem.ts` - Buy/sell with auto-restocking (2 shops: Bob's Axes, General Store)

**World**
- `src/world/Lumbridge.ts` - Creates terrain, river, buildings, spawns NPCs/enemies/resources

**Data**
- `src/data/NPCData.ts` - 25+ NPCs with full dialogue trees and quest associations
- `src/data/EnemyData.ts` - 15 enemy types with stats, loot tables, spawn locations

**Utilities**
- `src/utils/Constants.ts` - Game constants: XP_TABLE (levels 1-99), SKILLS, ITEMS (70+ with OSRS IDs), ENEMY_TYPES, NPC_TYPES, etc.
- `src/utils/XPCalculator.ts` - XP/level calculations, combat formulas (accuracy, max hit, damage)

**UI**
- `src/ui/UIManager.ts` - Updates stats, inventory, equipment, minimap, chat messages

### System Integration Pattern

Systems are interconnected through GameLogic:
- GameLogic holds references to Player, World, all Systems, and UIManager
- Systems receive GameLogic (or Player) in constructor to access other components
- Example: CombatSystem accesses `this.gameLogic.ui.addMessage()` and `this.gameLogic.lootSystem.generateLoot()`

### Data-Driven Design

NPCs and Enemies are data-driven:
- **NPCData.ts** defines dialogue trees, quest associations, roaming behavior
- **EnemyData.ts** defines stats, loot tables with probabilities, spawn locations
- Entity classes (NPC.ts, Enemy.ts) consume this data in constructors
- IDs are used for cross-referencing (e.g., quests reference NPC IDs, loot system uses enemy IDs)

### XP and Leveling

The game uses the authentic OSRS XP table (exported as XP_TABLE in Constants.ts):
- **XP_TABLE array**: Index 0 = level 1 (0 XP), Index 98 = level 99 (13,034,431 XP)
- **XPCalculator functions** operate on this table:
  - `getLevel(xp)` - Returns level for given XP
  - `getXPForLevel(level)` - Returns XP required for level (careful: array is 0-indexed, so level 1 = index 0)
  - `getXPToNextLevel(currentXP)` - Returns XP needed to next level
  - `getProgressToNextLevel(currentXP)` - Returns 0-1 progress percentage

**Critical**: When accessing XP_TABLE by level, use `XP_TABLE[level - 1]` because the array is 0-indexed but levels are 1-indexed.

### Combat Mechanics

Combat uses authentic OSRS formulas (in XPCalculator.ts):
- **Accuracy**: Based on attacker's Attack level + bonuses vs defender's Defence level + bonuses
- **Max Hit**: Based on Strength level + strength bonus (formula: `floor((level + 8) * (64 + bonus) / 640)`)
- **Attack Cooldown**: 2.4 seconds (OSRS tick speed)
- **XP Rewards**: 4 XP per damage dealt in Attack/Strength/Defence, 1.33 XP per damage in Hitpoints

### Testing Patterns

Tests follow these patterns:
1. **Mock Three.js**: Tests spy on `Player.prototype.createMesh` and mock the mesh structure
2. **Mock GameLogic**: Tests create minimal mocks with only required references (player, ui.addMessage, etc.)
3. **Mock UI**: Tests mock `ui.addMessage` to prevent DOM access
4. **Integration tests** (Integration.test.ts) verify multiple systems working together

When writing new tests:
- Always mock `Player.prototype.createMesh` before creating Player instances
- Mock GameLogic with structure: `{ player, ui: { addMessage: jest.fn() } }`
- Import constants from `src/utils/Constants.ts` (don't hardcode values)

## Common Patterns

### Adding New NPCs
1. Add entry to `NPC_DATA` in `src/data/NPCData.ts` with unique ID
2. Define dialogue tree (structure: `{ initial: string, responses: [{text, next}], special: {quest_id: {stage: {...}}} }`)
3. Spawn NPC in `src/world/Lumbridge.ts` using `new NPC(x, z, 'NPC_ID')`

### Adding New Enemies
1. Add entry to `ENEMY_DATA` in `src/data/EnemyData.ts` with unique ID
2. Define stats (level, hitpoints, xpReward) and loot table (array of `{item, chance}`)
3. Add spawn location to `SPAWN_LOCATIONS` array
4. Spawn enemy in `src/world/Lumbridge.ts` using `new Enemy(x, z, 'ENEMY_ID')`

### Adding New Items
1. Add item to `ITEMS` in `src/utils/Constants.ts` with OSRS item ID, name, stackable flag, value
2. Add item to loot tables in EnemyData.ts if it should drop
3. Add item to shop inventories in ShopSystem if it should be sold

### Adding New Quests
1. Define quest in `QuestSystem.ts` constructor (add to `this.quests` object)
2. Structure: `{ name, stages: [{description, completed, requirements, onComplete}] }`
3. Link NPCs to quest by adding special dialogue in NPCData.ts (`special: { quest_id: { stage: {...} } }`)
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
- `src/main.ts` - Entry point
- `src/game/GameLogic.ts` - Difficult to test (Three.js integration)
- `src/ui/UIManager.ts` - DOM-heavy
- `src/world/Lumbridge.ts` - Three.js mesh creation

## Key Technical Decisions

**TypeScript Configuration**:
- TypeScript 5.9 with strict mode enabled
- Target: ES2020 for modern JavaScript features
- Module: ESNext (native ES6 modules)
- Module Resolution: bundler (Vite-compatible)
- Comprehensive type system in `src/types/` directory:
  - `src/types/index.ts` - Core OSRS types (Skills, Items, Combat, Quests, etc.)
  - `src/types/entities.ts` - Entity-specific types
  - `src/types/systems.ts` - System-specific types
  - `src/types/loot.ts` - Loot table types
- Build: `npm run build` (TypeScript type-check + Vite bundling)
- Type checking: `npm run typecheck` (TypeScript only, no emit)

**Three.js Configuration**:
- 64-bit HDR color depth (HalfFloatType, 16-bit per channel)
- PBR materials using MeshStandardMaterial with roughness/metalness workflow
- `outputColorSpace: THREE.SRGBColorSpace` for proper color conversion
- ACES Filmic tone mapping with exposure 1.2 for HDR
- 4096x4096 VSM shadow maps for ultra-high quality shadows
- Post-processing pipeline: HDR Bloom, SSAO, FXAA, Output Pass
- 60 FPS target with optimized HDR rendering

**Module System**: ES6 modules with `type: "module"` in package.json. TypeScript files use `.ts` extensions.

**Test Environment**: Jest with `jest-environment-jsdom` for DOM access and `babel-jest` for TypeScript transpilation.

**Build System**: Vite handles TypeScript compilation and bundling for development and production. The dev server (`npm run dev`) provides hot module replacement for TypeScript files.
