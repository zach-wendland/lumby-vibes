# TypeScript Migration Guide

## Current Status: Phase 1 Complete ✅

### Completed (Phase 1)
- [x] TypeScript configuration (`tsconfig.json`)
- [x] Build scripts and Jest configuration
- [x] Type definitions (`src/types/index.ts`)
- [x] `src/utils/Constants.ts` - Game constants with full types
- [x] `src/utils/XPCalculator.ts` - XP calculation utilities
- [x] `src/entities/Player.ts` - Player entity

### Testing Status
- ✅ All 394 tests passing
- ✅ TypeScript builds without errors
- ✅ Backward compatible with existing `.js` files

---

## Remaining Work

### Phase 2: Core Entities
**Priority: HIGH** - These are heavily tested and core to gameplay

#### Files to Migrate:
1. **`src/entities/NPC.ts`** (~260 lines)
   - Import types from `../types/index.js`
   - Use `NPCDefinition` from types
   - Type the wandering behavior
   - Dialogue system types

2. **`src/entities/Enemy.ts`** (~485 lines)
   - Import `EnemyDefinition` type
   - Combat state types
   - HP bar and mesh types
   - Loot generation types

#### Migration Pattern for Entities:
```typescript
import * as THREE from 'three';
import { EntityBase, EnemyDefinition } from '../types/index.js';
import { ENEMY_SPEED, ITEMS } from '../utils/Constants.js';

export class Enemy implements EntityBase {
    position: THREE.Vector3;
    rotation: number;
    mesh?: THREE.Group;

    // Enemy-specific properties
    enemyType: string;
    level: number;
    // ... etc

    constructor(x: number, z: number, enemyType: string) {
        // implementation
    }

    update(delta: number, player?: any): void {
        // implementation
    }
}
```

---

### Phase 3: Game Systems
**Priority: HIGH** - Core gameplay mechanics

#### Files to Migrate:
1. **`src/systems/CombatSystem.ts`** (~165 lines)
   - Combat calculations
   - Damage types
   - Use `CombatState`, `DamageResult` from types

2. **`src/systems/SkillsSystem.ts`** (~150 lines)
   - Resource gathering
   - Use `ResourceNode` type
   - Skill XP rewards

3. **`src/systems/QuestSystem.ts`** (~475 lines)
   - Quest state management
   - Use `QuestDefinition`, `QuestProgress` types
   - NPC dialogue integration

4. **`src/systems/ShopSystem.ts`** (~430 lines)
   - Shop transactions
   - Use `ShopDefinition`, `ShopItem` types
   - Inventory integration

5. **`src/systems/LootSystem.ts`** (~270 lines)
   - Loot generation
   - Use `LootDrop`, `LootTable` types
   - Enemy drop tables

---

### Phase 4: Game Data
**Priority: MEDIUM** - Large data files, less complex logic

#### Files to Migrate:
1. **`src/data/NPCData.ts`** (~545 lines)
   - Convert to `Record<string, NPCDefinition>`
   - Type all NPC dialogue
   - Export type-safe data

2. **`src/data/EnemyData.ts`** (~545 lines)
   - Convert to `Record<string, EnemyDefinition>`
   - Type spawn locations
   - Utility functions with types

#### Data File Pattern:
```typescript
import { NPCDefinition } from '../types/index.js';

export const NPC_DATA: Readonly<Record<string, NPCDefinition>> = {
    DUKE_HORACIO: {
        name: 'Duke Horacio',
        title: 'Duke of Lumbridge',
        // ... rest of properties
    } as const,
    // ... more NPCs
} as const;
```

---

### Phase 5: Engine and World
**Priority: MEDIUM-LOW** - Complex but isolated

#### Files to Migrate:
1. **`src/engine/GameEngine.ts`** (~310 lines)
   - Scene management types
   - Camera and renderer types
   - Entity update callbacks

2. **`src/world/Lumbridge.ts`** (~625 lines)
   - World building
   - Terrain generation
   - Building placement

---

### Phase 6: Game Logic and UI
**Priority: LOW** - Integration layers, can wait

#### Files to Migrate:
1. **`src/game/GameLogic.ts`** (~450 lines)
   - Main game loop
   - State management
   - Event handling

2. **`src/ui/UIManager.ts`** (~370 lines)
   - UI rendering
   - Context menus
   - Notifications

---

## Migration Checklist for Each File

### Before Migration:
- [ ] Read the original `.js` file completely
- [ ] Identify all data structures and their shapes
- [ ] Check for interfaces already in `src/types/index.ts`
- [ ] List all imports and their types

### During Migration:
- [ ] Create `.ts` file with same name
- [ ] Add proper imports with `.js` extensions (for ESM compatibility)
- [ ] Define internal interfaces (private to the class)
- [ ] Add type annotations to all parameters
- [ ] Add return types to all methods
- [ ] Use `private` for internal methods
- [ ] Add JSDoc comments where helpful
- [ ] Use `readonly` for immutable properties

### After Migration:
- [ ] Run `npm run build` - must compile without errors
- [ ] Run `npm test` - all tests must pass
- [ ] Check no accidental behavior changes
- [ ] Commit with descriptive message

---

## Common Patterns

### THREE.js Types
```typescript
// Always import THREE types
import * as THREE from 'three';

// Vector3 usage
position: THREE.Vector3;
mesh?: THREE.Group | THREE.Mesh; // Optional mesh

// Mesh creation
const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
```

### Optional vs Required Properties
```typescript
// Required
enemyType: string;

// Optional
mesh?: THREE.Group;  // Use ? for optional
target: Enemy | null; // Or explicit null

// Readonly (constants)
readonly maxHP: number;
```

### Method Typing
```typescript
// Simple method
moveTo(x: number, z: number): void {
    // implementation
}

// With optional parameters
addItem(item: Item, count: number = 1): boolean {
    // implementation
}

// With union types
update(delta: number, player?: Player | null): void {
    // implementation
}
```

### Event Handlers
```typescript
// Custom events
window.dispatchEvent(new CustomEvent<XPGainEvent>('xpGain', {
    detail: {
        skill: 'attack',
        xp: 50,
        levelUp: true,
        newLevel: 45
    }
}));
```

---

## Tips for Success

### 1. **Use Existing Types First**
Before creating new interfaces, check `src/types/index.ts`. It has 20+ comprehensive type definitions.

### 2. **Import Extensions**
Always use `.js` extension in imports for ESM compatibility:
```typescript
import { Player } from './entities/Player.js'; // ✅ Correct
import { Player } from './entities/Player';    // ❌ Wrong
```

### 3. **Strict Mode Benefits**
`tsconfig.json` has strict mode enabled. This catches:
- Null/undefined issues
- Type mismatches
- Missing return types
- Unused variables

### 4. **Test Compatibility**
Tests remain in `.js` but work with both `.js` and `.ts` source files. No test changes needed!

### 5. **Incremental Compilation**
Run `npm run build:watch` in a separate terminal while migrating. See errors immediately.

---

## Build Commands

```bash
# Type check without emitting files
npm run type-check

# Build TypeScript to JavaScript
npm run build

# Watch mode (continuous compilation)
npm run build:watch

# Run all tests
npm test

# Run tests with coverage
npm test:coverage
```

---

## Current Dependencies

### TypeScript Related:
- `typescript@^5.9.3`
- `ts-jest@^29.4.5`
- `@types/node@^24.10.1`
- `@types/jest@^30.0.0`
- `@types/three@^0.181.0`

### Build Output:
- Source: `src/**/*.ts`
- Output: `dist/**/*.js` + `dist/**/*.d.ts`
- Source maps: `dist/**/*.js.map` + `dist/**/*.d.ts.map`

---

## Troubleshooting

### "Cannot find module" errors
**Cause**: Missing `.js` extension in import
**Fix**: Add `.js` extension: `from './file.js'`

### "Type 'X' is not assignable to type 'Y'"
**Cause**: Type mismatch
**Fix**: Check the type definition in `src/types/index.ts` or add type assertion

### Tests fail after migration
**Cause**: Behavioral change in converted code
**Fix**: Compare with original `.js` file, ensure logic is identical

### Build is slow
**Cause**: TypeScript compiling all files
**Fix**: Use `npm run build:watch` for incremental builds

---

## Progress Tracking

### Lines of Code Migrated:
- ✅ Utils: ~470 lines
- ✅ Types: ~350 lines
- ✅ Player Entity: ~335 lines
- **Total: ~1,155 / ~5,000 lines (23%)**

### Files Migrated:
- **Completed: 4 files**
- **Remaining: ~15 files**

---

## Next Session Quick Start

1. **Pull latest changes**
   ```bash
   git pull origin claude/add-comprehensive-tests-011zxZfSqKmtBDVf2EJ7zPFw
   ```

2. **Install dependencies** (if needed)
   ```bash
   npm install
   ```

3. **Start with Phase 2**
   - Migrate `src/entities/NPC.ts`
   - Then `src/entities/Enemy.ts`

4. **Test after each file**
   ```bash
   npm run build && npm test
   ```

5. **Commit frequently**
   ```bash
   git add src/entities/NPC.ts
   git commit -m "Migrate NPC entity to TypeScript"
   ```

---

## Questions for Continuation

### When migrating, ask yourself:
1. Are all parameters typed?
2. Are all return types specified?
3. Are nullable values explicitly typed (`| null`)?
4. Do all imports have `.js` extensions?
5. Does the file compile without errors?
6. Do all tests still pass?
7. Is the behavior identical to the JavaScript version?

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Three.js TypeScript Guide](https://threejs.org/docs/#manual/en/introduction/Typescript-setup)
- Project types: `src/types/index.ts`
- Example migrated file: `src/entities/Player.ts`

---

**Last Updated**: November 27, 2025
**Migration Progress**: Phase 1 Complete (23%)
**Next Priority**: Phase 2 - Core Entities (NPC.ts, Enemy.ts)
