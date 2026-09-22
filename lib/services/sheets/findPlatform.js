export function findPlatform({
  rows,
  platform,
}) {

const platformNames = [
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "TWITTER",
  "X",
  "YOUTUBE",
];

  const targetPlatform =
    platform.toUpperCase();

  let platformStart = -1;

  let platformEnd =
    rows.length;

  for (
    let i = 0;
    i < rows.length;
    i++
  ) {

    const cells =
      rows[i]?.values || [];

    let section = "";

    for (const cell of cells) {

      const value = String(
        cell?.formattedValue || ""
      )
        .toUpperCase()
        .trim();

      if (value) {

        section = value;

        break;
      }
    }

    // ======================
    // CURRENT PLATFORM
    // ======================

    if (
      section ===
      targetPlatform
    ) {

      platformStart = i;
    }

    // ======================
    // PLATFORM NOT FOUND
    // ======================

    if (
      platformStart === -1
    ) {
      continue;
    }

    // ======================
    // BRIEF KPI
    // ======================

    if (
      section ===
      "BRIEF KPI"
    ) {

      platformEnd = i;

      break;
    }

    // ======================
    // NEXT PLATFORM
    // ======================

    if (
      i > platformStart &&
      platformNames.includes(
        section
      )
    ) {

      platformEnd = i;

      break;
    }
  }

  return {
    platformStart,
    platformEnd,
  };
}