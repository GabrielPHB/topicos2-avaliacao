import type {
  RequesterType,
  TravelRequestInput,
  TravelRequestOutput,
  TravelRequestStatus,
} from "./travel-request.js";

const millisecondsPerDay = 86_400_000;
const pendingReviewTravelDays = 5;
const pendingReviewTotalInCents = 200_000;
const detailedReasonMinimumLength = 30;

const dailyAmountByRequesterType: Record<RequesterType, number> = {
  student: 9_000,
  employee: 18_000,
  professor: 25_000,
  manager: 30_000,
};

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [yearValue, monthValue, dayValue] = value.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function getUtcDayNumber(value: string): number {
  const [year, month, day] = value.split("-").map(Number);

  return Date.UTC(year, month - 1, day);
}

function getDailyAmountInCents(requesterType: RequesterType): number {
  return dailyAmountByRequesterType[requesterType] ?? 0;
}

function validateRequiredFields(input: TravelRequestInput): string[] {
  const errors: string[] = [];

  if (!input.requestId) {
    errors.push("requestId is required");
  }
  if (!input.requesterName) {
    errors.push("requesterName is required");
  }
  if (!input.requesterType) {
    errors.push("requesterType is required");
  }
  if (!input.destination) {
    errors.push("destination is required");
  }
  if (!input.departureDate) {
    errors.push("departureDate is required");
  }
  if (!input.returnDate) {
    errors.push("returnDate is required");
  }

  return errors;
}

function calculateTravelDays(input: TravelRequestInput, errors: string[]): number {
  let invalidDepartureDate = false;
  let invalidReturnDate = false;

  if (input.departureDate) {
    if (!isValidDate(input.departureDate)) {
      errors.push("departureDate must be a valid YYYY-MM-DD date");
      invalidDepartureDate = true;
    }
  } else {
    invalidDepartureDate = true;
  }

  if (input.returnDate) {
    if (!isValidDate(input.returnDate)) {
      errors.push("returnDate must be a valid YYYY-MM-DD date");
      invalidReturnDate = true;
    }
  } else {
    invalidReturnDate = true;
  }

  if (invalidDepartureDate || invalidReturnDate) {
    return 0;
  }

  const departureDay = getUtcDayNumber(input.departureDate);
  const returnDay = getUtcDayNumber(input.returnDate);

  if (returnDay < departureDay) {
    errors.push("returnDate cannot be before departureDate");
    return 0;
  }

  return Math.floor((returnDay - departureDay) / millisecondsPerDay) + 1;
}

function collectWarnings(input: TravelRequestInput, travelDays: number): string[] {
  if (
    travelDays > pendingReviewTravelDays &&
    input.reason.length < detailedReasonMinimumLength
  ) {
    return ["long travel requests should include a detailed reason"];
  }

  return [];
}

function decideStatus(
  errors: string[],
  travelDays: number,
  totalAmountInCents: number,
): TravelRequestStatus {
  if (errors.length > 0) {
    return "rejected";
  }

  if (
    travelDays > pendingReviewTravelDays ||
    totalAmountInCents > pendingReviewTotalInCents
  ) {
    return "pending-review";
  }

  return "approved";
}

export function analyzeTravelRequest(
  input: TravelRequestInput,
): TravelRequestOutput {
  const errors = validateRequiredFields(input);
  const travelDays = calculateTravelDays(input, errors);
  const dailyAmountInCents = getDailyAmountInCents(input.requesterType);
  const subtotalInCents = travelDays * dailyAmountInCents;
  const totalAmountInCents = subtotalInCents + input.transportCostInCents;
  const warnings = collectWarnings(input, travelDays);
  const status = decideStatus(errors, travelDays, totalAmountInCents);

  return {
    requestId: input.requestId,
    status,
    travelDays,
    dailyAmountInCents,
    subtotalInCents,
    totalAmountInCents,
    errors,
    warnings,
  };
}
