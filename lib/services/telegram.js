import axios from "axios";

const TELEGRAM_TOKEN =
  process.env
    .TELEGRAM_TOKEN;

// ======================
// TELEGRAM API
// ======================

const TELEGRAM_API =
  `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const TELEGRAM_FILE_API =
  `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}`;

// ======================
// SEND MESSAGE
// ======================

export async function sendMessage(
  chatId,
  text
) {

  return axios.post(
    `${TELEGRAM_API}/sendMessage`,
    {
      chat_id: chatId,
      text,
    }
  );
}

// ======================
// GET FILE URL
// ======================

export async function getFileUrl(
  fileId
) {

  const response =
    await axios.get(
      `${TELEGRAM_API}/getFile?file_id=${fileId}`
    );

  const filePath =
    response.data
      .result
      .file_path;

  return (
    `${TELEGRAM_FILE_API}/${filePath}`
  );
}