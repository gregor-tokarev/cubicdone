export function replaceAt(
  target: string,
  idx: number,
  replacement: string,
): string {
  return target.slice(0, idx) + replacement + target.slice(idx);
}
