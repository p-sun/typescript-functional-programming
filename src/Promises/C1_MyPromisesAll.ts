/* -------------------------------------------------------------------------- */
/*        Create a MyPromisesAll() with the same types as Promise.all()       */
/* -------------------------------------------------------------------------- */

export function MyPromisesAll<PArray extends readonly any[]>(
  promises: PArray
): Promise<MyPromisesResult<PArray>> {
  return new Promise(async (resolve, reject) => {
    const results: unknown[] = [];
    for (const p of promises) {
      try {
        results.push(await p);
      } catch (err) {
        reject(err);
        break;
      }
    }
    resolve(results as MyPromisesResult<PArray>);
  });
}

export type MyPromisesResult<PArray extends readonly any[]> = //
  PArray extends []
    ? []
    : PArray extends readonly [infer Head, ...infer Tail] // PArray is a readonly tuple.
    ? Head extends Promise<infer H>
      ? [H, ...MyPromisesResult<Tail>] // Unwrap Head, recurse on Tail.
      : [Head, ...MyPromisesResult<Tail>]
    : PArray extends Promise<infer Element>[] // PArray is a mutable Array.
    ? Element[] // Unwrap Array.
    : []; // Not possible b/c PArray extends readonly any[]
