import { describe, expect, it } from "vitest";

import { analyzeTravelRequest } from "../../src/domain/travel-policy.js";
import type { TravelRequestInput } from "../../src/domain/travel-request.js";

function makeInput(overrides: Partial<TravelRequestInput> = {}): TravelRequestInput {
  return {
    requestId: "TR-100",
    requesterName: "Grace Hopper",
    requesterType: "employee",
    destination: "Parnaiba",
    departureDate: "2026-08-10",
    returnDate: "2026-08-12",
    reason: "Attend institutional technical meeting",
    transportCostInCents: 12_000,
    ...overrides,
  };
}

describe("analyzeTravelRequest", () => {
  it("keeps the public output shape for an approved request", () => {
    expect(analyzeTravelRequest(makeInput())).toEqual({
      requestId: "TR-100",
      status: "approved",
      travelDays: 3,
      dailyAmountInCents: 18_000,
      subtotalInCents: 54_000,
      totalAmountInCents: 66_000,
      errors: [],
      warnings: [],
    });
  });

  it("rejects invalid calendar dates without calculating amounts from days", () => {
    const output = analyzeTravelRequest(
      makeInput({
        departureDate: "2026-02-30",
        returnDate: "2026-03-01",
      }),
    );

    expect(output.status).toBe("rejected");
    expect(output.travelDays).toBe(0);
    expect(output.subtotalInCents).toBe(0);
    expect(output.totalAmountInCents).toBe(12_000);
    expect(output.errors).toEqual([
      "departureDate must be a valid YYYY-MM-DD date",
    ]);
  });

  it("marks a high total amount as pending review", () => {
    const output = analyzeTravelRequest(
      makeInput({
        requesterType: "manager",
        departureDate: "2026-12-01",
        returnDate: "2026-12-05",
        transportCostInCents: 60_000,
      }),
    );

    expect(output.status).toBe("pending-review");
    expect(output.totalAmountInCents).toBe(210_000);
  });

  it("warns when a long trip has a short reason", () => {
    const output = analyzeTravelRequest(
      makeInput({
        departureDate: "2026-11-01",
        returnDate: "2026-11-07",
        reason: "Meeting",
      }),
    );

    expect(output.status).toBe("pending-review");
    expect(output.warnings).toEqual([
      "long travel requests should include a detailed reason",
    ]);
  });
});
