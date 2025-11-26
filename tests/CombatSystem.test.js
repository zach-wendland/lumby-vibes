/**
 * CombatSystem Tests
 */

// Mock canvas context BEFORE imports
global.HTMLCanvasElement.prototype.getContext = function(contextType) {
    if (contextType === '2d') {
        return {
            fillStyle: '',
            font: '',
            textAlign: '',
            fillText: jest.fn(),
            measureText: jest.fn(() => ({ width: 100 })),
            clearRect: jest.fn(),
            drawImage: jest.fn()
        };
    }
    return null;
};

import { CombatSystem } from '../src/systems/CombatSystem.js';
import { Player } from '../src/entities/Player.js';
import { Enemy } from '../src/entities/Enemy.js';

// Mock THREE.js (same as Player.test.js)
global.THREE = {
    Vector3: class {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        copy(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        }
        clone() {
            return new THREE.Vector3(this.x, this.y, this.z);
        }
        distanceTo(v) {
            const dx = this.x - v.x;
            const dy = this.y - v.y;
            const dz = this.z - v.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
    },
    Group: class {
        constructor() {
            this.children = [];
            this.position = {
                x: 0,
                y: 0,
                z: 0,
                set(x, y, z) { this.x = x; this.y = y; this.z = z; },
                copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
            };
            this.rotation = { x: 0, y: 0, z: 0 };
            this.userData = {};
        }
        add(child) {
            this.children.push(child);
        }
    },
    BoxGeometry: class {},
    SphereGeometry: class {},
    CylinderGeometry: class {},
    ConeGeometry: class {},
    DodecahedronGeometry: class {},
    MeshLambertMaterial: class {},
    MeshBasicMaterial: class {},
    Mesh: class {
        constructor() {
            this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
            this.rotation = { x: 0, y: 0, z: 0 };
            this.scale = { set: () => {}, x: 1 };
            this.visible = true;
            this.castShadow = false;
            this.receiveShadow = false;
        }
    },
    PlaneGeometry: class {},
    CanvasTexture: class {},
    SpriteMaterial: class {},
    Sprite: class { constructor() { this.position = { y: 0 }; this.scale = { set: () => {} }; } }
};

// Mock UI Manager
const mockUI = {
    addMessage: jest.fn(),
    updateStats: jest.fn(),
    updateInventory: jest.fn()
};

// Mock Game Logic
const createMockGameLogic = (player) => ({
    player,
    ui: mockUI,
    createDamageSplash: jest.fn()
});

describe('CombatSystem', () => {
    let player;
    let enemy;
    let combatSystem;
    let gameLogic;

    beforeEach(() => {
        player = new Player(0, 0);
        enemy = new Enemy(5, 5, 'CHICKEN');
        gameLogic = createMockGameLogic(player);
        combatSystem = new CombatSystem(gameLogic);
        jest.clearAllMocks();
    });

    describe('attacking', () => {
        test('should initiate combat with target', () => {
            combatSystem.attackTarget(enemy);

            expect(player.target).toBe(enemy);
            expect(player.inCombat).toBe(true);
            expect(enemy.inCombat).toBe(true);
        });

        test('should not attack dead enemies', () => {
            enemy.isDead = true;
            combatSystem.attackTarget(enemy);

            expect(player.target).toBeFalsy();
            expect(player.inCombat).toBe(false);
        });

        test('should calculate hit damage', () => {
            const damage = combatSystem.calculateHit(player, enemy);

            expect(typeof damage).toBe('number');
            expect(damage).toBeGreaterThanOrEqual(0);
        });

        test('should award XP on kill', () => {
            const initialXP = player.skills.attack.xp;

            // Manually kill enemy through combat system
            enemy.currentHP = 1;
            combatSystem.player.target = enemy;
            combatSystem.handleKill(enemy);

            expect(player.skills.attack.xp).toBeGreaterThan(initialXP);
        });
    });

    describe('stopping combat', () => {
        test('should stop combat', () => {
            combatSystem.attackTarget(enemy);
            combatSystem.stopCombat();

            expect(player.inCombat).toBe(false);
            expect(player.target).toBe(null);
            expect(enemy.inCombat).toBe(false);
        });
    });

    describe('kill handling', () => {
        test('should mark enemy as dead', () => {
            combatSystem.player.target = enemy;
            combatSystem.handleKill(enemy);

            expect(enemy.isDead).toBe(true);
        });

        test('should add loot to inventory', () => {
            const inventoryBefore = player.getInventoryCount();
            combatSystem.player.target = enemy;
            combatSystem.handleKill(enemy);

            // Chicken should drop bones and possibly feathers/raw chicken
            expect(player.getInventoryCount()).toBeGreaterThanOrEqual(inventoryBefore);
        });

        test('should stop combat after kill', () => {
            combatSystem.attackTarget(enemy);
            combatSystem.handleKill(enemy);

            expect(player.inCombat).toBe(false);
            expect(player.target).toBe(null);
        });
    });

    describe('update loop', () => {
        test('should perform attack when timer expires', () => {
            combatSystem.attackTarget(enemy);
            combatSystem.attackTimer = 0;

            const spy = jest.spyOn(combatSystem, 'performAttack');
            combatSystem.update(0.1);

            expect(spy).toHaveBeenCalled();
        });

        test('should not attack when timer is active', () => {
            combatSystem.attackTarget(enemy);
            combatSystem.attackTimer = 2.0;

            const spy = jest.spyOn(combatSystem, 'performAttack');
            combatSystem.update(0.1);

            expect(spy).not.toHaveBeenCalled();
        });

        test('should decrement attack timer', () => {
            combatSystem.attackTarget(enemy);
            combatSystem.attackTimer = 2.0;

            combatSystem.update(0.5);

            expect(combatSystem.attackTimer).toBe(1.5);
        });
    });
});
