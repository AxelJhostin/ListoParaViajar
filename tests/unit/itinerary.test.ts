import { describe, expect, it } from "vitest";
import {
  formatCountdown,
  nextReminderThreshold,
  preparationTimes,
  zonedDateTimeToTimestamp,
} from "@/domain/itinerary";
import { defaults } from "@/domain/models";

describe("flight countdowns", () => {
  it("converts each airport's local departure time to the correct instant", () => {
    expect(
      new Date(
        zonedDateTimeToTimestamp("2026-09-14", "14:20", "America/Guayaquil")!,
      ).toISOString(),
    ).toBe("2026-09-14T19:20:00.000Z");
    expect(
      new Date(
        zonedDateTimeToTimestamp("2026-09-25", "08:55", "America/Toronto")!,
      ).toISOString(),
    ).toBe("2026-09-25T12:55:00.000Z");
  });

  it("calculates airport arrival and lodging departure independently", () => {
    const leg = {
      ...defaults("leg"),
      description: "Manta → Quito",
      date: "2026-09-14",
      time: "14:20",
      timezone: "America/Guayaquil",
      departureType: "Traslado al aeropuerto" as const,
      airportLeadMinutes: 120,
      travelMinutes: 35,
    };
    const timing = preparationTimes(leg)!;
    expect(new Date(timing.ready).toISOString()).toBe(
      "2026-09-14T17:20:00.000Z",
    );
    expect(new Date(timing.leave!).toISOString()).toBe(
      "2026-09-14T16:45:00.000Z",
    );
  });

  it("selects only the most urgent unsent reminder", () => {
    expect(nextReminderThreshold(10 * 60_000, [])).toBe(15);
    expect(nextReminderThreshold(30 * 60_000, [60])).toBeNull();
    expect(nextReminderThreshold(25 * 60 * 60_000, [])).toBeNull();
  });

  it("formats a live countdown", () => {
    expect(formatCountdown(90_000)).toBe("1 min · 30 s");
    expect(formatCountdown(0)).toBe("El vuelo ya salió");
  });
});
