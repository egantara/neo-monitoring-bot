export function buildUpdates({
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
}) {

  const updates = [];

  // ======================
  // ADD UPDATE
  // ======================

  function addUpdate(
    row,
    value
  ) {

    if (row === -1) {
      return;
    }

    updates.push({
      range:
        `${sheetName}!${colLetter}${row}`,

      values: [
        [value],
      ],
    });
  }

  // ======================
  // METRICS
  // ======================

  addUpdate(
    engagementRow,
    totalEngagement
  );

  addUpdate(
    reachRow,
    totalReach
  );

  addUpdate(
    erRow,
    avgER
  );

  addUpdate(
    followersRow,
    totalFollowers
  );

  addUpdate(
    videoViewsRow,
    videoViews
  );

  addUpdate(
    impressionsRow,
    totalImpressions
  );

  return updates;
}