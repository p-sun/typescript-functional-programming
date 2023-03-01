/* -------------------------------------------------------------------------- */
/*                              Without Promises                              */
/* -------------------------------------------------------------------------- */

function average(x: number, y: number): number {
  return (x + y) / 2;
}

function averageAll() {
  const avgA = average(7, 9); // 8
  const avgB = average(8, 12); // 10
  const avgC = average(10, 30); // 20
  return (avgA + avgB + avgC) / 3;
}

function runAverage() {
  console.log('averageAllNumbers(): ' + averageAll()); // 12.66
}

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

/*
 * 3 Promises start at the same time.
 * Total time: max(500, 1000, 250) = 1000ms
 **/
function averageAllEventually_1(): Promise<number> {
  const x = averageEventually(7, 9, /* ms */ 500);
  const y = averageEventually(8, 12, /* ms */ 1000);
  const z = averageEventually(10, 30, /* ms */ 250);

  x.then(() => {
    return 'hi';
  }).then((hi) => {});

  return x.then((xResult) => {
    return y.then((yResult) => {
      return z.then((zResult) => {
        return (xResult + yResult + zResult) / 3;
      });
    });
  });
}

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

/* -------------------------------------------------------------------------- */
/*                                 Async/Await                                */
/* -------------------------------------------------------------------------- */

// Same Promise with aync/await and without.

function singlePromise() {
  return averageEventually(5, 7, /* milliseconds */ 500).then((x) => {
    console.log('I got: ' + x);
    return x;
  });
}
async function singlePromiseAsync() {
  const x = await averageEventually(5, 7, /* milliseconds */ 500);
  console.log('I got: ' + x);
  return x;
}

/* -------------------------------------------------------------------------- */
/*                              Chaining Promises                             */
/* -------------------------------------------------------------------------- */

function runPromisesChain() {
  averageAllEventually_0()
    // avg is 12.66
    // Return a Promise<number>
    .then((avg) => {
      return averageEventually(100, 300, /* ms */ 300);
    })
    // avg is 200
    // Return a Promise<{ averageVal: number }>
    .then((avg) => {
      return {
        averageVal: avg, // avg is 200
      };
    })
    // obj is { averageVal: 200 }
    // Return undefined
    .then((obj) =>
      console.log(
        `averageAllEventually_0(), third then:' ${JSON.stringify(obj)}`
      )
    );
}

function PromisePair<A, B>(a: Promise<A>, b: Promise<B>): Promise<[A, B]> {
  return a.then((aResult) => {
    return b.then((bResult) => {
      return [aResult, bResult];
    });
  });
}

export default function runPromises() {}
