/* -------------------------------------------------------------------------- */
/*                        Recursively bubble up error                         */
/* -------------------------------------------------------------------------- */

// Similar to MyPromisesResult in 3C1_MyPromisesAll.ts
// except it returns [] if ANY element is NOT a Promise.
export type MyPromisesResult2<PArray extends readonly any[]> =
  _PromisesResult<PArray> extends 'NotAPromise' ? [] : _PromisesResult<PArray>;

// Need 'NotAPromise' to distinguish between _PromisesResult<[]> and _PromisesResult<'NotAPromise'>
type _PromisesResult<PArray extends readonly any[] | 'NotAPromise'> =
  PArray extends []
    ? []
    : PArray extends readonly [infer Head, ...infer Tail] // PArray is a readonly tuple.
    ? Head extends Promise<infer H> // Head EXISTS, Tail may be [].
      ? _PromisesResult<Tail> extends 'NotAPromise'
        ? 'NotAPromise' // Propogate ERROR to result: If any element in Tail is NOT a Promise, reduce to [].
        : [H, ..._PromisesResult<Tail>] // Unwrap Head, recurse through Tail.
      : 'NotAPromise' // Encounter ERROR: Head is NOT a Promise.
    : PArray extends Promise<infer Element>[] // PArray is a mutable Array.
    ? Element[] // Unwrap Array.
    : []; // Not possible b/c PArray extends readonly any[]
