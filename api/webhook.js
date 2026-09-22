import axios from "axios";

import { parseCommand }
from "../lib/parser.js";

import { processCSV }
from "../lib/services/csv.js";

import { buildAllUpdates }
from "../lib/services/sheets/buildAllUpdates.js";

import { sheets }
from "../lib/services/sheets/auth.js";

import { buildSuccessMessage }
from "../lib/buildSuccessMessage.js";

import {
  sendMessage,
  getFileUrl,
} from "../lib/services/telegram.js";

// ======================
// WEBHOOK
// ======================

export default async function handler(
  req,
  res
) {

  const body =
    req.body;

  const message =
    body.message;

  try {

    // ======================
    // NO MESSAGE
    // ======================

    if (!message) {

      return res
        .status(200)
        .send("ok");
    }

    // ======================
    // MUST UPLOAD FILE
    // ======================

    if (!message.document) {

      return res
        .status(200)
        .send("ok");
    }

    const chatId =
      message.chat.id;

    // ======================
    // CAPTION
    // ======================

    const caption =
      message.caption;

    if (!caption) {

      await sendMessage(
        chatId,
        "❌ Command tidak ditemukan di caption."
      );

      return res
        .status(200)
        .send("ok");
    }

    // ======================
    // PARSE COMMAND
    // ======================

    const parsed =
      parseCommand(
        caption
      );

    console.log({
      command: parsed,
    });

    // ======================
    // GET FILE
    // ======================

    const fileId =
      message.document.file_id;

    const fileUrl =
      await getFileUrl(
        fileId
      );

    // ======================
    // DOWNLOAD CSV
    // ======================

    const csvRes =
      await axios.get(
        fileUrl
      );

    // ======================
    // PROCESS CSV
    // ======================

    console.log(
      "START PROCESS CSV"
    );

const result =
  await processCSV(
    csvRes.data,
    parsed.dates,
    parsed.platform
  );
  

    console.log(
      "CSV FINISHED"
    );

    console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);

    // ======================
    // NO DATA
    // ======================

    if (
      Object.keys(result)
        .length === 0
    ) {

      await sendMessage(
        chatId,
        "❌ Tidak ada data sesuai periode report."
      );

      return res
        .status(200)
        .send("ok");
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

    console.log(
      "FETCHING SHEETS..."
    );

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

    console.log(
      "SHEETS FETCHED"
    );

    // ======================
    // BUILD SHEET MAP
    // ======================

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

const successText =
  buildSuccessMessage({

    platform:
      parsed.platform,

    result,
  });

// ======================
// BUILD UPDATES
// ======================

const allUpdates =
  buildAllUpdates({

    result,

    sheetMap,

    platform:
      parsed.platform,
  });
    // ======================
    // VALIDATE UPDATES
    // ======================

    if (
      allUpdates.length === 0
    ) {

      throw new Error(
        "Tidak ada update yang valid"
      );
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

    // ======================
    // SEND RESULT
    // ======================

    await sendMessage(
      chatId,
      successText
    );

    return res
      .status(200)
      .send("ok");

  } catch (error) {

    console.error(
      "FULL ERROR:"
    );

    console.error(error);

    console.error(
      error.stack
    );

    if (
      message?.chat?.id
    ) {

      await sendMessage(
        message.chat.id,
        `❌ Error:\n${error.message}`
      );
    }

    return res
      .status(200)
      .send("ok");
  }
}