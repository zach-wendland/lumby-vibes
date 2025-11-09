/**
 * Test setup - Mock THREE.js for Jest
 */

// Mock THREE.js globally
global.THREE = {
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
            return new Vector3(this.x, this.y, this.z);
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
        distanceTo(v) {
            const dx = this.x - v.x;
            const dy = this.y - v.y;
            const dz = this.z - v.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
    },
    Group: class Group {
        constructor() {
            this.children = [];
            this.position = new THREE.Vector3();
            this.rotation = { x: 0, y: 0, z: 0 };
            this.scale = { x: 1, y: 1, z: 1 };
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
    Mesh: class Mesh {
        constructor(geometry, material) {
            this.geometry = geometry;
            this.material = material;
            this.position = new THREE.Vector3();
            this.rotation = { x: 0, y: 0, z: 0 };
            this.scale = { x: 1, y: 1, z: 1 };
            this.castShadow = false;
            this.receiveShadow = false;
        }
    },
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
    MeshLambertMaterial: class MeshLambertMaterial {
        constructor(options = {}) {
            this.color = options.color || 0xffffff;
        }
    },
    MeshBasicMaterial: class MeshBasicMaterial {
        constructor(options = {}) {
            this.color = options.color || 0xffffff;
        }
    },
    Sprite: class Sprite {
        constructor(material) {
            this.material = material;
            this.position = new THREE.Vector3();
            this.scale = { x: 1, y: 1, z: 1 };
        }
        lookAt(vector) {
            // Mock implementation
        }
    },
    SpriteMaterial: class SpriteMaterial {
        constructor(options = {}) {
            this.map = options.map;
        }
    },
    CanvasTexture: class CanvasTexture {
        constructor(canvas) {
            this.canvas = canvas;
        }
    },
    PlaneGeometry: class PlaneGeometry {
        constructor(width, height) {
            this.width = width;
            this.height = height;
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
