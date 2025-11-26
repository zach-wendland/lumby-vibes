# TypeScript Migration Plan

## 📋 Overview

This document outlines the comprehensive strategy for migrating the Lumbridge Three.js codebase from JavaScript to TypeScript while maintaining full functionality and test coverage.

---

## ✅ Phase 3 Complete (Current State)

- ✅ TypeScript 5.9.3 installed
- ✅ @types/three and @types/jest installed
- ✅ ts-jest configured for test support
- ✅ tsconfig.json with strict mode enabled
- ✅ Core OSRS type definitions created (`src/types/osrs.d.ts`)
- ✅ npm scripts added for build, type-check, lint, format
- ✅ Jest configured to handle both .js and .ts files

---

## 🎯 Migration Strategy

### Principle: **Incremental, Safe, Tested**

We will migrate files incrementally, following these rules:

1. **One file at a time** - Never break the build
2. **Tests first** - Convert test files alongside source files
3. **Bottom-up approach** - Start with dependencies, end with dependents
4. **Maintain compatibility** - JS and TS coexist during migration
5. **Type safety gradually** - Start with `any`, refine to strict types

---

## 📁 Migration Order (9 Phases)

### **Phase 1: Type Definitions** ✅ COMPLETE
*Status: Done*
- [x] `src/types/osrs.d.ts` - Core OSRS interfaces
- [x] `tsconfig.json` - TypeScript configuration

### **Phase 2: Utilities & Constants**
*Why first: No dependencies, used by everything*

**Files to convert:**
1. `src/utils/Constants.js` → `Constants.ts`
   - Export all constants with proper types
   - Use `as const` for readonly objects
   - Add type annotations for complex objects

2. `src/utils/XPCalculator.js` → `XPCalculator.ts`
   - Add return types to all functions
   - Use `readonly number[]` for XP table
   - Type skill names with `SkillName` type

**Test files:**
- `tests/XPCalculator.test.js` → `XPCalculator.test.ts`

**Estimated effort:** 2-3 hours
**Risk level:** Low

---

### **Phase 3: Data Layer**
*Why second: Pure data, no logic, defines types for entities*

**Files to convert:**
1. `src/data/NPCData.js` → `NPCData.ts`
   - Use `NPCDefinition` interface
   - Type dialogue trees properly
   - Export with `as const` for immutability

2. `src/data/EnemyData.js` → `EnemyData.ts`
   - Use `EnemyDefinition` interface
   - Type drop tables with `DropTable`
   - Type spawn locations with `SpawnLocation`

**Test files:**
- `tests/NPCData.test.js` → `NPCData.test.ts`

**Estimated effort:** 3-4 hours
**Risk level:** Low

---

### **Phase 4: Systems Layer**
*Why third: Core game logic, no THREE.js dependencies*

**Files to convert:**
1. `src/systems/SkillsSystem.js` → `SkillsSystem.ts`
   - Type player parameter
   - Use `SkillName` type
   - Type resource gathering methods

2. `src/systems/LootSystem.js` → `LootSystem.ts`
   - Use `DropTable` and `DropTableEntry` types
   - Type loot generation methods
   - Type RDT system

3. `src/systems/QuestSystem.js` → `QuestSystem.ts`
   - Use `Quest` interface
   - Type quest stages and objectives
   - Type reward distribution

4. `src/systems/ShopSystem.js` → `ShopSystem.ts`
   - Use `Shop` and `ShopStock` interfaces
   - Type buy/sell methods
   - Type restocking system

5. `src/systems/CombatSystem.js` → `CombatSystem.ts`
   - Use `CombatStats` interface
   - Type damage calculation
   - Type accuracy formulas

**Test files:**
- `tests/SkillsSystem.test.js` → `SkillsSystem.test.ts`
- `tests/LootSystem.test.js` → `LootSystem.test.ts`
- `tests/QuestSystem.test.js` → `QuestSystem.test.ts`
- `tests/ShopSystem.test.js` → `ShopSystem.test.ts`
- `tests/CombatSystem.test.js` → `CombatSystem.test.ts`

**Estimated effort:** 6-8 hours
**Risk level:** Medium

---

### **Phase 5: Entities**
*Why fourth: Use systems, provide interfaces to world/engine*

**Files to convert:**
1. `src/entities/Player.js` → `Player.ts`
   - Use `PlayerStats`, `PlayerSkills`, `PlayerEquipment` types
   - Type inventory methods
   - Type skill progression
   - Import THREE types properly

2. `src/entities/Enemy.js` → `Enemy.ts`
   - Use `EnemyStats` interface
   - Type AI behavior methods
   - Type combat methods
   - Import THREE types

3. `src/entities/NPC.js` → `NPC.ts`
   - Use `NPCDefinition` interface
   - Type dialogue methods
   - Type wandering behavior
   - Import THREE types

**Test files:**
- `tests/Player.test.js` → `Player.test.ts`
- `tests/Enemy.test.ts` (new file, improved coverage)
- `tests/NPC.test.ts` (new file)

**Estimated effort:** 6-8 hours
**Risk level:** Medium-High (THREE.js integration)

---

### **Phase 6: World**
*Why fifth: Creates entities, uses all systems*

**Files to convert:**
1. `src/world/Lumbridge.js` → `Lumbridge.ts`
   - Type terrain generation
   - Type entity spawning
   - Type building creation
   - Use proper THREE types

**Test files:**
- `tests/Lumbridge.test.ts` (new file)

**Estimated effort:** 4-5 hours
**Risk level:** Medium

---

### **Phase 7: UI Layer**
*Why sixth: DOM manipulation, less critical*

**Files to convert:**
1. `src/ui/UIManager.js` → `UIManager.ts`
   - Type DOM elements
   - Type event handlers
   - Type tab management
   - Use proper types for player data display

**Test files:**
- `tests/UIManager.test.ts` (new file)

**Estimated effort:** 3-4 hours
**Risk level:** Medium

---

### **Phase 8: Engine & Game Logic**
*Why seventh: Top-level coordination, depends on everything*

**Files to convert:**
1. `src/engine/GameEngine.js` → `GameEngine.ts`
   - Use proper THREE types throughout
   - Type render loop
   - Type raycaster
   - Type camera controls

2. `src/game/GameLogic.js` → `GameLogic.ts`
   - Type game state
   - Type entity management
   - Type system coordination
   - Type update loop

**Test files:**
- `tests/GameEngine.test.ts` (new file)
- `tests/GameLogic.test.ts` (new file)

**Estimated effort:** 6-8 hours
**Risk level:** High (complex THREE.js usage)

---

### **Phase 9: Entry Point**
*Why last: Depends on everything*

**Files to convert:**
1. `src/main.js` → `main.ts`
   - Type initialization
   - Type global game object
   - Update HTML to reference .ts or compiled .js

2. Update `index.html` if needed

**Estimated effort:** 1 hour
**Risk level:** Low

---

## 🔧 Conversion Checklist (Per File)

When converting each file, follow this checklist:

### 1. **Preparation**
- [ ] Read the file completely
- [ ] Identify all imports and exports
- [ ] List all functions and their purposes
- [ ] Note any complex logic or edge cases
- [ ] Check if tests exist

### 2. **Type Annotations**
- [ ] Add parameter types to all functions
- [ ] Add return types to all functions
- [ ] Type all class properties
- [ ] Type all variables (or use inference)
- [ ] Import types from `osrs.d.ts`

### 3. **Strict Type Checking**
- [ ] Enable `strict: true` compliance
- [ ] Handle null/undefined properly
- [ ] Remove `any` types where possible
- [ ] Add runtime checks where needed

### 4. **Testing**
- [ ] Convert test file to TypeScript
- [ ] Ensure all tests pass
- [ ] Add new tests for typed edge cases
- [ ] Verify coverage maintained/improved

### 5. **Documentation**
- [ ] Update JSDoc comments to TSDoc
- [ ] Document complex types
- [ ] Add examples where helpful

### 6. **Validation**
- [ ] Run `npm run type-check`
- [ ] Run `npm test`
- [ ] Run `npm run lint`
- [ ] Build succeeds: `npm run build`

---

## 🚨 Common Pitfalls & Solutions

### **Pitfall 1: THREE.js Types**
**Problem:** THREE types are complex and verbose
**Solution:** Use type inference where possible, create helper types

```typescript
// Bad
const position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

// Good
const position = new THREE.Vector3(0, 0, 0);
```

### **Pitfall 2: Constants as Types**
**Problem:** Constants need to be typed as literals
**Solution:** Use `as const` assertions

```typescript
// Bad
export const SKILLS = { ATTACK: 'attack' };

// Good
export const SKILLS = { ATTACK: 'attack' } as const;
export type SkillName = typeof SKILLS[keyof typeof SKILLS];
```

### **Pitfall 3: Dynamic Property Access**
**Problem:** TypeScript doesn't like `obj[dynamicKey]`
**Solution:** Use proper indexing and type guards

```typescript
// Bad
const value = obj[key]; // Error if key type is string

// Good
const value = obj[key as keyof typeof obj];
```

### **Pitfall 4: Test Mocks**
**Problem:** THREE.js mocks need proper typing
**Solution:** Update `tests/setup.js` → `tests/setup.ts` with proper types

---

## 📊 Progress Tracking

| Phase | Files | Status | Completion |
|-------|-------|--------|------------|
| 1. Type Definitions | 1 | ✅ Complete | 100% |
| 2. Utils & Constants | 2 | ⏳ Pending | 0% |
| 3. Data Layer | 2 | ⏳ Pending | 0% |
| 4. Systems | 5 | ⏳ Pending | 0% |
| 5. Entities | 3 | ⏳ Pending | 0% |
| 6. World | 1 | ⏳ Pending | 0% |
| 7. UI | 1 | ⏳ Pending | 0% |
| 8. Engine & Logic | 2 | ⏳ Pending | 0% |
| 9. Entry Point | 1 | ⏳ Pending | 0% |
| **Total** | **18 files** | **1/18** | **5.6%** |

---

## 🎯 Success Criteria

Migration is complete when:

- ✅ All source files converted to TypeScript
- ✅ All test files converted to TypeScript
- ✅ `npm run type-check` passes with zero errors
- ✅ `npm test` passes with 90%+ coverage
- ✅ `npm run build` succeeds
- ✅ `npm run lint` passes
- ✅ Application runs identically to JS version
- ✅ No `any` types in production code (except where necessary)

---

## 📅 Estimated Timeline

**Phase 2-3 (Utils + Data):** 1 day
**Phase 4 (Systems):** 2 days
**Phase 5-6 (Entities + World):** 2 days
**Phase 7-8 (UI + Engine):** 2 days
**Phase 9 (Entry):** 0.5 days
**Buffer/Testing:** 0.5 days

**Total:** ~7-8 days for complete migration

---

## 🔄 Rollback Plan

If migration encounters critical issues:

1. **Immediate:** Revert latest commit
2. **Short-term:** Keep JS files alongside TS during migration
3. **Long-term:** Use feature branches for each phase

All commits should:
- Be atomic (one file/phase at a time)
- Include passing tests
- Be easily revertible

---

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [THREE.js TypeScript Docs](https://threejs.org/docs/#manual/en/introduction/Typescript-setup)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [OSRS Wiki](https://oldschool.runescape.wiki/) - For type accuracy

---

## 🎓 Best Practices

1. **Type inference is your friend** - Don't over-annotate
2. **Use interfaces for objects** - Classes for instances
3. **Prefer `readonly` where possible** - Immutability
4. **Use union types** - Instead of enums for strings
5. **Type guards for runtime safety** - Validate external data
6. **Generic types for reusability** - DRY principle

---

**Status:** Phase 3 Complete, Ready for Phase 1/2 Hybrid Development
**Next Step:** Begin Phase 1/2 Hybrid (Testing + Quality)
**Updated:** 2025-11-26
