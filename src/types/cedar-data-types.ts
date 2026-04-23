/**
 * Cedar entity and attribute type definitions.
 * These represent the Cedar data model used by the playground
 * for entity/context/attribute manipulation.
 */

export interface EntityIdentifier {
    entityType: string;
    entityId: string;
}

export interface AttributeValue {
    boolean?: boolean;
    long?: number;
    string?: string;
    entityIdentifier?: EntityIdentifier;
    set?: AttributeValue[];
    record?: Record<string, AttributeValue>;
}

export type ContextMap = Record<string, AttributeValue>;

export interface EntityItem {
    identifier: EntityIdentifier;
    attributes?: Record<string, AttributeValue>;
    parents?: EntityIdentifier[];
}
