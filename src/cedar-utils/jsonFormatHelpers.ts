// Copied from src/cedar-editor/jsonFormatHelpers.ts — pure data-shape helpers only.
// All Ace/LSP/editor imports have been stripped; only type imports from
// '@cedar-policy/cedar-wasm' and the local AVP data types remain.
import type {
  AttributeValue,
  EntityIdentifier,
  EntityItem,
} from "../types/cedar-data-types";
import type {
  CedarValueJson,
  EntityJson,
  EntityUidJson,
  TypeAndId,
} from "@cedar-policy/cedar-wasm";

export function isCedarAttrEntityType(
  attr: CedarValueJson,
): attr is { __entity: TypeAndId } {
  if (!attr) {
    return false;
  }
  if (typeof attr !== "object" || !("__entity" in attr)) {
    return false;
  }
  const e = attr.__entity;
  if (typeof e !== "object" || !e || !("type" in e) || !("id" in e)) {
    return false;
  }
  const { type, id } = e;
  if (typeof type !== "string" || typeof id !== "string") {
    return false;
  }
  return true;
}

export function isCedarAttrRecordType(
  attr: CedarValueJson,
): attr is { [key: string]: CedarValueJson } {
  if (!attr) {
    return false;
  }
  if (
    typeof attr !== "object" ||
    "__entity" in attr ||
    "__extn" in attr ||
    Array.isArray(attr)
  ) {
    return false;
  }
  return true;
}

function validateAVPEntityIdentifier(
  identifier: EntityIdentifier | undefined,
): void {
  const euidStr = JSON.stringify(identifier);
  if (typeof identifier !== "object") {
    throw new Error("Entity identifier must be an object.");
  }
  if (
    !identifier.entityType ||
    typeof identifier.entityType !== "string" ||
    identifier.entityType.trim() === ""
  ) {
    throw new Error(`EntityType missing or not a string: ${euidStr}`);
  }
  if (
    !identifier.entityId ||
    typeof identifier.entityType !== "string" ||
    identifier.entityId.trim() === ""
  ) {
    throw new Error(`EntityId missing or not a string: ${euidStr}`);
  }
  if (Object.keys(identifier).length > 2) {
    throw new Error(`Invalid keys in entity identifier: ${euidStr}`);
  }
}

export function entityIdentifierToString(
  identifier: EntityIdentifier | undefined,
): string {
  validateAVPEntityIdentifier(identifier);
  return `${identifier?.entityType}::"${identifier?.entityId}"`;
}

export function convertEntityIdentifierToCedarEntityId(
  identifier: EntityIdentifier | undefined,
): TypeAndId {
  validateAVPEntityIdentifier(identifier);
  return {
    type: identifier?.entityType || "",
    id: identifier?.entityId || "",
  };
}

/** For ease of access, converts either format of a Cedar EUID object into the type/id format. */
function flattenCedarUid(uid: EntityUidJson): TypeAndId {
  if ("__entity" in uid) {
    return uid.__entity;
  }
  return uid;
}

export function euidStringToExprFormat(stringifiedEID: string) {
  if (typeof stringifiedEID === "object" && "__expr" in stringifiedEID) {
    // conversion is already there, return
    return stringifiedEID;
  }
  if (!stringifiedEID?.includes?.("::")) {
    throw new Error(`EntityUID ${stringifiedEID} malformed.`);
  }
  return { __expr: stringifiedEID };
}

export function stringToEntityIdentifier(stringifiedEID: string) {
  // todo: replace with call to wasm to parse euid
  const hasTwoDoubleQuotes = (stringifiedEID?.split?.('"') || []).length >= 3;
  if (!stringifiedEID?.includes?.("::") || !hasTwoDoubleQuotes) {
    throw new Error(`${stringifiedEID} is not a valid entity id`);
  }
  const segments = stringifiedEID.split('"');
  const namespaceAndType = segments[0].split("::").slice(0, -1);
  return {
    EntityType: namespaceAndType.join("::"),
    EntityId: segments[1],
  };
}

function convertAttributeValueToCedarValue(
  attr: AttributeValue,
): CedarValueJson {
  const attrStr = JSON.stringify(attr);
  if (typeof attr !== "object") {
    throw new Error(`Attribute value must be an object: ${attrStr}`);
  }
  if (Object.keys(attr).length !== 1) {
    throw new Error(`Attribute value must have one key: ${attrStr}`);
  }
  const typeMismatchError = `Invalid value type for attribute: ${attrStr}`;
  if ("boolean" in attr) {
    if (typeof attr.boolean !== "boolean") {
      throw new Error(typeMismatchError);
    }
    return attr.boolean;
  }
  if ("long" in attr) {
    if (typeof attr.long !== "number") {
      throw new Error(typeMismatchError);
    }
    return attr.long;
  }
  if ("string" in attr) {
    if (typeof attr.string !== "string") {
      throw new Error(typeMismatchError);
    }
    return attr.string;
  }
  if ("entityIdentifier" in attr) {
    return {
      __entity: convertEntityIdentifierToCedarEntityId(attr.entityIdentifier),
    };
  }
  if ("set" in attr) {
    if (!Array.isArray(attr.set)) {
      throw new Error(typeMismatchError);
    }
    return (attr.set || []).map((e: AttributeValue) =>
      convertAttributeValueToCedarValue(e),
    );
  }
  if ("record" in attr) {
    if (typeof attr.record !== "object") {
      throw new Error(typeMismatchError);
    }
    return avpAttributesToCedarRecord(attr.record);
  }
  throw new Error(
    `Unrecognized attribute type for attribute: ${JSON.stringify(attr)}`,
  );
}

export function avpAttributesToCedarRecord(
  attributes: { [key: string]: AttributeValue } | undefined,
): Record<string, CedarValueJson> {
  if (!attributes) {
    return {};
  }
  const result: Record<string, CedarValueJson> = {};
  if (typeof attributes !== "object" || Array.isArray(attributes)) {
    throw new Error("Attributes must be a record object.");
  }
  for (const key in attributes) {
    result[key] = convertAttributeValueToCedarValue(attributes[key]);
  }
  return result;
}

export function AVPEntityToCedarEntity(avpEntity: EntityItem): EntityJson {
  if (typeof avpEntity !== "object") {
    throw new Error(`Entity must be an object: ${avpEntity}`);
  }
  const validEntityKeys = ["attributes", "identifier", "parents"];
  for (const key in avpEntity) {
    if (!validEntityKeys.includes(key)) {
      throw new Error(
        `Invalid key '${key}' in entity ${entityIdentifierToString(avpEntity.identifier)}`,
      );
    }
  }
  if (avpEntity.parents && !Array.isArray(avpEntity.parents)) {
    throw new Error(
      `Parents for entity ${entityIdentifierToString(avpEntity.identifier)} must be an array`,
    );
  }
  let parents: EntityUidJson[] = [];
  if (avpEntity.parents && Array.isArray(avpEntity.parents)) {
    parents = avpEntity.parents.map((avpEntityParent: EntityIdentifier) => ({
      type: avpEntityParent.entityType || "", // these can't really be undefined
      id: avpEntityParent.entityId || "",
    }));
  }
  if (avpEntity.attributes && typeof avpEntity.attributes !== "object") {
    throw new Error(
      `Attributes for entity ${entityIdentifierToString(avpEntity.identifier)} must be a record object.`,
    );
  }
  const hasAttributes = Object.keys(avpEntity.attributes || {}).length > 0;
  return {
    uid: convertEntityIdentifierToCedarEntityId(avpEntity.identifier),
    attrs: hasAttributes
      ? avpAttributesToCedarRecord(avpEntity.attributes)
      : {},
    parents,
  };
}

function convertAttrToAVPAttribute(attrVal: CedarValueJson): AttributeValue {
  if (typeof attrVal === "boolean") {
    return { boolean: attrVal };
  }
  if (typeof attrVal === "number") {
    return { long: attrVal };
  }
  if (typeof attrVal === "string") {
    return { string: attrVal };
  }
  if (Array.isArray(attrVal)) {
    return {
      set: attrVal.map((innerAttr) => {
        return convertAttrToAVPAttribute(innerAttr);
      }),
    };
  }
  if (typeof attrVal === "object" && attrVal) {
    if (isCedarAttrEntityType(attrVal)) {
      const entityIdObj = attrVal.__entity;
      return {
        entityIdentifier: {
          entityType: entityIdObj.type,
          entityId: entityIdObj.id,
        },
      };
    }
    return {
      /**
       * Used type coercion here because TS raises errors about `{ __extn: { fn: string, arg: CedarValueJson } }`
       * not working for this function call, when it works the same as a record object would.
       */
      record: cedarAttrsToAVPAttributes(attrVal),
    };
  }
  throw new Error(`Unrecognized type for attribute with value ${attrVal}`);
}

export function cedarAttrsToAVPAttributes(
  attrs: Record<string, CedarValueJson>,
): Record<string, AttributeValue> {
  if (!attrs) {
    return {};
  }
  const result: Record<string, AttributeValue> = {};
  for (const key in attrs) {
    result[key] = convertAttrToAVPAttribute(attrs[key]);
  }
  return result;
}

export function cedarEntityToAVP(cedarEntity: EntityJson): EntityItem {
  const hasAttributes = Object.keys(cedarEntity.attrs || {}).length > 0;
  const { type, id } = flattenCedarUid(cedarEntity.uid);
  const avpEntity: EntityItem = {
    identifier: {
      entityType: type,
      entityId: id,
    },
  };
  if (hasAttributes) {
    avpEntity.attributes = cedarAttrsToAVPAttributes(cedarEntity.attrs);
  }
  if (Array.isArray(cedarEntity.parents)) {
    avpEntity.parents = cedarEntity.parents.map((avpEid: EntityUidJson) => {
      const { type, id } = flattenCedarUid(avpEid);
      return {
        entityType: type,
        entityId: id,
      };
    });
  }
  return avpEntity;
}

export function cedarEntitiesToAVPEntities(
  entities: EntityJson[],
): EntityItem[] {
  return entities.map((cedarEntity) => cedarEntityToAVP(cedarEntity));
}

export function avpEntitiesToCedarEntities(
  avpEntities: EntityItem[],
): EntityJson[] {
  if (!Array.isArray(avpEntities)) {
    throw new Error("Entities must be in an array");
  }
  return avpEntities.map((stringifiedAVPEntities: EntityItem) =>
    AVPEntityToCedarEntity(stringifiedAVPEntities),
  );
}

export function validateAVPAttributes(avpAttributes: {
  [key: string]: AttributeValue;
}) {
  let errorMessage: string | undefined;
  try {
    avpAttributesToCedarRecord(avpAttributes);
  } catch (exx) {
    const err = exx as Error;
    errorMessage = err.message;
  }
  return errorMessage;
}

export function validateAVPEntities(avpEntities: EntityItem[]) {
  let errorMessage: string | undefined;
  try {
    avpEntitiesToCedarEntities(avpEntities);
  } catch (exx) {
    const err = exx as Error;
    errorMessage = err.message;
  }
  return errorMessage;
}
