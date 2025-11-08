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
WATER_BLUE = (70, 130, 180)
RED = (220, 20, 60)
DARK_RED = (139, 0, 0)
YELLOW = (255, 215, 0)
ORANGE = (255, 140, 0)
BEIGE = (245, 245, 220)
STONE = (112, 128, 144)
GRASS = (60, 179, 113)

class Building:
    """Lumbridge buildings"""
    def __init__(self, x, y, building_type, name=""):
        self.x = x
        self.y = y
        self.type = building_type
        self.name = name

        # Building dimensions based on type
        if building_type == 'castle':
            self.width = 160
            self.height = 200
        elif building_type == 'church':
            self.width = 80
            self.height = 100
        elif building_type == 'farm':
            self.width = 100
            self.height = 80
        else:
            self.width = 70
            self.height = 80

    def draw(self, screen, camera_x=0, camera_y=0):
        draw_x = self.x - camera_x
        draw_y = self.y - camera_y

        # Castle (Lumbridge Castle)
        if self.type == 'castle':
            # Main castle body
            pygame.draw.rect(screen, STONE, (draw_x, draw_y + 50, self.width, self.height - 50))
            pygame.draw.rect(screen, BLACK, (draw_x, draw_y + 50, self.width, self.height - 50), 3)

            # Towers (4 corners)
            tower_size = 40
            # Top-left tower
            pygame.draw.rect(screen, DARK_GRAY, (draw_x - 10, draw_y, tower_size, 100))
            pygame.draw.polygon(screen, RED, [
                (draw_x - 10, draw_y),
                (draw_x + 15, draw_y - 20),
                (draw_x + tower_size - 10, draw_y)
            ])

            # Top-right tower
            pygame.draw.rect(screen, DARK_GRAY, (draw_x + self.width - tower_size + 10, draw_y, tower_size, 100))
            pygame.draw.polygon(screen, RED, [
                (draw_x + self.width - tower_size + 10, draw_y),
                (draw_x + self.width - 15, draw_y - 20),
                (draw_x + self.width + 10, draw_y)
            ])

            # Bottom towers
            pygame.draw.rect(screen, DARK_GRAY, (draw_x - 10, draw_y + 150, tower_size, 100))
            pygame.draw.rect(screen, DARK_GRAY, (draw_x + self.width - tower_size + 10, draw_y + 150, tower_size, 100))

            # Castle door
            pygame.draw.rect(screen, DARK_BROWN, (draw_x + self.width // 2 - 20, draw_y + self.height - 50, 40, 50))

            # Windows
            for i in range(3):
                for j in range(2):
                    wx = draw_x + 30 + i * 45
                    wy = draw_y + 80 + j * 40
                    pygame.draw.rect(screen, LIGHT_BLUE, (wx, wy, 15, 15))

            # Flag on top
            pygame.draw.line(screen, BROWN, (draw_x + self.width // 2, draw_y - 20),
                           (draw_x + self.width // 2, draw_y + 30), 3)
            pygame.draw.polygon(screen, RED, [
                (draw_x + self.width // 2, draw_y - 15),
                (draw_x + self.width // 2 + 25, draw_y - 5),
                (draw_x + self.width // 2, draw_y + 5)
            ])

        # Church
        elif self.type == 'church':
            # Main body
            pygame.draw.rect(screen, STONE, (draw_x, draw_y + 30, self.width, self.height - 30))
            pygame.draw.rect(screen, BLACK, (draw_x, draw_y + 30, self.width, self.height - 30), 2)

            # Steeple roof
            pygame.draw.polygon(screen, DARK_GRAY, [
                (draw_x, draw_y + 30),
                (draw_x + self.width // 2, draw_y),
                (draw_x + self.width, draw_y + 30)
            ])

            # Cross on top
            cx = draw_x + self.width // 2
            cy = draw_y - 15
            pygame.draw.line(screen, YELLOW, (cx, cy), (cx, cy + 20), 3)
            pygame.draw.line(screen, YELLOW, (cx - 5, cy + 5), (cx + 5, cy + 5), 3)

            # Arched door
            pygame.draw.rect(screen, DARK_BROWN, (draw_x + self.width // 2 - 12, draw_y + self.height - 25, 24, 25))

        # General Store
        elif self.type == 'general_store':
            pygame.draw.rect(screen, BEIGE, (draw_x, draw_y + 25, self.width, self.height - 25))
            pygame.draw.polygon(screen, BROWN, [
                (draw_x, draw_y + 25),
                (draw_x + self.width // 2, draw_y),
                (draw_x + self.width, draw_y + 25)
            ])
            pygame.draw.rect(screen, DARK_BROWN, (draw_x + self.width // 2 - 10, draw_y + self.height - 20, 20, 20))
            # Shop sign
            pygame.draw.rect(screen, BROWN, (draw_x + 10, draw_y + 40, 30, 20))

        # Bob's Axes
        elif self.type == 'bobs_axes':
            pygame.draw.rect(screen, DARK_BROWN, (draw_x, draw_y + 25, self.width, self.height - 25))
            pygame.draw.polygon(screen, RED, [
                (draw_x, draw_y + 25),
                (draw_x + self.width // 2, draw_y),
                (draw_x + self.width, draw_y + 25)
            ])
            # Axe sign
            pygame.draw.line(screen, GRAY, (draw_x + 15, draw_y + 35), (draw_x + 25, draw_y + 50), 3)

        # Chicken Farm
        elif self.type == 'farm':
            pygame.draw.rect(screen, BROWN, (draw_x, draw_y + 25, self.width, self.height - 25))
            pygame.draw.polygon(screen, RED, [
                (draw_x, draw_y + 25),
                (draw_x + self.width // 2, draw_y),
                (draw_x + self.width, draw_y + 25)
            ])
            # Fence
            for i in range(0, self.width, 15):
                pygame.draw.line(screen, DARK_BROWN, (draw_x + i, draw_y + self.height),
                               (draw_x + i, draw_y + self.height + 20), 2)

        # Goblin House
        elif self.type == 'goblin_house':
            pygame.draw.rect(screen, DARK_GRAY, (draw_x, draw_y + 25, self.width, self.height - 25))
            pygame.draw.polygon(screen, DARK_BROWN, [
                (draw_x, draw_y + 25),
                (draw_x + self.width // 2, draw_y),
                (draw_x + self.width, draw_y + 25)
            ])

        # Generic house
        else:
            pygame.draw.rect(screen, BROWN, (draw_x, draw_y + 25, self.width, self.height - 25))
            pygame.draw.polygon(screen, RED, [
                (draw_x, draw_y + 25),
                (draw_x + self.width // 2, draw_y),
                (draw_x + self.width, draw_y + 25)
            ])
            pygame.draw.rect(screen, DARK_BROWN, (draw_x + self.width // 2 - 10, draw_y + self.height - 20, 20, 20))

        # Name label
        if self.name:
            font = pygame.font.Font(None, 18)
            text = font.render(self.name, True, WHITE)
            text_rect = text.get_rect(center=(draw_x + self.width // 2, draw_y - 15))
            pygame.draw.rect(screen, BLACK, text_rect.inflate(6, 4))
            screen.blit(text, text_rect)

class River:
    """River Lum"""
    def __init__(self, x, width):
        self.x = x
        self.width = width

    def draw(self, screen, camera_x=0, camera_y=0):
        # Draw river
        river_x = self.x - camera_x
        pygame.draw.rect(screen, WATER_BLUE, (river_x, 0, self.width, SCREEN_HEIGHT - 150))

        # Water ripples
        for i in range(0, SCREEN_HEIGHT - 150, 30):
            offset = (pygame.time.get_ticks() // 100 + i) % 30
            pygame.draw.circle(screen, LIGHT_BLUE, (river_x + offset, i), 3, 1)
            pygame.draw.circle(screen, LIGHT_BLUE, (river_x + self.width - offset, i + 15), 3, 1)

class Bridge:
    """Bridge over River Lum"""
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.width = 80
        self.height = 150

    def draw(self, screen, camera_x=0, camera_y=0):
        draw_x = self.x - camera_x
        draw_y = self.y - camera_y

        # Bridge deck
        pygame.draw.rect(screen, BROWN, (draw_x, draw_y, self.width, self.height))
        pygame.draw.rect(screen, DARK_BROWN, (draw_x, draw_y, self.width, self.height), 3)

        # Railings
        for i in range(0, self.height, 20):
            pygame.draw.line(screen, DARK_BROWN, (draw_x, draw_y + i), (draw_x, draw_y + i + 10), 2)
            pygame.draw.line(screen, DARK_BROWN, (draw_x + self.width, draw_y + i),
                           (draw_x + self.width, draw_y + i + 10), 2)

class Character:
    """Base character class"""
    def __init__(self, x, y, char_type, name=""):
        self.x = x
        self.y = y
        self.start_x = x
        self.start_y = y
        self.type = char_type
        self.name = name
        self.width = TILE_SIZE
        self.height = TILE_SIZE
        self.speed = 3
        self.direction = 0
        self.walking = False
        self.walk_timer = 0
        self.wander_timer = 0
        self.wander_cooldown = random.randint(60, 180)

        # Stats
        self.level = 1
        self.hp = 10
        self.max_hp = 10
        self.alive = True

    def draw_character(self, screen, color, camera_x=0, camera_y=0):
        """Draw character sprite"""
        draw_x = self.x - camera_x
        draw_y = self.y - camera_y

        if not self.alive:
            return

        # Body
        pygame.draw.rect(screen, color, (draw_x + 8, draw_y + 12, 16, 14))

        # Head
        head_color = (255, 220, 177) if self.type != 'enemy' else (100, 150, 100)
        pygame.draw.circle(screen, head_color, (int(draw_x + 16), int(draw_y + 10)), 6)

        # Eyes
        pygame.draw.circle(screen, BLACK, (int(draw_x + 14), int(draw_y + 9)), 1)
        pygame.draw.circle(screen, BLACK, (int(draw_x + 18), int(draw_y + 9)), 1)

        # Legs
        leg_offset = 2 if (self.walk_timer // 10) % 2 == 0 and self.walking else 0
        pygame.draw.rect(screen, color, (draw_x + 10, draw_y + 26, 4, 6 + leg_offset))
        pygame.draw.rect(screen, color, (draw_x + 18, draw_y + 26, 4, 6 - leg_offset))

        # HP bar for enemies
        if self.type == 'enemy' and self.hp < self.max_hp:
            hp_width = int((self.hp / self.max_hp) * self.width)
            pygame.draw.rect(screen, RED, (draw_x, draw_y - 8, self.width, 4))
            pygame.draw.rect(screen, GREEN, (draw_x, draw_y - 8, hp_width, 4))

        # Name tag
        if self.name:
            font = pygame.font.Font(None, 14)
            text = font.render(self.name, True, YELLOW if self.type == 'npc' else WHITE)
            text_rect = text.get_rect(center=(draw_x + 16, draw_y - 12))
            pygame.draw.rect(screen, BLACK, text_rect.inflate(4, 2))
            screen.blit(text, text_rect)

class Player(Character):
    def __init__(self, x, y):
        super().__init__(x, y, 'player', "")
        self.speed = 4
        self.attack = 1
        self.defense = 1
        self.combat_xp = 0
        self.gold = 0
        self.inventory = {}

    def move(self, dx, dy, buildings, river):
        new_x = self.x + dx * self.speed
        new_y = self.y + dy * self.speed

        # Bounds check
        if new_x < 0 or new_x > 3000 - self.width:
            dx = 0
        if new_y < 0 or new_y > 2500 - self.height:
            dy = 0

        # Building collision
        test_rect = pygame.Rect(new_x, new_y, self.width, self.height)
        for building in buildings:
            building_rect = pygame.Rect(building.x, building.y + 30, building.width, building.height - 30)
            if test_rect.colliderect(building_rect):
                return

        self.x = new_x
        self.y = new_y

        if dx != 0 or dy != 0:
            self.walking = True
            self.walk_timer += 1
        else:
            self.walking = False
            self.walk_timer = 0

    def draw(self, screen, camera_x=0, camera_y=0):
        self.draw_character(screen, BLUE, camera_x, camera_y)

class NPC(Character):
    """Lumbridge NPCs"""
    def __init__(self, x, y, npc_name, role):
        super().__init__(x, y, 'npc', npc_name)
        self.role = role
        self.speed = 1

        # Role-specific colors
        colors = {
            'duke': (150, 0, 150),  # Purple
            'guard': (150, 30, 30),  # Red
            'cook': (255, 255, 255),  # White
            'priest': (100, 100, 100),  # Gray
            'shopkeeper': (180, 140, 50),  # Gold
            'servant': (100, 150, 200),  # Blue
            'farmer': (120, 180, 90)  # Green
        }
        self.color = colors.get(role, (100, 150, 200))

        # Hans walks in circles around castle
        self.is_hans = (npc_name == "Hans")
        self.circle_angle = 0
        self.circle_radius = 120

    def update(self, buildings):
        if self.is_hans:
            # Hans walks in a circle around castle
            self.circle_angle += 0.02
            center_x = 1000  # Castle center
            center_y = 600
            self.x = center_x + math.cos(self.circle_angle) * self.circle_radius
            self.y = center_y + math.sin(self.circle_angle) * self.circle_radius
            self.walking = True
            self.walk_timer += 1
        else:
            # Stationary or minimal wander
            self.wander_timer += 1
            if self.wander_timer >= self.wander_cooldown:
                dx = random.choice([-1, 0, 1])
                dy = random.choice([-1, 0, 1])
                new_x = self.x + dx * 10
                new_y = self.y + dy * 10

                if abs(new_x - self.start_x) < 30 and abs(new_y - self.start_y) < 30:
                    self.x = new_x
                    self.y = new_y

                self.wander_timer = 0
                self.wander_cooldown = random.randint(120, 300)

    def draw(self, screen, camera_x=0, camera_y=0):
        self.draw_character(screen, self.color, camera_x, camera_y)

class Enemy(Character):
    """Training enemies"""
    def __init__(self, x, y, enemy_type, level=1):
        names = {
            'goblin': f"Goblin (level {level})",
            'chicken': f"Chicken (level 1)",
            'cow': f"Cow (level 2)"
        }
        super().__init__(x, y, 'enemy', names.get(enemy_type, "Enemy"))
        self.enemy_type = enemy_type
        self.level = level
        self.hp = 5 * level if enemy_type != 'chicken' else 3
        self.max_hp = self.hp
        self.speed = 1 if enemy_type != 'chicken' else 2

        colors = {
            'goblin': (100, 150, 50),
            'chicken': (255, 255, 200),
            'cow': (160, 120, 80)
        }
        self.color = colors.get(enemy_type, (100, 100, 100))

        self.wander_area = 100

    def update(self, buildings):
        # Simple wandering
        self.wander_timer += 1
        if self.wander_timer >= 60:
            dx = random.choice([-1, 0, 1])
            dy = random.choice([-1, 0, 1])
            new_x = self.x + dx * self.speed * 10
            new_y = self.y + dy * self.speed * 10

            if abs(new_x - self.start_x) < self.wander_area and abs(new_y - self.start_y) < self.wander_area:
                self.x = new_x
                self.y = new_y
                if dx != 0 or dy != 0:
                    self.walking = True

            self.wander_timer = 0

        if self.walking:
            self.walk_timer += 1
            if self.walk_timer > 20:
                self.walking = False
                self.walk_timer = 0

    def draw(self, screen, camera_x=0, camera_y=0):
        self.draw_character(screen, self.color, camera_x, camera_y)

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("LUMBRIDGE - OSRS Recreation")
        self.clock = pygame.time.Clock()
        self.running = True
        self.font = pygame.font.Font(None, 24)
        self.small_font = pygame.font.Font(None, 16)

        # Camera
        self.camera_x = 0
        self.camera_y = 0

        # World
        self.world_width = 3000
        self.world_height = 2500

        self.create_lumbridge()

        self.message = "Welcome to Lumbridge! The home of new adventurers."
        self.message_timer = 300

    def create_lumbridge(self):
        """Create accurate Lumbridge layout"""
        # Player spawns at castle
        self.player = Player(1000, 700)

        # River Lum (runs north-south through middle)
        self.river = River(1150, 100)

        # Bridge over river
        self.bridge = Bridge(1130, 550)

        # Buildings (positioned accurately)
        self.buildings = [
            # Lumbridge Castle (center-west of river)
            Building(900, 500, 'castle', "Lumbridge Castle"),

            # Church (southeast of castle)
            Building(1050, 750, 'church', "Church"),

            # General Store (west side)
            Building(750, 650, 'general_store', "General Store"),

            # Bob's Axes (south)
            Building(950, 850, 'bobs_axes', "Bob's Axes"),

            # Fred's Farm (northwest)
            Building(700, 400, 'farm', "Fred's Farm"),

            # Chicken Farm (west)
            Building(650, 550, 'farm', "Chicken Farm"),

            # Goblin House (east of river)
            Building(1350, 600, 'goblin_house', "Goblin House"),

            # Houses
            Building(800, 800, 'house', "House"),
            Building(850, 500, 'house', "House"),
        ]

        # NPCs (positioned accurately)
        self.npcs = [
            # Castle NPCs
            NPC(1000, 600, "Duke Horacio", "duke"),  # 2nd floor room
            NPC(950, 650, "Cook", "cook"),  # Kitchen
            NPC(1000, 700, "Hans", "servant"),  # Walks around castle

            # Guards around castle
            NPC(950, 540, "Guard", "guard"),
            NPC(1050, 540, "Guard", "guard"),
            NPC(950, 720, "Guard", "guard"),
            NPC(1050, 720, "Guard", "guard"),

            # Church
            NPC(1080, 800, "Father Aereck", "priest"),

            # Shops
            NPC(770, 680, "Donie", "shopkeeper"),  # General store
            NPC(970, 880, "Bob", "shopkeeper"),  # Bob's Axes

            # Farmer
            NPC(720, 430, "Fred the Farmer", "farmer"),

            # Additional villagers
            NPC(820, 830, "Villager", "servant"),
            NPC(870, 530, "Villager", "servant"),
            NPC(780, 720, "Villager", "servant"),
        ]

        # Training enemies (positioned in correct areas)
        self.enemies = []

        # Chickens (west side, near chicken farm)
        for i in range(7):
            x = 620 + random.randint(0, 100)
            y = 520 + random.randint(0, 100)
            self.enemies.append(Enemy(x, y, 'chicken', 1))

        # Goblins (east of river, near goblin house)
        # Level 2 goblins
        for i in range(5):
            x = 1300 + random.randint(0, 150)
            y = 550 + random.randint(0, 150)
            self.enemies.append(Enemy(x, y, 'goblin', 2))

        # Level 5 goblins
        for i in range(3):
            x = 1400 + random.randint(0, 100)
            y = 600 + random.randint(0, 100)
            self.enemies.append(Enemy(x, y, 'goblin', 5))

        # Cows (northwest fields)
        for i in range(5):
            x = 600 + random.randint(0, 150)
            y = 350 + random.randint(0, 100)
            self.enemies.append(Enemy(x, y, 'cow', 2))

    def update_camera(self):
        """Camera follows player"""
        self.camera_x = self.player.x - SCREEN_WIDTH // 2
        self.camera_y = self.player.y - SCREEN_HEIGHT // 2 + 75

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
        """Attack enemies"""
        for enemy in self.enemies:
            if enemy.alive:
                if (enemy.x <= world_x <= enemy.x + enemy.width and
                    enemy.y <= world_y <= enemy.y + enemy.height):
                    self.attack_enemy(enemy)
                    return

    def attack_enemy(self, enemy):
        damage = self.player.attack + random.randint(0, 2)
        enemy.hp -= damage

        if enemy.hp <= 0:
            enemy.alive = False
            xp = enemy.level * 10 if enemy.enemy_type != 'chicken' else 5
            gold = enemy.level * 5
            self.player.combat_xp += xp
            self.player.gold += gold
            self.message = f"{enemy.name} defeated! +{xp} XP, +{gold} coins"
            self.message_timer = 180

            # Respawn after delay
            enemy.respawn_timer = 300
        else:
            self.message = f"You hit the {enemy.enemy_type} for {damage} damage!"
            self.message_timer = 120

    def update(self):
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
            self.player.move(dx, dy, self.buildings, self.river)

        # Update NPCs
        for npc in self.npcs:
            npc.update(self.buildings)

        # Update enemies
        for enemy in self.enemies:
            if enemy.alive:
                enemy.update(self.buildings)

        self.update_camera()

        if self.message_timer > 0:
            self.message_timer -= 1

    def draw(self):
        # Background grass
        self.screen.fill(GRASS)

        # Draw river
        self.river.draw(self.screen, self.camera_x, self.camera_y)

        # Draw bridge
        self.bridge.draw(self.screen, self.camera_x, self.camera_y)

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

        # UI
        self.draw_ui()

        pygame.display.flip()

    def draw_ui(self):
        # UI Panel
        ui_y = SCREEN_HEIGHT - 150
        pygame.draw.rect(self.screen, (25, 25, 25), (0, ui_y, SCREEN_WIDTH, 150))
        pygame.draw.rect(self.screen, YELLOW, (0, ui_y, SCREEN_WIDTH, 150), 3)

        # Title
        title = self.font.render("LUMBRIDGE", True, YELLOW)
        self.screen.blit(title, (20, ui_y + 10))

        # Stats
        stats = [
            f"Position: ({int(self.player.x)}, {int(self.player.y)})",
            f"Combat XP: {self.player.combat_xp}",
            f"Gold: {self.player.gold}",
        ]

        for i, text in enumerate(stats):
            surf = self.small_font.render(text, True, WHITE)
            self.screen.blit(surf, (20, ui_y + 40 + i * 20))

        # Entity counts
        alive_enemies = sum(1 for e in self.enemies if e.alive)
        counts = [
            f"NPCs: {len(self.npcs)}",
            f"Enemies: {alive_enemies}",
            f"Buildings: {len(self.buildings)}"
        ]

        for i, text in enumerate(counts):
            surf = self.small_font.render(text, True, (150, 255, 150))
            self.screen.blit(surf, (250, ui_y + 40 + i * 20))

        # Controls
        controls = ["WASD - Move", "Click Enemy - Attack"]
        for i, text in enumerate(controls):
            surf = self.small_font.render(text, True, WHITE)
            self.screen.blit(surf, (450, ui_y + 40 + i * 20))

        # Message
        if self.message_timer > 0:
            msg = self.font.render(self.message, True, YELLOW)
            msg_rect = msg.get_rect(center=(SCREEN_WIDTH // 2, 30))
            pygame.draw.rect(self.screen, BLACK, msg_rect.inflate(20, 10))
            pygame.draw.rect(self.screen, YELLOW, msg_rect.inflate(20, 10), 2)
            self.screen.blit(msg, msg_rect)

        # Minimap
        minimap_size = 180
        minimap_x = SCREEN_WIDTH - minimap_size - 20
        minimap_y = 20
        pygame.draw.rect(self.screen, (15, 15, 15), (minimap_x, minimap_y, minimap_size, minimap_size))
        pygame.draw.rect(self.screen, YELLOW, (minimap_x, minimap_y, minimap_size, minimap_size), 2)

        scale = minimap_size / self.world_width

        # River on minimap
        river_mini_x = minimap_x + int(self.river.x * scale)
        pygame.draw.rect(self.screen, WATER_BLUE, (river_mini_x, minimap_y, int(self.river.width * scale), minimap_size))

        # Buildings
        for building in self.buildings:
            mini_x = minimap_x + int(building.x * scale)
            mini_y = minimap_y + int(building.y * scale)
            color = RED if building.type == 'castle' else GRAY
            pygame.draw.rect(self.screen, color, (mini_x, mini_y, 3, 3))

        # Player
        mini_px = minimap_x + int(self.player.x * scale)
        mini_py = minimap_y + int(self.player.y * scale)
        pygame.draw.circle(self.screen, BLUE, (mini_px, mini_py), 3)

    def run(self):
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
