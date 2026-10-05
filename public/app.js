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

const selectedDateEl =
  document.getElementById(
    "selected-date"
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

const writeBtn =
  document.getElementById(
    "write-sheet"
  );

const writeStatus =
  document.getElementById(
    "write-status"
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

function formatDate(
  value
) {
  const [year, month, day] =
    String(value || "").split(
      "-"
    );

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  return `${day}/${month}/${year}`;
}

function updateSelected() {
  const formatted =
    formatDate(
      dateInput.value
    );

  selectedDateEl.textContent =
    formatted
      ? "Tanggal terpilih"
      : "";
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
    formatDate(
      dateInput.value
    );

  if (!formatted) {
    addLog(
      "Tanggal belum dipilih"
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
  "change",
  () => {
    updateSelected();
  }
);

addDateBtn.addEventListener(
  "click",
  addDate
);

// ======================
// SUBMIT
// ======================

let lastPreview = null;

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

    writeBtn.disabled = true;

    writeStatus.textContent =
      "";

    writeStatus.className =
      "write-status";

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

      if (
        payload.brandCount > 0
      ) {
        lastPreview = {
          csv,
          platform:
            platformSelect.value,
          dates: [...dates],
        };

        writeBtn.disabled =
          false;

        writeStatus.textContent =
          "";

        writeStatus.className =
          "write-status";

        addLog(
          `✅ ${payload.platform} • ${dates.length} tanggal • ${payload.brandCount} brand`
        );

        const brandList =
          [
            ...new Set(
              Object.values(
                payload.result || {}
              ).flatMap(
                (brands) =>
                  Object.keys(brands)
              )
            ),
          ];

        addLog(
          `Brands: ${brandList.join(", ")}`
        );
      } else {
        lastPreview = null;

        writeBtn.disabled =
          true;

        addLog(
          `⚠️ ${payload.message || "Tidak ada data sesuai periode report."}`
        );
      }
    } catch (error) {
      lastPreview = null;

      writeBtn.disabled =
        true;

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

dateInput.value = "";

updateSelected();

// ======================
// WRITE TO SHEET
// ======================

writeBtn.addEventListener(
  "click",
  async () => {
    if (!lastPreview) {
      addLog(
        "Gagal: belum ada hasil preview"
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Tulis ke Google Sheet?\n\nPlatform: ${lastPreview.platform}\nTanggal: ${lastPreview.dates.join(", ")}\n\nSel tanggal terpilih akan ditimpa.`
      );

    if (!confirmed) {
      addLog(
        "Tulis ke Sheet dibatalkan"
      );

      return;
    }

    writeBtn.disabled = true;

    writeBtn.textContent =
      "Menulis...";

    writeStatus.textContent =
      "";

    writeStatus.className =
      "write-status";

    try {
      const response =
        await fetch(
          "/api/write",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              lastPreview
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

      if (!payload.ok) {
        throw new Error(
          payload.message ||
            "Tidak ada data untuk ditulis"
        );
      }

      writeStatus.textContent = `✅ ${payload.updatedCells} sel • ${payload.brandCount} brand • ${payload.dates.join(", ")}`;

      writeStatus.className =
        "write-status ok";

      addLog(
        `✍️ Sheet terupdate: ${payload.updatedCells} sel • ${payload.brandCount} brand • ${payload.dates.join(", ")}`
      );
    } catch (error) {
      writeStatus.textContent = `❌ ${error.message}`;

      writeStatus.className =
        "write-status err";

      addLog(
        `❌ Tulis sheet: ${error.message}`
      );
    } finally {
      writeBtn.disabled =
        false;

      writeBtn.textContent =
        "Submit";
    }
  }
);

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
