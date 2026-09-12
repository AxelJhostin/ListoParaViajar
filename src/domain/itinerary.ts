import type { DataMap } from "./models";

export const reminderThresholds = [15, 60, 360, 1440] as const;

type Leg = DataMap["leg"];

function localParts(timestamp: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

export function zonedDateTimeToTimestamp(
  date: string,
  time: string,
  timeZone: string,
) {
  if (!date || !time || !timeZone) return null;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  try {
    const desired = Date.UTC(year, month - 1, day, hour, minute, 0);
    let guess = desired;
    for (let pass = 0; pass < 3; pass += 1) {
      const shown = localParts(guess, timeZone);
      const represented = Date.UTC(
        shown.year,
        shown.month - 1,
        shown.day,
        shown.hour,
        shown.minute,
        shown.second,
      );
      guess += desired - represented;
    }
    const verified = localParts(guess, timeZone);
    return verified.year === year &&
      verified.month === month &&
      verified.day === day &&
      verified.hour === hour &&
      verified.minute === minute
      ? guess
      : null;
  } catch {
    return null;
  }
}

export function departureTimestamp(leg: Leg) {
  return zonedDateTimeToTimestamp(leg.date, leg.time, leg.timezone);
}

export function arrivalTimestamp(leg: Leg) {
  return zonedDateTimeToTimestamp(
    leg.arrivalDate,
    leg.arrivalTime,
    leg.arrivalTimezone,
  );
}

export function itineraryPreferences(leg: Leg) {
  const journeyStart = leg.order === 0 || leg.order === 3;
  const departureType =
    leg.departureType || (journeyStart ? "Traslado al aeropuerto" : "Conexión");
  const defaultLead =
    departureType === "Conexión" ? 45 : leg.order === 3 ? 180 : 120;
  return {
    departureType,
    airportLeadMinutes: Number.isFinite(leg.airportLeadMinutes)
      ? leg.airportLeadMinutes
      : defaultLead,
    travelMinutes: Number.isFinite(leg.travelMinutes) ? leg.travelMinutes : 0,
  };
}

export function preparationTimes(leg: Leg) {
  const departure = departureTimestamp(leg);
  if (departure === null) return null;
  const preferences = itineraryPreferences(leg);
  const lead = Math.max(0, preferences.airportLeadMinutes) * 60_000;
  const ready = departure - lead;
  const leave =
    preferences.departureType === "Traslado al aeropuerto" &&
    preferences.travelMinutes > 0
      ? ready - preferences.travelMinutes * 60_000
      : null;
  return { departure, ready, leave };
}

export function formatCountdown(milliseconds: number) {
  if (milliseconds <= 0) return "El vuelo ya salió";
  const seconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  if (days > 0) return `${days} d · ${hours} h · ${minutes} min`;
  if (hours > 0) return `${hours} h · ${minutes} min · ${remainder} s`;
  return `${minutes} min · ${remainder} s`;
}

export function formatAtAirport(timestamp: number, timeZone: string) {
  return new Intl.DateTimeFormat("es-EC", {
    timeZone,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(timestamp));
}

export function nextReminderThreshold(
  remainingMilliseconds: number,
  delivered: readonly number[],
) {
  if (remainingMilliseconds <= 0) return null;
  const remainingMinutes = remainingMilliseconds / 60_000;
  const nearest = reminderThresholds.find(
    (threshold) => remainingMinutes <= threshold,
  );
  return nearest !== undefined && !delivered.includes(nearest) ? nearest : null;
}

export function reminderLabel(minutes: number) {
  if (minutes === 1440) return "24 horas";
  if (minutes >= 60) return `${minutes / 60} horas`;
  return `${minutes} minutos`;
}

export function formatMinutes(totalMinutes: number) {
  const minutes = Math.max(0, Math.floor(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours
    ? `${hours} h ${rest ? `${rest} min` : ""}`.trim()
    : `${rest} min`;
}

export function connectionWindows(legs: Leg[]) {
  const ordered = [...legs].sort((a, b) => a.order - b.order);
  return ordered.flatMap((leg, index) => {
    const next = ordered[index + 1];
    if (!next || next.direction !== leg.direction) return [];
    if (itineraryPreferences(next).departureType !== "Conexión") return [];
    const arrival = arrivalTimestamp(leg);
    const departure = departureTimestamp(next);
    if (arrival === null || departure === null || departure <= arrival)
      return [];
    const minutes = Math.floor((departure - arrival) / 60_000);
    const level =
      minutes >= 150 ? "comfortable" : minutes >= 90 ? "review" : "tight";
    return [{ leg, next, minutes, level } as const];
  });
}

export function nextUpcomingLeg(legs: Leg[], now = Date.now()) {
  return (
    [...legs]
      .map((leg) => ({ leg, departure: departureTimestamp(leg) }))
      .filter(
        (item): item is { leg: Leg; departure: number } =>
          item.departure !== null && item.departure >= now,
      )
      .sort((a, b) => a.departure - b.departure)[0] ?? null
  );
}
