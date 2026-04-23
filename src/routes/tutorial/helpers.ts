import type {
  Context,
  EntityJson,
  TypeAndId,
} from "@cedar-policy/cedar-wasm";

export function renderEntitiesString(
    entities: EntityJson[],
    extraIndentSpaces = 4,
) {
    const padString = new Array(extraIndentSpaces).fill(' ').join('');
    const stringifiedEntitiesLines = JSON.stringify(entities, null, 4).split(
        "\n",
    );
    // don't pad the first line
    const stringifiedEntitiesLinesWithPadding = [
        stringifiedEntitiesLines[0],
        ...stringifiedEntitiesLines.slice(1).map((line) => padString + line),
    ];
    return stringifiedEntitiesLinesWithPadding.join('\n');
}

export function renderContextString(context: any, extraIndentSpaces = 4) {
    const padString = new Array(extraIndentSpaces).fill(' ').join('');
    const stringifiedEntityLines = JSON.stringify(context, null, 4).split('\n');
    const stringifiedEntityLinesWithPadding = [
        stringifiedEntityLines[0],
        ...stringifiedEntityLines.slice(1).map((line) => padString + line),
    ];
    return stringifiedEntityLinesWithPadding.join('\n');
}

export function typeAndIdToFormattedString(input: TypeAndId): string {
    return `${input.type}::"${input.id}"`;
}

export function renderRustCode(
    principal: TypeAndId,
    action: TypeAndId,
    resource: TypeAndId,
    context: Context,
    policies: string,
    entities: EntityJson[],
) {
    const code = `use cedar_policy::{Request, PolicySet, Authorizer, Entities, Context, EntityUid};

let principal = EntityUid::from_str(${JSON.stringify(typeAndIdToFormattedString(principal))}).expect("entity parse error");
let action = EntityUid::from_str(${JSON.stringify(typeAndIdToFormattedString(action))}).expect("entity parse error");
let resource = EntityUid::from_str(${JSON.stringify(typeAndIdToFormattedString(resource))}).expect("entity parse error");

let context_json_val: serde_json::value::Value = serde_json::json!(${renderContextString(context, 0)});
let context = Context::from_json_value(context_json_val, None).unwrap();

let request: Request = Request::new(principal, action, resource, context, None).expect("request validation error");

let policies_str = r#"${policies.trim()}"#;
let policy_set = PolicySet::from_str(policies_str).expect("policy parse error");

let entities_json = r#"${renderEntitiesString(entities, 0)}"#;
let entities = Entities::from_json_str(entities_json, None).expect("entity parse error");

let authorizer = Authorizer::new();
let decision = authorizer.is_authorized(&request, &policy_set, &entities);
`;
    return code;
}

export function renderRustCodeUsingJson(
    principal: string,
    action: string,
    resource: string,
    context: any,
    policies: string,
    entities: EntityJson[],
) {
    const authorizationCall = {
        principal,
        action,
        resource,
        context: '%%CONTEXT%%',
        slice: {
            policies,
            entities: '%%ENTITIES%%',
        },
    };
    let code = `use cedar_policy::frontend::is_authorized::json_is_authorized;

let call = r#"${JSON.stringify(authorizationCall, null, 4)}"#;
let decision = json_is_authorized(call);`;

    code = code.replace('"%%CONTEXT%%"', renderContextString(context, 4));
    code = code.replace('"%%ENTITIES%%"', renderEntitiesString(entities, 8));
    return code;
}
