const TIME_ZONE = "Asia/Kolkata";

function getParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    year: Number(value("year")),
    month: Number(value("month")),
    day: Number(value("day")),
  };
}

export function getTodayIST() {
  const { year, month, day } = getParts(new Date());
  return { year, month, day };
}

export function getISTDayRange() {
  const { year, month, day } = getTodayIST();

  // IST is UTC+05:30.
  const start = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00+05:30`,
  );

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export function getPreviousMonthISTRange() {
  const { year, month } = getTodayIST();

  // Day 0 of the current month means the final day of the previous month.
  const previousMonthLastDay = new Date(
    `${year}-${String(month).padStart(2, "0")}-01T00:00:00+05:30`,
  );
  previousMonthLastDay.setDate(0);

  const previousYear = previousMonthLastDay.getFullYear();
  const previousMonth = previousMonthLastDay.getMonth() + 1;

  const start = new Date(
    `${previousYear}-${String(previousMonth).padStart(2, "0")}-01T00:00:00+05:30`,
  );

  const end = new Date(
    `${year}-${String(month).padStart(2, "0")}-01T00:00:00+05:30`,
  );

  const label = new Intl.DateTimeFormat("en-IN", {
    timeZone: TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(start);

  return { start, end, label };
}
