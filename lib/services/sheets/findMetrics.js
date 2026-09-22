import { normalizeText }
from "../../utils/normalize.js";

import { METRICS }
from "../../config/metrics.js";

export function findMetrics({
  rows,
  platformStart,
  platformEnd,
}) {

  let engagementRow = -1;
  let reachRow = -1;
  let erRow = -1;

  let followersRow = -1;

  let videoViewsRow = -1;
  let impressionsRow = -1;

  for (
    let i = platformStart;
    i < platformEnd;
    i++
  ) {

    const cells =
      rows[i]?.values || [];

    let rowLabel = "";

    for (const cell of cells) {

      const value =
        normalizeText(
          cell?.formattedValue || ""
        );

      if (value) {

        rowLabel = value;

        break;
      }
    }

    const rowNumber =
      i + 1;

    // ======================
    // CORE METRICS
    // ======================

    if (
      rowLabel ===
      METRICS.TOTAL_ENGAGEMENT
    ) {

      engagementRow =
        rowNumber;
    }

    if (
      rowLabel ===
      METRICS.TOTAL_REACH
    ) {

      reachRow =
        rowNumber;
    }

    if (
      rowLabel ===
      METRICS.AVG_ER
    ) {

      erRow =
        rowNumber;
    }

    // ======================
    // FOLLOWERS
    // ======================

    if (
      rowLabel ===
      METRICS.TOTAL_FOLLOWERS
    ) {

      followersRow =
        rowNumber;
    }

    // ======================
    // VIEWS
    // ======================

    if (
      rowLabel ===
      METRICS.VIDEO_VIEWS ||
      rowLabel ===
      METRICS.TOTAL_VIDEO_VIEWS
    ) {

      videoViewsRow =
        rowNumber;
    }

    // ======================
    // IMPRESSIONS
    // ======================

    if (
      rowLabel ===
        METRICS.TOTAL_IMPRESSIONS ||
      rowLabel ===
        METRICS.TOTAL_IMPRESSION ||
      rowLabel ===
        METRICS.TOTAL_VIEWS
    ) {

      impressionsRow =
        rowNumber;
    }
  }

  return {

    engagementRow,
    reachRow,
    erRow,

    followersRow,

    videoViewsRow,
    impressionsRow,
  };
}