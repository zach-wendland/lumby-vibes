/**
 * Test setup - Comprehensive THREE.js Mock for Jest
 */

// Mock THREE.js globally with full API coverage
global.THREE = {
    // Core Math
    Vector2: class Vector2 {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
        set(x, y) {
            this.x = x;
            this.y = y;
            return this;
        }
        clone() {
            return new THREE.Vector2(this.x, this.y);
        }
    },
    Vector3: class Vector3 {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        set(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }
        copy(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        }
        clone() {
            return new THREE.Vector3(this.x, this.y, this.z);
        }
        add(v) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
            return this;
        }
        sub(v) {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
            return this;
        }
        multiplyScalar(s) {
            this.x *= s;
            this.y *= s;
            this.z *= s;
            return this;
        }
        addScaledVector(v, s) {
            this.x += v.x * s;
            this.y += v.y * s;
            this.z += v.z * s;
            return this;
        }
        subVectors(a, b) {
            this.x = a.x - b.x;
            this.y = a.y - b.y;
            this.z = a.z - b.z;
            return this;
        }
        normalize() {
            const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            if (length > 0) {
                this.x /= length;
                this.y /= length;
                this.z /= length;
            }
            return this;
        }
        length() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }
        distanceTo(v) {
            const dx = this.x - v.x;
            const dy = this.y - v.y;
            const dz = this.z - v.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
        lerp(v, alpha) {
            this.x += (v.x - this.x) * alpha;
            this.y += (v.y - this.y) * alpha;
            this.z += (v.z - this.z) * alpha;
            return this;
        }
    },
    Color: class Color {
        constructor(color = 0xffffff) {
            this.r = 1;
            this.g = 1;
            this.b = 1;
            if (typeof color === 'number') {
                this.setHex(color);
            }
        }
        setHex(hex) {
            this.r = ((hex >> 16) & 255) / 255;
            this.g = ((hex >> 8) & 255) / 255;
            this.b = (hex & 255) / 255;
            return this;
        }
    },
    Clock: class Clock {
        constructor() {
            this.startTime = Date.now();
            this.oldTime = this.startTime;
            this.elapsedTime = 0;
            this.running = false;
        }
        start() {
            this.startTime = Date.now();
            this.oldTime = this.startTime;
            this.elapsedTime = 0;
            this.running = true;
        }
        getDelta() {
            const diff = Date.now() - this.oldTime;
            this.oldTime = Date.now();
            this.elapsedTime += diff;
            return diff / 1000;
        }
        getElapsedTime() {
            return this.elapsedTime / 1000;
        }
    },
    // Raycaster for click detection
    Raycaster: class Raycaster {
        constructor() {
            this.ray = {
                origin: new THREE.Vector3(),
                direction: new THREE.Vector3()
            };
            this.intersections = [];
        }
        setFromCamera(_mouse, _camera) {
            // Mock implementation
        }
        intersectObjects(objects, _recursive = false) {
            return this.intersections;
        }
    },
    // Scene & Rendering
    Scene: class Scene {
        constructor() {
            this.children = [];
            this.background = null;
            this.fog = null;
            this.userData = {};
        }
        add(object) {
            this.children.push(object);
        }
        remove(object) {
            const index = this.children.indexOf(object);
            if (index > -1) {
                this.children.splice(index, 1);
            }
        }
    },
    Fog: class Fog {
        constructor(color, near, far) {
            this.color = new THREE.Color(color);
            this.near = near;
            this.far = far;
        }
    },
    WebGLRenderer: class WebGLRenderer {
        constructor(options = {}) {
            this.domElement = options.canvas || document.createElement('canvas');
            this.shadowMap = {
                enabled: false,
                type: null
            };
            this.toneMapping = null;
            this.toneMappingExposure = 1;
            this.outputColorSpace = null;
        }
        setSize(_width, _height) {}
        setPixelRatio(_ratio) {}
        render(_scene, _camera) {}
        dispose() {}
    },
    ACESFilmicToneMapping: 4,
    SRGBColorSpace: 'srgb',
    PCFSoftShadowMap: 1,
    // Cameras
    PerspectiveCamera: class PerspectiveCamera {
        constructor(fov, aspect, near, far) {
            this.fov = fov;
            this.aspect = aspect;
            this.near = near;
            this.far = far;
            this.position = new THREE.Vector3();
            this.rotation = { x: 0, y: 0, z: 0 };
        }
        lookAt(_x, _y, _z) {
            // Mock implementation
        }
        updateProjectionMatrix() {}
    },
    // Lights
    DirectionalLight: class DirectionalLight {
        constructor(color, intensity) {
            this.color = new THREE.Color(color);
            this.intensity = intensity;
            this.position = new THREE.Vector3();
            this.castShadow = false;
            this.shadow = {
                mapSize: { width: 0, height: 0 },
                camera: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    near: 0,
                    far: 0
                }
            };
        }
    },
    AmbientLight: class AmbientLight {
        constructor(color, intensity) {
            this.color = new THREE.Color(color);
            this.intensity = intensity;
        }
    },
    HemisphereLight: class HemisphereLight {
        constructor(skyColor, groundColor, intensity) {
            this.skyColor = new THREE.Color(skyColor);
            this.groundColor = new THREE.Color(groundColor);
            this.intensity = intensity;
            this.position = new THREE.Vector3();
        }
    },
    // Objects
    Group: class Group {
        constructor() {
            this.children = [];
            this.position = new THREE.Vector3();
            this.rotation = { x: 0, y: 0, z: 0 };
            this.scale = { x: 1, y: 1, z: 1 };
            this.userData = {};
            this.visible = true;
        }
        add(object) {
            this.children.push(object);
        }
        remove(object) {
            const index = this.children.indexOf(object);
            if (index > -1) {
                this.children.splice(index, 1);
            }
        }
    },
    Mesh: class Mesh {
        constructor(geometry, material) {
            this.geometry = geometry;
            this.material = material;
            this.position = new THREE.Vector3();
            this.rotation = { x: 0, y: 0, z: 0 };
            this.scale = { x: 1, y: 1, z: 1 };
            this.castShadow = false;
            this.receiveShadow = false;
            this.userData = {};
            this.visible = true;
        }
    },
    Sprite: class Sprite {
        constructor(material) {
            this.material = material;
            this.position = new THREE.Vector3();
            this.scale = { x: 1, y: 1, z: 1 };
        }
        lookAt(_vector) {
            // Mock implementation
        }
    },
    // Geometries
    BoxGeometry: class BoxGeometry {
        constructor(width, height, depth) {
            this.width = width;
            this.height = height;
            this.depth = depth;
        }
    },
    SphereGeometry: class SphereGeometry {
        constructor(radius, widthSegments, heightSegments) {
            this.radius = radius;
            this.widthSegments = widthSegments;
            this.heightSegments = heightSegments;
        }
    },
    CylinderGeometry: class CylinderGeometry {
        constructor(radiusTop, radiusBottom, height, radialSegments) {
            this.radiusTop = radiusTop;
            this.radiusBottom = radiusBottom;
            this.height = height;
            this.radialSegments = radialSegments;
        }
    },
    PlaneGeometry: class PlaneGeometry {
        constructor(width, height, widthSegments, heightSegments) {
            this.width = width;
            this.height = height;
            this.widthSegments = widthSegments || 1;
            this.heightSegments = heightSegments || 1;
        }
    },
    ConeGeometry: class ConeGeometry {
        constructor(radius, height, radialSegments) {
            this.radius = radius;
            this.height = height;
            this.radialSegments = radialSegments;
        }
    },
    // Materials
    MeshLambertMaterial: class MeshLambertMaterial {
        constructor(options = {}) {
            this.color = new THREE.Color(options.color || 0xffffff);
            this.emissive = new THREE.Color(options.emissive || 0x000000);
            this.map = options.map || null;
        }
    },
    MeshBasicMaterial: class MeshBasicMaterial {
        constructor(options = {}) {
            this.color = new THREE.Color(options.color || 0xffffff);
            this.map = options.map || null;
        }
    },
    MeshStandardMaterial: class MeshStandardMaterial {
        constructor(options = {}) {
            this.color = new THREE.Color(options.color || 0xffffff);
            this.roughness = options.roughness !== undefined ? options.roughness : 1;
            this.metalness = options.metalness !== undefined ? options.metalness : 0;
            this.map = options.map || null;
        }
    },
    SpriteMaterial: class SpriteMaterial {
        constructor(options = {}) {
            this.map = options.map;
            this.color = new THREE.Color(options.color || 0xffffff);
        }
    },
    // Textures
    CanvasTexture: class CanvasTexture {
        constructor(canvas) {
            this.canvas = canvas;
            this.needsUpdate = false;
        }
    },
    TextureLoader: class TextureLoader {
        constructor() {}
        load(url, onLoad, _onProgress, _onError) {
            const texture = { image: new Image(), needsUpdate: true };
            if (onLoad) onLoad(texture);
            return texture;
        }
    }
};

// Mock canvas and document for sprite creation
global.document = {
    createElement: (tag) => {
        if (tag === 'canvas') {
            return {
                width: 256,
                height: 64,
                getContext: () => ({
                    fillStyle: '',
                    font: '',
                    textAlign: '',
                    fillText: jest.fn()
                })
            };
        }
        return {};
    }
};
