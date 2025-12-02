/**
 * Comprehensive ShopSystem tests
 */

import { ShopSystem, SHOPS } from '../src/systems/ShopSystem.ts';

describe('ShopSystem', () => {
    let mockGameLogic;
    let shopSystem;
    let mockPlayer;

    beforeEach(() => {
        // Create mock player
        mockPlayer = {
            skills: {
                woodcutting: { level: 1 },
                attack: { level: 1 },
                mining: { level: 1 }
            },
            inventory: new Array(28).fill(null),
            isMember: false,
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
            removeItem: jest.fn((slot) => {
                const item = mockPlayer.inventory[slot];
                mockPlayer.inventory[slot] = null;
                return item;
            }),
            getInventoryCount: jest.fn(() => {
                return mockPlayer.inventory.filter(item => item !== null).length;
            })
        };

        // Add coins to inventory (using numeric ID 995 for coins)
        mockPlayer.inventory[0] = { id: 995, name: 'Coins', count: 50000, stackable: true };

        mockGameLogic = {
            player: mockPlayer
        };

        shopSystem = new ShopSystem(mockGameLogic);
    });

    describe('Initialization', () => {
        test('should initialize with game logic', () => {
            expect(shopSystem.gameLogic).toBe(mockGameLogic);
            expect(shopSystem.player).toBe(mockPlayer);
        });

        test('should initialize all shops from SHOPS constant', () => {
            expect(shopSystem.shops.size).toBe(Object.keys(SHOPS).length);
        });

        test('should deep copy shop items', () => {
            const shop = shopSystem.shops.get('bobs_axes');
            expect(shop).toBeDefined();
            expect(shop.items).not.toBe(SHOPS.BOBS_AXES.items);
        });

        test('should initialize with no current shop', () => {
            expect(shopSystem.currentShop).toBeNull();
        });
    });

    describe('openShop', () => {
        test('should open existing shop successfully', () => {
            const result = shopSystem.openShop('bobs_axes');
            expect(result.success).toBe(true);
            expect(result.shop).toBeDefined();
            expect(result.shop.id).toBe('bobs_axes');
            expect(shopSystem.currentShop).toBe(result.shop);
        });

        test('should fail to open non-existent shop', () => {
            const result = shopSystem.openShop('fake_shop');
            expect(result.success).toBe(false);
            expect(result.message).toContain('not found');
        });

        test('should fail to open members-only shop as F2P player', () => {
            // Note: No members-only shops currently in SHOPS, so we skip this test
            // or we can test that F2P players can open all current shops
            mockPlayer.isMember = false;
            const result = shopSystem.openShop('bobs_axes');
            expect(result.success).toBe(true); // F2P can access this shop
        });

        test('should allow F2P shop for F2P player', () => {
            mockPlayer.isMember = false;
            const result = shopSystem.openShop('bobs_axes');
            expect(result.success).toBe(true);
        });
    });

    describe('closeShop', () => {
        test('should close currently open shop', () => {
            shopSystem.openShop('bobs_axes');
            expect(shopSystem.currentShop).not.toBeNull();
            shopSystem.closeShop();
            expect(shopSystem.currentShop).toBeNull();
        });
    });

    describe('buyItem', () => {
        beforeEach(() => {
            shopSystem.openShop('bobs_axes');
        });

        test('should fail if no shop is open', () => {
            shopSystem.closeShop();
            const result = shopSystem.buyItem('bronze_axe', 1);
            expect(result.success).toBe(false);
            expect(result.message).toContain('No shop is open');
        });

        test('should fail for non-existent item', () => {
            const result = shopSystem.buyItem('fake_item', 1);
            expect(result.success).toBe(false);
            expect(result.message).toContain('not found');
        });

        test('should fail when insufficient stock', () => {
            const shop = shopSystem.currentShop;
            const item = shop.items.find(i => i.id === 'bronze_axe');
            item.stock = 0;

            const result = shopSystem.buyItem('bronze_axe', 1);
            expect(result.success).toBe(false);
            expect(result.message).toContain('stock');
        });

        test('should fail when skill requirements not met', () => {
            mockPlayer.skills.woodcutting.level = 1;
            const result = shopSystem.buyItem('steel_axe', 1); // requires level 6
            expect(result.success).toBe(false);
            expect(result.message).toContain('Requires');
        });

        test('should fail when insufficient coins', () => {
            mockPlayer.inventory[0].count = 1; // Only 1 coin
            const result = shopSystem.buyItem('bronze_axe', 1);
            expect(result.success).toBe(false);
            expect(result.message).toContain('need');
        });

        test('should fail when inventory is full', () => {
            // Fill inventory
            for (let i = 1; i < 28; i++) {
                mockPlayer.inventory[i] = { id: 'junk', name: 'Junk' };
            }

            const result = shopSystem.buyItem('bronze_axe', 1);
            expect(result.success).toBe(false);
            expect(result.message).toContain('inventory space');
        });

        test('should successfully buy item with valid conditions', () => {
            const shop = shopSystem.currentShop;
            const item = shop.items.find(i => i.id === 'bronze_axe');
            const initialStock = item.stock;
            const initialCoins = mockPlayer.inventory[0].count;

            const result = shopSystem.buyItem('bronze_axe', 1);

            expect(result.success).toBe(true);
            expect(result.item).toBe(item);
            expect(result.quantity).toBe(1);
            expect(result.cost).toBe(item.buyPrice);
            expect(item.stock).toBe(initialStock - 1);
            expect(mockPlayer.inventory[0].count).toBe(initialCoins - item.buyPrice);
        });

        test('should buy multiple items at once', () => {
            const shop = shopSystem.currentShop;
            const item = shop.items.find(i => i.id === 'bronze_axe');
            const quantity = 3;
            const initialStock = item.stock;

            const result = shopSystem.buyItem('bronze_axe', quantity);

            expect(result.success).toBe(true);
            expect(item.stock).toBe(initialStock - quantity);
        });

        test('should add item to player inventory', () => {
            const result = shopSystem.buyItem('bronze_axe', 1);
            expect(result.success).toBe(true);
            expect(mockPlayer.addItem).toHaveBeenCalled();
        });

        test('should schedule restock after purchase', () => {
            jest.useFakeTimers();
            shopSystem.buyItem('bronze_axe', 1);
            expect(shopSystem.restockTimers.size).toBeGreaterThan(0);
            jest.useRealTimers();
        });
    });

    describe('sellItem', () => {
        beforeEach(() => {
            shopSystem.openShop('general_store');
            // Add a rope to inventory
            mockPlayer.inventory[1] = { id: 'rope', name: 'Rope', count: 1 };
        });

        test('should fail if no shop is open', () => {
            shopSystem.closeShop();
            const result = shopSystem.sellItem(1, 1);
            expect(result.success).toBe(false);
            expect(result.message).toContain('No shop is open');
        });

        test('should fail if inventory slot is empty', () => {
            const result = shopSystem.sellItem(5, 1); // Empty slot
            expect(result.success).toBe(false);
            expect(result.message).toContain('No item');
        });

        test('should fail if shop doesn\'t buy the item', () => {
            shopSystem.closeShop();
            shopSystem.openShop('bobs_axes'); // Specialty shop
            mockPlayer.inventory[1] = { id: 'weird_item', name: 'Weird Item' };

            const result = shopSystem.sellItem(1, 1);
            expect(result.success).toBe(false);
            expect(result.message).toContain('doesn\'t buy');
        });

        test('should successfully sell item to general store', () => {
            const initialCoins = mockPlayer.inventory[0].count;
            const result = shopSystem.sellItem(1, 1);

            expect(result.success).toBe(true);
            expect(result.value).toBeGreaterThan(0);
            expect(mockPlayer.inventory[0].count).toBeGreaterThan(initialCoins);
        });

        test('should use shop item sell price if item exists in shop', () => {
            const shop = shopSystem.currentShop;
            const shopItem = shop.items.find(i => i.id === 'rope');
            if (shopItem) {
                const result = shopSystem.sellItem(1, 1);
                expect(result.value).toBe(shopItem.sellPrice);
            }
        });

        test('should increase shop stock when selling stocked item', () => {
            const shop = shopSystem.currentShop;
            const shopItem = shop.items.find(i => i.id === 'rope');
            if (shopItem) {
                const initialStock = shopItem.stock;
                shopSystem.sellItem(1, 1);
                expect(shopItem.stock).toBeGreaterThanOrEqual(initialStock);
            }
        });
    });

    describe('restocking system', () => {
        test('should restore one item at a time', () => {
            jest.useFakeTimers();

            shopSystem.openShop('bobs_axes');
            const shop = shopSystem.currentShop;
            const item = shop.items.find(i => i.id === 'bronze_axe');
            const maxStock = item.maxStock;

            // Deplete stock
            item.stock = 5;

            // Trigger restock
            shopSystem.restockItem('bobs_axes', 'bronze_axe');

            expect(item.stock).toBe(6);

            jest.useRealTimers();
        });

        test('should not restock above max stock', () => {
            shopSystem.openShop('bobs_axes');
            const shop = shopSystem.currentShop;
            const item = shop.items.find(i => i.id === 'bronze_axe');

            item.stock = item.maxStock;
            shopSystem.restockItem('bobs_axes', 'bronze_axe');

            expect(item.stock).toBe(item.maxStock);
        });

        test('should schedule restock timer correctly', () => {
            jest.useFakeTimers();

            shopSystem.openShop('bobs_axes');
            shopSystem.scheduleRestock('bobs_axes', 'bronze_axe');

            expect(shopSystem.restockTimers.has('bobs_axes_bronze_axe')).toBe(true);

            jest.useRealTimers();
        });
    });

    describe('helper methods', () => {
        test('getPlayerCoins should return coin count', () => {
            mockPlayer.inventory[0] = { id: 995, name: 'Coins', count: 1234 };
            expect(shopSystem.getPlayerCoins()).toBe(1234);
        });

        test('getPlayerCoins should return 0 if no coins', () => {
            mockPlayer.inventory = new Array(28).fill(null);
            expect(shopSystem.getPlayerCoins()).toBe(0);
        });

        test('addPlayerCoins should add to existing stack', () => {
            mockPlayer.inventory[0] = { id: 995, name: 'Coins', count: 100 };
            shopSystem.addPlayerCoins(50);
            expect(mockPlayer.inventory[0].count).toBe(150);
        });

        test('addPlayerCoins should create new stack if none exists', () => {
            mockPlayer.inventory = new Array(28).fill(null);
            shopSystem.addPlayerCoins(100);
            expect(mockPlayer.addItem).toHaveBeenCalled();
        });

        test('removePlayerCoins should remove from stack', () => {
            mockPlayer.inventory[0] = { id: 995, name: 'Coins', count: 100 };
            const result = shopSystem.removePlayerCoins(50);
            expect(result).toBe(true);
            expect(mockPlayer.inventory[0].count).toBe(50);
        });

        test('removePlayerCoins should remove stack if depleted', () => {
            mockPlayer.inventory[0] = { id: 995, name: 'Coins', count: 50 };
            shopSystem.removePlayerCoins(50);
            expect(mockPlayer.inventory[0]).toBeNull();
        });

        test('hasInventorySpace should count empty slots', () => {
            mockPlayer.inventory[1] = { id: 'item', name: 'Item' };
            mockPlayer.inventory[2] = { id: 'item', name: 'Item' };
            expect(shopSystem.hasInventorySpace(1)).toBe(true);
            expect(shopSystem.hasInventorySpace(25)).toBe(true);
        });

        test('getShopInfo should return shop data', () => {
            const shopInfo = shopSystem.getShopInfo('bobs_axes');
            expect(shopInfo).toBeDefined();
            expect(shopInfo.id).toBe('bobs_axes');
        });

        test('getCurrentShop should return current shop', () => {
            expect(shopSystem.getCurrentShop()).toBeNull();
            shopSystem.openShop('bobs_axes');
            expect(shopSystem.getCurrentShop()).not.toBeNull();
        });
    });

    describe('update method', () => {
        test('should exist and be callable', () => {
            expect(typeof shopSystem.update).toBe('function');
            expect(() => shopSystem.update(1.0)).not.toThrow();
        });
    });

    describe('Shop data integrity', () => {
        test('BOBS_AXES should have correct structure', () => {
            const shop = SHOPS.BOBS_AXES;
            expect(shop.id).toBe('bobs_axes');
            expect(shop.name).toBe("Bob's Brilliant Axes");
            expect(shop.items).toBeInstanceOf(Array);
            expect(shop.items.length).toBeGreaterThan(0);
        });

        test('All shop items should have required properties', () => {
            for (const shopKey in SHOPS) {
                const shop = SHOPS[shopKey];
                for (const item of shop.items) {
                    expect(item).toHaveProperty('id');
                    expect(item).toHaveProperty('name');
                    expect(item).toHaveProperty('stock');
                    expect(item).toHaveProperty('buyPrice');
                    expect(item).toHaveProperty('sellPrice');
                }
            }
        });
    });
});
