export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export function randomIntInRange(
  includedMin: number,
  excludedMax: number
): number {
  return Math.floor(Math.random() * (excludedMax - includedMin)) + includedMin;
}

export function randomOrderArray<T>(iter: Iterable<T>): T[] {
  let res: T[] = [];

  for (const value of iter) {
    res.splice(randomIntInRange(0, res.length + 1), 0, value);
  }

  return res;
}
