import { analyzeTravelRequest } from "../domain/travel-policy.js";
import type {
  TravelRequestInput,
  TravelRequestOutput,
} from "../domain/travel-request.js";
import type {
  PersistedTravelRequestAnalysis,
  TravelRequestRepository,
} from "./travel-request-repository.js";

export class ProcessTravelRequestUseCase {
  constructor(private readonly repository?: TravelRequestRepository) {}

  execute(input: TravelRequestInput): TravelRequestOutput {
    return analyzeTravelRequest(input);
  }

  async executeAndSave(
    input: TravelRequestInput,
  ): Promise<PersistedTravelRequestAnalysis> {
    const output = this.execute(input);

    if (!this.repository) {
      return { output, saved: false };
    }

    await this.repository.save({
      input,
      output,
      createdAt: new Date(),
    });

    return { output, saved: true };
  }
}
