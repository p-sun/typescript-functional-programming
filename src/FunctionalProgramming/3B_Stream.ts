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
/*                               Stream Examples                              */
/* -------------------------------------------------------------------------- */
// Conclusion: Using yield is much faster than using custom Lazy class.

export default function run() {
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
