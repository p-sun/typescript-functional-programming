/* -------------------------------------------------------------------------- */
/*                              Without Promises                              */
/* -------------------------------------------------------------------------- */

import { errorEventually, succeedEventually } from './__tests/PromiseTestUtils';

function average(x: number, y: number): number {
  return (x + y) / 2;
}

function averageAll() {
  const avgA = average(7, 9); // 8
  const avgB = average(8, 12); // 10
  const avgC = average(10, 30); // 20
  return (avgA + avgB + avgC) / 3;
}
console.log('averageAllNumbers(): ' + averageAll()); // 12.66

/* -------------------------------------------------------------------------- */
/*                                With Promises                               */
/* -------------------------------------------------------------------------- */

export function averageEventually(
  a: number,
  b: number,
  duration: number /* milliseconds */
): Promise<number> {
  // resolve and reject are functions
  return new Promise((resolve, reject) => {
    // wait for duration in milliseconds
    setTimeout(() => {
      // after time has passed, pass result into the resolve function
      resolve((a + b) / 2);
    }, duration);
  });
}

/*
 * Promises execute sequentially.
 * i.e. Each promise execute only after the previous promise finished.
 * Total time: 500 + 1000 + 250 = 1750ms
 **/
function averageAllEventually_0(): Promise<number> {
  return averageEventually(7, 9, /* ms */ 500).then((xResult) => {
    return averageEventually(8, 12, /* ms */ 1000).then((yResult) => {
      return averageEventually(10, 30, /* ms */ 250).then((zResult) => {
        return (xResult + yResult + zResult) / 3;
      });
    });
  });
}
averageAllEventually_0()
  .then(
    // 12.66
    (avg) => console.log(`averageAllEventually_0(), first 'then()': ${avg}`)
  )
  .then(
    // Undefined b/c previous console.log returned undefined
    (avg) => console.log(`averageAllEventually_0(), second 'then()' ${avg}`)
  );

/*
 * 3 Promises start at the same time.
 * Total time: max(500, 1000, 250) = 1000ms
 **/
function averageAllEventually_1(): Promise<number> {
  const x = averageEventually(7, 9, /* ms */ 500);
  const y = averageEventually(8, 12, /* ms */ 1000);
  const z = averageEventually(10, 30, /* ms */ 250);

  return x.then((xResult) => {
    return y.then((yResult) => {
      return z.then((zResult) => {
        return (xResult + yResult + zResult) / 3;
      });
    });
  });
}
averageAllEventually_1().then(
  (avg) => console.log('averageAllEventually_1(): ' + avg) // 12.66
);

/*
 * 3 Promises start at the same time, using aync await.
 * Does the same thing as averageAllEventually_1(), but is easier to read.
 * Total time: max(500, 1000, 250) = 1000ms
 **/
async function averageAllEventually_2(): Promise<number> {
  const x = await averageEventually(7, 9, /* ms */ 500);
  const y = await averageEventually(8, 12, /* ms */ 1000);
  const z = await averageEventually(10, 30, /* ms */ 250);
  return (x + y + z) / 3;
}
averageAllEventually_2().then((avg) =>
  console.log('averageAllEventually_2(): ' + avg)
);

/* -------------------------------------------------------------------------- */
/*                              Chaining Promises                             */
/* -------------------------------------------------------------------------- */

/* ------------------------------- PromisePair ------------------------------ */
function PromisePair<A, B>(a: Promise<A>, b: Promise<B>): Promise<[A, B]> {
  Promise.all;
  return a.then((aResult) => {
    return b.then((bResult) => {
      return [aResult, bResult];
    });
  });
}

PromisePair(
  succeedEventually(1234, /* ms */ 500),
  succeedEventually(5678, /* ms */ 1000)
).then((tuple) => console.log(`PromisePair success: ${tuple}`)); // 1234,5678

PromisePair(
  succeedEventually(1234, /* ms */ 500),
  errorEventually('myError', /* ms */ 1000)
).catch((error) => console.log(`PromisePair error: ${error}`)); // myError

/* --------------------- PromiseAll that takes one type --------------------- */
function PromiseAll<A>(promises: Promise<A>[]): Promise<A[]> {
  return new Promise(async (resolve, reject) => {
    const results: A[] = [];
    for (const p of promises) {
      try {
        results.push(await p);
      } catch (err) {
        reject(err);
        break;
      }
    }
    resolve(results);
  });
}

PromiseAll([
  succeedEventually(1234, /* ms */ 500),
  succeedEventually(3456, /* ms */ 1000),
  succeedEventually(5678, /* ms */ 250),
]).then((array) => console.log(`PromiseAll success: ${array}`));

PromiseAll([
  succeedEventually(1234, /* ms */ 500),
  errorEventually('myError', /* ms */ 1000),
  succeedEventually(3456, /* ms */ 1000),
]).catch((error) => console.log(`PromiseAll error: ${error}`));

/* --------------------- PromiseAll that takes any type --------------------- */
// Similar to `Promise.all` in JS.
function PromiseAllForAnyType(
  promises: Promise<unknown>[]
): Promise<unknown[]> {
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
    resolve(results);
  });
}

PromiseAllForAnyType([
  succeedEventually(1234, /* ms */ 500),
  succeedEventually('myString', /* ms */ 1000),
  succeedEventually({ hello: 'world' }, /* ms */ 250),
]).then((results) =>
  console.log(`PromiseAllForAnyType success: ${JSON.stringify(results)}`)
);

export default function runPromises() {}
