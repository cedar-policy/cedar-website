import type { CedarEntityIdObj } from "../../cedar-utils";

export interface SampleAuthorizationQuery {
  queryTitle: string;
  principal: CedarEntityIdObj;
  action: CedarEntityIdObj;
  resource: CedarEntityIdObj;
  context: string;
  entities: string;
}

export interface SampleApp {
  name: SampleAppName;
  queries: SampleAuthorizationQuery[];
  policy: string;
  schema: string;
}

export type SampleAppName =
  | "PhotoFlash"
  | "HealthCare"
  | "Kubernetes"
  | "JITNA";
