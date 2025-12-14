/**
 * Comprehensive SkillsSystem tests
 */

import { SkillsSystem } from '../src/systems/SkillsSystem.ts';
import { SKILLS, ITEMS } from '../src/utils/Constants.ts';

describe('SkillsSystem', () => {
    let mockGameLogic;
    let skillsSystem;
    let mockPlayer;
    let mockUI;

    beforeEach(() => {
        mockUI = {
            addMessage: jest.fn(),
            updateStats: jest.fn(),
            updateInventory: jest.fn()
        };

        mockPlayer = {
            skills: {
                [SKILLS.WOODCUTTING]: { level: 1, xp: 0 },
                [SKILLS.MINING]: { level: 1, xp: 0 },
                [SKILLS.FISHING]: { level: 1, xp: 0 }
            },
            inventory: new Array(28).fill(null),
            addItem: jest.fn((item, count) => {
                // Find first empty slot
                for (let i = 0; i < mockPlayer.inventory.length; i++) {
                    if (!mockPlayer.inventory[i]) {
                        mockPlayer.inventory[i] = { ...item, count };
                        return true;
                    }
                }
                return false;
            }),
            addXP: jest.fn((skill, xp) => {
                mockPlayer.skills[skill].xp += xp;
            })
        };

        mockGameLogic = {
            player: mockPlayer,
            ui: mockUI
        };

        skillsSystem = new SkillsSystem(mockGameLogic);
    });

    describe('Initialization', () => {
        test('should initialize with gameLogic', () => {
            expect(skillsSystem.gameLogic).toBe(mockGameLogic);
            expect(skillsSystem.player).toBe(mockPlayer);
        });

        test('should initialize with empty resources array', () => {
            expect(skillsSystem.resources).toEqual([]);
        });
    });

    describe('addResource', () => {
        test('should add resource to resources array', () => {
            const mockResource = { type: 'tree', name: 'Tree' };
            skillsSystem.addResource(mockResource);
            expect(skillsSystem.resources).toContain(mockResource);
        });

        test('should add multiple resources', () => {
            const resource1 = { type: 'tree', name: 'Tree' };
            const resource2 = { type: 'copper_rock', name: 'Copper Rock' };

            skillsSystem.addResource(resource1);
            skillsSystem.addResource(resource2);

            expect(skillsSystem.resources.length).toBe(2);
            expect(skillsSystem.resources).toContain(resource1);
            expect(skillsSystem.resources).toContain(resource2);
        });
    });

    describe('getRequiredSkill', () => {
        test('should return correct skill for woodcutting resources', () => {
            expect(skillsSystem.getRequiredSkill('tree')).toBe(SKILLS.WOODCUTTING);
            expect(skillsSystem.getRequiredSkill('normal_tree')).toBe(SKILLS.WOODCUTTING);
            expect(skillsSystem.getRequiredSkill('oak_tree')).toBe(SKILLS.WOODCUTTING);
            expect(skillsSystem.getRequiredSkill('willow_tree')).toBe(SKILLS.WOODCUTTING);
        });

        test('should return correct skill for mining resources', () => {
            expect(skillsSystem.getRequiredSkill('copper_rock')).toBe(SKILLS.MINING);
            expect(skillsSystem.getRequiredSkill('tin_rock')).toBe(SKILLS.MINING);
            expect(skillsSystem.getRequiredSkill('iron_rock')).toBe(SKILLS.MINING);
        });

        test('should return correct skill for fishing resources', () => {
            expect(skillsSystem.getRequiredSkill('fishing_spot')).toBe(SKILLS.FISHING);
            expect(skillsSystem.getRequiredSkill('shrimp_spot')).toBe(SKILLS.FISHING);
        });

        test('should return undefined for unknown resource type', () => {
            expect(skillsSystem.getRequiredSkill('unknown')).toBeUndefined();
        });
    });

    describe('getGatheredItem', () => {
        test('should return correct item for woodcutting resources', () => {
            expect(skillsSystem.getGatheredItem('tree')).toBe(ITEMS.LOGS);
            expect(skillsSystem.getGatheredItem('normal_tree')).toBe(ITEMS.LOGS);
            expect(skillsSystem.getGatheredItem('oak_tree')).toBe(ITEMS.LOGS);
            expect(skillsSystem.getGatheredItem('willow_tree')).toBe(ITEMS.LOGS);
        });

        test('should return correct item for mining resources', () => {
            expect(skillsSystem.getGatheredItem('copper_rock')).toBe(ITEMS.COPPER_ORE);
            expect(skillsSystem.getGatheredItem('tin_rock')).toBe(ITEMS.TIN_ORE);
        });

        test('should return correct item for fishing resources', () => {
            expect(skillsSystem.getGatheredItem('fishing_spot')).toBe(ITEMS.RAW_SHRIMPS);
            expect(skillsSystem.getGatheredItem('shrimp_spot')).toBe(ITEMS.RAW_SHRIMPS);
        });

        test('should return undefined for unknown resource type', () => {
            expect(skillsSystem.getGatheredItem('unknown')).toBeUndefined();
        });
    });

    describe('gatherResource', () => {
        let mockResource;

        beforeEach(() => {
            mockResource = {
                type: 'tree',
                name: 'Tree',
                levelRequired: 1,
                hp: 5,
                xpReward: 25,
                depleted: false,
                deplete: jest.fn(() => {
                    mockResource.depleted = true;
                }),
                respawn: jest.fn(() => {
                    mockResource.depleted = false;
                    mockResource.hp = 5;
                })
            };
        });

        test('should not gather from null resource', () => {
            skillsSystem.gatherResource(null);
            expect(mockPlayer.addItem).not.toHaveBeenCalled();
        });

        test('should not gather from depleted resource', () => {
            mockResource.depleted = true;
            skillsSystem.gatherResource(mockResource);
            expect(mockPlayer.addItem).not.toHaveBeenCalled();
        });

        test('should fail if player level is too low', () => {
            mockResource.levelRequired = 10;
            mockPlayer.skills[SKILLS.WOODCUTTING].level = 5;

            skillsSystem.gatherResource(mockResource);

            expect(mockUI.addMessage).toHaveBeenCalledWith(
                expect.stringContaining('You need 10'),
                'game'
            );
            expect(mockPlayer.addItem).not.toHaveBeenCalled();
        });

        test('should gather resource when successful (with mocked random)', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.01); // Force success

            skillsSystem.gatherResource(mockResource);

            expect(mockResource.hp).toBe(4);
            expect(mockPlayer.addItem).toHaveBeenCalled();
            expect(mockPlayer.addXP).toHaveBeenCalledWith(SKILLS.WOODCUTTING, 25);
            expect(mockUI.updateStats).toHaveBeenCalled();
            expect(mockUI.updateInventory).toHaveBeenCalled();

            Math.random.mockRestore();
        });

        test('should show failure message when gather fails', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.99); // Force failure

            skillsSystem.gatherResource(mockResource);

            expect(mockUI.addMessage).toHaveBeenCalledWith(
                expect.stringContaining('You attempt to gather'),
                'game'
            );
            expect(mockPlayer.addItem).not.toHaveBeenCalled();

            Math.random.mockRestore();
        });

        test('should deplete resource when hp reaches 0', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.01); // Force success

            mockResource.hp = 1;
            skillsSystem.gatherResource(mockResource);

            expect(mockResource.hp).toBe(0);
            expect(mockResource.deplete).toHaveBeenCalled();

            Math.random.mockRestore();
        });

        test('should show inventory full message when inventory is full', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.01); // Force success

            // Fill inventory
            mockPlayer.addItem = jest.fn(() => false);

            skillsSystem.gatherResource(mockResource);

            expect(mockUI.addMessage).toHaveBeenCalledWith(
                expect.stringContaining('inventory is full'),
                'game'
            );

            Math.random.mockRestore();
        });

        test('should calculate success chance based on level difference', () => {
            // At level 1 gathering level 1 resource: success chance = 0.1 + (1-1)*0.05 = 0.1
            mockPlayer.skills[SKILLS.WOODCUTTING].level = 1;
            mockResource.levelRequired = 1;

            jest.spyOn(Math, 'random').mockReturnValue(0.05); // Should succeed
            skillsSystem.gatherResource(mockResource);
            expect(mockPlayer.addItem).toHaveBeenCalled();

            mockPlayer.addItem.mockClear();

            jest.spyOn(Math, 'random').mockReturnValue(0.15); // Should fail
            skillsSystem.gatherResource(mockResource);
            expect(mockPlayer.addItem).not.toHaveBeenCalled();

            Math.random.mockRestore();
        });

        test('should cap success chance at 0.9', () => {
            mockPlayer.skills[SKILLS.WOODCUTTING].level = 100;
            mockResource.levelRequired = 1;

            jest.spyOn(Math, 'random').mockReturnValue(0.95); // Should fail even at high level
            skillsSystem.gatherResource(mockResource);
            expect(mockPlayer.addItem).not.toHaveBeenCalled();

            Math.random.mockRestore();
        });

        test('should gather from different resource types', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.01); // Force success

            // Test mining
            const copperRock = {
                type: 'copper_rock',
                name: 'Copper Rock',
                levelRequired: 1,
                hp: 3,
                xpReward: 17.5,
                depleted: false,
                deplete: jest.fn(),
                respawn: jest.fn()
            };

            skillsSystem.gatherResource(copperRock);
            expect(mockPlayer.addXP).toHaveBeenCalledWith(SKILLS.MINING, 17.5);

            mockPlayer.addXP.mockClear();

            // Test fishing
            const fishingSpot = {
                type: 'fishing_spot',
                name: 'Fishing Spot',
                levelRequired: 1,
                hp: 1,
                xpReward: 10,
                depleted: false,
                deplete: jest.fn(),
                respawn: jest.fn()
            };

            skillsSystem.gatherResource(fishingSpot);
            expect(mockPlayer.addXP).toHaveBeenCalledWith(SKILLS.FISHING, 10);

            Math.random.mockRestore();
        });
    });

    describe('update', () => {
        test('should update resource respawn timers', () => {
            const mockResource = {
                depleted: true,
                respawnTimer: 5,
                respawn: jest.fn(() => {
                    mockResource.depleted = false;
                })
            };

            skillsSystem.addResource(mockResource);

            // Update with 2 seconds
            skillsSystem.update(2);

            expect(mockResource.respawnTimer).toBe(3);
            expect(mockResource.respawn).not.toHaveBeenCalled();
        });

        test('should respawn resource when timer reaches 0', () => {
            const mockResource = {
                depleted: true,
                respawnTimer: 1,
                respawn: jest.fn(() => {
                    mockResource.depleted = false;
                })
            };

            skillsSystem.addResource(mockResource);

            // Update with 2 seconds
            skillsSystem.update(2);

            expect(mockResource.respawnTimer).toBe(-1);
            expect(mockResource.respawn).toHaveBeenCalled();
            expect(mockResource.depleted).toBe(false);
        });

        test('should not update non-depleted resources', () => {
            const mockResource = {
                depleted: false,
                respawnTimer: 10,
                respawn: jest.fn()
            };

            skillsSystem.addResource(mockResource);

            skillsSystem.update(5);

            expect(mockResource.respawnTimer).toBe(10); // Unchanged
            expect(mockResource.respawn).not.toHaveBeenCalled();
        });

        test('should update multiple resources simultaneously', () => {
            const resource1 = {
                depleted: true,
                respawnTimer: 10,
                respawn: jest.fn()
            };

            const resource2 = {
                depleted: true,
                respawnTimer: 5,
                respawn: jest.fn()
            };

            skillsSystem.addResource(resource1);
            skillsSystem.addResource(resource2);

            skillsSystem.update(3);

            expect(resource1.respawnTimer).toBe(7);
            expect(resource2.respawnTimer).toBe(2);
        });
    });

    describe('Integration tests', () => {
        test('should complete full gather-deplete-respawn cycle', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.01); // Force success

            const mockResource = {
                type: 'tree',
                name: 'Tree',
                levelRequired: 1,
                hp: 1,
                xpReward: 25,
                depleted: false,
                respawnTimer: 0,
                deplete: jest.fn(() => {
                    mockResource.depleted = true;
                    mockResource.respawnTimer = 30;
                }),
                respawn: jest.fn(() => {
                    mockResource.depleted = false;
                    mockResource.hp = 1;
                })
            };

            skillsSystem.addResource(mockResource);

            // Gather and deplete
            skillsSystem.gatherResource(mockResource);
            expect(mockResource.depleted).toBe(true);

            // Try to gather again (should fail)
            mockPlayer.addItem.mockClear();
            skillsSystem.gatherResource(mockResource);
            expect(mockPlayer.addItem).not.toHaveBeenCalled();

            // Wait for respawn
            skillsSystem.update(30);
            expect(mockResource.respawn).toHaveBeenCalled();
            expect(mockResource.depleted).toBe(false);

            // Gather again successfully
            mockPlayer.addItem.mockClear();
            skillsSystem.gatherResource(mockResource);
            expect(mockPlayer.addItem).toHaveBeenCalled();

            Math.random.mockRestore();
        });

        test('should award correct XP for different resources', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.01); // Force success

            const resources = [
                { type: 'tree', xpReward: 25, skill: SKILLS.WOODCUTTING },
                { type: 'copper_rock', xpReward: 17.5, skill: SKILLS.MINING },
                { type: 'fishing_spot', xpReward: 10, skill: SKILLS.FISHING }
            ];

            for (const resourceData of resources) {
                const resource = {
                    type: resourceData.type,
                    name: 'Resource',
                    levelRequired: 1,
                    hp: 5,
                    xpReward: resourceData.xpReward,
                    depleted: false,
                    deplete: jest.fn(),
                    respawn: jest.fn()
                };

                mockPlayer.addXP.mockClear();
                skillsSystem.gatherResource(resource);

                expect(mockPlayer.addXP).toHaveBeenCalledWith(resourceData.skill, resourceData.xpReward);
            }

            Math.random.mockRestore();
        });
    });
});
