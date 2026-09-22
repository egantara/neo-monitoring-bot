import {
  parseInputDate,
  serialToDate,
  isSameDate,
} from "../../utils/dates.js";

export function findDateColumn({
  rows,
  inputDate,
}) {

  // ======================
  // TARGET DATE
  // ======================

  const targetDate =
    parseInputDate(
      inputDate
    );

  const maxRows =
    Math.min(
      rows.length,
      20
    );

  // ======================
  // LOOP ROWS
  // ======================

  for (
    let rowIndex = 0;
    rowIndex < maxRows;
    rowIndex++
  ) {

    const cells =
      rows[rowIndex]
        ?.values || [];

    // ======================
    // LOOP CELLS
    // ======================

    for (
      let colIndex = 0;
      colIndex < cells.length;
      colIndex++
    ) {

      const serial =
        cells[colIndex]
          ?.effectiveValue
          ?.numberValue;

      // skip non-date
      if (
        typeof serial !==
        "number"
      ) {
        continue;
      }

      const sheetDate =
        serialToDate(
          serial
        );

      if (
        isSameDate(
          targetDate,
          sheetDate
        )
      ) {

        return colIndex;
      }
    }
  }

  // ======================
  // NOT FOUND
  // ======================

  return -1;
}