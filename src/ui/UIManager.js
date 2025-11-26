/**
 * UIManager - Handle all UI updates and interactions
 */

export class UIManager {
    constructor(gameLogic) {
        this.gameLogic = gameLogic;
        this.player = gameLogic.player;

        this.currentTab = 'stats';
        this.setupEventListeners();
        this.setupInventoryGrid();
    }

    /**
     * Setup UI event listeners
     */
    setupEventListeners() {
        // Tab navigation
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Chat input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleChatInput(chatInput.value);
                    chatInput.value = '';
                }
            });
        }
    }

    /**
     * Setup inventory grid
     */
    setupInventoryGrid() {
        const inventoryGrid = document.getElementById('inventory-grid');
        if (!inventoryGrid) return;

        // Create 28 slots
        for (let i = 0; i < 28; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.slot = i;

            slot.addEventListener('click', () => {
                this.handleInventoryClick(i);
            });

            slot.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.handleInventoryRightClick(i, e);
            });

            inventoryGrid.appendChild(slot);
        }
    }

    /**
     * Switch active tab
     */
    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        const activePanel = document.getElementById(`${tabName}-tab`);
        if (activePanel) {
            activePanel.classList.add('active');
        }
    }

    /**
     * Update player stats display
     */
    updateStats() {
        // HP bar
        const hpBar = document.getElementById('hp-bar');
        const hpText = document.getElementById('hp-text');
        if (hpBar && hpText) {
            const hpPercent = (this.player.currentHP / this.player.skills.hitpoints.level) * 100;
            hpBar.style.width = `${hpPercent  }%`;
            hpText.textContent = `${this.player.currentHP}/${this.player.skills.hitpoints.level}`;
        }

        // Prayer bar
        const prayerBar = document.getElementById('prayer-bar');
        const prayerText = document.getElementById('prayer-text');
        if (prayerBar && prayerText) {
            const prayerPercent = (this.player.currentPrayer / this.player.skills.prayer.level) * 100;
            prayerBar.style.width = `${prayerPercent  }%`;
            prayerText.textContent = `${this.player.currentPrayer}/${this.player.skills.prayer.level}`;
        }

        // Combat level
        const combatLvlText = document.getElementById('combat-lvl-text');
        if (combatLvlText) {
            combatLvlText.textContent = this.player.getCombatLevel();
        }

        // Update skill list
        this.updateSkillsList();
    }

    /**
     * Update skills list
     */
    updateSkillsList() {
        for (const [skillName, skillData] of Object.entries(this.player.skills)) {
            const skillItem = document.querySelector(`.skill-item[data-skill="${skillName}"]`);
            if (skillItem) {
                const levelSpan = skillItem.querySelector('.skill-level');
                const xpSpan = skillItem.querySelector('.skill-xp');

                if (levelSpan) levelSpan.textContent = skillData.level;
                if (xpSpan) xpSpan.textContent = `${skillData.xp} XP`;
            }
        }
    }

    /**
     * Update inventory display
     */
    updateInventory() {
        const slots = document.querySelectorAll('.inventory-slot');

        for (let i = 0; i < this.player.inventory.length; i++) {
            const slot = slots[i];
            if (!slot) continue;

            const item = this.player.inventory[i];

            if (item) {
                slot.classList.add('has-item');
                slot.innerHTML = `
                    <div class="item-name">${item.name}</div>
                    ${item.stackable ? `<div class="item-count">${item.count}</div>` : ''}
                `;
            } else {
                slot.classList.remove('has-item');
                slot.innerHTML = '';
            }
        }

        // Update count
        const countSpan = document.getElementById('inventory-count');
        if (countSpan) {
            countSpan.textContent = this.player.getInventoryCount();
        }
    }

    /**
     * Handle inventory click
     */
    handleInventoryClick(slot) {
        const item = this.player.inventory[slot];
        if (item) {
            this.addMessage(`${item.name} (x${item.count || 1})`, 'game');
        }
    }

    /**
     * Handle inventory right-click
     */
    handleInventoryRightClick(slot, event) {
        const item = this.player.inventory[slot];
        if (!item) return;

        // Create context menu
        const menu = this.createContextMenu([
            { label: 'Use', action: () => this.useItem(slot) },
            { label: 'Drop', action: () => this.dropItem(slot) },
            { label: 'Examine', action: () => this.examineItem(slot) }
        ]);

        menu.style.left = `${event.clientX  }px`;
        menu.style.top = `${event.clientY  }px`;
        document.body.appendChild(menu);

        // Remove menu on click outside
        setTimeout(() => {
            const removeMenu = () => {
                menu.remove();
                document.removeEventListener('click', removeMenu);
            };
            document.addEventListener('click', removeMenu);
        }, 10);
    }

    /**
     * Create context menu
     */
    createContextMenu(options) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';

        for (const option of options) {
            const item = document.createElement('div');
            item.className = 'context-menu-item';
            item.textContent = option.label;
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                option.action();
                menu.remove();
            });
            menu.appendChild(item);
        }

        return menu;
    }

    /**
     * Use item from inventory
     */
    useItem(slot) {
        const item = this.player.inventory[slot];
        if (!item) return;

        this.addMessage(`You attempt to use ${item.name}...`, 'game');
        // TODO: Implement item usage (eating food, etc.)
    }

    /**
     * Drop item from inventory
     */
    dropItem(slot) {
        const item = this.player.removeItem(slot);
        if (item) {
            this.addMessage(`You drop ${item.name}.`, 'game');
            this.updateInventory();
            // TODO: Create ground item
        }
    }

    /**
     * Examine item
     */
    examineItem(slot) {
        const item = this.player.inventory[slot];
        if (!item) return;

        this.addMessage(`${item.name}`, 'game');
    }

    /**
     * Add message to chat
     */
    addMessage(message, type = 'game') {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${type}`;
        msgDiv.textContent = message;

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Keep only last 50 messages
        while (chatMessages.children.length > 50) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
    }

    /**
     * Handle chat input
     */
    handleChatInput(text) {
        if (!text.trim()) return;

        this.addMessage(`You: ${text}`, 'system');

        // Check for commands
        if (text.startsWith('/')) {
            this.handleCommand(text.substring(1));
        }
    }

    /**
     * Handle commands
     */
    handleCommand(cmd) {
        const parts = cmd.split(' ');
        const command = parts[0].toLowerCase();

        switch (command) {
            case 'help':
                this.addMessage('Available commands: /help, /stats, /pos', 'system');
                break;
            case 'stats': {
                const combat = this.player.getCombatLevel();
                this.addMessage(`Combat level: ${combat}`, 'system');
                break;
            }
            case 'pos': {
                const pos = this.player.position;
                this.addMessage(`Position: (${pos.x.toFixed(1)}, ${pos.z.toFixed(1)})`, 'system');
                break;
            }
            default:
                this.addMessage('Unknown command. Type /help for help.', 'system');
        }
    }

    /**
     * Update minimap
     */
    updateMinimap(player, npcs, enemies) {
        const canvas = document.getElementById('minimap-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        const scale = width / 200; // 200 units of game world
        const centerX = width / 2;
        const centerY = height / 2;

        // Draw terrain features
        ctx.fillStyle = '#4682B4';
        ctx.fillRect(centerX + (20 - player.position.x) * scale - 3, 0, 6, height);

        // Draw NPCs
        ctx.fillStyle = '#FFFF00';
        for (const npc of npcs) {
            const dx = (npc.position.x - player.position.x) * scale;
            const dy = (npc.position.z - player.position.z) * scale;
            ctx.fillRect(centerX + dx - 1, centerY + dy - 1, 2, 2);
        }

        // Draw enemies
        ctx.fillStyle = '#FF0000';
        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dx = (enemy.position.x - player.position.x) * scale;
            const dy = (enemy.position.z - player.position.z) * scale;
            ctx.fillRect(centerX + dx - 1, centerY + dy - 1, 2, 2);
        }

        // Draw player
        ctx.fillStyle = '#0099FF';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Show level up notification
     */
    showLevelUp(skill, level) {
        this.addMessage(`Congratulations! You have advanced a ${skill} level! You are now level ${level}.`, 'game');

        // TODO: Add visual level up effect
    }
}

export default UIManager;
