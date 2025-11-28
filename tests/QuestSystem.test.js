/**
 * QuestSystem tests
 */

import { QuestSystem, QUESTS, QUEST_STATUS } from '../src/systems/QuestSystem.ts';

describe('QuestSystem', () => {
    let mockPlayer;
    let questSystem;

    beforeEach(() => {
        mockPlayer = {
            skills: {
                attack: { level: 1, xp: 0 },
                strength: { level: 1, xp: 0 },
                defence: { level: 1, xp: 0 },
                hitpoints: { level: 10, xp: 1154 },
                agility: { level: 1, xp: 0 },
                thieving: { level: 1, xp: 0 },
                mining: { level: 1, xp: 0 },
                cooking: { level: 1, xp: 0 },
                runecraft: { level: 1, xp: 0 },
                prayer: { level: 1, xp: 0 }
            },
            questPoints: 0,
            addXP: jest.fn((skill, xp) => false)
        };

        questSystem = new QuestSystem(mockPlayer);
    });

    describe('initialization', () => {
        test('should initialize with all quests', () => {
            expect(questSystem.questData.size).toBeGreaterThan(0);
            expect(questSystem.questData.has('cooks_assistant')).toBe(true);
            expect(questSystem.questData.has('rune_mysteries')).toBe(true);
        });

        test('should initialize all quests as not started', () => {
            for (const [questId, quest] of questSystem.questData.entries()) {
                expect(quest.status).toBe(QUEST_STATUS.NOT_STARTED);
                expect(quest.currentStage).toBe(0);
            }
        });
    });

    describe('canStartQuest', () => {
        test('should allow starting quest with no requirements', () => {
            const result = questSystem.canStartQuest('cooks_assistant');
            expect(result.can).toBe(true);
        });

        test('should prevent starting quest without skill requirements', () => {
            const result = questSystem.canStartQuest('the_lost_tribe');
            expect(result.can).toBe(false);
            expect(result.reason).toContain('Requires');
        });

        test('should prevent starting already started quest', () => {
            questSystem.startQuest('cooks_assistant');
            const result = questSystem.canStartQuest('cooks_assistant');
            expect(result.can).toBe(false);
        });

        test('should allow starting quest when requirements are met', () => {
            mockPlayer.skills.agility.level = 13;
            mockPlayer.skills.thieving.level = 13;
            mockPlayer.skills.mining.level = 17;
            questSystem.completedQuests.add('rune_mysteries');
            questSystem.completedQuests.add('goblin_diplomacy');

            const result = questSystem.canStartQuest('the_lost_tribe');
            expect(result.can).toBe(true);
        });
    });

    describe('startQuest', () => {
        test('should successfully start a quest', () => {
            const result = questSystem.startQuest('cooks_assistant');
            expect(result.success).toBe(true);

            const quest = questSystem.questData.get('cooks_assistant');
            expect(quest.status).toBe(QUEST_STATUS.IN_PROGRESS);
        });

        test('should add quest to active quests', () => {
            questSystem.startQuest('cooks_assistant');
            expect(questSystem.activeQuests.has('cooks_assistant')).toBe(true);
        });

        test('should not start quest without requirements', () => {
            const result = questSystem.startQuest('the_lost_tribe');
            expect(result.success).toBe(false);
        });
    });

    describe('completeQuest', () => {
        test('should complete a quest and award rewards', () => {
            questSystem.startQuest('cooks_assistant');
            questSystem.completeQuest('cooks_assistant');

            const quest = questSystem.questData.get('cooks_assistant');
            expect(quest.status).toBe(QUEST_STATUS.COMPLETED);
            expect(questSystem.completedQuests.has('cooks_assistant')).toBe(true);
            expect(questSystem.activeQuests.has('cooks_assistant')).toBe(false);
        });

        test('should award XP rewards', () => {
            questSystem.startQuest('cooks_assistant');
            questSystem.completeQuest('cooks_assistant');

            expect(mockPlayer.addXP).toHaveBeenCalledWith('cooking', 300);
        });

        test('should award quest points', () => {
            questSystem.startQuest('cooks_assistant');
            questSystem.completeQuest('cooks_assistant');

            expect(mockPlayer.questPoints).toBe(1);
        });
    });

    describe('getNPCDialogue', () => {
        test('should return quest start dialogue for quest giver', () => {
            const dialogue = questSystem.getNPCDialogue('Cook', mockPlayer);
            expect(dialogue).toContain("Cook's Assistant");
        });

        test('should return in progress dialogue', () => {
            questSystem.startQuest('cooks_assistant');
            const dialogue = questSystem.getNPCDialogue('Cook', mockPlayer);
            expect(dialogue).toBeTruthy();
        });

        test('should return completed dialogue', () => {
            questSystem.startQuest('cooks_assistant');
            questSystem.completeQuest('cooks_assistant');
            const dialogue = questSystem.getNPCDialogue('Cook', mockPlayer);
            expect(dialogue).toContain('Thank you');
        });

        test('should return null for non-quest NPCs', () => {
            const dialogue = questSystem.getNPCDialogue('RandomNPC', mockPlayer);
            expect(dialogue).toBeNull();
        });
    });

    describe('getQuestOptions', () => {
        test('should return start quest option', () => {
            const options = questSystem.getQuestOptions('Cook', mockPlayer);
            expect(options.length).toBeGreaterThan(0);
            expect(options[0].label).toContain('Start');
            expect(options[0].action).toBe('start');
        });

        test('should return continue quest option for in-progress quest', () => {
            questSystem.startQuest('cooks_assistant');
            const options = questSystem.getQuestOptions('Cook', mockPlayer);
            expect(options[0].label).toContain('Continue');
            expect(options[0].action).toBe('continue');
        });

        test('should return empty array for non-quest NPCs', () => {
            const options = questSystem.getQuestOptions('RandomNPC', mockPlayer);
            expect(options.length).toBe(0);
        });
    });

    describe('handleQuestInteraction', () => {
        test('should start quest on start action', () => {
            const result = questSystem.handleQuestInteraction('cooks_assistant', 'start', mockPlayer);
            expect(result.message).toBeTruthy();
            expect(result.updateUI).toBe(true);

            const quest = questSystem.questData.get('cooks_assistant');
            expect(quest.status).toBe(QUEST_STATUS.IN_PROGRESS);
        });

        test('should return quest info on continue action', () => {
            questSystem.startQuest('cooks_assistant');
            const result = questSystem.handleQuestInteraction('cooks_assistant', 'continue', mockPlayer);
            expect(result.message).toBeTruthy();
        });

        test('should fail to start quest without requirements', () => {
            const result = questSystem.handleQuestInteraction('the_lost_tribe', 'start', mockPlayer);
            expect(result.message).toBeTruthy();
            expect(result.updateUI).toBe(false);
        });
    });

    describe('getActiveQuests', () => {
        test('should return list of active quests', () => {
            questSystem.startQuest('cooks_assistant');
            questSystem.startQuest('sheep_shearer');

            const activeQuests = questSystem.getActiveQuests();
            expect(activeQuests.length).toBe(2);
        });
    });

    describe('getCompletedQuests', () => {
        test('should return list of completed quests', () => {
            questSystem.startQuest('cooks_assistant');
            questSystem.completeQuest('cooks_assistant');

            const completedQuests = questSystem.getCompletedQuests();
            expect(completedQuests.length).toBe(1);
            expect(completedQuests[0].id).toBe('cooks_assistant');
        });
    });

    describe('getTotalQuestPoints', () => {
        test('should return total quest points', () => {
            mockPlayer.questPoints = 5;
            expect(questSystem.getTotalQuestPoints()).toBe(5);
        });

        test('should return 0 when player has no quest points', () => {
            expect(questSystem.getTotalQuestPoints()).toBe(0);
        });
    });
});
