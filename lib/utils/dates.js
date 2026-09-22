export function parseInputDate(
  inputDate
) {

  const parts = String(
    inputDate || ""
  )
    .trim()
    .split("/");

  if (
    parts.length !== 3
  ) {

    throw new Error(
      `Format tanggal tidak valid: ${inputDate}`
    );
  }

  const [
    day,
    month,
    year,
  ] = parts;

  return {
    day:
      String(day).padStart(
        2,
        "0"
      ),

    month:
      String(month).padStart(
        2,
        "0"
      ),

    year:
      String(year),
  };
}

export function serialToDate(
  serial
) {

  const date =
    new Date(
      Math.round(
        (serial - 25569) *
          86400 *
          1000
      )
    );

  return {
    day:
      String(
        date.getUTCDate()
      ).padStart(2, "0"),

    month:
      String(
        date.getUTCMonth() + 1
      ).padStart(2, "0"),

    year:
      String(
        date.getUTCFullYear()
      ),
  };
}

export function isSameDate(
  dateA,
  dateB
) {

  return (
    dateA.day ===
      dateB.day &&
    dateA.month ===
      dateB.month &&
    dateA.year ===
      dateB.year
  );
}