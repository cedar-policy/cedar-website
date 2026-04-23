import type {
  AuthorizationAnswer,
  ValidationAnswer,
} from "@cedar-policy/cedar-wasm";
import { TranslateFunction } from "../hooks/useTranslations";

// success/failure depends on context
// if a decision call, success/failure is synonomous with allow/deny
// if a validation call, success/failure is synonomous with valid/invalid
export interface DecisionAndValidationOutputForUI {
  status: "success" | "warning" | "failure" | "error";
  message: string;
  errors: string[];
  warnings: string[];
}

// Local status keys — previously sourced from cedar-editor/code-editor/errorUtils.
// Kept here so the translation lookup below continues to work unchanged.
type StatusKeyType =
  | "CEDAR_LOAD_ERROR"
  | "CEDAR_INTERNAL_ERROR"
  | "PARSE_ERROR"
  | "SCHEMA_PARSE_ERROR"
  | "ALLOW_AUTH"
  | "DENY_AUTH"
  | "VALIDATION_SUCCESS"
  | "VALIDATION_FAILURE";

export const statusKeyToTranslationKey: Record<StatusKeyType, string> = {
  CEDAR_LOAD_ERROR: "waterfordRust.isAuth.cedarError",
  CEDAR_INTERNAL_ERROR: "waterfordRust.isAuth.internalError",
  PARSE_ERROR: "waterfordRust.isAuth.parseError",
  SCHEMA_PARSE_ERROR: "waterfordRust.schema.parseError",
  ALLOW_AUTH: "waterfordRust.isAuth.allowAuth",
  DENY_AUTH: "waterfordRust.isAuth.denyAuth",
  VALIDATION_SUCCESS: "waterfordRust.validate.success",
  VALIDATION_FAILURE: "waterfordRust.validate.failure",
};

export function getSchemaParseError(
  t: TranslateFunction,
): DecisionAndValidationOutputForUI {
  return {
    status: "error",
    message: t(statusKeyToTranslationKey.SCHEMA_PARSE_ERROR),
    errors: [],
    warnings: [],
  };
}

export function convertCedarAuthOutputToIntlOutput(
  result: AuthorizationAnswer,
  t: TranslateFunction,
): DecisionAndValidationOutputForUI {
  if (result.type === "failure") {
    const { errors } = result;
    const statusKey: StatusKeyType = "CEDAR_INTERNAL_ERROR";
    return {
      status: "error",
      message: t(statusKeyToTranslationKey[statusKey]),
      errors: errors.map((e) => e.message) || [],
      warnings: [],
    };
  }

  // Success
  const { response } = result;
  const { decision: authDecision } = response;
  const statusKey: StatusKeyType =
    authDecision === "allow" ? "ALLOW_AUTH" : "DENY_AUTH";

  return {
    status: authDecision === "allow" ? "success" : "failure",
    message: t(statusKeyToTranslationKey[statusKey]),
    errors: response.diagnostics.errors.map(
      ({ policyId, error }) =>
        `${error.code || "Error"} at ${policyId}: ${error.message}; ${error.help || ""}`,
    ),
    warnings: [],
  };
}

export function convertCedarValidationOutputToIntlOutput(
  result: ValidationAnswer,
  t: TranslateFunction,
): DecisionAndValidationOutputForUI {
  if (result.type === "failure") {
    const { errors } = result;
    const statusKey: StatusKeyType = "VALIDATION_FAILURE";
    return {
      status: "failure",
      message: t(statusKeyToTranslationKey[statusKey]),
      errors: errors.map((e) => e.message) || [],
      warnings: [],
    };
  }

  // Valid, but with issues
  const { validationErrors, validationWarnings, otherWarnings } = result;
  const hasIssues =
    validationErrors.length > 0 ||
    validationWarnings.length > 0 ||
    otherWarnings.length > 0;

  if (hasIssues) {
    const warnings = validationWarnings.map((e) => e.error.message) || [];
    const othrWarnings = otherWarnings.map((e) => e.message) || [];

    return {
      status: "warning",
      message: "Policy semantics are invalid",
      errors: validationErrors.map((e) => e.error.message) || [],
      warnings: [...warnings, ...othrWarnings],
    };
  }

  const statusKey: StatusKeyType = "VALIDATION_SUCCESS";

  // Valid
  return {
    status: "success",
    message: t(statusKeyToTranslationKey[statusKey]), // All policies validated successfully.
    errors: [],
    warnings: [],
  };
}
