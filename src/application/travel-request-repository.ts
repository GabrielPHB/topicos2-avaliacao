import type {
  TravelRequestOutput,
  TravelRequestRecord,
} from "../domain/travel-request.js";

export interface TravelRequestRepository {
  save(record: TravelRequestRecord): Promise<void>;
  findById(requestId: string): Promise<TravelRequestRecord | null>;
}

export type PersistedTravelRequestAnalysis = {
  output: TravelRequestOutput;
  saved: boolean;
};
