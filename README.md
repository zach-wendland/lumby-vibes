# Lumbridge - Old School RuneScape Recreation

A faithful recreation of RuneScape's iconic Lumbridge area using Three.js with enhanced 64-bit HDR graphics and authentic RuneScape mechanics.

![Lumbridge](https://img.shields.io/badge/Status-Complete-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Three.js](https://img.shields.io/badge/Three.js-r152-orange)

## 🎮 Features

### Complete RuneScape Mechanics
- **Authentic Combat System**: Click-to-attack combat with accurate RuneScape formulas
- **Skills System**: Mining, Woodcutting, Fishing, Cooking, and all combat skills
- **XP & Leveling**: Accurate RuneScape XP table and level progression
- **Inventory System**: 28-slot inventory with stackable items
- **Equipment System**: Full equipment slots with stat bonuses

### Enhanced Graphics (64-bit HDR)
- **High-Quality Rendering**: 64-bit color depth (16-bit per channel) with full HDR support
- **Physically-Based Rendering (PBR)**: Realistic materials with metalness and roughness workflow
- **Advanced Lighting**: HDR lighting with enhanced shadows (4096x4096 VSM shadow maps)
- **Post-Processing Pipeline**: HDR bloom, SSAO, FXAA, and ACES tone mapping
- **Smooth Performance**: Optimized Three.js engine with 60 FPS target

### Lumbridge World
- **Lumbridge Castle**: Detailed castle with towers and interior areas
- **River Lum**: Flowing river with bridge and fishing spots
- **Buildings**: Church, General Store, Bob's Axes, farms, and houses
- **NPCs**: Duke Horacio, Hans, Bob, Father Aereck, guards, and villagers
- **Training Areas**: Chickens, cows, and goblins (levels 2 & 5)
- **Resources**: Trees for woodcutting, rocks for mining, fishing spots

### User Interface
- **RuneScape-Style UI**: Authentic golden and dark theme
- **Stats Tab**: View all skill levels and XP progress
- **Inventory Tab**: Manage your 28-slot inventory
- **Equipment Tab**: Equip weapons, armor, and accessories
- **Minimap**: Real-time minimap with NPCs and enemies
- **Chat System**: Game messages and command input

## 🚀 Quick Start

### Prerequisites
- Modern web browser with WebGL support
- Python 3.6+ (for local server) OR any HTTP server

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/zach-wendland/lumby-vibes.git
cd lumby-vibes
```

2. **Start a local server**

Using Python:
```bash
python -m http.server 8000
```

Or using Node.js:
```bash
npx http-server -p 8000
```

3. **Open in browser**
```
http://localhost:8000
```

## 🎯 How to Play

### Controls

#### Movement
- **WASD** or **Arrow Keys**: Move your character
- **Middle Mouse Button + Drag**: Rotate camera
- **Mouse Wheel**: Zoom in/out

#### Interaction
- **Left Click**: Walk to location / Attack enemy / Talk to NPC / Gather resource
- **Right Click**: Open context menu with available actions

#### UI Navigation
- **Tab Buttons**: Switch between Stats, Inventory, Equipment, Prayer, and Magic
- **Click Inventory Items**: View item details
- **Right-Click Items**: Use, Drop, or Examine items
- **Chat Input**: Type commands or messages

### Gameplay

#### Training Combat
1. Find chickens (west of castle) or cows (northwest) for low-level training
2. Click on the enemy to initiate combat
3. Gain XP in Attack, Strength, Defence, and Hitpoints
4. Collect drops like bones, feathers, and raw meat

#### Skilling
1. **Woodcutting**: Click on trees around Lumbridge (requires Bronze axe)
2. **Mining**: Click on rocks north of Lumbridge (requires Bronze pickaxe)
3. **Fishing**: Click on fishing spots by River Lum (requires Small fishing net)

#### NPCs and Quests
1. Talk to NPCs by clicking on them
2. Duke Horacio can provide information about Lumbridge
3. Bob sells axes at Bob's Brilliant Axes
4. Visit Father Aereck at the church

## 🧪 Testing

The project includes comprehensive unit and integration tests.

### Running Tests

1. **Install dependencies**
```bash
npm install
```

2. **Run all tests**
```bash
npm test
```

3. **Run tests in watch mode**
```bash
npm run test:watch
```

4. **Generate coverage report**
```bash
npm run test:coverage
```

### Test Coverage

The test suite covers:
- ✅ XP calculation and level progression
- ✅ Player stats, skills, and inventory
- ✅ Combat system mechanics
- ✅ Item stacking and management
- ✅ Damage calculation and accuracy

## 🏗️ Project Structure

```
lumby-vibes/
├── index.html              # Main HTML file
├── styles.css              # UI styling
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build config
├── src/
│   ├── main.ts                     # Entry point
│   ├── types/                      # TypeScript type definitions
│   │   ├── index.ts               # Core OSRS types
│   │   ├── entities.ts            # Entity types
│   │   ├── systems.ts             # System types
│   │   └── loot.ts                # Loot types
│   ├── engine/
│   │   ├── GameEngine.ts          # Three.js rendering engine
│   │   └── PostProcessingManager.ts  # Post-processing
│   ├── game/
│   │   └── GameLogic.ts           # Main game controller
│   ├── entities/
│   │   ├── Player.ts              # Player character
│   │   ├── NPC.ts                 # Non-player characters
│   │   └── Enemy.ts               # Hostile creatures
│   ├── world/
│   │   └── Lumbridge.ts           # World environment
│   ├── systems/
│   │   ├── CombatSystem.ts        # Combat mechanics
│   │   ├── SkillsSystem.ts        # Skills (Mining, etc.)
│   │   ├── QuestSystem.ts         # Quest progression
│   │   ├── LootSystem.ts          # Loot generation
│   │   └── ShopSystem.ts          # Shop mechanics
│   ├── data/
│   │   ├── NPCData.ts             # NPC definitions
│   │   └── EnemyData.ts           # Enemy definitions
│   ├── ui/
│   │   └── UIManager.ts           # UI updates
│   └── utils/
│       ├── Constants.ts           # Game constants
│       └── XPCalculator.ts        # XP calculations
├── tests/                          # Test files
│   ├── XPCalculator.test.js
│   ├── Player.test.js
│   └── CombatSystem.test.js
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## 🎨 Graphics Features

### 64-bit HDR Rendering
- Ultra-high precision color (16-bit per channel, 64-bit RGBA)
- HalfFloat render targets for HDR pipeline
- Linear color space with sRGB output encoding
- ACES Filmic tone mapping with enhanced exposure control
- Enhanced shadow quality (4096x4096 VSM shadow maps)

### Lighting System
- HDR directional sun light with realistic VSM shadows
- Enhanced ambient lighting for HDR color depth
- Hemisphere light for realistic sky/ground color variation
- Physically-based light intensities optimized for HDR

### Performance Optimizations
- Level of Detail (LOD) for distant objects
- Frustum culling for off-screen objects
- Efficient mesh instancing
- Optimized HDR rendering pipeline
- Efficient post-processing with selective passes

### Post-Processing Effects
- **HDR Bloom**: Realistic light bleeding for bright areas
- **SSAO**: Screen-space ambient occlusion for enhanced depth perception
- **FXAA**: Fast anti-aliasing for smooth edges
- **Output Pass**: Proper color space conversion for display

## 🔧 Development

### Building New Features

1. **Adding New NPCs**
```javascript
// In src/world/Lumbridge.ts
this.npcs.push(new NPC(x, z, NPC_TYPES.VILLAGER, 'New NPC'));
```

2. **Creating New Enemies**
```javascript
// Add to ENEMY_TYPES in src/utils/Constants.ts
ENEMY_TYPES: {
    NEW_ENEMY: { name: 'Enemy Name', level: 5, hp: 20, xp: 15 }
}

// Spawn in world
this.enemies.push(new Enemy(x, z, 'NEW_ENEMY'));
```

3. **Adding New Items**
```javascript
// In src/utils/Constants.ts
ITEMS: {
    NEW_ITEM: { id: 100, name: 'New Item', stackable: true }
}
```

### Debug Mode

Access the game instance in browser console:
```javascript
window.game.player.addXP('attack', 10000);  // Add XP
window.game.player.addItem(ITEMS.COINS, 1000);  // Add items
window.game.combatSystem.stopCombat();  // Stop combat
```

## 📝 Technical Details

### Technologies Used
- **TypeScript 5.9**: Full type safety with strict mode
- **Three.js r181**: 3D graphics rendering with HDR support
- **Vite 7.2**: Fast build tool with TypeScript support and HMR
- **CSS3**: UI styling with flexbox and grid
- **Jest 29**: Unit and integration testing
- **Babel**: TypeScript transpilation for tests
- **EffectComposer**: Advanced post-processing pipeline

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Requirements
- WebGL 2.0 support
- 4GB RAM minimum
- Dedicated GPU recommended

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests with improvements or additional features.

### Development Guidelines
1. Follow existing code style and structure
2. Write tests for new features
3. Ensure all tests pass before submitting
4. Update README with new features
5. Add JSDoc comments to functions

## 📄 License

This project is open source under the MIT License.

## 🙏 Acknowledgments

- Jagex for creating RuneScape and Lumbridge
- Three.js team for the excellent 3D library
- Old School RuneScape Wiki for detailed game mechanics
- RuneScape community for inspiration

## 🔗 Links

- [Three.js Documentation](https://threejs.org/docs/)
- [Old School RuneScape Wiki](https://oldschool.runescape.wiki/)
- [WebGL Fundamentals](https://webglfundamentals.org/)

## 📊 Project Status

✅ Complete Features:
- **TypeScript Migration**: Fully migrated to TypeScript with strict mode
- Core game engine with 64-bit HDR rendering
- Physically-based rendering (PBR) materials
- Advanced post-processing pipeline (Bloom, SSAO, FXAA)
- Player movement and camera controls
- Combat system with accurate formulas
- Skills system (Mining, Woodcutting, Fishing)
- Quest system (6 quests implemented)
- Loot system with Rare Drop Table
- Shop system with auto-restocking
- Inventory and equipment management
- NPC interactions and dialogue (25+ NPCs)
- Enemy AI and respawning (15 enemy types)
- UI with all tabs functional
- Minimap with real-time updates
- Comprehensive test coverage

## 🔷 TypeScript Migration

This project has been fully migrated to TypeScript with:
- ✅ All 22 source files converted to `.ts`
- ✅ Comprehensive type system (338-line type definitions)
- ✅ Strict mode enabled for maximum type safety
- ✅ Vite build system with TypeScript support
- ✅ Zero runtime overhead (compiles to ES2020)

### Type Safety Features
- Compile-time type checking prevents runtime errors
- IntelliSense and autocomplete in all modern IDEs
- Refactoring safety with static analysis
- Clear interfaces for all game systems (Skills, Combat, Quests, Loot, etc.)

🚧 Future Enhancements:
- Multiplayer support
- More training areas (Wilderness, etc.)
- Additional skills (Crafting, Smithing)
- Bank system
- Trading with NPCs
- Music and sound effects
- Mobile touch controls

---

**Enjoy exploring Lumbridge! Happy adventuring!** 🏰⚔️
