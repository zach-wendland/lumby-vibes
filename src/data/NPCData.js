/**
 * Complete NPC Data for Lumbridge - OSRS
 */

export const NPC_DATA = {
    // ========== LUMBRIDGE CASTLE ==========
    DUKE_HORACIO: {
        name: 'Duke Horacio',
        title: 'Duke of Lumbridge',
        location: 'Lumbridge Castle, 1st floor',
        examine: 'The duke of Lumbridge.',
        questGiver: ['rune_mysteries', 'the_lost_tribe'],
        shop: false,
        dialogue: {
            greeting: [
                'Greetings. Welcome to my castle.',
                'I am Duke Horacio, the ruler of Lumbridge.',
                'How may I help you?'
            ],
            default: [
                'I hope you are enjoying your stay in Lumbridge.',
                'Feel free to explore the castle.',
                'If you need anything, please let me know.'
            ],
            quest_rune_mysteries_start: [
                'Ah, adventurer! I have a task for you.',
                "The head wizard at the Wizards' Tower has sent me a mysterious package.",
                'Could you deliver this air talisman to Archmage Sedridor?',
                'He resides in the basement of the tower, south of Draynor Village.'
            ],
            quest_lost_tribe_start: [
                "There's been a terrible disturbance!",
                'A huge hole has appeared in my castle cellar!',
                'I suspect goblins or worse. Will you investigate?'
            ],
            goodbye: [
                'Farewell, adventurer.',
                'Safe travels!'
            ]
        },
        roaming: false,
        wanderRadius: 5
    },

    HANS: {
        name: 'Hans',
        title: 'Castle Servant',
        location: 'Lumbridge Castle courtyard',
        examine: 'A very old servant of the castle.',
        questGiver: false,
        shop: false,
        dialogue: {
            greeting: [
                "Hello there! I'm Hans, I've served this castle for over 230 years!",
                'Well, not quite that long really, but it certainly feels like it!'
            ],
            playtime: [
                "You've been playing for: [TIME]",
                'Keep up the good work!'
            ],
            cape_shop: [
                "Ah, I see you're interested in veteran capes!",
                'These capes are for players who have been here a long time.',
                'Would you like to buy one?'
            ],
            default: [
                "It's a lovely day, isn't it?",
                'The castle has certainly seen better days.',
                "I've been working here since before you were born!"
            ]
        },
        roaming: true,
        wanderRadius: 30,
        wanderPattern: 'circular' // Walks in circles around castle
    },

    COOK: {
        name: 'Cook',
        title: 'Castle Cook',
        location: 'Lumbridge Castle kitchen',
        examine: "It's the castle's cook.",
        questGiver: ['cooks_assistant', 'recipe_for_disaster'],
        shop: false,
        dialogue: {
            greeting: [
                'Hello there, adventurer!',
                'Welcome to my kitchen!'
            ],
            quest_cooks_assistant_start: [
                'Oh dear, oh dear!',
                "It's the Duke's birthday today and I'm supposed to be making him a big birthday cake!",
                "Unfortunately, I've forgotten to buy the ingredients.",
                "I'll need:",
                '- A bucket of milk',
                '- An egg',
                '- A pot of flour',
                'Will you help me?'
            ],
            quest_cooks_assistant_progress: [
                'Have you found the ingredients yet?',
                'I need a bucket of milk, an egg, and a pot of flour!'
            ],
            quest_cooks_assistant_complete: [
                "Wonderful! You've brought everything I need!",
                'Now I can make the cake!',
                'Thank you so much for your help!'
            ],
            default: [
                "I hope you're enjoying Lumbridge!",
                'Feel free to help yourself to some bread.'
            ]
        },
        roaming: false,
        wanderRadius: 3
    },

    SIGMUND: {
        name: 'Sigmund',
        title: "Duke's Former Adviser",
        location: 'Lumbridge Castle, 1st floor',
        examine: 'A suspicious looking man.',
        questGiver: ['the_lost_tribe'],
        shop: false,
        dialogue: {
            greeting: [
                'What do you want?',
                "I'm busy with important matters."
            ],
            suspicious: [
                "I don't trust goblins.",
                "They're up to something, mark my words."
            ],
            default: [
                "Leave me alone, I'm thinking.",
                "The Duke doesn't understand the dangers we face."
            ]
        },
        roaming: false,
        wanderRadius: 2
    },

    // Guards
    CASTLE_GUARD: {
        name: 'Guard',
        title: 'Castle Guard',
        location: 'Lumbridge Castle (various positions)',
        examine: 'A guard of Lumbridge Castle.',
        count: 4, // Multiple instances
        dialogue: {
            greeting: [
                'Halt! State your business.',
                'Move along, citizen.'
            ],
            default: [
                'Stay out of trouble.',
                "We're here to protect the Duke.",
                'All quiet on my watch.'
            ]
        },
        roaming: true,
        wanderRadius: 8
    },

    // ========== CHURCH ==========
    FATHER_AERECK: {
        name: 'Father Aereck',
        title: 'Priest of Saradomin',
        location: 'Lumbridge Church',
        examine: 'A follower of Saradomin.',
        questGiver: ['the_restless_ghost'],
        shop: false,
        dialogue: {
            greeting: [
                'Welcome to the church of Saradomin.',
                'May Saradomin bless you.'
            ],
            quest_restless_ghost_start: [
                'Oh dear, I need your help!',
                "There's a ghost haunting our graveyard.",
                'The poor spirit cannot rest.',
                'Please, could you speak with Father Urhney?',
                'He lives in a small house in Lumbridge Swamp.',
                'He may know how to help the restless ghost.'
            ],
            prayer_info: [
                'Would you like to know about Prayer?',
                'You can bury bones to gain Prayer experience.',
                'Prayer can be recharged at any altar, like the one in this church.'
            ],
            default: [
                'Saradomin watches over us all.',
                'Feel free to pray at the altar.',
                'May your faith be strong.'
            ]
        },
        roaming: false,
        wanderRadius: 5
    },

    FATHER_URHNEY: {
        name: 'Father Urhney',
        title: 'Hermit Priest',
        location: 'Lumbridge Swamp (small house)',
        examine: 'A grumpy looking priest.',
        questGiver: false,
        questNPC: ['the_restless_ghost'],
        dialogue: {
            greeting: [
                'What do you want?',
                'I came here for some peace and quiet!'
            ],
            quest_ghost_help: [
                '*Sigh* Aereck sent you, did he?',
                'Fine, take this Amulet of Ghostspeak.',
                'It will allow you to speak with spirits.',
                'Now leave me alone!'
            ],
            default: [
                'Go away!',
                "I'm trying to meditate here!"
            ],
            goodbye: [
                'Finally! Some peace and quiet.'
            ]
        },
        roaming: false,
        wanderRadius: 0
    },

    // ========== SHOPS ==========
    BOB: {
        name: 'Bob',
        title: 'Axe Shop Owner',
        location: "Bob's Brilliant Axes",
        examine: 'Owner of the local axe shop.',
        shop: 'bobs_axes',
        dialogue: {
            greeting: [
                "Welcome to Bob's Brilliant Axes!",
                'I sell the finest axes in Lumbridge!'
            ],
            shop: [
                'What can I do for you?',
                "Looking for an axe? You've come to the right place!"
            ],
            repairs: [
                'I can repair your Barrows equipment, if you have any.',
                "It'll cost you though!"
            ],
            default: [
                'Sharp axes! Get your sharp axes here!',
                'Best axes in all of Gielinor!'
            ]
        },
        roaming: false,
        wanderRadius: 3
    },

    DONIE: {
        name: 'Donie',
        title: 'Shop Assistant',
        location: 'Lumbridge General Store',
        examine: 'She runs the general store.',
        shop: 'general_store',
        dialogue: {
            greeting: [
                'Welcome to the Lumbridge General Store!',
                'We buy and sell almost anything!'
            ],
            shop: [
                'What would you like to buy or sell?',
                'We have a wide variety of goods!'
            ],
            quest_suggestions: [
                'Looking for something to do?',
                'You could help the Cook in the castle,',
                'or speak with Father Aereck at the church.',
                'The Duke might have tasks for you too!'
            ],
            default: [
                'Come back anytime!',
                "We're always buying!"
            ]
        },
        roaming: false,
        wanderRadius: 3
    },

    // ========== FARMERS ==========
    FRED_THE_FARMER: {
        name: 'Fred the Farmer',
        title: 'Sheep Farmer',
        location: "Fred's Farm (north of Lumbridge)",
        examine: 'A farmer.',
        questGiver: ['sheep_shearer'],
        shop: false,
        dialogue: {
            greeting: [
                'Hello there!',
                'Welcome to my farm!'
            ],
            quest_sheep_shearer_start: [
                'I need help!',
                "My sheep need shearing, but I don't have time!",
                'Could you shear 20 sheep for me?',
                "I'll give you 60 coins and some balls of wool!"
            ],
            farming_tips: [
                'You can shear sheep with shears.',
                'Spin the wool on a spinning wheel to make balls of wool.',
                "It's good money for beginners!"
            ],
            default: [
                "These sheep won't shear themselves!",
                "It's honest work, farming."
            ]
        },
        roaming: true,
        wanderRadius: 10
    },

    // ========== GUIDES & TUTORS ==========
    LUMBRIDGE_GUIDE: {
        name: 'Lumbridge Guide',
        title: 'Helpful Guide',
        location: 'Various locations in Lumbridge',
        examine: 'A guide to help new players.',
        dialogue: {
            greeting: [
                "Hello! I'm the Lumbridge Guide.",
                "I'm here to help new adventurers find their way!"
            ],
            directions: [
                'What would you like to know?',
                '- Where is the bank?',
                '- Where can I train combat?',
                '- Where are the shops?',
                '- Tell me about quests'
            ],
            bank_location: [
                'The nearest bank is on the top floor of Lumbridge Castle.',
                'Just go up the stairs twice!'
            ],
            combat_training: [
                'For combat training, I recommend:',
                '- Chickens (level 1) - North-east of here',
                '- Cows (level 2) - North of the windmill',
                '- Goblins (level 2-5) - East of the river'
            ],
            shops: [
                "Bob's Axes is in the south part of town.",
                'The General Store is to the north.',
                'Both buy and sell items!'
            ],
            quests: [
                'There are several quests you can do here:',
                "- Cook's Assistant (in the castle kitchen)",
                '- The Restless Ghost (speak to Father Aereck)',
                '- Rune Mysteries (speak to Duke Horacio)',
                '- Sheep Shearer (speak to Fred the Farmer)'
            ]
        },
        roaming: true,
        wanderRadius: 20
    },

    MAGIC_INSTRUCTOR: {
        name: 'Magic Instructor',
        title: 'Magic Tutor',
        location: 'Lumbridge Castle, 2nd floor',
        examine: 'An instructor of the mystic arts.',
        dialogue: {
            greeting: [
                'Greetings, young mage!',
                'Welcome to the world of Magic!'
            ],
            magic_info: [
                'Magic is a powerful skill.',
                'You can cast spells using runes.',
                'To train Magic, try casting Wind Strike on enemies!',
                "You'll need Mind runes and Air runes."
            ],
            default: [
                'Study hard and practice often!',
                'Magic is all about understanding the elements.'
            ]
        },
        roaming: false,
        wanderRadius: 5
    },

    COMBAT_INSTRUCTOR: {
        name: 'Combat Instructor',
        title: 'Melee Tutor',
        location: 'Lumbridge Castle courtyard',
        examine: 'A master of melee combat.',
        dialogue: {
            greeting: [
                'Ready for battle?',
                'I can teach you about combat!'
            ],
            combat_info: [
                'There are three main combat styles:',
                '- Accurate (for Attack XP)',
                '- Aggressive (for Strength XP)',
                '- Defensive (for Defence XP)',
                'Choose your style wisely!'
            ],
            default: [
                'Practice makes perfect!',
                'Go fight some chickens or goblins to train!'
            ]
        },
        roaming: false,
        wanderRadius: 8
    },

    // ========== MISC NPCs ==========
    VEOS: {
        name: 'Veos',
        title: 'Ship Captain',
        location: 'Lumbridge Swamp (boat)',
        examine: 'A ship captain.',
        questGiver: ['x_marks_the_spot'],
        dialogue: {
            greeting: [
                'Ahoy there, adventurer!',
                'Looking to set sail?'
            ],
            quest_x_marks_start: [
                "I've got a treasure map!",
                "But I'm too busy with the ship.",
                'Could you follow the clues and find the treasure?',
                'X marks the spot!'
            ],
            travel: [
                'I can take you to:',
                '- Port Sarim',
                '- Fossil Island (if unlocked)',
                'Where would you like to go?'
            ]
        },
        roaming: false,
        wanderRadius: 2
    },

    PHILLIPE: {
        name: 'Phillipe',
        title: 'Carnillean servant',
        location: 'South of Lumbridge',
        examine: 'A well-dressed servant.',
        dialogue: {
            greeting: [
                'Good day to you!',
                "I'm on an errand for the Carnilleans."
            ],
            default: [
                "Lovely weather we're having!",
                'The Carnilleans are a noble family.'
            ]
        },
        roaming: true,
        wanderRadius: 15
    },

    MILLIE_MILLER: {
        name: 'Millie Miller',
        title: 'Miller',
        location: 'Mill Lane Mill',
        examine: 'She works at the mill.',
        dialogue: {
            greeting: [
                'Hello! Welcome to the mill!',
                'We grind wheat into flour here.'
            ],
            how_to_mill: [
                'To make flour:',
                '1. Pick wheat from the field',
                '2. Go to the top floor and put wheat in the hopper',
                '3. Pull the lever',
                '4. Go downstairs and use an empty pot on the flour bin!'
            ],
            default: [
                'Flour is used for baking!',
                'Feel free to use the mill anytime!'
            ]
        },
        roaming: false,
        wanderRadius: 5
    },

    // Wandering NPCs
    MAN: {
        name: 'Man',
        title: 'Citizen',
        location: 'Various',
        examine: 'One of Lumbridge\'s citizens.',
        count: 5,
        dialogue: {
            greeting: [
                'Hello there!',
                "Nice day, isn't it?",
                'Good to see you!'
            ],
            default: [
                'I love living in Lumbridge!',
                'Have you visited the castle?',
                'The Duke is a fair ruler.'
            ]
        },
        roaming: true,
        wanderRadius: 25
    },

    WOMAN: {
        name: 'Woman',
        title: 'Citizen',
        location: 'Various',
        examine: 'One of Lumbridge\'s citizens.',
        count: 5,
        dialogue: {
            greeting: [
                'Hello!',
                'Lovely weather!',
                'Good day to you!'
            ],
            default: [
                'Lumbridge is such a peaceful town.',
                "I hope you're enjoying your stay!",
                'The market has fresh produce today!'
            ]
        },
        roaming: true,
        wanderRadius: 25
    }
};

// Export helper function to get NPC by name
export function getNPCData(name) {
    for (const [key, npc] of Object.entries(NPC_DATA)) {
        if (npc.name === name) {
            return npc;
        }
    }
    return null;
}

export default NPC_DATA;
