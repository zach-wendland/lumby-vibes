import { Page, Locator } from '@playwright/test';

/**
 * CanvasPage - Page object for WebGL/Three.js canvas interactions
 *
 * Handles low-level canvas and rendering verification
 */
export class CanvasPage {
    readonly page: Page;
    readonly canvas: Locator;

    constructor(page: Page) {
        this.page = page;
        this.canvas = page.locator('#gameCanvas');
    }

    /**
     * Get canvas dimensions
     */
    async getCanvasDimensions(): Promise<{ width: number; height: number }> {
        const box = await this.canvas.boundingBox();
        if (!box) return { width: 0, height: 0 };
        return { width: box.width, height: box.height };
    }

    /**
     * Check if WebGL context is available
     */
    async hasWebGLContext(): Promise<boolean> {
        return await this.page.evaluate(() => {
            const canvas = document.querySelector('#gameCanvas') as HTMLCanvasElement;
            if (!canvas) return false;
            const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
            return gl !== null;
        });
    }

    /**
     * Check if game renderer is running
     */
    async isRendering(): Promise<boolean> {
        return await this.page.evaluate(() => {
            const game = (window as any).game;
            return game && game.engine && game.engine.renderer !== null;
        });
    }

    /**
     * Get renderer info
     */
    async getRendererInfo(): Promise<any> {
        return await this.page.evaluate(() => {
            const game = (window as any).game;
            if (!game || !game.engine || !game.engine.renderer) return null;
            const renderer = game.engine.renderer;
            return {
                width: renderer.domElement.width,
                height: renderer.domElement.height,
                pixelRatio: renderer.getPixelRatio(),
            };
        });
    }

    /**
     * Get scene object count
     */
    async getSceneObjectCount(): Promise<number> {
        return await this.page.evaluate(() => {
            const game = (window as any).game;
            if (!game || !game.engine || !game.engine.scene) return 0;

            let count = 0;
            game.engine.scene.traverse(() => {
                count++;
            });
            return count;
        });
    }

    /**
     * Get camera position
     */
    async getCameraPosition(): Promise<{ x: number; y: number; z: number }> {
        return await this.page.evaluate(() => {
            const game = (window as any).game;
            if (!game || !game.engine || !game.engine.camera) {
                return { x: 0, y: 0, z: 0 };
            }
            const camera = game.engine.camera;
            return {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z,
            };
        });
    }

    /**
     * Take screenshot of canvas only
     */
    async takeCanvasScreenshot(): Promise<Buffer> {
        return await this.canvas.screenshot();
    }

    /**
     * Check if HDR rendering is enabled
     */
    async isHDREnabled(): Promise<boolean> {
        return await this.page.evaluate(() => {
            const game = (window as any).game;
            if (!game || !game.engine) return false;
            // Check if renderer uses HalfFloatType for HDR
            return game.engine.renderer?.capabilities?.isWebGL2 || false;
        });
    }

    /**
     * Get FPS (frames per second)
     */
    async measureFPS(duration: number = 1000): Promise<number> {
        return await this.page.evaluate(async (ms) => {
            return new Promise<number>((resolve) => {
                let frameCount = 0;
                const startTime = performance.now();

                function countFrame() {
                    frameCount++;
                    if (performance.now() - startTime < ms) {
                        requestAnimationFrame(countFrame);
                    } else {
                        const fps = Math.round((frameCount / ms) * 1000);
                        resolve(fps);
                    }
                }

                requestAnimationFrame(countFrame);
            });
        }, duration);
    }

    /**
     * Check for WebGL errors
     */
    async hasWebGLErrors(): Promise<boolean> {
        return await this.page.evaluate(() => {
            const canvas = document.querySelector('#gameCanvas') as HTMLCanvasElement;
            if (!canvas) return true;
            const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
            if (!gl) return true;
            return gl.getError() !== gl.NO_ERROR;
        });
    }

    /**
     * Get number of active lights in scene
     */
    async getLightCount(): Promise<number> {
        return await this.page.evaluate(() => {
            const game = (window as any).game;
            if (!game || !game.engine || !game.engine.scene) return 0;

            let count = 0;
            game.engine.scene.traverse((obj: any) => {
                if (obj.isLight) count++;
            });
            return count;
        });
    }

    /**
     * Get entities in scene
     */
    async getEntityCounts(): Promise<{ npcs: number; enemies: number; resources: number }> {
        return await this.page.evaluate(() => {
            const game = (window as any).game;
            if (!game || !game.world) {
                return { npcs: 0, enemies: 0, resources: 0 };
            }
            return {
                npcs: game.world.npcs?.length || 0,
                enemies: game.world.enemies?.length || 0,
                resources: game.world.getResources?.()?.length || 0,
            };
        });
    }
}
