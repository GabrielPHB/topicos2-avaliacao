import { describe, expect, it } from "vitest";

import { ProcessTravelRequestUseCase } from "../../src/application/process-travel-request-use-case.js";
import type { TravelRequestRepository } from "../../src/application/travel-request-repository.js";
import type {
  TravelRequestInput,
  TravelRequestRecord,
} from "../../src/domain/travel-request.js";

function makeInput(): TravelRequestInput {
  return {
    requestId: "TR-200",
    requesterName: "Katherine Johnson",
    requesterType: "professor",
    destination: "Teresina",
    departureDate: "2026-09-01",
    returnDate: "2026-09-02",
    reason: "Present institutional research results",
    transportCostInCents: 15_000,
  };
}

class InMemoryTravelRequestRepository implements TravelRequestRepository {
  private readonly records = new Map<string, TravelRequestRecord>();

  async save(record: TravelRequestRecord): Promise<void> {
    this.records.set(record.input.requestId, record);
  }

  async findById(requestId: string): Promise<TravelRequestRecord | null> {
    return this.records.get(requestId) ?? null;
  }
}

describe("ProcessTravelRequestUseCase", () => {
  it("processes a request without requiring persistence", () => {
    const useCase = new ProcessTravelRequestUseCase();

    expect(useCase.execute(makeInput()).totalAmountInCents).toBe(65_000);
  });

  it("saves the generated analysis when a repository is provided", async () => {
    const repository = new InMemoryTravelRequestRepository();
    const useCase = new ProcessTravelRequestUseCase(repository);

    const result = await useCase.executeAndSave(makeInput());
    const savedRecord = await repository.findById("TR-200");

    expect(result.saved).toBe(true);
    expect(savedRecord?.output).toEqual(result.output);
  });
});
