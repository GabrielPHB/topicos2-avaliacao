import { describe, expect, it } from "vitest";

import { PostgresTravelRequestRepository } from "../../src/infra/postgres-travel-request-repository.js";
import type { TravelRequestRecord } from "../../src/domain/travel-request.js";

type QueryCall = {
  sql: string;
  values: unknown[];
};

class FakePgClient {
  readonly calls: QueryCall[] = [];
  rows: unknown[] = [];

  async query<T>(sql: string, values: unknown[]): Promise<{ rows: T[] }> {
    this.calls.push({ sql, values });

    return { rows: this.rows as T[] };
  }
}

function makeRecord(): TravelRequestRecord {
  return {
    input: {
      requestId: "TR-300",
      requesterName: "Dorothy Vaughan",
      requesterType: "student",
      destination: "Floriano",
      departureDate: "2026-10-01",
      returnDate: "2026-10-03",
      reason: "Join an academic extension activity",
      transportCostInCents: 10_000,
    },
    output: {
      requestId: "TR-300",
      status: "approved",
      travelDays: 3,
      dailyAmountInCents: 9_000,
      subtotalInCents: 27_000,
      totalAmountInCents: 37_000,
      errors: [],
      warnings: [],
    },
    createdAt: new Date("2026-07-03T12:00:00.000Z"),
  };
}

describe("PostgresTravelRequestRepository", () => {
  it("sends a complete upsert command when saving a record", async () => {
    const client = new FakePgClient();
    const repository = new PostgresTravelRequestRepository(client);

    await repository.save(makeRecord());

    expect(client.calls[0]?.sql).toContain("INSERT INTO travel_requests");
    expect(client.calls[0]?.values).toEqual([
      "TR-300",
      "Dorothy Vaughan",
      "student",
      "Floriano",
      "2026-10-01",
      "2026-10-03",
      "Join an academic extension activity",
      "approved",
      3,
      9_000,
      27_000,
      10_000,
      37_000,
      "[]",
      "[]",
      "2026-07-03T12:00:00.000Z",
    ]);
  });

  it("maps a database row back to a domain record", async () => {
    const client = new FakePgClient();
    client.rows = [
      {
        id: "TR-300",
        requester_name: "Dorothy Vaughan",
        requester_type: "student",
        destination: "Floriano",
        departure_date: "2026-10-01",
        return_date: "2026-10-03",
        reason: "Join an academic extension activity",
        status: "approved",
        travel_days: 3,
        daily_amount_in_cents: 9_000,
        subtotal_in_cents: 27_000,
        transport_cost_in_cents: 10_000,
        total_amount_in_cents: 37_000,
        errors_json: "[]",
        warnings_json: "[]",
        created_at: "2026-07-03T12:00:00.000Z",
      },
    ];
    const repository = new PostgresTravelRequestRepository(client);

    const record = await repository.findById("TR-300");

    expect(record).toEqual(makeRecord());
  });
});
