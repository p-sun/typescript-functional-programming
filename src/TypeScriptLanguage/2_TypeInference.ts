/* -------------------------------------------------------------------------- */
/*                         Wrapping/Unwrapping a Type                         */
/* -------------------------------------------------------------------------- */

/* ----------------------------- Wrap a Promise ----------------------------- */

// Take T, wrap into Promise<T>
type WrapPromise<T> = T;

type wp1 = WrapPromise<number>; // type Promise<number>
type wp2 = WrapPromise<string>; // type Promise<string>

/* ---------------------------- Unwrap a Promise ---------------------------- */

// Take `Promise<T>` and unwrap return type `T`
type UnwrapPromise<P> = P extends Promise<infer T> ? T : 'fail';

type up1 = UnwrapPromise<Promise<number>>; // type number
type up2 = UnwrapPromise<UnwrapArray<(Promise<number> | Promise<string>)[]>>; // string | number
type up_fail = UnwrapPromise<9>; // type 'fail'

/* -------------------------------------------------------------------------- */
/*                           Unwrap an Array/Tuple                            */
/* -------------------------------------------------------------------------- */

/* ----------------------- mutable vs readonly Arrays ----------------------- */

// mutable array extends readonly array, not vice versa
type mr1 = [number] extends readonly [number] ? true : false; // type true
type mr_fail = readonly [number] extends [number] ? true : false; // type false

/* ---------------------------- Unwrap an Array ---------------------------- */

type UnwrapArray<T> = T extends (infer Item)[] ? Item : 'fail';

type ua1 = UnwrapArray<number[]>; // type number
type ua2 = UnwrapArray<[number, string]>; // type string | number
type ua_fail1 = UnwrapArray<readonly number[]>; // 'fail'
type ua_fail2 = UnwrapArray<readonly [number, string]>; // 'fail'

/* ------------------------- Unwrap a readonly array ------------------------ */

type UnwrapReadonlyArray<T> = T extends readonly (infer Item)[] ? Item : 'fail';

type ur1 = UnwrapReadonlyArray<readonly number[]>; // type number
type ur2 = UnwrapReadonlyArray<readonly [number, string]>; // type string | number

/* ------------------------ Infer head of Array/Tuple ----------------------- */

type HeadOf<T> = T extends [infer Head, ...infer Tail] ? Head : 'fail';

type ht1 = HeadOf<[number, string, boolean]>; // type number
type ht_fail = HeadOf<readonly [number, string, boolean]>; // 'fail'

/* -------------------------------------------------------------------------- */
/*                                Falsey Types                                */
/* -------------------------------------------------------------------------- */

// never extends all types. i.e. never can be passed to any function.
type f1 = never extends { hello: 'world' } ? true : false; // type true
type f2 = never extends number ? true : false; // type true
type f3 = never extends undefined ? true : false; // type true
type f4 = never extends void ? true : false; // type true

/* -------------------------------------------------------------------------- */
/*                               Inference Order                              */
/* -------------------------------------------------------------------------- */

/* ------------------ Infer return type from parameter type ----------------- */
/**
 * This seems to be the order that inference occurs:
 * 1. Infer concrete types from function parameter.
 * 2. Check concrete types satisfes any `extends` in the <>.
 * 3. Use concrete types calculate function result type.
 * Each line of code is inferred separately, top to bottom.
 */
// Compiler infer param then return types:           1    2
declare function unwrapPromiseFn<T>(promise: Promise<T>): T;
// type number
const a_unwrapfn_success = unwrapPromiseFn(new Promise<number>(() => {}));

// Compiler infer param then return types:    1                 2
declare function unwrapPromiseFn2<P>(promise: P): UnwrapPromise<P>;
// type number
const a_unwrapfn2_success = unwrapPromiseFn2(new Promise<number>(() => {}));

/* ------- Inferrence works backwards then forwards on the param type ------- */

// Compiler infer param then return types:
declare function unwrapPromiseFn3<T>(
  // 2                          1     3
  p: T extends number ? Promise<T> : 'fail'
): T; // 4
// type number
const a_unwrapfn3_success = unwrapPromiseFn3(new Promise<number>(() => {}));
// type boolean.
// const a_unwrapfn3_fail = unwrapPromiseFn3(new Promise<boolean>(() => {}));
//                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// ERROR: Argument of type 'Promise<boolean>' is not assignable to parameter of type '"fail"'.
// 1 Pattern match concrete param `Promise<number>` to `Promise<T>`. Therefore T is boolean.
// 2 Type p using the new concrete T: "boolean doesn't extend number",
// 3 therefore p is of type 'fail'.
// 4 Return type is boolean.

/* ------- Inference cannot infer param type from function return type ------ */

// NOTE: Compiler only infers types top-down (i.e. a line at a time),
// not from outside-in (i.e. return value first, then parameter)
function s<T>(): number {
  // 2    type T                                1
  const returnVal = unwrapPromiseFn(new Promise<T>(() => {}));
  // ERROR: Type 'T' is not assignable to type 'number'
  // return returnVal;
  return 0;
}

// NOTE: Type T & P in angle brackets is only used to
//       throw compile error when argument type P is not a Promise<T>.
// But types in angle brackets CANNOT be used to infer T.
// CAN'T infer out of order:      2                 3               1   4
declare function unwrapPromiseFn4<P extends Promise<T>, T>(promise: P): T;
// type unknown
const a_unwrapfn4_fail = unwrapPromiseFn4(new Promise<number>(() => {}));

/* -------------------------------------------------------------------------- */
/*                                  Promisify                                 */
/* -------------------------------------------------------------------------- */

// Wrap individual element in an array with a promise
type Promisify<T extends any[] | readonly any[]> = //
  T extends [] // Clean up the type output to remove the final `...Promise<never>[]`.
    ? [] // Because `...never[]` is the same as `[]`.
    : T extends [infer Head1, ...infer Tail1]
    ? [Promise<Head1>, ...Promisify<Tail1>]
    : T extends readonly [infer Head2, ...infer Tail2]
    ? readonly [Promise<Head2>, ...Promisify<Tail2>]
    : T extends (infer E)[]
    ? Promise<E>[]
    : [];

type pf1 = Promisify<[string, boolean]>; // [Promise<string>, Promise<boolean>];
type pf2 = Promisify<readonly [string, boolean]>; // readonly [Promise<string>, Promise<boolean>]
type pf3 = Promisify<boolean[]>; // Promise<boolean>[]

/* -------------------------------------------------------------------------- */
/*                          `infer` after `extends`                           */
/* -------------------------------------------------------------------------- */

// `infer` an input type and use it in the output type.
type BerryPrefix<T extends string> =
  T extends `${infer Prefix extends string}berry` ? Prefix : never;
type p0 = BerryPrefix<'strawberry' | 'blueberry' | 'melon'>; // "straw" | "blue"

export default function run() {}
