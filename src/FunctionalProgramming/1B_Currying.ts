/* -------------------------------------------------------------------------- */
/*                             Functions as data;                             */
/* -------------------------------------------------------------------------- */
// Functions can be variables, arguments, and return values.

// 1. Put a function in a variable (or in a list, object, class, etc).

const double = (n: number) => 2 * n;
const listOfFunctions = [double, (n: number) => 3 * n];

// 2. Pass a function as an argument.
// e.g. Pass an value and fn, and apply fn to value.

function applyNumberFunction(value: number, fn: (n: number) => string): string {
  return fn(value);
}

function applyFunction<A, B>(value: A, fn: (n: A) => B): B {
  return fn(value);
}

const str1 = applyNumberFunction(1234, (s) => `Number: ${s}`); // "Number: 1234"
const str2 = applyFunction(1234, (s) => `Number: ${s}`); // "Number: 1234"

// 3. Return a function from a function

function myFavoriteFunction(): (n: number) => number {
  return double;
}

function makeMultiplier(m: number): (n: number) => number {
  return (n: number) => m * n;
}

const tripler = makeMultiplier(3); // const tripler: (n: number) => number
const twelve = makeMultiplier(3)(4); // 12

/* -------------------------------------------------------------------------- */
/*                          Curry the `add` function                          */
/* -------------------------------------------------------------------------- */

function curryFn(
  f: (a: number, b: number) => number
): (a: number) => (b: number) => number {
  return (a: number) => (b: number) => f(a, b);
}
// (x: number, y: number) => number
const add = (x: number, y: number) => x + y;
const t1 = add(1, 2); // 3

// (a: number) => (b: number) => number
const curriedAdd = curryFn(add);
const t2 = curriedAdd(1)(2); // 3

/* -------------------------------------------------------------------------- */
/*                              Curry First Param                             */
/* -------------------------------------------------------------------------- */

// Curry the first parameter of `f`
function curryHead<H, Tail extends unknown[], C>(
  f: (h: H, ...t: Tail) => C
): (h: H) => (...t: Tail) => C {
  return (h: H) =>
    (...t: Tail) =>
      f(h, ...t);
}

const triplet = (s: string, n: number, b: boolean) => `${s}, ${n}, ${b}`;

// (h: string) => (n: number, b: boolean) => string
const c1 = curryHead(triplet)('A')(2, true); // string

/* -------------------------------------------------------------------------- */
/*                               Curry All Type                               */
/* -------------------------------------------------------------------------- */

type Curry<Args extends readonly any[], R> = Args extends readonly [
  infer Head,
  ...infer Tail
]
  ? (h: Head) => Curry<Tail, R>
  : R;

// (h: string) => (h: number) => (h: boolean) => number
type testType = Curry<[string, number, boolean], number>;

/* -------------------------------------------------------------------------- */
/*                               Curry All - #1                               */
/* -------------------------------------------------------------------------- */

// Curry all params of a function.
// Input: (A, B, C, D) => E
// Ouput: (A) => (B) => (C) => (D) => E
// NOTE: We can type only the API instead of all the implementation.
const curryAll = <Args extends unknown[], C>(
  fn: (...a: Args) => C
): Curry<Args, C> => {
  const curried = (...acc: unknown[]) => {
    if (acc.length >= fn.length) {
      return fn(...(acc as any));
    } else {
      return (...nextArgs: unknown[]) => {
        return curried(...acc.concat(nextArgs));
      };
    }
  };
  return curried as Curry<Args, C>;
};

const c2 = curryAll(triplet)('A')(3)(true); // string

/* -------------------------------------------------------------------------- */
/*                       Curry All - #2 (works the same)                      */
/* -------------------------------------------------------------------------- */

function curryAll2<Args extends unknown[], R>(
  fn: (...args: Args) => R
): Curry<Args, R> {
  const curried =
    (acc: unknown[]) =>
    (...nextArgs: unknown[]) => {
      const newAcc = acc.concat(nextArgs);
      if (newAcc.length >= fn.length) {
        return fn(...(newAcc as any));
      } else {
        return curried(newAcc);
      }
    };
  return curried([]) as Curry<Args, R>;
}

const c3 = curryAll2(triplet)('A')(3)(true); // string

/* -------------------------------------------------------------------------- */
/*                                   Uncurry                                  */
/* -------------------------------------------------------------------------- */

// Homework #2 implement uncurry
declare function uncurry<A, B extends any[], C>(
  f: (a: A) => (...b: B) => C
): (a: A, ...b: B) => C;

// Homework #3 implement uncurryAll

// Curry all parameters of `f`
// function curryAll<A extends unknown[], C>(
//   f: (...arr: A) => C
// ): CurriedArray<A> {

// }

/* -------------------------------------------------------------------------- */
/*                                     Run                                    */
/* -------------------------------------------------------------------------- */

export default function run() {}
