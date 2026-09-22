export function numberToColumn(
  num
) {

  let column = "";

  while (
    num > 0
  ) {

    const remainder =
      (num - 1) % 26;

    column =
      String.fromCharCode(
        65 + remainder
      ) + column;

    num = Math.floor(
      (num - remainder) /
        26
    );
  }

  return column;
}