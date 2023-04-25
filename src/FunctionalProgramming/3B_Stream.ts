import { Lazy, $ } from './3A_Lazy';
import { runPerformanceTest } from './Utils/PerformanceUtils';

/* -------------------------------------------------------------------------- */
/*                             Stream Using Yield                             */
/* -------------------------------------------------------------------------- */

const streamUsingYield = function* (arr: readonly number[]) {
  for (let i = 0; i < arr.length; i++) {
    yield arr[i];
  }
};

/* -------------------------------------------------------------------------- */
/*                           Stream using Suspension                          */
/* -------------------------------------------------------------------------- */

class StreamCell<T> {
  constructor(
    public readonly value: T,
    public readonly next: Lazy<StreamCell<T> | undefined>
  ) {
    Object.freeze(this);
  }
}

const EmptyStream = $(() => undefined);

// Not as performant as streamUsingYield.
// Academic excercise for thinking about FP Streams, and how yield is implemented.
const streamUsingLazy = (arr: readonly number[]) => {
  const helper = (i: number): Lazy<StreamCell<number> | undefined> => {
    if (i >= arr.length) {
      return EmptyStream;
    }
    return $(() => new StreamCell(arr[i], helper(i + 1)));
  };
  return helper(0);
};

/* -------------------------------------------------------------------------- */
/*                       Stream Using Yielding Promises                       */
/* -------------------------------------------------------------------------- */
// Note! We're using async/await with generators/iterators.
// async/await -- promises
// yield, function* -- generators/iterators

class Counter {
  private count = 0;
  private promise: Promise<number>;

  constructor(private readonly max: number) {
    this.promise = promiseToAddOne(this.count);
  }

  // Returns AsyncGenerator<number, void, unknown>
  async *makeInterator() {
    while (this.count < this.max) {
      this.count = await this.promise;
      this.promise = promiseToAddOne(this.count);
      yield this.count;
    }
  }
}

function promiseToAddOne(val: number) {
  return new Promise<number>((resolve, _) => {
    setTimeout(() => {
      resolve(val + 1);
    }, 300);
  });
}

async function runCounters() {
  // Use 'for await' to count from 1...6
  for await (const n of new Counter(6).makeInterator()) {
    console.log('Counter for-loop:', n);
  }

  // Use 'while' to count from 1...6, and stop Counter externally
  const counter = new Counter(100).makeInterator();
  let current = await counter.next();
  while (!current.done) {
    if (current.value >= 6) {
      counter.return();
    }
    console.log('Counter while-loop:', current.value);
    current = await counter.next();
  }
}

/* -------------------------------------------------------------------------- */
/*                               Stream Examples                              */
/* -------------------------------------------------------------------------- */

// Conclusion: Using yield is much faster than using custom Lazy class.
function runStreamComparison() {
  const repeat = 100;
  const length = 100000;
  const arr = Object.freeze(Array.from({ length: length }, (_, i) => i));

  // 1136 milliseconds, length = 100000, repeat = 100
  runPerformanceTest(repeat, () => {
    let stream = streamUsingLazy(arr);
    let next = stream.force();
    while (next) {
      //   console.log(next.value);
      next = next.next.force();
    }
  });

  // 351 milliseconds, length = 100000, repeat = 100
  runPerformanceTest(repeat, () => {
    const stream = streamUsingYield(arr);
    let next = stream.next();
    while (!next.done) {
      //   console.log(next.value);
      next = stream.next();
    }
  });
}

export default function run() {
  runCounters();
  runStreamComparison();
}
