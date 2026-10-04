import csv from "csvtojson";

import { toGMT15 }
from "../utils/timezone.js";

import { getReportPeriod }
from "../utils/reportPeriod.js";

import { BRAND_MAP }
from "../config/brands.js";

import { parseInstagramDate }
from "../utils/parseInstagramDate.js";

function toNumber(value) {

  return Number(
    String(value || 0)
      .replace(/,/g, "")
      .trim()
  ) || 0;
}

function getAccountKey(
  row,
  platform
) {

  if (
    platform === "FACEBOOK"
  ) {

    return String(
      row["Page name"] || ""
    )
      .toLowerCase()
      .trim();
  }

  if (
    platform === "TIKTOK"
  ) {

    return String(
      row["Profile"] || ""
    )
      .toLowerCase()
      .trim();
  }

  return String(
    row[
      "Account username"
    ] ||
    row[
      "Account Username"
    ] ||
    row["Username"] ||
    ""
  )
    .toLowerCase()
    .trim();
}

export async function processCSV(
  csvText,
  dates,
  platform
) {
  const rows =
  await csv({
    delimiter:
      platform === "TIKTOK"
        ? ";"
        : ",",
  }).fromString(
    csvText
  );

  // ======================
  // FINAL RESULT
  // ======================

  const result = {};

  // ======================
  // LOOP PER DATE
  // ======================

  for (const targetDate of dates) {

    const period =
      getReportPeriod(
        targetDate
      );

    // ======================
    // GROUP PER BRAND
    // ======================

    const grouped = {};

// ======================
// LOOP ROWS
// ======================

for (const row of rows) {

  const accountKey =
    getAccountKey(
      row,
      platform
    );

   
const brand =
  BRAND_MAP[accountKey];

console.log({
  accountKey,
  brand,
});


      // skip unknown brand
      if (!brand) {
        console.log(
    `BRAND NOT FOUND: ${accountKey}`
  );

  continue;
      }

      // ======================
      // PUBLISH TIME
      // ======================

if (
  platform !== "TIKTOK"
) {

  const publishTime =
    row["Publish time"];

  const utcDate =
    parseInstagramDate(
      publishTime
    );

  if (!utcDate) {
    continue;
  }

  const gmt15Date =
    toGMT15(utcDate);

  if (
    gmt15Date <
      period.start ||
    gmt15Date >
      period.end
  ) {
    continue;
  }
}

      // ======================
      // INIT BRAND
      // ======================

      if (!grouped[brand]) {
        grouped[brand] = {
          totalReach: 0,
          totalEngagement: 0,
          totalImpressions: 0,
            totalFollowers: 0,
          videoViews: 0,
          erList: [],
        };
      }

      // ======================
      // METRICS
      // ======================
let reach = 0;
let engagement = 0;
let views = 0;
let postType = "";

// ======================
// INSTAGRAM
// ======================

if (
  platform === "INSTAGRAM"
) {

reach =
  toNumber(
    row.Reach
  );

  const likes =
  toNumber(
    row.Likes
  );

const shares =
  toNumber(
    row.Shares
  );

const comments =
  toNumber(
    row.Comments
  );

const saves =
  toNumber(
    row.Saves
  );

views =
  toNumber(
    row.Views
  );

  postType = String(
    row["Post type"] || ""
  )
    .toLowerCase()
    .trim();

  engagement =
    likes +
    shares +
    comments +
    saves;
}

// ======================
// FACEBOOK
// ======================

else if (
  platform === "FACEBOOK"
) {

reach =
  toNumber(
    row.Reach
  );

  engagement =
  toNumber(
    row[
      "Reactions, Comments and Shares"
    ]
  );

views =
  toNumber(
    row["Views"]
  );

  postType = String(
    row["Post type"] || ""
  )
    .toLowerCase()
    .trim();
}

// ======================
// TIKTOK
// ======================

else if (
  platform === "TIKTOK"
) {

  engagement =
  toNumber(
    row[
      "Total ENG Tiktok"
    ]
  );

views =
  toNumber(
    row[
      "Impressions/views of posts"
    ]
  );

const followers =
  toNumber(
    row["Follower"]
  );

  grouped[
    brand
  ].totalFollowers =
    followers;

  reach = 0;
}
// ======================
// TOTAL REACH
// ======================

grouped[
  brand
].totalReach +=
  reach;

// ======================
// TOTAL ENGAGEMENT
// ======================

grouped[
  brand
].totalEngagement +=
  engagement;


 // ======================
// TOTAL IMPRESSIONS
// ======================

grouped[
  brand
].totalImpressions +=
  views;

// ======================
// VIDEO VIEWS
// IG REEL ONLY
// ======================

if (
  platform ===
    "INSTAGRAM" &&
  postType ===
    "ig reel"
) {

  grouped[
    brand
  ].videoViews +=
    views;
}

if (
  platform ===
    "FACEBOOK" &&
  postType ===
    "videos"
) {

  grouped[
    brand
  ].videoViews +=
    views;
}

if (
  platform ===
    "TIKTOK"
) {

  grouped[
    brand
  ].videoViews +=
    views;
}

      if (reach > 0) {
        grouped[
          brand
        ].erList.push(
          engagement / reach
        );
      }
    }

    // ======================
    // BUILD RESULT
    // ======================

    result[targetDate] = {};

    for (const brand in grouped) {

      const data =
        grouped[brand];

      const avgER =
        data.erList.length > 0
          ? (
              data.erList.reduce(
                (a, b) =>
                  a + b,
                0
              ) /
              data.erList
                .length
            ) * 100
          : 0;

      result[targetDate][
        brand
      ] = {

        totalFollowers:
  data.totalFollowers,

        totalReach:
          data.totalReach,

        totalEngagement:
          data.totalEngagement,

totalImpressions:
  data.totalImpressions,

videoViews:
  data.videoViews,

        avgER:
          avgER.toFixed(2) +
          "%",
      };
    }
  }



  return result;
}