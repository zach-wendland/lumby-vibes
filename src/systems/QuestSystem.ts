/**
 * Complete Quest System for OSRS Lumbridge
 * TypeScript version with full type safety
 */

import type { Player } from '../entities/Player';
import type { SkillName } from '../types/index';

/**
 * Quest status constants
 */
export const QUEST_STATUS = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
} as const;

export type QuestStatus = typeof QUEST_STATUS[keyof typeof QUEST_STATUS];

/**
 * Quest stage definition
 */
interface QuestStage {
    id: number;
    description: string;
    objectives: string[];
}

/**
 * Quest requirements
 */
interface QuestRequirements {
    skills?: Partial<Record<SkillName, number>>;
    quests?: string[];
}

/**
 * Quest rewards
 */
interface QuestRewards {
    questPoints: number;
    items?: string[];
    unlocks?: string[];
    coins?: number;
    antique_lamp?: number;
    [skillName: string]: unknown;
}

/**
 * Quest definition
 */
interface QuestDefinition {
    id: string;
    name: string;
    difficulty: 'Novice' | 'Intermediate' | 'Experienced' | 'Master' | 'Grandmaster';
    length: 'Very Short' | 'Short' | 'Medium' | 'Long' | 'Very Long';
    requirements: QuestRequirements;
    rewards: QuestRewards;
    description: string;
    stages: QuestStage[];
    startNPC: string;
    startLocation: string;
}

/**
 * Quest state (runtime data)
 */
interface QuestState extends QuestDefinition {
    status: QuestStatus;
    currentStage: number;
    completedObjectives: Set<string>;
}

/**
 * Can start quest result
 */
interface CanStartResult {
    can: boolean;
    reason?: string;
}

/**
 * Quest interaction result
 */
interface QuestInteractionResult {
    message: string;
    updateUI: boolean;
}

/**
 * Quest option for NPC menu
 */
interface QuestOption {
    label: string;
    questId: string;
    action: 'start' | 'continue';
}

/**
 * Quest progress information
 */
interface QuestProgress {
    name: string;
    status: QuestStatus;
    currentStage: number;
    totalStages: number;
    objectives: string[];
    completedObjectives: string[];
}

/**
 * All quest definitions
 */
export const QUESTS: Record<string, QuestDefinition> = {
    COOKS_ASSISTANT: {
        id: 'cooks_assistant',
        name: "Cook's Assistant",
        difficulty: 'Novice',
        length: 'Short',
        requirements: {},
        rewards: {
            questPoints: 1,
            cooking: 300,
            items: []
        },
        description: "Help the Lumbridge cook make a birthday cake for Duke Horacio.",
        stages: [
            {
                id: 0,
                description: "Talk to the Cook in Lumbridge Castle kitchen",
                objectives: ["Speak with the Cook"]
            },
            {
                id: 1,
                description: "Gather ingredients for the cake",
                objectives: [
                    "Get a bucket of milk",
                    "Get an egg",
                    "Get a pot of flour"
                ]
            },
            {
                id: 2,
                description: "Return to the Cook with all ingredients",
                objectives: ["Give ingredients to the Cook"]
            }
        ],
        startNPC: 'Cook',
        startLocation: 'Lumbridge Castle Kitchen'
    },

    RUNE_MYSTERIES: {
        id: 'rune_mysteries',
        name: "Rune Mysteries",
        difficulty: 'Novice',
        length: 'Short',
        requirements: {},
        rewards: {
            questPoints: 1,
            runecraft: 250,
            items: ['Air talisman'],
            unlocks: ['Runecrafting skill']
        },
        description: "Unlock the secrets of runecrafting by helping the Duke and Wizards.",
        stages: [
            {
                id: 0,
                description: "Talk to Duke Horacio in Lumbridge Castle",
                objectives: ["Speak with Duke Horacio on 1st floor"]
            },
            {
                id: 1,
                description: "Deliver the air talisman to Archmage Sedridor",
                objectives: ["Go to Wizards' Tower", "Give talisman to Sedridor"]
            },
            {
                id: 2,
                description: "Take research package to Aubury in Varrock",
                objectives: ["Travel to Varrock", "Deliver package to Aubury"]
            },
            {
                id: 3,
                description: "Return to Archmage Sedridor",
                objectives: ["Return to Wizards' Tower", "Complete quest with Sedridor"]
            }
        ],
        startNPC: 'Duke Horacio',
        startLocation: 'Lumbridge Castle 1st Floor'
    },

    THE_RESTLESS_GHOST: {
        id: 'the_restless_ghost',
        name: "The Restless Ghost",
        difficulty: 'Novice',
        length: 'Short',
        requirements: {},
        rewards: {
            questPoints: 1,
            prayer: 1125,
            items: []
        },
        description: "Help Father Aereck remove the ghost from Lumbridge graveyard.",
        stages: [
            {
                id: 0,
                description: "Talk to Father Aereck in the church",
                objectives: ["Speak with Father Aereck"]
            },
            {
                id: 1,
                description: "Get help from Father Urhney",
                objectives: ["Go to Lumbridge Swamp", "Talk to Father Urhney", "Receive Amulet of Ghostspeak"]
            },
            {
                id: 2,
                description: "Talk to the ghost in the graveyard",
                objectives: ["Equip Amulet of Ghostspeak", "Open coffin", "Talk to Restless Ghost"]
            },
            {
                id: 3,
                description: "Retrieve the ghost's skull",
                objectives: ["Go to swamp mine", "Search altar to find skull", "Kill Skeleton (optional)"]
            },
            {
                id: 4,
                description: "Return the skull to the coffin",
                objectives: ["Put skull in coffin", "Complete quest"]
            }
        ],
        startNPC: 'Father Aereck',
        startLocation: 'Lumbridge Church'
    },

    SHEEP_SHEARER: {
        id: 'sheep_shearer',
        name: "Sheep Shearer",
        difficulty: 'Novice',
        length: 'Short',
        requirements: {},
        rewards: {
            questPoints: 1,
            crafting: 150,
            coins: 60,
            items: ['Ball of wool (20)']
        },
        description: "Help Fred the Farmer by gathering wool from his sheep.",
        stages: [
            {
                id: 0,
                description: "Talk to Fred the Farmer",
                objectives: ["Speak with Fred the Farmer"]
            },
            {
                id: 1,
                description: "Shear 20 sheep and collect wool",
                objectives: ["Gather 20 balls of wool"]
            },
            {
                id: 2,
                description: "Return to Fred the Farmer",
                objectives: ["Give wool to Fred"]
            }
        ],
        startNPC: 'Fred the Farmer',
        startLocation: "Fred's Farm (north of Lumbridge)"
    },

    THE_LOST_TRIBE: {
        id: 'the_lost_tribe',
        name: "The Lost Tribe",
        difficulty: 'Intermediate',
        length: 'Medium',
        requirements: {
            skills: { mining: 17 },
            quests: ['rune_mysteries']
        },
        rewards: {
            questPoints: 1,
            mining: 3000,
            items: ['Peace treaty', 'Mining helmet']
        },
        description: "Discover the lost goblin tribe beneath Lumbridge.",
        stages: [
            {
                id: 0,
                description: "Investigate the cellar",
                objectives: ["Talk to Duke Horacio about hole in cellar"]
            },
            {
                id: 1,
                description: "Explore the underground tunnel",
                objectives: ["Investigate the cellar hole", "Explore Lumbridge caves"]
            },
            {
                id: 2,
                description: "Find the Dorgeshuun tribe",
                objectives: ["Navigate caves", "Meet Mistag", "Discover Dorgesh-Kaan"]
            },
            {
                id: 3,
                description: "Negotiate peace treaty",
                objectives: ["Talk to council", "Return to Duke Horacio", "Complete treaty"]
            }
        ],
        startNPC: 'Sigmund',
        startLocation: 'Lumbridge Castle'
    },

    X_MARKS_THE_SPOT: {
        id: 'x_marks_the_spot',
        name: "X Marks the Spot",
        difficulty: 'Novice',
        length: 'Very Short',
        requirements: {},
        rewards: {
            questPoints: 1,
            antique_lamp: 300,
            items: []
        },
        description: "Help the Lumbridge instructors get started on your adventure.",
        stages: [
            {
                id: 0,
                description: "Talk to Veos at the Lumbridge docks",
                objectives: ["Speak with Veos"]
            },
            {
                id: 1,
                description: "Follow the treasure map clues",
                objectives: ["Dig at marked locations", "Find treasure"]
            },
            {
                id: 2,
                description: "Return to Veos",
                objectives: ["Complete quest with Veos"]
            }
        ],
        startNPC: 'Veos',
        startLocation: 'Lumbridge Docks'
    }
};

/**
 * Extended Player interface for quest system
 */
interface QuestPlayer extends Player {
    questPoints?: number;
}

/**
 * QuestSystem class - Manages all quests
 */
export class QuestSystem {
    private player: QuestPlayer;
    private activeQuests: Map<string, QuestState>;
    private completedQuests: Set<string>;
    private questData: Map<string, QuestState>;

    constructor(player: Player) {
        this.player = player as QuestPlayer;
        this.activeQuests = new Map();
        this.completedQuests = new Set();
        this.questData = new Map();

        this.initializeQuests();
    }

    /**
     * Initialize all quests with default state
     */
    private initializeQuests(): void {
        for (const [key, quest] of Object.entries(QUESTS)) {
            this.questData.set(quest.id, {
                ...quest,
                status: QUEST_STATUS.NOT_STARTED,
                currentStage: 0,
                completedObjectives: new Set()
            });
        }
    }

    /**
     * Check if player can start a quest
     */
    canStartQuest(questId: string): CanStartResult {
        const quest = this.questData.get(questId);
        if (!quest) return { can: false, reason: 'Quest not found' };

        if (quest.status !== QUEST_STATUS.NOT_STARTED) {
            return { can: false, reason: 'Quest already started or completed' };
        }

        // Check skill requirements
        if (quest.requirements.skills) {
            for (const [skill, level] of Object.entries(quest.requirements.skills)) {
                const skillData = this.player.skills[skill as SkillName];
                if (skillData && skillData.level < (level as number)) {
                    return { can: false, reason: `Requires ${skill} level ${level}` };
                }
            }
        }

        // Check quest requirements
        if (quest.requirements.quests) {
            for (const reqQuest of quest.requirements.quests) {
                if (!this.completedQuests.has(reqQuest)) {
                    const questKey = reqQuest.toUpperCase();
                    const questName = QUESTS[questKey]?.name || questKey;
                    return { can: false, reason: `Requires completion of ${questName}` };
                }
            }
        }

        return { can: true };
    }

    /**
     * Start a quest
     */
    startQuest(questId: string): { success: boolean; message: string } {
        const canStart = this.canStartQuest(questId);
        if (!canStart.can) {
            return { success: false, message: canStart.reason || 'Cannot start quest' };
        }

        const quest = this.questData.get(questId);
        if (!quest) {
            return { success: false, message: 'Quest not found' };
        }

        quest.status = QUEST_STATUS.IN_PROGRESS;
        quest.currentStage = 0;
        this.activeQuests.set(questId, quest);

        return { success: true, message: `Started quest: ${quest.name}` };
    }

    /**
     * Complete an objective for a quest
     */
    completeObjective(questId: string, objective: string): boolean {
        const quest = this.questData.get(questId);
        if (!quest || quest.status !== QUEST_STATUS.IN_PROGRESS) return false;

        quest.completedObjectives.add(objective);

        // Check if all objectives for current stage are complete
        const currentStage = quest.stages[quest.currentStage];
        const allComplete = currentStage.objectives.every(obj =>
            quest.completedObjectives.has(obj)
        );

        if (allComplete) {
            quest.currentStage++;

            // Check if quest is complete
            if (quest.currentStage >= quest.stages.length) {
                this.completeQuest(questId);
            }
        }

        return true;
    }

    /**
     * Complete a quest
     */
    completeQuest(questId: string): { success: boolean; message: string; rewards?: QuestRewards } | undefined {
        const quest = this.questData.get(questId);
        if (!quest) return;

        quest.status = QUEST_STATUS.COMPLETED;
        this.activeQuests.delete(questId);
        this.completedQuests.add(questId);

        // Award rewards
        this.awardQuestRewards(quest);

        return {
            success: true,
            message: `Congratulations! You have completed ${quest.name}!`,
            rewards: quest.rewards
        };
    }

    /**
     * Award quest rewards to player
     */
    private awardQuestRewards(quest: QuestState): void {
        // Award quest points
        if (quest.rewards.questPoints) {
            this.player.questPoints = (this.player.questPoints || 0) + quest.rewards.questPoints;
        }

        // Award XP for skills
        for (const [skill, xp] of Object.entries(quest.rewards)) {
            const skillData = this.player.skills[skill as SkillName];
            if (skillData && typeof xp === 'number') {
                this.player.addXP(skill as SkillName, xp);
            }
        }

        // Note: Quest reward items not yet implemented
    }

    /**
     * Get quest progress
     */
    getQuestProgress(questId: string): QuestProgress | null {
        const quest = this.questData.get(questId);
        if (!quest) return null;

        return {
            name: quest.name,
            status: quest.status,
            currentStage: quest.currentStage,
            totalStages: quest.stages.length,
            objectives: quest.stages[quest.currentStage]?.objectives || [],
            completedObjectives: Array.from(quest.completedObjectives)
        };
    }

    /**
     * Get all active quests
     */
    getActiveQuests(): QuestState[] {
        return Array.from(this.activeQuests.values());
    }

    /**
     * Get all completed quests
     */
    getCompletedQuests(): (QuestState | undefined)[] {
        return Array.from(this.completedQuests).map(id => this.questData.get(id));
    }

    /**
     * Get total quest points
     */
    getTotalQuestPoints(): number {
        return this.player.questPoints || 0;
    }

    /**
     * Get dialogue from NPC based on quest status
     */
    getNPCDialogue(npcId: string, player: Player): string | null {
        for (const [questId, quest] of this.questData.entries()) {
            if (quest.startNPC === npcId || quest.startNPC.toLowerCase() === npcId.toLowerCase()) {
                if (quest.status === QUEST_STATUS.NOT_STARTED) {
                    return `Would you like to help me? (Start ${quest.name})`;
                } else if (quest.status === QUEST_STATUS.IN_PROGRESS) {
                    const stage = quest.stages[quest.currentStage];
                    return stage ? stage.description : 'How is the quest going?';
                } else if (quest.status === QUEST_STATUS.COMPLETED) {
                    return 'Thank you for your help!';
                }
            }
        }
        return null;
    }

    /**
     * Get quest-related options for NPC context menu
     */
    getQuestOptions(npcId: string, player: Player): QuestOption[] {
        const options: QuestOption[] = [];

        for (const [questId, quest] of this.questData.entries()) {
            if (quest.startNPC === npcId || quest.startNPC.toLowerCase() === npcId.toLowerCase()) {
                if (quest.status === QUEST_STATUS.NOT_STARTED) {
                    const canStart = this.canStartQuest(questId);
                    if (canStart.can) {
                        options.push({
                            label: `Start ${quest.name}`,
                            questId: quest.id,
                            action: 'start'
                        });
                    }
                } else if (quest.status === QUEST_STATUS.IN_PROGRESS) {
                    options.push({
                        label: `Continue ${quest.name}`,
                        questId: quest.id,
                        action: 'continue'
                    });
                }
            }
        }

        return options;
    }

    /**
     * Handle quest interaction (start, continue, complete)
     */
    handleQuestInteraction(questId: string, action: string, player: Player): QuestInteractionResult {
        if (action === 'start') {
            const result = this.startQuest(questId);
            return {
                message: result.message || 'Quest started!',
                updateUI: result.success
            };
        } else if (action === 'continue') {
            const quest = this.questData.get(questId);
            if (quest && quest.status === QUEST_STATUS.IN_PROGRESS) {
                const stage = quest.stages[quest.currentStage];
                return {
                    message: stage ? stage.description : 'Continue your quest.',
                    updateUI: false
                };
            }
        }

        return {
            message: 'Quest interaction not available.',
            updateUI: false
        };
    }

    /**
     * Get quest by ID
     */
    getQuest(questId: string): QuestState | undefined {
        return this.questData.get(questId);
    }

    /**
     * Check if a quest is completed
     */
    isQuestCompleted(questId: string): boolean {
        return this.completedQuests.has(questId);
    }

    /**
     * Get quest status
     */
    getQuestStatus(questId: string): QuestStatus | undefined {
        return this.questData.get(questId)?.status;
    }
}

export default QuestSystem;
