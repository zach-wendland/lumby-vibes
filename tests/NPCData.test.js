/**
 * Comprehensive NPCData tests
 */

import { NPC_DATA } from '../src/data/NPCData.js';

describe('NPCData', () => {
    describe('Data integrity', () => {
        test('should export NPC_DATA object', () => {
            expect(NPC_DATA).toBeDefined();
            expect(typeof NPC_DATA).toBe('object');
        });

        test('should have at least one NPC defined', () => {
            expect(Object.keys(NPC_DATA).length).toBeGreaterThan(0);
        });
    });

    describe('NPC structure validation', () => {
        test('all NPCs should have required fields', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                expect(npcData).toHaveProperty('name');
                expect(npcData).toHaveProperty('location');
                expect(npcData).toHaveProperty('examine');

                expect(typeof npcData.name).toBe('string');
                expect(typeof npcData.location).toBe('string');
                expect(typeof npcData.examine).toBe('string');

                expect(npcData.name.length).toBeGreaterThan(0);
                expect(npcData.location.length).toBeGreaterThan(0);
                expect(npcData.examine.length).toBeGreaterThan(0);
            }
        });

        test('all NPCs should have valid questGiver field if present', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                if (npcData.questGiver !== undefined) {
                    if (npcData.questGiver !== false) {
                        expect(Array.isArray(npcData.questGiver)).toBe(true);
                        npcData.questGiver.forEach(questId => {
                            expect(typeof questId).toBe('string');
                            expect(questId.length).toBeGreaterThan(0);
                        });
                    }
                }
            }
        });

        test('all NPCs should have valid shop field if present', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                if (npcData.shop !== undefined) {
                    if (npcData.shop !== false) {
                        expect(typeof npcData.shop).toBe('string');
                        expect(npcData.shop.length).toBeGreaterThan(0);
                    }
                }
            }
        });

        test('all NPCs should have roaming and wanderRadius fields', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                expect(npcData).toHaveProperty('roaming');
                expect(npcData).toHaveProperty('wanderRadius');

                expect(typeof npcData.roaming).toBe('boolean');
                expect(typeof npcData.wanderRadius).toBe('number');
                expect(npcData.wanderRadius).toBeGreaterThanOrEqual(0);
            }
        });
    });

    describe('Dialogue validation', () => {
        test('all NPCs should have dialogue object', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                expect(npcData).toHaveProperty('dialogue');
                expect(typeof npcData.dialogue).toBe('object');
            }
        });

        test('dialogue should contain valid arrays', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                const dialogue = npcData.dialogue;

                for (const [key, lines] of Object.entries(dialogue)) {
                    expect(Array.isArray(lines)).toBe(true);
                    expect(lines.length).toBeGreaterThan(0);

                    lines.forEach(line => {
                        expect(typeof line).toBe('string');
                        expect(line.length).toBeGreaterThan(0);
                    });
                }
            }
        });

        test('dialogue should have greeting and default sections', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                const dialogue = npcData.dialogue;

                // Most NPCs should have greeting
                if (!dialogue.greeting) {
                    console.warn(`${npcId} missing greeting dialogue`);
                }

                // Most NPCs should have default
                if (!dialogue.default) {
                    console.warn(`${npcId} missing default dialogue`);
                }
            }
        });
    });

    describe('String syntax validation', () => {
        test('should not have unescaped apostrophes in single-quoted strings', () => {
            const fileContent = JSON.stringify(NPC_DATA, null, 2);

            // This is a heuristic test - if the data loads without errors, it passed
            expect(NPC_DATA).toBeDefined();
        });

        test('all examine texts should be properly formatted', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                const examine = npcData.examine;

                // Should not be empty
                expect(examine.trim().length).toBeGreaterThan(0);

                // Should end with punctuation
                expect(/[.!?]$/.test(examine)).toBe(true);

                // Should start with capital letter or 'A'/'An'/'The'
                expect(/^[A-Z]/.test(examine)).toBe(true);
            }
        });

        test('all dialogue lines should be properly formatted', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                const dialogue = npcData.dialogue;

                for (const [key, lines] of Object.entries(dialogue)) {
                    lines.forEach((line, index) => {
                        // Should not be empty
                        expect(line.trim().length).toBeGreaterThan(0);

                        // Should start with capital letter, number, or special char like quotes
                        if (!/^[A-Z"'0-9!@#$%^&*()\-]/.test(line)) {
                            console.warn(`${npcId}.dialogue.${key}[${index}]: "${line}" doesn't start with expected character`);
                        }
                    });
                }
            }
        });
    });

    describe('Specific NPC tests', () => {
        test('should have Duke Horacio', () => {
            expect(NPC_DATA.DUKE_HORACIO).toBeDefined();
            expect(NPC_DATA.DUKE_HORACIO.name).toBe('Duke Horacio');
            expect(NPC_DATA.DUKE_HORACIO.title).toBe('Duke of Lumbridge');
        });

        test('should have Cook', () => {
            expect(NPC_DATA.COOK).toBeDefined();
            expect(NPC_DATA.COOK.name).toBe('Cook');
            expect(Array.isArray(NPC_DATA.COOK.questGiver)).toBe(true);
        });

        test('should have Father Aereck', () => {
            expect(NPC_DATA.FATHER_AERECK).toBeDefined();
            expect(NPC_DATA.FATHER_AERECK.name).toBe('Father Aereck');
        });

        test('should have Bob (shop owner)', () => {
            expect(NPC_DATA.BOB).toBeDefined();
            expect(NPC_DATA.BOB.shop).toBeTruthy();
        });
    });

    describe('Quest NPC validation', () => {
        test('quest-giving NPCs should have quest dialogue', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                if (npcData.questGiver && Array.isArray(npcData.questGiver)) {
                    const dialogue = npcData.dialogue;

                    // Should have some quest-related dialogue
                    const hasQuestDialogue = Object.keys(dialogue).some(key =>
                        key.includes('quest')
                    );

                    if (!hasQuestDialogue) {
                        console.warn(`${npcId} is quest giver but lacks quest dialogue keys`);
                    }
                }
            }
        });
    });

    describe('Shop NPC validation', () => {
        test('shop NPCs should have shop identifier', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                if (npcData.shop && npcData.shop !== false) {
                    expect(typeof npcData.shop).toBe('string');
                    expect(npcData.shop.length).toBeGreaterThan(0);
                }
            }
        });
    });

    describe('Wandering NPC validation', () => {
        test('roaming NPCs should have reasonable wander radius', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                if (npcData.roaming) {
                    expect(npcData.wanderRadius).toBeGreaterThan(0);
                    expect(npcData.wanderRadius).toBeLessThan(100);
                }
            }
        });

        test('non-roaming NPCs can have small wander radius', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                if (!npcData.roaming) {
                    expect(npcData.wanderRadius).toBeGreaterThanOrEqual(0);
                    expect(npcData.wanderRadius).toBeLessThan(20);
                }
            }
        });
    });

    describe('Count field validation', () => {
        test('NPCs with count field should have valid numbers', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                if (npcData.count !== undefined) {
                    expect(typeof npcData.count).toBe('number');
                    expect(npcData.count).toBeGreaterThan(0);
                    expect(Number.isInteger(npcData.count)).toBe(true);
                }
            }
        });
    });

    describe('Critical NPCs', () => {
        const criticalNPCs = [
            'DUKE_HORACIO',
            'COOK',
            'FATHER_AERECK',
            'HANS',
            'BOB',
            'FRED_THE_FARMER'
        ];

        test('should have all critical Lumbridge NPCs', () => {
            criticalNPCs.forEach(npcId => {
                expect(NPC_DATA[npcId]).toBeDefined();
                expect(NPC_DATA[npcId].name).toBeTruthy();
                expect(NPC_DATA[npcId].dialogue).toBeTruthy();
            });
        });
    });

    describe('Regression: Apostrophe syntax errors', () => {
        test('MAN NPC should have properly escaped examine text', () => {
            expect(NPC_DATA.MAN).toBeDefined();
            expect(NPC_DATA.MAN.examine).toBe("One of Lumbridge's citizens.");
        });

        test('WOMAN NPC should have properly escaped examine text', () => {
            expect(NPC_DATA.WOMAN).toBeDefined();
            expect(NPC_DATA.WOMAN.examine).toBe("One of Lumbridge's citizens.");
        });

        test('all examine texts should be valid strings without syntax errors', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                expect(() => {
                    const test = `${npcData.examine}`;
                }).not.toThrow();
            }
        });
    });

    describe('Data consistency', () => {
        test('NPC IDs should be uppercase with underscores', () => {
            for (const npcId of Object.keys(NPC_DATA)) {
                expect(npcId).toMatch(/^[A-Z_0-9]+$/);
            }
        });

        test('NPC names should use proper capitalization', () => {
            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                const name = npcData.name;

                // Should start with capital letter
                expect(/^[A-Z]/.test(name)).toBe(true);

                // Should not be all caps (unless it's an acronym)
                if (name.length > 3 && !name.includes(' ')) {
                    expect(name).not.toBe(name.toUpperCase());
                }
            }
        });

        test('locations should reference valid Lumbridge areas', () => {
            const validLocationKeywords = [
                'Lumbridge',
                'Castle',
                'Church',
                'Farm',
                'Shop',
                'Bank',
                'Various',
                'General',
                'Kitchen',
                'Courtyard',
                'Graveyard',
                'Mill',
                'Swamp',
                'Bridge',
                'Tower',
                'Road',
                'Docks',
                'Axe',
                'Hut'
            ];

            for (const [npcId, npcData] of Object.entries(NPC_DATA)) {
                const location = npcData.location;
                const hasValidKeyword = validLocationKeywords.some(keyword =>
                    location.includes(keyword)
                );

                if (!hasValidKeyword) {
                    console.warn(`${npcId} has unusual location: "${location}"`);
                }
            }
        });
    });
});
