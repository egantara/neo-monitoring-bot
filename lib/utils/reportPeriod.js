export function getReportPeriod(
  targetDate
) {
  // target:
  // 24/05/2026

  const [
    day,
    month,
    year,
  ] = targetDate.split("/");

  // start:
  // 01/05/2026
  const start =
    new Date(
      Number(year),
      Number(month) - 1,
      1,
      0,
      0,
      0
    );

  // end:
  // 23/05/2026
  const end =
    new Date(
      Number(year),
      Number(month) - 1,
      Number(day) - 1,
      23,
      59,
      59
    );

  return {
    start,
    end,
  };
}