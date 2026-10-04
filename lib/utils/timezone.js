export function toGMT15(
  date
) {
  return new Date(
    date.getTime() +
      15 * 60 * 60 * 1000
  );
}