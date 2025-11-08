import pygame
import sys
import random
import math

# Initialize Pygame
pygame.init()

# Game Constants
SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720
FPS = 60
TILE_SIZE = 32

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (34, 139, 34)
DARK_GREEN = (0, 100, 0)
BROWN = (139, 69, 19)
DARK_BROWN = (101, 67, 33)
GRAY = (128, 128, 128)
DARK_GRAY = (70, 70, 70)
BLUE = (30, 144, 255)
LIGHT_BLUE = (135, 206, 250)
RED = (220, 20, 60)
DARK_RED = (139, 0, 0)
YELLOW = (255, 215, 0)
ORANGE = (255, 140, 0)
BEIGE = (245, 245, 220)
STONE = (112, 128, 144)

class Building:
    """Village buildings with different types"""
    def __init__(self, x, y, building_type):
        self.x = x
        self.y = y
        self.type = building_type
        self.width = 64 if building_type != 'castle' else 96
        self.height = 80 if building_type != 'castle' else 120

        # Building properties
        self.colors = {
            'house': (BROWN, DARK_BROWN, RED),
            'shop': (BEIGE, BROWN, ORANGE),
            'blacksmith': (DARK_GRAY, BLACK, GRAY),
            'tavern': (BROWN, DARK_BROWN, YELLOW),
            'church': (STONE, GRAY, WHITE),
            'farm': (BEIGE, BROWN, GREEN),
            'barracks': (GRAY, DARK_GRAY, RED),
            'castle': (STONE, DARK_GRAY, BLUE)
        }

    def draw(self, screen, camera_x=0, camera_y=0):
        colors = self.colors.get(self.type, (BROWN, DARK_BROWN, RED))
        draw_x = self.x - camera_x
        draw_y = self.y - camera_y

        # Main building
        pygame.draw.rect(screen, colors[1], (draw_x, draw_y + 30, self.width, self.height - 30))
        pygame.draw.rect(screen, BLACK, (draw_x, draw_y + 30, self.width, self.height - 30), 2)

        # Roof
        roof_points = [
            (draw_x, draw_y + 30),
            (draw_x + self.width // 2, draw_y),
            (draw_x + self.width, draw_y + 30)
        ]
        pygame.draw.polygon(screen, colors[2], roof_points)
        pygame.draw.polygon(screen, BLACK, roof_points, 2)

        # Door
        door_width = self.width // 4
        door_height = self.height // 3
        pygame.draw.rect(screen, DARK_BROWN,
                        (draw_x + self.width // 2 - door_width // 2,
                         draw_y + self.height - door_height,
                         door_width, door_height))

        # Windows
        window_size = 8
        pygame.draw.rect(screen, LIGHT_BLUE,
                        (draw_x + self.width // 4 - window_size // 2,
                         draw_y + self.height // 2,
                         window_size, window_size))
        pygame.draw.rect(screen, LIGHT_BLUE,
                        (draw_x + 3 * self.width // 4 - window_size // 2,
                         draw_y + self.height // 2,
                         window_size, window_size))

        # Type label
        font = pygame.font.Font(None, 16)
        text = font.render(self.type.upper(), True, WHITE)
        text_rect = text.get_rect(center=(draw_x + self.width // 2, draw_y - 10))
        screen.blit(text, text_rect)

class Character:
    """Base character class for player, NPCs, and enemies"""
    def __init__(self, x, y, char_type, name=""):
        self.x = x
        self.y = y
        self.start_x = x
        self.start_y = y
        self.type = char_type  # 'player', 'npc', 'enemy'
        self.name = name
        self.width = TILE_SIZE
        self.height = TILE_SIZE
        self.speed = 3

        # Stats
        self.level = 1
        self.hp = 10
        self.max_hp = 10
        self.alive = True

        # Movement
        self.direction = 0  # 0=down, 1=right, 2=up, 3=left
        self.walking = False
        self.walk_timer = 0

        # NPC behavior
        self.wander_timer = 0
        self.wander_cooldown = random.randint(60, 180)

    def draw_character(self, screen, color, camera_x=0, camera_y=0):
        """Draw a detailed character sprite"""
        draw_x = self.x - camera_x
        draw_y = self.y - camera_y

        if not self.alive:
            return

        # Body
        body_color = color
        pygame.draw.rect(screen, body_color, (draw_x + 8, draw_y + 12, 16, 14))

        # Head
        head_color = (255, 220, 177) if self.type != 'enemy' else (100, 150, 100)
        pygame.draw.circle(screen, head_color, (int(draw_x + 16), int(draw_y + 10)), 6)

        # Eyes
        eye_offset = 2 if self.direction == 0 else (-2 if self.direction == 2 else 0)
        pygame.draw.circle(screen, BLACK, (int(draw_x + 14), int(draw_y + 9 + eye_offset)), 1)
        pygame.draw.circle(screen, BLACK, (int(draw_x + 18), int(draw_y + 9 + eye_offset)), 1)

        # Legs (animated when walking)
        leg_offset = 0
        if self.walking:
            leg_offset = 2 if (self.walk_timer // 10) % 2 == 0 else -2

        pygame.draw.rect(screen, body_color, (draw_x + 10, draw_y + 26, 4, 6 + leg_offset))
        pygame.draw.rect(screen, body_color, (draw_x + 18, draw_y + 26, 4, 6 - leg_offset))

        # HP bar for enemies
        if self.type == 'enemy' and self.hp < self.max_hp:
            hp_width = int((self.hp / self.max_hp) * self.width)
            pygame.draw.rect(screen, RED, (draw_x, draw_y - 8, self.width, 4))
            pygame.draw.rect(screen, GREEN, (draw_x, draw_y - 8, hp_width, 4))

        # Name tag
        if self.name:
            font = pygame.font.Font(None, 14)
            text = font.render(self.name, True, WHITE)
            text_rect = text.get_rect(center=(draw_x + 16, draw_y - 12))
            # Background for text
            pygame.draw.rect(screen, BLACK, text_rect.inflate(4, 2))
            screen.blit(text, text_rect)

class Player(Character):
    def __init__(self, x, y):
        super().__init__(x, y, 'player', "HERO")
        self.speed = 4

        # RuneScape-style stats
        self.attack = 1
        self.defense = 1
        self.mining = 1
        self.fishing = 1
        self.woodcutting = 1

        # Experience
        self.combat_xp = 0
        self.mining_xp = 0
        self.fishing_xp = 0
        self.woodcutting_xp = 0

        # Inventory
        self.gold = 100
        self.inventory = {}

    def move(self, dx, dy, buildings, npcs):
        """Move with collision detection"""
        new_x = self.x + dx * self.speed
        new_y = self.y + dy * self.speed

        # Check bounds
        if new_x < 0 or new_x > 2000 - self.width:
            dx = 0
        if new_y < 0 or new_y > 2000 - self.height:
            dy = 0

        # Check building collisions
        test_rect = pygame.Rect(new_x, new_y, self.width, self.height)
        for building in buildings:
            building_rect = pygame.Rect(building.x, building.y + 30, building.width, building.height - 30)
            if test_rect.colliderect(building_rect):
                return

        self.x = new_x
        self.y = new_y

        # Update direction and animation
        if dx != 0 or dy != 0:
            self.walking = True
            self.walk_timer += 1
            if dy > 0:
                self.direction = 0  # down
            elif dy < 0:
                self.direction = 2  # up
            elif dx > 0:
                self.direction = 1  # right
            elif dx < 0:
                self.direction = 3  # left
        else:
            self.walking = False
            self.walk_timer = 0

    def draw(self, screen, camera_x=0, camera_y=0):
        self.draw_character(screen, BLUE, camera_x, camera_y)

class NPC(Character):
    """Non-player character"""
    def __init__(self, x, y, npc_role):
        names = {
            'villager': ['John', 'Mary', 'Bob', 'Alice', 'Tom', 'Emma', 'Sam', 'Lucy'],
            'merchant': ['Trader Joe', 'Shop Keep', 'Merchant'],
            'guard': ['Guard', 'Knight', 'Soldier'],
            'farmer': ['Farmer Brown', 'Gardener'],
            'blacksmith': ['Smithy', 'Armorer']
        }
        name = random.choice(names.get(npc_role, ['Villager']))
        super().__init__(x, y, 'npc', name)

        self.role = npc_role
        self.speed = 1

        # Role colors
        self.colors = {
            'villager': (100, 150, 200),
            'merchant': (180, 140, 50),
            'guard': (150, 30, 30),
            'farmer': (120, 180, 90),
            'blacksmith': (80, 80, 80)
        }

    def update(self, buildings):
        """Simple AI - wander around"""
        self.wander_timer += 1

        if self.wander_timer >= self.wander_cooldown:
            # Random movement
            dx = random.choice([-1, 0, 1])
            dy = random.choice([-1, 0, 1])

            new_x = self.x + dx * self.speed * 5
            new_y = self.y + dy * self.speed * 5

            # Stay near starting position
            if abs(new_x - self.start_x) < 100 and abs(new_y - self.start_y) < 100:
                # Check building collisions
                test_rect = pygame.Rect(new_x, new_y, self.width, self.height)
                collision = False
                for building in buildings:
                    building_rect = pygame.Rect(building.x, building.y + 30, building.width, building.height - 30)
                    if test_rect.colliderect(building_rect):
                        collision = True
                        break

                if not collision:
                    self.x = new_x
                    self.y = new_y

                    if dx != 0 or dy != 0:
                        self.walking = True
                        if dy > 0:
                            self.direction = 0
                        elif dy < 0:
                            self.direction = 2
                        elif dx > 0:
                            self.direction = 1
                        elif dx < 0:
                            self.direction = 3

            self.wander_timer = 0
            self.wander_cooldown = random.randint(60, 180)

        if self.walking:
            self.walk_timer += 1
            if self.walk_timer > 20:
                self.walking = False
                self.walk_timer = 0

    def draw(self, screen, camera_x=0, camera_y=0):
        color = self.colors.get(self.role, (100, 150, 200))
        self.draw_character(screen, color, camera_x, camera_y)

class Enemy(Character):
    """Enemy character"""
    def __init__(self, x, y, enemy_type, level=1):
        enemy_names = {
            'goblin': ['Goblin', 'Goblin Scout', 'Goblin Warrior'],
            'skeleton': ['Skeleton', 'Undead'],
            'bandit': ['Bandit', 'Thief', 'Rogue'],
            'orc': ['Orc', 'Orc Brute']
        }
        name = random.choice(enemy_names.get(enemy_type, ['Enemy']))
        super().__init__(x, y, 'enemy', f"{name} Lv.{level}")

        self.enemy_type = enemy_type
        self.level = level
        self.hp = 5 * level
        self.max_hp = 5 * level
        self.speed = 1

        self.colors = {
            'goblin': (100, 150, 50),
            'skeleton': (200, 200, 200),
            'bandit': (100, 50, 50),
            'orc': (50, 100, 50)
        }

        self.aggro_range = 150
        self.chasing = False

    def update(self, player, buildings):
        """Simple AI - chase player if in range"""
        dx = player.x - self.x
        dy = player.y - self.y
        distance = math.sqrt(dx**2 + dy**2)

        if distance < self.aggro_range:
            self.chasing = True
            # Move towards player
            if abs(dx) > 5:
                move_x = self.speed if dx > 0 else -self.speed
                new_x = self.x + move_x

                # Check collisions
                test_rect = pygame.Rect(new_x, self.y, self.width, self.height)
                collision = False
                for building in buildings:
                    building_rect = pygame.Rect(building.x, building.y + 30, building.width, building.height - 30)
                    if test_rect.colliderect(building_rect):
                        collision = True
                        break

                if not collision:
                    self.x = new_x
                    self.direction = 1 if dx > 0 else 3
                    self.walking = True

            if abs(dy) > 5:
                move_y = self.speed if dy > 0 else -self.speed
                new_y = self.y + move_y

                test_rect = pygame.Rect(self.x, new_y, self.width, self.height)
                collision = False
                for building in buildings:
                    building_rect = pygame.Rect(building.x, building.y + 30, building.width, building.height - 30)
                    if test_rect.colliderect(building_rect):
                        collision = True
                        break

                if not collision:
                    self.y = new_y
                    self.direction = 0 if dy > 0 else 2
                    self.walking = True

            self.walk_timer += 1
        else:
            self.chasing = False
            self.walking = False

    def draw(self, screen, camera_x=0, camera_y=0):
        color = self.colors.get(self.enemy_type, RED)
        self.draw_character(screen, color, camera_x, camera_y)

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Medieval Village - Enhanced")
        self.clock = pygame.time.Clock()
        self.running = True
        self.font = pygame.font.Font(None, 24)
        self.small_font = pygame.font.Font(None, 18)

        # Camera
        self.camera_x = 0
        self.camera_y = 0

        # World size
        self.world_width = 2000
        self.world_height = 2000

        # Initialize world
        self.create_village()

        self.message = "Welcome to the Medieval Village! Explore and fight enemies!"
        self.message_timer = 300

    def create_village(self):
        """Create the village with buildings, NPCs, and enemies"""
        # Player starts in center
        self.player = Player(self.world_width // 2, self.world_height // 2)

        # Create 8 buildings
        self.buildings = [
            Building(400, 300, 'castle'),
            Building(600, 400, 'blacksmith'),
            Building(700, 250, 'tavern'),
            Building(500, 550, 'shop'),
            Building(800, 500, 'house'),
            Building(300, 500, 'church'),
            Building(900, 350, 'farm'),
            Building(350, 650, 'barracks')
        ]

        # Create 25 NPCs with different roles
        self.npcs = []
        npc_positions = [
            # Villagers (15)
            (450, 450, 'villager'), (550, 500, 'villager'), (650, 350, 'villager'),
            (750, 450, 'villager'), (850, 550, 'villager'), (400, 600, 'villager'),
            (500, 700, 'villager'), (600, 650, 'villager'), (700, 600, 'villager'),
            (800, 650, 'villager'), (900, 600, 'villager'), (450, 350, 'villager'),
            (550, 300, 'villager'), (650, 550, 'villager'), (750, 650, 'villager'),
            # Merchants (3)
            (520, 570, 'merchant'), (430, 320, 'merchant'), (720, 270, 'merchant'),
            # Guards (4)
            (380, 280, 'guard'), (420, 340, 'guard'), (370, 670, 'guard'), (390, 630, 'guard'),
            # Farmers (2)
            (920, 370, 'farmer'), (880, 330, 'farmer'),
            # Blacksmith (1)
            (620, 420, 'blacksmith')
        ]

        for x, y, role in npc_positions:
            self.npcs.append(NPC(x, y, role))

        # Create 15 enemies of different types
        enemy_positions = [
            # Goblins (5)
            (200, 200, 'goblin', 1), (250, 300, 'goblin', 1), (300, 250, 'goblin', 2),
            (1100, 400, 'goblin', 1), (1200, 500, 'goblin', 2),
            # Skeletons (4)
            (200, 800, 'skeleton', 2), (300, 900, 'skeleton', 1),
            (1100, 800, 'skeleton', 2), (1200, 700, 'skeleton', 1),
            # Bandits (4)
            (900, 200, 'bandit', 1), (1000, 250, 'bandit', 2),
            (850, 850, 'bandit', 1), (950, 900, 'bandit', 2),
            # Orcs (2)
            (150, 500, 'orc', 3), (1250, 600, 'orc', 3)
        ]

        self.enemies = []
        for x, y, e_type, level in enemy_positions:
            self.enemies.append(Enemy(x, y, e_type, level))

    def update_camera(self):
        """Camera follows player"""
        self.camera_x = self.player.x - SCREEN_WIDTH // 2
        self.camera_y = self.player.y - SCREEN_HEIGHT // 2 + 75

        # Clamp camera to world bounds
        self.camera_x = max(0, min(self.camera_x, self.world_width - SCREEN_WIDTH))
        self.camera_y = max(0, min(self.camera_y, self.world_height - SCREEN_HEIGHT + 150))

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False

            if event.type == pygame.MOUSEBUTTONDOWN:
                mouse_x, mouse_y = pygame.mouse.get_pos()
                world_x = mouse_x + self.camera_x
                world_y = mouse_y + self.camera_y
                self.handle_click(world_x, world_y)

    def handle_click(self, world_x, world_y):
        """Handle clicking on enemies"""
        for enemy in self.enemies:
            if enemy.alive:
                if (enemy.x <= world_x <= enemy.x + enemy.width and
                    enemy.y <= world_y <= enemy.y + enemy.height):
                    self.attack_enemy(enemy)
                    return

    def attack_enemy(self, enemy):
        """Attack an enemy"""
        damage = self.player.attack + random.randint(0, 2)
        enemy.hp -= damage

        if enemy.hp <= 0:
            enemy.alive = False
            xp_gained = enemy.level * 15
            gold_gained = enemy.level * 10
            self.player.combat_xp += xp_gained
            self.player.gold += gold_gained
            self.message = f"{enemy.name} defeated! +{xp_gained} XP, +{gold_gained} gold"
            self.message_timer = 180

            # Level up check
            xp_needed = self.player.level * 100
            if self.player.combat_xp >= xp_needed:
                self.player.level += 1
                self.player.attack += 1
                self.player.defense += 1
                self.player.max_hp += 3
                self.player.hp = self.player.max_hp
                self.message = f"LEVEL UP! You are now level {self.player.level}!"
                self.message_timer = 240
        else:
            self.message = f"You hit {enemy.name} for {damage} damage!"
            self.message_timer = 120

    def update(self):
        """Update game state"""
        # Player movement
        keys = pygame.key.get_pressed()
        dx = dy = 0

        if keys[pygame.K_w] or keys[pygame.K_UP]:
            dy = -1
        if keys[pygame.K_s] or keys[pygame.K_DOWN]:
            dy = 1
        if keys[pygame.K_a] or keys[pygame.K_LEFT]:
            dx = -1
        if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
            dx = 1

        if dx != 0 or dy != 0:
            self.player.move(dx, dy, self.buildings, self.npcs)

        # Update NPCs
        for npc in self.npcs:
            npc.update(self.buildings)

        # Update enemies
        for enemy in self.enemies:
            if enemy.alive:
                enemy.update(self.player, self.buildings)

        # Update camera
        self.update_camera()

        # Update message timer
        if self.message_timer > 0:
            self.message_timer -= 1

    def draw(self):
        """Draw everything"""
        # Background
        self.screen.fill(DARK_GREEN)

        # Draw grass tiles
        for y in range(0, SCREEN_HEIGHT - 150, TILE_SIZE):
            for x in range(0, SCREEN_WIDTH, TILE_SIZE):
                if random.random() > 0.95:
                    pygame.draw.circle(self.screen, GREEN,
                                     (x + random.randint(0, TILE_SIZE),
                                      y + random.randint(0, TILE_SIZE)), 3)

        # Draw buildings
        for building in self.buildings:
            building.draw(self.screen, self.camera_x, self.camera_y)

        # Draw NPCs
        for npc in self.npcs:
            npc.draw(self.screen, self.camera_x, self.camera_y)

        # Draw enemies
        for enemy in self.enemies:
            if enemy.alive:
                enemy.draw(self.screen, self.camera_x, self.camera_y)

        # Draw player
        self.player.draw(self.screen, self.camera_x, self.camera_y)

        # Draw UI
        self.draw_ui()

        pygame.display.flip()

    def draw_ui(self):
        """Draw UI elements"""
        # UI Panel
        ui_y = SCREEN_HEIGHT - 150
        pygame.draw.rect(self.screen, (30, 30, 30), (0, ui_y, SCREEN_WIDTH, 150))
        pygame.draw.rect(self.screen, YELLOW, (0, ui_y, SCREEN_WIDTH, 150), 3)

        # Stats
        stats_x = 20
        stats_y = ui_y + 15

        stats_text = [
            f"LEVEL: {self.player.level}",
            f"HP: {self.player.hp}/{self.player.max_hp}",
            f"ATK: {self.player.attack} | DEF: {self.player.defense}",
            f"GOLD: {self.player.gold}",
            f"Position: ({int(self.player.x)}, {int(self.player.y)})"
        ]

        for i, text in enumerate(stats_text):
            surf = self.small_font.render(text, True, WHITE)
            self.screen.blit(surf, (stats_x, stats_y + i * 22))

        # Combat XP
        xp_x = 250
        xp_needed = self.player.level * 100
        xp_text = f"Combat XP: {self.player.combat_xp}/{xp_needed}"
        surf = self.small_font.render(xp_text, True, (200, 200, 255))
        self.screen.blit(surf, (xp_x, stats_y))

        # XP Bar
        bar_width = 150
        xp_progress = min(1.0, self.player.combat_xp / xp_needed)
        pygame.draw.rect(self.screen, DARK_GRAY, (xp_x, stats_y + 25, bar_width, 15))
        pygame.draw.rect(self.screen, YELLOW, (xp_x, stats_y + 25, int(bar_width * xp_progress), 15))
        pygame.draw.rect(self.screen, WHITE, (xp_x, stats_y + 25, bar_width, 15), 2)

        # Entity counts
        alive_enemies = sum(1 for e in self.enemies if e.alive)
        count_text = [
            f"NPCs: {len(self.npcs)}",
            f"Enemies: {alive_enemies}/15",
            f"Buildings: {len(self.buildings)}"
        ]

        for i, text in enumerate(count_text):
            surf = self.small_font.render(text, True, (150, 255, 150))
            self.screen.blit(surf, (xp_x, stats_y + 50 + i * 22))

        # Controls
        controls_x = 550
        controls_text = [
            "CONTROLS:",
            "WASD - Move",
            "Click Enemy - Attack",
            "Explore the village!"
        ]

        for i, text in enumerate(controls_text):
            color = YELLOW if i == 0 else WHITE
            surf = self.small_font.render(text, True, color)
            self.screen.blit(surf, (controls_x, stats_y + i * 22))

        # Message
        if self.message_timer > 0:
            msg_surf = self.font.render(self.message, True, (255, 255, 100))
            msg_rect = msg_surf.get_rect(center=(SCREEN_WIDTH // 2, 30))
            # Background
            pygame.draw.rect(self.screen, BLACK, msg_rect.inflate(20, 10))
            pygame.draw.rect(self.screen, YELLOW, msg_rect.inflate(20, 10), 2)
            self.screen.blit(msg_surf, msg_rect)

        # Mini-map (top right)
        minimap_size = 150
        minimap_x = SCREEN_WIDTH - minimap_size - 20
        minimap_y = 20
        pygame.draw.rect(self.screen, (20, 20, 20), (minimap_x, minimap_y, minimap_size, minimap_size))
        pygame.draw.rect(self.screen, WHITE, (minimap_x, minimap_y, minimap_size, minimap_size), 2)

        # Scale factor for minimap
        scale = minimap_size / self.world_width

        # Draw buildings on minimap
        for building in self.buildings:
            mini_x = minimap_x + int(building.x * scale)
            mini_y = minimap_y + int(building.y * scale)
            pygame.draw.rect(self.screen, GRAY, (mini_x, mini_y, 3, 3))

        # Draw player on minimap
        mini_player_x = minimap_x + int(self.player.x * scale)
        mini_player_y = minimap_y + int(self.player.y * scale)
        pygame.draw.circle(self.screen, BLUE, (mini_player_x, mini_player_y), 3)

        # Draw enemies on minimap
        for enemy in self.enemies:
            if enemy.alive:
                mini_enemy_x = minimap_x + int(enemy.x * scale)
                mini_enemy_y = minimap_y + int(enemy.y * scale)
                pygame.draw.circle(self.screen, RED, (mini_enemy_x, mini_enemy_y), 2)

    def run(self):
        """Main game loop"""
        while self.running:
            self.handle_events()
            self.update()
            self.draw()
            self.clock.tick(FPS)

        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run()
