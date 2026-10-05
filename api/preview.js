import { processCSV }
from "../lib/services/csv.js";

import { PLATFORM_MAP }
from "../lib/config/platforms.js";

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
    const result =
      await processCSV(
        csv,
        dates,
        platform
      );

    const brandCount =
      new Set(
        Object.values(
          result
        ).flatMap(
          (brands) =>
            Object.keys(
              brands
            )
        )
      ).size;

    if (
      brandCount === 0
    ) {
      return res
        .status(200)
        .json({
          platform,
          result,
          brandCount,
          message:
            "Tidak ada data sesuai periode report.",
        });
    }

    return res
      .status(200)
      .json({
        platform,
        result,
        brandCount,
      });
  } catch (error) {
    console.error(
      "PREVIEW ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        error:
          error.message ||
          "Gagal memproses CSV",
      });
  }
}
