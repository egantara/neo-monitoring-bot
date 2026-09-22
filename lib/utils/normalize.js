export function normalizeText(
  text
) {

  return String(
    text || ""
  )
    .toLowerCase()
    .replace(
      /\./g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}