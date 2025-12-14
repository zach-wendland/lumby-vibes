/**
 * Type Guards - Runtime type checking for game entities
 * Replaces string-based type checks with compile-time verified guards
 */

import * as THREE from 'three';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { NPC } from '../entities/NPC';

/**
 * Entity types enum - single source of truth for entity type strings
 */
export const EntityType = {
    PLAYER: 'player',
    ENEMY: 'enemy',
    NPC: 'npc',
    RESOURCE: 'resource',
    TERRAIN: 'terrain'
} as const;

export type EntityTypeName = typeof EntityType[keyof typeof EntityType];

/**
 * Resource data stored in userData
 * Note: The full Resource interface is internal to Lumbridge/SkillsSystem
 * This type is intentionally minimal for type guard purposes
 */
export interface ResourceData {
    type: string;
    name: string;
    levelRequired: number;
    depleted: boolean;
    // Additional properties exist but are handled by systems
    [key: string]: unknown;
}

/**
 * Typed userData interface
 */
export interface EntityUserData {
    type: EntityTypeName;
    entity?: Player | Enemy | NPC;
    resource?: ResourceData;
    npcType?: string;
    enemyType?: string;
}

/**
 * Type guard: Check if object has entity userData
 */
export function hasEntityUserData(object: THREE.Object3D | null | undefined): object is THREE.Object3D & { userData: EntityUserData } {
    if (!object) return false;
    return typeof object.userData?.type === 'string';
}

/**
 * Get entity type from object or its parent
 */
export function getEntityType(object: THREE.Object3D): EntityTypeName | null {
    const type = object.userData?.type || object.parent?.userData?.type;
    if (type && Object.values(EntityType).includes(type as EntityTypeName)) {
        return type as EntityTypeName;
    }
    return null;
}

/**
 * Get entity from object or its parent
 */
export function getEntity<T>(object: THREE.Object3D): T | null {
    return (object.userData?.entity || object.parent?.userData?.entity) as T | null;
}

/**
 * Type guard: Check if clicked object is terrain
 */
export function isTerrain(object: THREE.Object3D): boolean {
    return getEntityType(object) === EntityType.TERRAIN;
}

/**
 * Type guard: Check if clicked object is an enemy
 */
export function isEnemyObject(object: THREE.Object3D): boolean {
    return getEntityType(object) === EntityType.ENEMY;
}

/**
 * Type guard: Check if clicked object is an NPC
 */
export function isNPCObject(object: THREE.Object3D): boolean {
    return getEntityType(object) === EntityType.NPC;
}

/**
 * Type guard: Check if clicked object is a resource
 */
export function isResourceObject(object: THREE.Object3D): boolean {
    return getEntityType(object) === EntityType.RESOURCE;
}

/**
 * Type guard: Check if clicked object is the player
 */
export function isPlayerObject(object: THREE.Object3D): boolean {
    return getEntityType(object) === EntityType.PLAYER;
}

/**
 * Get enemy from clicked object (with type safety)
 */
export function getEnemyFromObject(object: THREE.Object3D): Enemy | null {
    if (!isEnemyObject(object)) return null;
    return getEntity<Enemy>(object);
}

/**
 * Get NPC from clicked object (with type safety)
 */
export function getNPCFromObject(object: THREE.Object3D): NPC | null {
    if (!isNPCObject(object)) return null;
    return getEntity<NPC>(object);
}

/**
 * Get resource data from clicked object (with type safety)
 */
export function getResourceFromObject(object: THREE.Object3D): ResourceData | null {
    if (!isResourceObject(object)) return null;
    return (object.userData?.resource || object.parent?.userData?.resource) as ResourceData | null;
}

/**
 * Type-safe entity extractor with discriminated result
 */
export type EntityResult =
    | { type: 'terrain'; point: THREE.Vector3 }
    | { type: 'enemy'; entity: Enemy }
    | { type: 'npc'; entity: NPC }
    | { type: 'resource'; resource: ResourceData }
    | { type: 'player' }
    | { type: 'unknown' };

/**
 * Extract typed entity from clicked object
 */
export function extractEntity(object: THREE.Object3D, point?: THREE.Vector3): EntityResult {
    const entityType = getEntityType(object);

    switch (entityType) {
        case EntityType.TERRAIN:
            return { type: 'terrain', point: point || new THREE.Vector3() };

        case EntityType.ENEMY: {
            const enemy = getEnemyFromObject(object);
            if (enemy) return { type: 'enemy', entity: enemy };
            break;
        }

        case EntityType.NPC: {
            const npc = getNPCFromObject(object);
            if (npc) return { type: 'npc', entity: npc };
            break;
        }

        case EntityType.RESOURCE: {
            const resource = getResourceFromObject(object);
            if (resource) return { type: 'resource', resource };
            break;
        }

        case EntityType.PLAYER:
            return { type: 'player' };
    }

    return { type: 'unknown' };
}
