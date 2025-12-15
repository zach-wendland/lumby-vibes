# Lumby-Vibes: Game Refactoring Masterplan

## Executive Summary

**Current State**: A technically solid RuneScape-inspired 3D browser game with ~8,670 lines of TypeScript, authentic OSRS mechanics, 474 passing tests, and advanced HDR graphics. The architecture is sound but the game lacks the "fun factor" and polish that makes a game worth playing.

**Vision**: Transform this from a tech demo into an engaging, polished, mobile-friendly MMORPG-lite that players actually want to play and return to.

---

## Critical Analysis: Why This Isn't a "Game" Yet

### What We Have (The Good)
- ✅ Authentic OSRS XP/leveling system
- ✅ Working combat with damage calculations
- ✅ 6 fully-scripted quests
- ✅ 25+ NPCs with dialogue trees
- ✅ 15 enemy types with loot tables
- ✅ 70+ items database
- ✅ Shop system with buy/sell
- ✅ Mining, Woodcutting, Fishing skills
- ✅ Professional 64-bit HDR rendering
- ✅ Memory-managed lifecycle system

### What's Missing (The Problems)

#### 1. **No Feedback Loop = No Fun**
- Players kill enemies but feel nothing
- XP gains are silent (no "ding!" satisfaction)
- Loot drops appear in chat - no excitement
- Combat has no juice (screen shake, hit effects)

#### 2. **No Goals = No Direction**
- Players spawn and don't know what to do
- No tutorial, no breadcrumbs
- Quests exist but aren't surfaced well
- No daily/weekly challenges

#### 3. **No Persistence = No Investment**
- Everything resets on refresh
- Hours of progress... gone
- Why would anyone grind?

#### 4. **No Social = No Stickiness**
- Single-player only
- No leaderboards, no achievements
- Nothing to share or compare

#### 5. **Technical Blockers**
- Build is broken (`getResources()` missing)
- No mobile controls = no mobile players
- UI assumes desktop resolution

---

## Phase 0: Immediate Hotfixes (Do First)

### 0.1 Fix Build-Breaking Bug
**File**: `src/world/Lumbridge.ts`
```typescript
// Add public getter for resources
public getResources(): Resource[] {
    return this.resources;
}
```
**Impact**: Build will compile

### 0.2 Fix Item ID Collision
**File**: `src/utils/Constants.ts`
```typescript
// RAW_MUTTON and RAW_CHICKEN both use 2138
// Fix: RAW_MUTTON should be 10816 (actual OSRS ID)
```

### 0.3 Add Null Checks to UIManager
Prevent crashes when HTML elements missing.

---

## Phase 1: Game Feel & Juice

**Goal**: Make every action feel satisfying.

### 1.1 Combat Feedback
| Element | Implementation |
|---------|---------------|
| Screen shake on hit | CameraShake class, trigger on damage dealt/received |
| Hit particles | Three.js particle system, blood/sparks on impact |
| Death animation | Enemy falls, fades, drops loot visually |
| Combat sounds | Web Audio API - sword swings, impacts, grunts |
| Health bar above enemies | Billboard sprite following enemy mesh |

### 1.2 XP & Level Rewards
| Element | Implementation |
|---------|---------------|
| XP drop floaters | "+45 XP" floating text above player |
| Level-up fireworks | Particle explosion + sound + screen flash |
| Skill milestone rewards | Every 10 levels = special reward |
| Progress bars everywhere | Visual feedback on every action |

### 1.3 Loot & Item Feedback
| Element | Implementation |
|---------|---------------|
| 3D loot drops | Items physically drop from enemies |
| Pickup animation | Item flies to inventory |
| Rare item glow | Purple/gold particle effects |
| Loot beam | Vertical light beam on rare drops |

### 1.4 Audio System (NEW)
```
src/audio/
├── AudioManager.ts      # Web Audio API wrapper
├── SoundBank.ts         # Sound effect definitions
└── MusicSystem.ts       # Background music, area themes
```
- Combat sounds (12-15 variations per action)
- UI sounds (click, equip, inventory)
- Ambient sounds (birds, water, wind)
- Music per area (Lumbridge theme)

---

## Phase 2: Player Progression & Goals

### 2.1 Tutorial System
**New File**: `src/systems/TutorialSystem.ts`

Steps:
1. "Click to move" - highlight ground
2. "Click chicken to attack" - highlight enemy
3. "Collect loot" - highlight dropped items
4. "Open inventory" - highlight UI tab
5. "Equip item" - highlight equipment
6. "Talk to NPC" - guide to Duke Horacio
7. "Accept quest" - first quest hand-holding

### 2.2 Achievement System
**New File**: `src/systems/AchievementSystem.ts`

Categories:
- Combat: "Kill 10 chickens", "Defeat a goblin"
- Skills: "Mine 100 ore", "Catch 50 fish"
- Exploration: "Visit all Lumbridge areas"
- Quests: "Complete first quest", "All quests done"
- Wealth: "Earn 10K coins", "Own full bronze"

Rewards: Titles, cosmetics, bonus XP

### 2.3 Daily/Weekly Challenges
```typescript
interface Challenge {
    id: string;
    description: string;
    target: number;
    progress: number;
    reward: { xp?: number; items?: Item[]; coins?: number };
    refreshTime: 'daily' | 'weekly';
}
```
Examples:
- Daily: "Kill 25 enemies" → 500 bonus XP
- Weekly: "Gain 10 levels total" → 5000 coins

### 2.4 Milestone Rewards System
Every significant achievement = tangible reward:
- Level 10 in any skill = Title + cosmetic
- Complete all F2P quests = Special cape
- 1000 total level = Exclusive emote

---

## Phase 3: Persistence & Progression

### 3.1 Save/Load System
**New File**: `src/systems/SaveSystem.ts`

```typescript
interface SaveData {
    version: number;
    player: {
        skills: Record<SkillName, { level: number; xp: number }>;
        inventory: InventoryItem[];
        equipment: EquipmentSlots;
        position: { x: number; z: number };
    };
    quests: QuestProgress[];
    achievements: string[];
    settings: GameSettings;
    statistics: PlayerStats;
    timestamp: number;
}
```

Storage Options:
1. **LocalStorage** (offline, immediate)
2. **IndexedDB** (larger data, multiple saves)
3. **Cloud Save** (Supabase/Firebase - future)

Auto-save every 60 seconds + on significant events.

### 3.2 Player Statistics Tracking
Track everything for achievements + leaderboards:
- Total XP gained (all time)
- Enemies killed (by type)
- Items collected
- Quests completed
- Time played
- Highest hit dealt
- Deaths (if we add death)

### 3.3 Multiple Save Slots
- 3 character slots
- Character creation screen
- Name selection

---

## Phase 4: Combat & Gameplay Expansion

### 4.1 Complete Combat System

**Magic Combat** (Currently Stubbed)
```typescript
// Implement in CombatSystem.ts
private castSpell(spell: Spell, target: Enemy): void {
    // Rune consumption
    // Animation/particle effect
    // Damage calculation (magic bonus vs magic defence)
    // Magic XP reward
}
```

Spells to implement:
- Wind Strike, Water Strike, Earth Strike, Fire Strike
- Curse (reduce enemy attack)
- Confuse (reduce enemy accuracy)
- Bind (root enemy)
- Teleport spells

**Ranged Combat** (Currently Stubbed)
- Arrow/bolt consumption
- Range attack animations
- Distance-based accuracy modifier
- Ranged XP rewards

### 4.2 Prayer System
**Currently**: Defined but not functional

Implement:
- Prayer drain over time
- Protection prayers (50% damage reduction)
- Stat-boosting prayers
- Prayer restore potions

### 4.3 Consumables System
**New File**: `src/systems/ConsumablesSystem.ts`

```typescript
interface Consumable {
    id: number;
    healAmount?: number;
    boostSkill?: SkillName;
    boostAmount?: number;
    boostDuration?: number;
    restorePrayer?: number;
}
```

Implement:
- Food (heals HP)
- Potions (temporary stat boosts)
- Prayer potions (restore prayer)
- Cooking skill actually produces food

### 4.4 Death Mechanics
Currently: No death system

Implement:
- Player can die (HP hits 0)
- Respawn at Lumbridge (classic!)
- Items stay on ground 60 seconds
- Gravestones (optional paid recovery)

---

## Phase 5: World Expansion

### 5.1 World Map System
```
src/world/
├── WorldManager.ts      # Manages area loading/unloading
├── areas/
│   ├── Lumbridge.ts     # Current implementation
│   ├── LumbridgeSwamp.ts
│   ├── AlKharid.ts
│   ├── Varrock.ts
│   └── DraynorVillage.ts
└── WorldMap.ts          # Full map data, boundaries
```

Area transitions:
- Walk to edge → loading screen → new area
- Each area has unique enemies, NPCs, resources

### 5.2 Bank System
**New File**: `src/systems/BankSystem.ts`

- 100+ bank slots
- Deposit/withdraw items
- Bank tabs for organization
- Accessible from bank NPCs/chests

### 5.3 More Enemies (15 → 50+)
Tier progression:
1. Chickens, Cows (Combat 1-10)
2. Goblins, Spiders (Combat 10-20)
3. Skeletons, Zombies (Combat 20-40)
4. Guards, Knights (Combat 40-60)
5. Demons, Dragons (Combat 60+)

Each with:
- Unique models
- Attack patterns
- Loot tables
- Spawn locations

### 5.3 More Skills
Currently: Attack, Strength, Defence, HP, Mining, Woodcutting, Fishing, Cooking

Add:
- **Smithing**: Smelt bars, make armor
- **Crafting**: Make jewelry, leather
- **Firemaking**: Burn logs for XP
- **Herblore**: Make potions
- **Agility**: Shortcuts, run energy
- **Thieving**: Pickpocket NPCs

---

## Phase 6: Mobile & Accessibility

### 6.1 Touch Controls
**New File**: `src/controls/TouchController.ts`

- Virtual joystick for movement
- Tap to interact
- Long-press for context menu
- Pinch to zoom
- Swipe to rotate camera

### 6.2 Responsive UI
```css
/* Mobile-first approach */
@media (max-width: 768px) {
    #right-panel {
        position: fixed;
        bottom: 0;
        width: 100%;
        height: 40vh;
    }
    #inventory-grid {
        grid-template-columns: repeat(7, 1fr); /* 4 rows visible */
    }
}
```

### 6.3 Performance Optimization
- LOD system for distant objects
- Object pooling for particles
- Texture atlases
- Simplified shadows on mobile
- 30 FPS cap option

### 6.4 Accessibility
- Colorblind modes
- Scalable UI
- Keyboard-only navigation
- Screen reader support for chat

---

## Phase 7: Social & Retention

### 7.1 Leaderboards
**Backend Required**: Supabase/Firebase

Leaderboards:
- Total Level
- Combat Level
- Individual skill XP
- Quest points
- Achievements
- Speed runs (quest completion time)

### 7.2 Player Profiles
- Username display
- Achievement showcase
- Stats summary
- Activity history

### 7.3 Social Features (Future)
- Friends list
- Player trading
- Chat channels
- Guilds/clans

---

## Phase 8: Monetization Strategy (EA Mobile Style)

### 8.1 Ethical F2P Model
**Cosmetic-Only Premium**:
- Character skins
- Pet companions (visual only)
- Emotes
- Titles
- UI themes

**Battle Pass**:
- Free track: Basic rewards
- Premium track: Cosmetics, faster XP (not P2W)

**Quality of Life**:
- Extra bank space (not required)
- Additional character slots
- Cloud save sync

### 8.2 NO Pay-to-Win
Never sell:
- Direct XP
- Items that affect combat
- Skip quest requirements
- Exclusive powerful gear

---

## Implementation Priority

### Sprint 1: Foundation (Weeks 1-2)
- [ ] Fix build-breaking bugs
- [ ] Implement SaveSystem (LocalStorage)
- [ ] Add AudioManager skeleton
- [ ] Combat feedback (screen shake, particles)
- [ ] XP floaters and level-up effects

### Sprint 2: Core Loop (Weeks 3-4)
- [ ] Tutorial system
- [ ] Achievement system (10 basic achievements)
- [ ] Death mechanics
- [ ] Food/healing system
- [ ] Improved enemy death animations

### Sprint 3: Depth (Weeks 5-6)
- [ ] Magic combat implementation
- [ ] Prayer system activation
- [ ] Bank system
- [ ] Daily challenges
- [ ] Sound effects for combat

### Sprint 4: Content (Weeks 7-8)
- [ ] 10 new enemy types
- [ ] Smithing skill
- [ ] 2 new quests
- [ ] Background music
- [ ] Lumbridge Swamp area

### Sprint 5: Polish (Weeks 9-10)
- [ ] Mobile touch controls
- [ ] Responsive UI
- [ ] Performance optimization
- [ ] Bug fixing
- [ ] Player testing

### Sprint 6: Social (Weeks 11-12)
- [ ] Leaderboard backend
- [ ] Player profiles
- [ ] Cloud save
- [ ] Soft launch

---

## Technical Architecture Changes

### New Directory Structure
```
src/
├── main.ts
├── game/
│   └── GameLogic.ts
├── engine/
│   ├── GameEngine.ts
│   └── PostProcessingManager.ts
├── entities/
│   ├── Player.ts
│   ├── NPC.ts
│   └── Enemy.ts
├── systems/
│   ├── CombatSystem.ts
│   ├── SkillsSystem.ts
│   ├── QuestSystem.ts
│   ├── LootSystem.ts
│   ├── ShopSystem.ts
│   ├── SaveSystem.ts          # NEW
│   ├── AchievementSystem.ts   # NEW
│   ├── TutorialSystem.ts      # NEW
│   ├── ConsumablesSystem.ts   # NEW
│   ├── BankSystem.ts          # NEW
│   ├── ChallengeSystem.ts     # NEW
│   └── StatisticsSystem.ts    # NEW
├── audio/                      # NEW
│   ├── AudioManager.ts
│   ├── SoundBank.ts
│   └── MusicSystem.ts
├── controls/                   # NEW
│   ├── KeyboardController.ts
│   ├── MouseController.ts
│   └── TouchController.ts
├── effects/                    # NEW
│   ├── ParticleManager.ts
│   ├── CameraEffects.ts
│   └── UIEffects.ts
├── world/
│   ├── WorldManager.ts        # NEW
│   ├── Lumbridge.ts
│   └── areas/                 # NEW
├── data/
│   ├── NPCData.ts
│   ├── EnemyData.ts
│   ├── SpellData.ts           # NEW
│   └── AchievementData.ts     # NEW
├── ui/
│   ├── UIManager.ts
│   ├── components/            # NEW (modular UI)
│   └── MobileUI.ts            # NEW
├── utils/
│   ├── Constants.ts
│   └── XPCalculator.ts
└── types/
    └── *.ts
```

---

## Success Metrics

### Player Engagement
- **D1 Retention**: 40%+ (return next day)
- **D7 Retention**: 20%+
- **Session Length**: 15+ minutes average
- **Sessions/Day**: 2+ per active player

### Game Health
- **Tutorial Completion**: 80%+
- **First Quest Completion**: 60%+
- **First Level 10 Skill**: 40%+

### Technical
- **Build Stability**: 100% (no crashes)
- **Test Coverage**: 80%+
- **Load Time**: <3 seconds
- **60 FPS on desktop, 30 FPS on mobile

---

## Conclusion

This game has a solid technical foundation. The OSRS mechanics are authentic, the architecture is clean, and the rendering is impressive. What's missing is the "soul" - the feedback loops, the dopamine hits, the reasons to come back.

The plan above transforms it from "tech demo" to "game people want to play" by:

1. **Making every action feel good** (juice, feedback, audio)
2. **Giving players clear goals** (tutorial, achievements, challenges)
3. **Respecting their time** (persistence, progression)
4. **Expanding the experience** (more content, skills, areas)
5. **Meeting them where they are** (mobile, accessibility)

Let's build something players will actually remember.

---

*Document Version: 1.0*
*Last Updated: December 2025*
*Author: Product Management*
