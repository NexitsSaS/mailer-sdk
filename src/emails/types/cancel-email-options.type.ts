import { StandardError } from "../../common/types/error.types";

export interface CancelEmailResponse {
  data: { id: string; object: "email" } | null;
  error: StandardError | null;
}
