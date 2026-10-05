import { processCSV }
from "../lib/services/csv.js";

import { PLATFORM_MAP }
from "../lib/config/platforms.js";

import { buildAllUpdates }
from "../lib/services/sheets/buildAllUpdates.js";

import { sheets }
from "../lib/services/sheets/auth.js";

// ======================
// WRITE TO GOOGLE SHEET
// ======================

const DATE_REGEX =
  /^\d{2}\/\d{2}\/\d{4}$/;

export default async function handler(
  req,
  res
) {

  if (
    req.method !== "POST"
  ) {
    return res
      .status(405)
      .json({
        error:
          "Method tidak diizinkan",
      });
  }

  const body =
    req.body || {};

  const platformCode =
    String(
      body.platform || ""
    )
      .toUpperCase()
      .trim();

  const platform =
    PLATFORM_MAP[
      platformCode
    ];

  if (!platform) {
    return res
      .status(400)
      .json({
        error:
          "Platform tidak valid",
      });
  }

  const dates = (
    Array.isArray(
      body.dates
    )
      ? body.dates
      : []
  )
    .map((date) =>
      String(
        date || ""
      ).trim()
    )
    .filter(Boolean);

  if (
    dates.length === 0
  ) {
    return res
      .status(400)
      .json({
        error:
          "Tanggal tidak boleh kosong",
      });
  }

  for (
    const date of
    dates
  ) {
    if (
      !DATE_REGEX.test(
        date
      )
    ) {
      return res
        .status(400)
        .json({
          error: `Format tanggal salah: ${date}`,
        });
    }
  }

  const csv = String(
    body.csv || ""
  ).trim();

  if (!csv) {
    return res
      .status(400)
      .json({
        error:
          "CSV kosong",
      });
  }

  try {

    // ======================
    // PROCESS CSV
    // ======================

    const result =
      await processCSV(
        csv,
        dates,
        platform
      );

    if (
      Object.keys(result)
        .length === 0
    ) {
      return res
        .status(200)
        .json({
          ok: false,
          message:
            "Tidak ada data sesuai periode report.",
        });
    }

    // ======================
    // GET ALL BRANDS
    // ======================

    const allBrands =
      [
        ...new Set(
          Object.values(result)
            .flatMap(
              (brands) =>
                Object.keys(brands)
            )
        ),
      ];

    // ======================
    // GET SHEET DATA
    // ======================

    const sheetRes =
      await sheets
        .spreadsheets
        .get({

          spreadsheetId:
            process.env
              .GOOGLE_SHEET_ID,

          ranges:
            allBrands.map(
              (brand) =>
                `${brand}!A1:ZZ200`
            ),

          includeGridData:
            true,

          fields:
            "sheets(properties(title),data(rowData(values(formattedValue,effectiveValue))))",
        });

    const sheetMap = {};

    for (
      const sheet of
      sheetRes.data.sheets || []
    ) {

      const sheetName =
        sheet.properties.title;

      const rows =
        sheet.data?.[0]
          ?.rowData || [];

      sheetMap[sheetName] =
        rows;
    }

    // ======================
    // BUILD UPDATES
    // ======================

    const allUpdates =
      buildAllUpdates({

        result,

        sheetMap,

        platform,
      });

    if (
      allUpdates.length === 0
    ) {

      return res
        .status(422)
        .json({
          error:
            "Tidak ada update yang valid (tanggal tidak ada di header sheet).",
        });
    }

    // ======================
    // UPDATE ALL SHEETS
    // ======================

    await sheets
      .spreadsheets
      .values
      .batchUpdate({

        spreadsheetId:
          process.env
            .GOOGLE_SHEET_ID,

        requestBody: {

          valueInputOption:
            "USER_ENTERED",

          data: allUpdates,
        },
      });

    console.log(
      "ALL SHEETS UPDATED"
    );

    const brandCount =
      new Set(
        Object.values(result)
          .flatMap(
            (brands) =>
              Object.keys(brands)
          )
      ).size;

    return res
      .status(200)
      .json({
        ok: true,

        platform,

        dates,

        brandCount,

        updatedCells:
          allUpdates.length,
      });

  } catch (error) {

    console.error(
      "WRITE ERROR:"
    );

    console.error(error);

    return res
      .status(500)
      .json({
        error:
          error.message ||
          "Gagal menulis ke Google Sheet",
      });
  }
}
