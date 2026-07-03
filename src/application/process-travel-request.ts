import type {
  TravelRequestInput,
  TravelRequestOutput,
} from "../domain/travel-request.js";
import { ProcessTravelRequestUseCase } from "./process-travel-request-use-case.js";

const processTravelRequestUseCase = new ProcessTravelRequestUseCase();

export function processTravelRequest(
  input: TravelRequestInput,
): TravelRequestOutput {
  return processTravelRequestUseCase.execute(input);
}
