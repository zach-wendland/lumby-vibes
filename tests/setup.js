/**
 * Jest test setup file
 * Configures mocks and global test environment
 */

// Mock canvas for jsdom environment
global.HTMLCanvasElement.prototype.getContext = () => {
    return {
        fillStyle: '',
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn(),
        putImageData: jest.fn(),
        createImageData: jest.fn(),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        fillText: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        measureText: jest.fn(() => ({ width: 0 })),
        transform: jest.fn(),
        rect: jest.fn(),
        clip: jest.fn(),
    };
};

// Mock OffscreenCanvas if needed
global.OffscreenCanvas = class OffscreenCanvas {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    getContext() {
        return global.HTMLCanvasElement.prototype.getContext();
    }
};

// Suppress console errors during tests (optional)
// global.console.error = jest.fn();
// global.console.warn = jest.fn();
