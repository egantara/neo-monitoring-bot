export function buildSuccessMessage({
  platform,
  result,
}) {

  const dates =
    Object.keys(
      result
    );

  const brands =
    [
      ...new Set(
        Object.values(result)
          .flatMap(
            (items) =>
              Object.keys(items)
          )
      ),
    ];

  let text =
    `✅ CSV berhasil diproses\n\n`;

  text +=
    `Platform: ${platform}\n\n`;

  text +=
    `📅 ${dates.join(", ")}\n`;

  text +=
    `Brands updated: ${brands.length}\n\n`;

  text +=
    brands.join("\n");

  return text;
}