import { PLATFORM_MAP }
from "./config/platforms.js";

export function parseCommand(
  text
) {

  // ======================
  // CLEAN COMMAND
  // ======================

  const cleaned = String(
    text || ""
  )
    .replace("/", "")
    .trim()
    .toUpperCase();

  const normalized =
    cleaned.replace(
      /^FORCE-?/,
      ""
    );

  // ======================
  // SPLIT
  // ======================

  const parts =
    normalized.split("-");

  // ======================
  // VALIDATE
  // ======================

  if (parts.length < 2) {
    throw new Error(
      "Format command salah"
    );
  }

  // ======================
  // PLATFORM
  // ======================

  const rawPlatform =
    parts[0];

  const platformCode =
    normalizeCode(
      rawPlatform
        .replace("-", "")
    );

  const platform =
    PLATFORM_MAP[
      platformCode
    ];

  if (!platform) {
    throw new Error(
      "Platform tidak valid"
    );
  }

  // ======================
  // DATES
  // ======================

  const dateString =
    parts.slice(1).join("-");

  if (!dateString) {
    throw new Error(
      "Tanggal tidak valid"
    );
  }

  const dates =
    dateString
      .split(",")
      .map((date) =>
        date.trim()
      )
      .filter(Boolean);

  if (dates.length === 0) {
    throw new Error(
      "Tanggal tidak valid"
    );
  }

  return {
    platform,
    dates,
  };
}

// ======================
// NORMALIZE
// ======================

function normalizeCode(
  text
) {
  return String(text || "")
    .toUpperCase()
    .trim();
}