export function parseInstagramDate(
  dateString
) {
  // format:
  // 05/02/2026 19:00
  // MM/DD/YYYY HH:mm

  const [
    datePart,
    timePart,
  ] = String(
    dateString || ""
  ).split(" ");

  if (
    !datePart ||
    !timePart
  ) {
    return null;
  }

  const [
    month,
    day,
    year,
  ] = datePart.split("/");

  const [hour, minute] =
    timePart.split(":");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    0
  );
}