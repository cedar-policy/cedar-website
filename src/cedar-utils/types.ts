// Re-exports / aliases of cedar-wasm types to preserve old import names where needed.
export type {
  Context,
  EntityJson,
  SchemaJson,
  EntityUid,
  EntityUidJson,
  TypeAndId,
} from "@cedar-policy/cedar-wasm";
import type { EntityJson, TypeAndId } from "@cedar-policy/cedar-wasm";
// Backwards-compatible aliases used by existing call sites
export type CedarEntity = EntityJson;
export type CedarEntityIdObj = TypeAndId;
