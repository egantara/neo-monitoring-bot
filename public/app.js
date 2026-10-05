const form =
  document.getElementById(
    "preview-form"
  );

const platformSelect =
  document.getElementById(
    "platform"
  );

const dateInput =
  document.getElementById(
    "date-input"
  );

const addDateBtn =
  document.getElementById(
    "add-date"
  );

const dateChips =
  document.getElementById(
    "date-chips"
  );

const fileInput =
  document.getElementById(
    "csv-file"
  );

const dropzone =
  document.getElementById(
    "dropzone"
  );

const fileNameEl =
  document.getElementById(
    "file-name"
  );

const submitBtn =
  document.getElementById(
    "submit-btn"
  );

const resultEl =
  document.getElementById(
    "result"
  );

const logEl =
  document.getElementById(
    "log"
  );

let dates = [];

let selectedFile = null;

// ======================
// INIT
// ======================

function parseDMY(value) {
  const parts = String(
    value || ""
  )
    .trim()
    .split("/");

  if (
    parts.length !== 3
  ) {
    return null;
  }

  const [day, month, year] =
    parts;

  if (
    !/^\d{2}$/.test(day) ||
    !/^\d{2}$/.test(month) ||
    !/^\d{4}$/.test(year)
  ) {
    return null;
  }

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  if (
    date.getFullYear() !==
      Number(year) ||
    date.getMonth() !==
      Number(month) - 1 ||
    date.getDate() !==
      Number(day)
  ) {
    return null;
  }

  return `${day}/${month}/${year}`;
}

function todayDMY() {
  const now = new Date();

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  return `${day}/${month}/${now.getFullYear()}`;
}

function renderChips() {
  dateChips.innerHTML = "";

  for (
    const date of dates
  ) {
    const chip =
      document.createElement(
        "span"
      );

    chip.className = "chip";

    chip.append(
      document.createTextNode(
        date
      )
    );

    const removeBtn =
      document.createElement(
        "button"
      );

    removeBtn.type =
      "button";

    removeBtn.textContent =
      "×";

    removeBtn.addEventListener(
      "click",
      () => {
        dates =
          dates.filter(
            (item) =>
              item !== date
          );

        renderChips();
      }
    );

    chip.append(removeBtn);

    dateChips.append(chip);
  }
}

function addDate() {
  const formatted =
    parseDMY(
      dateInput.value
    );

  if (!formatted) {
    addLog(
      "Format tanggal harus DD/MM/YYYY"
    );

    return;
  }

  if (
    dates.includes(formatted)
  ) {
    addLog(
      `Tanggal ${formatted} sudah ada`
    );

    return;
  }

  dates.push(formatted);

  renderChips();

  addLog(
    `Tanggal ditambahkan: ${formatted}`
  );
}

// ======================
// LOG
// ======================

function addLog(message) {
  const item =
    document.createElement(
      "li"
    );

  const time =
    document.createElement(
      "span"
    );

  time.className = "time";

  time.textContent =
    new Date().toLocaleTimeString(
      "id-ID"
    );

  item.append(time);

  item.append(
    document.createTextNode(
      message
    )
  );

  logEl.prepend(item);
}

// ======================
// FILE
// ======================

function setFile(file) {
  if (!file) {
    return;
  }

  selectedFile = file;

  fileNameEl.textContent = `${file.name} (${Math.round(
    file.size / 1024
  )} KB)`;

  addLog(
    `File dipilih: ${file.name}`
  );
}

fileInput.addEventListener(
  "change",
  (event) => {
    setFile(
      event.target.files?.[0]
    );
  }
);

[
  "dragenter",
  "dragover",
].forEach((eventName) =>
  dropzone.addEventListener(
    eventName,
    (event) => {
      event.preventDefault();

      dropzone.classList.add(
        "dragover"
      );
    }
  )
);

[
  "dragleave",
  "drop",
].forEach((eventName) =>
  dropzone.addEventListener(
    eventName,
    (event) => {
      event.preventDefault();

      dropzone.classList.remove(
        "dragover"
      );
    }
  )
);

dropzone.addEventListener(
  "drop",
  (event) => {
    setFile(
      event.dataTransfer
        ?.files?.[0]
    );
  }
);

dateInput.addEventListener(
  "input",
  () => {
    const digits =
      dateInput.value
        .replace(/\D/g, "")
        .slice(0, 8);

    if (
      digits.length > 4
    ) {
      dateInput.value = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (
      digits.length > 2
    ) {
      dateInput.value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      dateInput.value =
        digits;
    }
  }
);

addDateBtn.addEventListener(
  "click",
  addDate
);

// ======================
// RENDER RESULT
// ======================

const METRIC_COLUMNS =
  [
    {
      key: "totalReach",
      label: "Reach",
    },
    {
      key: "totalEngagement",
      label: "Engagement",
    },
    {
      key: "totalImpressions",
      label: "Impressions",
    },
    {
      key: "videoViews",
      label: "Video Views",
    },
    {
      key: "avgER",
      label: "ER",
    },
  ];

function formatNumber(
  value
) {
  return typeof value ===
    "number"
    ? value.toLocaleString(
        "id-ID"
      )
    : value;
}

function renderResult(payload) {
  resultEl.innerHTML = "";

  const result =
    payload.result || {};

  const datesKey =
    Object.keys(result);

  if (
    datesKey.length === 0
  ) {
    resultEl.innerHTML =
      '<p class="muted">Tidak ada data sesuai periode report.</p>';

    return;
  }

  for (
    const date of datesKey
  ) {
    const brands =
      result[date] || {};

    const block =
      document.createElement(
        "div"
      );

    block.className =
      "result-block";

    const title =
      document.createElement(
        "h3"
      );

    title.textContent = `📅 ${date}`;

    block.append(title);

    const table =
      document.createElement(
        "table"
      );

    const head =
      document.createElement(
        "thead"
      );

    const headRow =
      document.createElement(
        "tr"
      );

    [
      "Brand",
      ...METRIC_COLUMNS.map(
        (column) =>
          column.label
      ),
    ].forEach((label) => {
      const th =
        document.createElement(
          "th"
        );

      th.textContent = label;

      headRow.append(th);
    });

    head.append(headRow);

    table.append(head);

    const body =
      document.createElement(
        "tbody"
      );

    for (
      const brand in brands
    ) {
      const data =
        brands[brand];

      const row =
        document.createElement(
          "tr"
        );

      const brandCell =
        document.createElement(
          "td"
        );

      brandCell.textContent =
        brand;

      row.append(brandCell);

      for (
        const column of METRIC_COLUMNS
      ) {
        const cell =
          document.createElement(
            "td"
          );

        cell.textContent =
          formatNumber(
            data[column.key]
          );

        row.append(cell);
      }

      body.append(row);
    }

    table.append(body);

    block.append(table);

    resultEl.append(block);
  }
}

// ======================
// SUBMIT
// ======================

form.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    if (dates.length === 0) {
      addLog(
        "Gagal: tanggal masih kosong"
      );

      return;
    }

    if (!selectedFile) {
      addLog(
        "Gagal: file CSV belum dipilih"
      );

      return;
    }

    submitBtn.disabled = true;

    submitBtn.textContent =
      "Memproses...";

    try {
      const csv =
        await selectedFile.text();

      const response =
        await fetch(
          "/api/preview",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              {
                csv,
                platform:
                  platformSelect.value,
                dates,
              }
            ),
          }
        );

      const payload =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          payload.error ||
            "Permintaan gagal"
        );
      }

      renderResult(payload);

      addLog(
        `✅ ${payload.platform} • ${dates.length} tanggal • ${payload.brandCount} brand`
      );
    } catch (error) {
      resultEl.innerHTML = `<p class="error">❌ ${error.message}</p>`;

      addLog(
        `❌ ${error.message}`
      );
    } finally {
      submitBtn.disabled = false;

      submitBtn.textContent =
        "Preview";
    }
  }
);

dateInput.value = todayDMY();

dateInput.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Enter"
    ) {
      event.preventDefault();

      addDate();
    }
  }
);

addDate();

logEl.innerHTML = "";
