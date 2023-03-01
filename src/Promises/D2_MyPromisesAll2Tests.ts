import { MyPromisesResult2 } from './D1_MyPromisesAll2';

// mutable tuple
type elements0 = MyPromisesResult2<[Promise<string>, Promise<number>]>;
const test0: [string, number] extends elements0 ? true : false = true;

// readonly tuple
type elements00 = MyPromisesResult2<
  readonly [Promise<string>, Promise<number>]
>;
const test00: [string, number] extends elements00 ? true : false = true;

// single element tuple
type elements1 = MyPromisesResult2<[Promise<string>]>;
const test1: [string] extends elements1 ? true : false = true;

// no element tuple
type element2 = MyPromisesResult2<[]>;
const test2: [] extends element2 ? true : false = true;

// array of objects
type element3 = MyPromisesResult2<Promise<{ hello: 'world' }>[]>;
const test3: { hello: 'world' }[] extends element3 ? true : false = true;

// Error handling: If first element is NOT a Promise, return []
type elementE1 = MyPromisesResult2<[boolean]>;
const testE1: [] extends elementE1 ? true : false = true;

// Error handling: If any element is NOT a Promise, return []
type elementE2 = MyPromisesResult2<[boolean, Promise<string>]>;
const testE2: [] extends elementE2 ? true : false = true;

// Error handling: If any element is NOT a Promise, return []
type elementE3 = MyPromisesResult2<[Promise<string>, boolean]>;
const testE3: [] extends elementE3 ? true : false = true;
