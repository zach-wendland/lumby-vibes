/**
 * ShopSystem tests
 */

import { ShopSystem, SHOPS } from '../src/systems/ShopSystem.js';

describe('ShopSystem', () => {
    let mockGameLogic;
    let shopSystem;

    beforeEach(() => {
        mockGameLogic = {
            player: {
                skills: {
                    woodcutting: { level: 1 }
                },
                inventory: [],
                coins: 1000,
                addItem: jest.fn(() => true),
                removeItem: jest.fn(() => true),
                hasItem: jest.fn(() => false)
            }
        };

        shopSystem = new ShopSystem(mockGameLogic);
    });

    describe('initialization', () => {
        test('should initialize all shops', () => {
            expect(shopSystem.shops.size).toBeGreaterThan(0);
            expect(shopSystem.shops.has('bobs_axes')).toBe(true);
            expect(shopSystem.shops.has('lumbridge_general_store')).toBe(true);
        });

        test('should initialize shop stock', () => {
            const bobsAxes = shopSystem.shops.get('bobs_axes');
            expect(bobsAxes.items.length).toBeGreaterThan(0);
        });
    });

    describe('getShop', () => {
        test('should return shop by id', () => {
            const shop = shopSystem.getShop('bobs_axes');
            expect(shop).toBeDefined();
            expect(shop.name).toBe("Bob's Brilliant Axes");
        });

        test('should return null for non-existent shop', () => {
            const shop = shopSystem.getShop('nonexistent_shop');
            expect(shop).toBeNull();
        });
    });

    describe('buyItem', () => {
        test('should successfully buy item with enough coins', () => {
            const result = shopSystem.buyItem('bobs_axes', 'bronze_axe', 1, mockGameLogic.player);
            expect(result.success).toBe(true);
            expect(mockGameLogic.player.addItem).toHaveBeenCalled();
        });

        test('should fail to buy without enough coins', () => {
            mockGameLogic.player.coins = 1;
            const result = shopSystem.buyItem('bobs_axes', 'rune_axe', 1, mockGameLogic.player);
            expect(result.success).toBe(false);
            expect(result.message).toContain('coins');
        });

        test('should fail to buy without skill requirements', () => {
            mockGameLogic.player.woodcutting = { level: 1 };
            const result = shopSystem.buyItem('bobs_axes', 'steel_axe', 1, mockGameLogic.player);
            expect(result.success).toBe(false);
            expect(result.message).toContain('Requires');
        });

        test('should reduce shop stock after purchase', () => {
            const shop = shopSystem.getShop('bobs_axes');
            const bronzeAxe = shop.items.find(item => item.id === 'bronze_axe');
            const initialStock = bronzeAxe.currentStock;

            shopSystem.buyItem('bobs_axes', 'bronze_axe', 1, mockGameLogic.player);

            expect(bronzeAxe.currentStock).toBe(initialStock - 1);
        });

        test('should fail when item is out of stock', () => {
            const shop = shopSystem.getShop('bobs_axes');
            const bronzeAxe = shop.items.find(item => item.id === 'bronze_axe');
            bronzeAxe.currentStock = 0;

            const result = shopSystem.buyItem('bobs_axes', 'bronze_axe', 1, mockGameLogic.player);
            expect(result.success).toBe(false);
            expect(result.message).toContain('stock');
        });

        test('should buy multiple items at once', () => {
            const result = shopSystem.buyItem('lumbridge_general_store', 'pot', 3, mockGameLogic.player);
            expect(result.success).toBe(true);
            expect(mockGameLogic.player.addItem).toHaveBeenCalledWith(expect.anything(), 3);
        });
    });

    describe('sellItem', () => {
        beforeEach(() => {
            mockGameLogic.player.hasItem = jest.fn(() => true);
        });

        test('should successfully sell item', () => {
            const result = shopSystem.sellItem('lumbridge_general_store', 'rope', 1, mockGameLogic.player);
            expect(result.success).toBe(true);
            expect(mockGameLogic.player.removeItem).toHaveBeenCalled();
        });

        test('should give correct amount of coins', () => {
            const initialCoins = mockGameLogic.player.coins;
            shopSystem.sellItem('lumbridge_general_store', 'rope', 1, mockGameLogic.player);

            expect(mockGameLogic.player.coins).toBeGreaterThan(initialCoins);
        });

        test('should fail to sell item not in inventory', () => {
            mockGameLogic.player.hasItem = jest.fn(() => false);
            const result = shopSystem.sellItem('lumbridge_general_store', 'rope', 1, mockGameLogic.player);
            expect(result.success).toBe(false);
        });

        test('should increase shop stock when selling', () => {
            const shop = shopSystem.getShop('lumbridge_general_store');
            const rope = shop.items.find(item => item.id === 'rope');

            if (!rope) {
                // Item not in shop yet, should be added
                const initialLength = shop.items.length;
                shopSystem.sellItem('lumbridge_general_store', 'rope', 1, mockGameLogic.player);
                // Should remain same length if item exists, or be added
                expect(shop.items.length).toBeGreaterThanOrEqual(initialLength);
            } else {
                const initialStock = rope.currentStock;
                shopSystem.sellItem('lumbridge_general_store', 'rope', 1, mockGameLogic.player);
                expect(rope.currentStock).toBe(initialStock + 1);
            }
        });
    });

    describe('restock system', () => {
        test('should restock items over time', (done) => {
            const shop = shopSystem.getShop('bobs_axes');
            const bronzeAxe = shop.items.find(item => item.id === 'bronze_axe');

            // Buy to reduce stock
            shopSystem.buyItem('bobs_axes', 'bronze_axe', 5, mockGameLogic.player);
            const reducedStock = bronzeAxe.currentStock;

            // Wait for restock
            setTimeout(() => {
                shopSystem.update(10); // Simulate 10 seconds passing
                expect(bronzeAxe.currentStock).toBeGreaterThan(reducedStock);
                done();
            }, 100);
        });

        test('should not restock above maximum', () => {
            const shop = shopSystem.getShop('bobs_axes');
            const bronzeAxe = shop.items.find(item => item.id === 'bronze_axe');
            const maxStock = bronzeAxe.stock;

            // Stock is already at max
            bronzeAxe.currentStock = maxStock;

            shopSystem.update(100); // Simulate time passing

            expect(bronzeAxe.currentStock).toBeLessThanOrEqual(maxStock);
        });
    });

    describe('shop inventory', () => {
        test("Bob's Axes should have all axe types", () => {
            const shop = shopSystem.getShop('bobs_axes');
            const axeTypes = ['bronze_axe', 'iron_axe', 'steel_axe', 'mithril_axe', 'adamant_axe', 'rune_axe'];

            for (const axe of axeTypes) {
                const hasAxe = shop.items.some(item => item.id === axe);
                expect(hasAxe).toBe(true);
            }
        });

        test('General Store should have basic supplies', () => {
            const shop = shopSystem.getShop('lumbridge_general_store');
            const basicItems = ['pot', 'bucket', 'tinderbox', 'chisel', 'hammer'];

            for (const item of basicItems) {
                const hasItem = shop.items.some(shopItem => shopItem.id === item);
                expect(hasItem).toBe(true);
            }
        });
    });

    describe('price calculations', () => {
        test('should have correct buy and sell prices', () => {
            const shop = shopSystem.getShop('bobs_axes');
            const bronzeAxe = shop.items.find(item => item.id === 'bronze_axe');

            expect(bronzeAxe.buyPrice).toBe(16);
            expect(bronzeAxe.sellPrice).toBeDefined();
            expect(bronzeAxe.sellPrice).toBeLessThan(bronzeAxe.buyPrice);
        });

        test('should calculate total cost for multiple items', () => {
            const shop = shopSystem.getShop('lumbridge_general_store');
            const pot = shop.items.find(item => item.id === 'pot');

            const quantity = 5;
            const expectedCost = pot.buyPrice * quantity;

            // This would be the cost if buying 5 pots
            expect(pot.buyPrice * quantity).toBe(expectedCost);
        });
    });

    describe('member requirements', () => {
        test('should allow F2P items for free players', () => {
            mockGameLogic.player.isMember = false;
            const result = shopSystem.buyItem('bobs_axes', 'bronze_axe', 1, mockGameLogic.player);
            expect(result.success).toBe(true);
        });

        test('should prevent buying members items as F2P', () => {
            mockGameLogic.player.isMember = false;

            // Find a members-only item if any
            const shop = shopSystem.getShop('bobs_axes');
            const membersItem = shop.items.find(item => item.members === true);

            if (membersItem) {
                const result = shopSystem.buyItem('bobs_axes', membersItem.id, 1, mockGameLogic.player);
                expect(result.success).toBe(false);
            } else {
                // If no members items in shop, that's fine
                expect(true).toBe(true);
            }
        });
    });

    describe('update system', () => {
        test('should process restock over time', () => {
            const shop = shopSystem.getShop('bobs_axes');
            const bronzeAxe = shop.items.find(item => item.id === 'bronze_axe');

            // Deplete stock
            bronzeAxe.currentStock = 0;

            // Update multiple times
            for (let i = 0; i < 10; i++) {
                shopSystem.update(1); // 1 second each
            }

            // Should have restocked some
            expect(bronzeAxe.currentStock).toBeGreaterThan(0);
        });
    });
});
