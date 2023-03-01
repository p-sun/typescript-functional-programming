/* -------------------------------------------------------------------------- */
/*                        Method Overloading w Generics                       */
/* -------------------------------------------------------------------------- */

/* ------------------------ With Generics in Function ----------------------- */

function asArray<T extends any[]>(value: T): T;
function asArray<T>(value: T): T[];

function asArray<T>(value: T) {
  return value instanceof Array ? value : [value];
}

// string[]
const p1 = asArray('a');

// number[]
const p2 = asArray([1, 2, 3]);

// (string | number)[]
const p3 = asArray([1, 'b', 3]);

/* ------------------------- With Generics in Class ------------------------- */

class MyVal<T> {
  constructor(readonly value: T) {}

  // You can define function signature separate from implementation
  valueAsArray(): T extends Array<any> ? T : T[];
  valueAsArray() {
    return this.value instanceof Array ? this.value : [this.value];
  }

  // Or you can define it with the 'as' keyword
  valueAsArray2() {
    return this.value instanceof Array
      ? this.value
      : ([this.value] as T extends Array<any> ? T : T[]);
  }
}

// number[]
const c1 = new MyVal([1, 2, 3]).valueAsArray();
// (readonly [1, 2, 3])[]
const c11 = new MyVal([1, 2, 3] as const).valueAsArray();

// string[]
const c2 = new MyVal('a').valueAsArray();

/* -------------------------------------------------------------------------- */
/*                              Non-Mutable Push                              */
/* -------------------------------------------------------------------------- */

// Make `maybeArr` as an array if needed, and push `element` to it.
// Use `as` and  `[...T]` to make TS type the result as a tuple
function tuplePush<T, Element>(maybeArr: T, element: Element) {
  return (
    maybeArr instanceof Array ? [...maybeArr, element] : [maybeArr, element]
  ) as T extends Array<any> ? [...T, Element] : [T, Element];
}

// [string, number]
const l1 = tuplePush('a', 1);
// [...string[], number]
const l2 = tuplePush(['a', 'b'], 1);
// [string, boolean, number]
const l3 = tuplePush(['a', true] as [string, boolean], 1);

/* -------------------------------------------------------------------------- */
/*                          Type Inference of Arrays                          */
/* -------------------------------------------------------------------------- */

// readonly [1, 2, 3]
const a0 = [1, 2, 3] as const;

// [number, number, number]
const a1 = a0 as [number, number, number];

// (string | number)[]
const a2 = [...a1, 's'];

// [number, number, number, 'y']
const a3 = [...a1, 'y'] as const;

type Concat<T extends any[], Element> = [...T, Element];
// [1, 2, 'b']
type c1 = Concat<[1, 2], 'b'>;
