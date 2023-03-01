import { MyPromisesAll, MyPromisesResult } from './C1_MyPromisesAll';

/* -------------------------------------------------------------------------- */
/*         Test a MyPromisesAll() with the same types as Promise.all()        */
/* -------------------------------------------------------------------------- */

/* ---------------------- Check types of Promise.all() ---------------------- */
const pa1 = Promise.all([
  createPromise<number>(),
  createPromise<string>(),
  true,
]); // type Promise<[number, string, boolean]>
const pa2 = Promise.all([]); // type Promise<[]>
const pa3 = Promise.all([{ hello: 'world' }]); // type Promise<[{ hello: string }]>
const pa4 = Promise.all([3, createPromise<string>()]); // type Promise<[number, string]>

/* -------------------------- Test MyPromisesAll() -------------------------- */

const py1 = MyPromisesAll([
  createPromise<number>(),
  createPromise<string>(),
  true as boolean,
] as const); // type Promise<[number, string, true]>
const py2 = MyPromisesAll([] as const); // type Promise<[]>
const py3 = MyPromisesAll([{ hello: 'world' }] as const); // type Promise<[{ hello: string }]>
const py4 = MyPromisesAll([Math.random(), createPromise<string>()] as const); // type Promise<[number, string]>

/* ------------------ Test the result type of MyPromisesAll ----------------- */

// mutable tuple
type pr0 = MyPromisesResult<[Promise<number>, Promise<string>]>;
const pt0: [number, string] extends pr0 ? true : false = true;

// readonly tuple
type pr00 = MyPromisesResult<readonly [Promise<number>, Promise<string>]>;
const pt00: [number, string] extends pr00 ? true : false = true;

// single pr tuple
type pr1 = MyPromisesResult<[Promise<string>]>;
const pt1: [string] extends pr1 ? true : false = true;

// no pr tuple
type pr2 = MyPromisesResult<[]>;
const pt2: [] extends pr2 ? true : false = true;

// array of objects
type pr3 = MyPromisesResult<Promise<{ hello: 'world' }>[]>;
const pt3: { hello: 'world' }[] extends pr3 ? true : false = true;

// Error handling: If first element is NOT a Promise, return element as is.
type prE1 = MyPromisesResult<[boolean]>;
const ptE1: [boolean] extends prE1 ? true : false = true;

// Error handling: If first element is NOT a Promise, return element as is.
type prE2 = MyPromisesResult<[boolean, Promise<string>]>;
const ptE2: [boolean, string] extends prE2 ? true : false = true;

// Error handling: If any element is NOT a Promise, return element as is.
type prE3 = MyPromisesResult<[Promise<string>, boolean]>;
const ptE3: [string, boolean] extends prE3 ? true : false = true;

/* ---------------------------------- Utils --------------------------------- */

function createPromise<T>() {
  return new Promise<T>(() => {});
}
