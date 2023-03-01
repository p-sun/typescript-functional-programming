/* -------------------------------------------------------------------------- */
/*                        Recursively bubble up error                         */
/* -------------------------------------------------------------------------- */

// Similar to MyPromisesResult in 3C1_MyPromisesAll.ts, except it
// returns [] if ANY element is NOT a Promise.
export type MyPromisesResult2<PArray extends readonly any[]> =
  _PromisesResult<PArray> extends 'NotAPromise' ? [] : _PromisesResult<PArray>;

// Returns 'NotAPromise' if ANY element is NOT a Promise.
// We need 'NotAPromise' to distinguish between
// _PromisesResult<[]> and _PromisesResult<'NotAPromise'>.
//
// The numbers represent the order of execution:
// 1 _PromisesResult<[Promise<number>, string]>
// 4 _PromisesResult<[string]>
type _PromisesResult<PArray extends readonly any[]> = PArray extends []
  ? []
  : PArray extends readonly [infer Head, ...infer Tail]
  ? // 2 Head = Promise<number>, Tail = [string]
    // 5 Head = string, Tail = []
    Head extends Promise<infer H>
    ? // 3 H = number, _PromisesResult<Tail> = _PromisesResult<[string]>
      _PromisesResult<Tail> extends 'NotAPromise'
      ? // 7 return 'NotAPromise' to 1 _PromisesResult<[Promise<number>, string]>
        'NotAPromise'
      : [H, ..._PromisesResult<Tail>]
    : // 6 return 'NotAPromise' to 3 _PromisesResult<[string]>
      'NotAPromise'
  : PArray extends Promise<infer Element>[]
  ? Element[]
  : [];
