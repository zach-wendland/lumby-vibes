import pygame
import sys

# Initialize Pygame
pygame.init()

# Game Constants
SCREEN_WIDTH = 1024
SCREEN_HEIGHT = 768
FPS = 60
TILE_SIZE = 32

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (34, 139, 34)
BROWN = (139, 69, 19)
GRAY = (128, 128, 128)
BLUE = (30, 144, 255)
RED = (220, 20, 60)

class Player:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.speed = 4
        self.width = TILE_SIZE
        self.height = TILE_SIZE

        # RuneScape-style stats
        self.level = 1
        self.hp = 10
        self.max_hp = 10
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
        self.gold = 0
        self.inventory = {}

    def move(self, dx, dy, game_map):
        """Move player with collision detection"""
        new_x = self.x + dx * self.speed
        new_y = self.y + dy * self.speed

        # Check bounds
        if 0 <= new_x <= SCREEN_WIDTH - self.width:
            self.x = new_x
        if 0 <= new_y <= SCREEN_HEIGHT - self.height - 150:  # Leave room for UI
            self.y = new_y

    def draw(self, screen):
        """Draw player character"""
        pygame.draw.rect(screen, BLUE, (self.x, self.y, self.width, self.height))
        # Draw a simple face
        pygame.draw.circle(screen, WHITE, (int(self.x + 16), int(self.y + 12)), 3)
        pygame.draw.circle(screen, WHITE, (int(self.x + 24), int(self.y + 12)), 3)

class Enemy:
    def __init__(self, x, y, level=1):
        self.x = x
        self.y = y
        self.level = level
        self.hp = 5 * level
        self.max_hp = 5 * level
        self.width = TILE_SIZE
        self.height = TILE_SIZE
        self.alive = True

    def draw(self, screen):
        if self.alive:
            pygame.draw.rect(screen, RED, (self.x, self.y, self.width, self.height))
            # HP bar
            hp_width = int((self.hp / self.max_hp) * self.width)
            pygame.draw.rect(screen, GREEN, (self.x, self.y - 8, hp_width, 4))

class Resource:
    """Trees, rocks, fish spots"""
    def __init__(self, x, y, resource_type):
        self.x = x
        self.y = y
        self.type = resource_type  # 'tree', 'rock', 'fish'
        self.width = TILE_SIZE
        self.height = TILE_SIZE
        self.hp = 3

    def draw(self, screen):
        if self.hp > 0:
            if self.type == 'tree':
                pygame.draw.rect(screen, GREEN, (self.x, self.y, self.width, self.height))
            elif self.type == 'rock':
                pygame.draw.rect(screen, GRAY, (self.x, self.y, self.width, self.height))
            elif self.type == 'fish':
                pygame.draw.circle(screen, BLUE, (int(self.x + 16), int(self.y + 16)), 16)

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Medieval War - RuneScape Style")
        self.clock = pygame.time.Clock()
        self.running = True
        self.font = pygame.font.Font(None, 24)
        self.small_font = pygame.font.Font(None, 20)

        # Game state
        self.player = Player(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2)
        self.enemies = [
            Enemy(200, 200, 1),
            Enemy(400, 150, 2),
            Enemy(600, 300, 1)
        ]
        self.resources = [
            Resource(100, 100, 'tree'),
            Resource(150, 100, 'tree'),
            Resource(300, 400, 'rock'),
            Resource(350, 400, 'rock'),
            Resource(700, 200, 'fish')
        ]

        self.selected_target = None
        self.message = "Welcome to Medieval War! Use WASD to move, click enemies to attack!"
        self.message_timer = 300

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False

            if event.type == pygame.MOUSEBUTTONDOWN:
                mouse_x, mouse_y = pygame.mouse.get_pos()
                self.handle_click(mouse_x, mouse_y)

    def handle_click(self, mouse_x, mouse_y):
        """Handle clicking on enemies and resources"""
        # Check enemies
        for enemy in self.enemies:
            if enemy.alive:
                if (enemy.x <= mouse_x <= enemy.x + enemy.width and
                    enemy.y <= mouse_y <= enemy.y + enemy.height):
                    self.attack_enemy(enemy)
                    return

        # Check resources
        for resource in self.resources:
            if resource.hp > 0:
                if (resource.x <= mouse_x <= resource.x + resource.width and
                    resource.y <= mouse_y <= resource.y + resource.height):
                    self.gather_resource(resource)
                    return

    def attack_enemy(self, enemy):
        """Attack an enemy (RuneScape-style)"""
        damage = self.player.attack
        enemy.hp -= damage

        if enemy.hp <= 0:
            enemy.alive = False
            xp_gained = enemy.level * 10
            gold_gained = enemy.level * 5
            self.player.combat_xp += xp_gained
            self.player.gold += gold_gained
            self.message = f"Enemy defeated! +{xp_gained} XP, +{gold_gained} gold"
            self.message_timer = 180

            # Level up check
            if self.player.combat_xp >= self.player.level * 50:
                self.player.level += 1
                self.player.attack += 1
                self.player.defense += 1
                self.player.max_hp += 2
                self.player.hp = self.player.max_hp
                self.message = f"LEVEL UP! You are now level {self.player.level}!"
                self.message_timer = 240
        else:
            self.message = f"You hit the enemy for {damage} damage!"
            self.message_timer = 120

    def gather_resource(self, resource):
        """Gather from resource node"""
        resource.hp -= 1

        if resource.hp <= 0:
            if resource.type == 'tree':
                self.player.woodcutting_xp += 10
                self.player.inventory['logs'] = self.player.inventory.get('logs', 0) + 1
                self.message = "You cut down a tree! +1 logs, +10 Woodcutting XP"
            elif resource.type == 'rock':
                self.player.mining_xp += 15
                self.player.inventory['ore'] = self.player.inventory.get('ore', 0) + 1
                self.message = "You mined ore! +1 ore, +15 Mining XP"
            elif resource.type == 'fish':
                self.player.fishing_xp += 12
                self.player.inventory['fish'] = self.player.inventory.get('fish', 0) + 1
                self.message = "You caught a fish! +1 fish, +12 Fishing XP"

            resource.hp = 3  # Respawn
            self.message_timer = 180
        else:
            self.message = f"Gathering {resource.type}..."
            self.message_timer = 60

    def update(self):
        """Update game state"""
        # Handle movement
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
            self.player.move(dx, dy, None)

        # Update message timer
        if self.message_timer > 0:
            self.message_timer -= 1

    def draw(self):
        """Draw everything"""
        # Background
        self.screen.fill(GREEN)

        # Draw resources
        for resource in self.resources:
            resource.draw(self.screen)

        # Draw enemies
        for enemy in self.enemies:
            enemy.draw(self.screen)

        # Draw player
        self.player.draw(self.screen)

        # Draw UI
        self.draw_ui()

        pygame.display.flip()

    def draw_ui(self):
        """Draw UI elements (RuneScape-style)"""
        # UI Panel at bottom
        ui_y = SCREEN_HEIGHT - 150
        pygame.draw.rect(self.screen, (40, 40, 40), (0, ui_y, SCREEN_WIDTH, 150))
        pygame.draw.rect(self.screen, WHITE, (0, ui_y, SCREEN_WIDTH, 150), 2)

        # Stats
        stats_x = 20
        stats_y = ui_y + 10

        # Character stats
        stats_text = [
            f"Level: {self.player.level}",
            f"HP: {self.player.hp}/{self.player.max_hp}",
            f"Attack: {self.player.attack}",
            f"Defense: {self.player.defense}",
            f"Gold: {self.player.gold}"
        ]

        for i, text in enumerate(stats_text):
            surf = self.small_font.render(text, True, WHITE)
            self.screen.blit(surf, (stats_x, stats_y + i * 25))

        # Skills
        skills_x = 200
        skills_text = [
            f"Combat XP: {self.player.combat_xp}",
            f"Mining: {self.player.mining} (XP: {self.player.mining_xp})",
            f"Fishing: {self.player.fishing} (XP: {self.player.fishing_xp})",
            f"Woodcutting: {self.player.woodcutting} (XP: {self.player.woodcutting_xp})"
        ]

        for i, text in enumerate(skills_text):
            surf = self.small_font.render(text, True, (200, 200, 200))
            self.screen.blit(surf, (skills_x, stats_y + i * 25))

        # Inventory
        inv_x = 550
        inv_text = "Inventory: "
        for item, count in self.player.inventory.items():
            inv_text += f"{item}:{count} "

        surf = self.small_font.render(inv_text, True, (255, 215, 0))
        self.screen.blit(surf, (inv_x, stats_y))

        # Message
        if self.message_timer > 0:
            msg_surf = self.font.render(self.message, True, (255, 255, 100))
            self.screen.blit(msg_surf, (SCREEN_WIDTH // 2 - msg_surf.get_width() // 2, 20))

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
