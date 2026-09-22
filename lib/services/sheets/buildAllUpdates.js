import { buildSheetUpdates }
from "./index.js";

export function buildAllUpdates({

  result,

  sheetMap,

  platform,
}) {

  const allUpdates =
    [];

  for (
    const date in result
  ) {

    const brands =
      result[date];

    for (
      const [
        brand,
        data,
      ] of Object.entries(
        brands
      )
    ) {

      console.log(
        `UPDATING: ${brand} (${date})`
      );

      const rows =
        sheetMap[brand];

      if (!rows) {

        console.log(
          `SHEET NOT FOUND: ${brand}`
        );

        continue;
      }

      const updateResult =
        buildSheetUpdates({

          rows,

          sheetName:
            brand,

          platform,

          dates: [date],

          totalReach:
            data.totalReach,

          totalEngagement:
            data.totalEngagement,

          totalImpressions:
            data.totalImpressions,

          totalFollowers:
            data.totalFollowers,

          videoViews:
            data.videoViews,

          avgER:
            data.avgER,
        });

      if (
        updateResult
          ?.updates
          ?.length
      ) {

        allUpdates.push(
          ...updateResult.updates
        );
      }
    }
  }

  return allUpdates;
}