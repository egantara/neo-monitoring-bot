import { numberToColumn }
from "../../utils/columns.js";

import { findMetrics }
from "./findMetrics.js";

import { findDateColumn }
from "./findDateColumn.js";

import { buildUpdates }
from "./buildUpdates.js";

import { findPlatform }
from "./findPlatform.js";

export function buildSheetUpdates({

  rows,

  sheetName,

  platform,

  dates,

  totalReach,
  totalEngagement,

  totalImpressions,
  videoViews,

  totalFollowers,

  avgER,
}) {

  // ======================
  // FIND PLATFORM
  // ======================

  const {
    platformStart,
    platformEnd,
  } = findPlatform({
    rows,
    platform,
  });

  if (
    platformStart === -1
  ) {

    throw new Error(
      `Platform tidak ditemukan: ${platform}`
    );
  }

  // ======================
  // FIND METRICS
  // ======================

  const {
  engagementRow,
  reachRow,
  erRow,

  followersRow: foundFollowersRow,

  videoViewsRow,
  impressionsRow,
} = findMetrics({
  rows,
  platformStart,
  platformEnd,
});

const followersRow =
  platform === "TIKTOK"
    ? foundFollowersRow
    : -1;

  const videoViewsUpdated =
    videoViewsRow !== -1;

  const impressionsUpdated =
    impressionsRow !== -1;

  // ======================
  // BUILD UPDATES
  // ======================

  const updates = [];

  for (const inputDate of dates) {

    const dateColumnIndex =
      findDateColumn({
        rows,
        inputDate,
      });

    if (
      dateColumnIndex === -1
    ) {
      continue;
    }

    const colLetter =
      numberToColumn(
        dateColumnIndex + 1
      );

    updates.push(
      ...buildUpdates({

        sheetName,
        colLetter,

        engagementRow,
        reachRow,
        erRow,

        followersRow,

        videoViewsRow,
        impressionsRow,

        totalEngagement,
        totalReach,

        totalFollowers,

        totalImpressions,
        videoViews,

        avgER,
      })
    );
  }

  // ======================
  // NO UPDATES
  // ======================

  if (
    updates.length === 0
  ) {

    console.log(
      `SKIPPED: ${sheetName}`
    );

    return {
      updates: [],

      updated: false,

      videoViewsUpdated,
      impressionsUpdated,
    };
  }

  // ======================
  // SUCCESS
  // ======================

  return {
    updates,

    updated: true,

    videoViewsUpdated,
    impressionsUpdated,
  };
}