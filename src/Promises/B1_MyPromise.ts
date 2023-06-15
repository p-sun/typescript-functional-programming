/* -------------------------------------------------------------------------- */
/*                      Implement a Promise from Scratch                      */
/* -------------------------------------------------------------------------- */

// This is similar to type from JS Promise:
//   then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
type OnResolve<T, S> = (value: T) => S | MyPromise<S>;

// This is similar to type from JS Promise:
//   catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
type OnRejected<S> = (err: unknown) => S | MyPromise<S>;

type PromiseResult<T> =
  | { tag: 'value'; value: T }
  | { tag: 'error'; error: unknown };

type PromiseState<T> = PromiseResult<T> | { tag: 'pending' };

export class MyPromise<T> {
  private result: PromiseState<T> = { tag: 'pending' };

  private onResolveHandlers: OnResolve<T, unknown>[] = [];
  private onRejectHandlers: OnRejected<unknown>[] = [];

  /* ---------------------------- Static Functions ---------------------------- */
  // Create a new Promise that resolves with a given value.
  // It's like saying "I have a value, and I want to wrap it in a Promise."
  // FP Pure: A -> F A
  static resolve<T>(value: T | MyPromise<T>): MyPromise<T> {
    return new MyPromise<T>((resolve, reject) => {
      if (value instanceof MyPromise) {
        value.then(resolve).catch(reject);
      } else {
        resolve(value);
      }
    });
  }

  static reject<T>(error: unknown): MyPromise<T> {
    return new MyPromise((resolve, reject) => {
      reject(error);
    });
  }
  /* -------------------------------------------------------------------------- */

  constructor(
    fn: (
      resolve: (value: T | MyPromise<T>) => void,
      reject: (error: unknown) => void
    ) => void
  ) {
    fn(
      this.applyOrAwait(this.resolveAllThens.bind(this)),
      this.applyOrAwait(this.rejectAllCatches.bind(this))
    );
  }

  // Promise Chaining where 'I' am the Promise:
  // Create the next Promise, so that when I receive a value,
  // I transform it with this `then` handler:                          `onfulfilled(value)`
  // Then I pass transformed value to the next promise:   `nextResolve(onfulfilled(value))`
  then<S>(onfulfilled: OnResolve<T, S>): MyPromise<S> {
    return new MyPromise<S>((nextResolve, nextReject) => {
      this.run((value: T) => nextResolve(onfulfilled(value)), nextReject);
    });
  }

  catch<S>(onrejected: OnRejected<S>): MyPromise<S | T> {
    return new MyPromise((nextResolve, nextReject) => {
      this.run(nextResolve, (error: unknown) => nextReject(onrejected(error)));
    });
  }

  private applyOrAwait<S>(
    fn: (s: S) => void
  ): (value: MyPromise<T> | S) => void {
    return (value) => {
      if (value instanceof MyPromise) {
        value
          .then(this.resolveAllThens.bind(this))
          .catch(this.rejectAllCatches.bind(this));
      } else {
        fn(value);
      }
    };
  }

  // Run the handlers eventually, when the result is ready.
  // * If I have the result, pass result to 'resolve' OR 'reject' handler immediately.
  // * If I'm waiting for the result, add the handers to be run, once I receive the result.
  private run(resolve: (t: T) => void, reject: (e: unknown) => void) {
    if (this.result.tag === 'pending') {
      this.onResolveHandlers.push((value: T) => {
        resolve(value);
      });
      this.onRejectHandlers.push((error: unknown) => {
        reject(error);
      });
    } else if (this.result.tag === 'error') {
      reject(this.result.error);
    } else {
      resolve(this.result.value);
    }
  }

  private resolveAllThens(value: T) {
    this.result = { tag: 'value', value };

    for (const onResolve of this.onResolveHandlers) {
      onResolve(value);
    }
  }

  private rejectAllCatches(error: unknown) {
    this.result = { tag: 'error', error };

    for (const onReject of this.onRejectHandlers) {
      onReject(error);
    }
  }

  // Unused - just showing a "unified" setter
  private setResult<R extends PromiseResult<T>>(result: R) {
    this.result = result;

    // How sad these casts are needed :'(

    const listeners = (
      result.tag === 'value' ? this.onResolveHandlers : this.onRejectHandlers
    ) as ((x: R['tag'] extends 'value' ? T : unknown) => void)[];

    const x = (
      result.tag === 'value' ? result.value : result.error
    ) as R['tag'] extends 'value' ? T : unknown;

    for (const listener of listeners) {
      listener(x);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                              Promise Chaining                              */
/* -------------------------------------------------------------------------- */

/**
 * A Promise is a Monad. To understand what a Monad is, see OptionalMonad.ts.
 * Explainations related to Monads is indicated with `FP`.

* The arrays `onResolveHandlers` & `onRejectHandlers` allows for
   multiple thens on the same promise. See MyPromiseTests.ts.
      const a = new Promise<T>(...)
      a.then((n) => { ... });
      a.then((n) => { ... });

* `promise.then(onResolve)` 
    * The handler `onResolve` that transforms the value to another value, or another Promise.
      When `onResolve` returns a value, `then` function is a `Map`.
        onResolve: A -> B
        FP Map: F A -> (A -> B) -> F B 
      When `onResolve` returns a Promise, `then` function is a `Bind`.
        onResolve: A -> F B
        FP Bind: F A -> (A -> F B) -> F B

Promise Chaining as an analogy:
 A) Constructor: I am a Promise. I am given work to run.
      `const doWork = (phone, email) => phone(value)`
      `const myPromise = new Promise(doWork)`
    I run the work, and when work is done, 
      `doWork(phone, email)`
    it will eventually call my phone with a value, or email me with an error.
 B) `myPromise.then((value) => newValueOrPromise)`: 
      1. I am the Promise. I wait for the value by saving each .then() handlers if needed. 
      2. Eventually, I pass resolved value to every `then` handler.
      3. I propagate the transformed value to the next Promise.
      4. Repeat steps 1-3 with the next Promise.
 */

/* -------------------------------------------------------------------------- */
/*                     Explaining chaining with pseudocode                    */
/* -------------------------------------------------------------------------- */

// promiseThree starts the work that will eventually resolve to 3.
const promise3 = new Promise<3>((resolve, _) =>
  setTimeout(() => {
    resolve(3);
  }, 800)
);

// 1. Before 800ms, when `then(onResolve3)` and `then(onResolveStr)` is called on on the pending `promise3`,
//    it adds the hander to an array:
//        onResolveHandlers.push((value) => onResolve3(value))
//        onResolveHandlers.push((value) => onResolveStr(value))
// 2. After 800ms, promise3 resolves to 3, and it passes 3 to each of its onResolve handlers.
//       `promise3.resolveAllThens(three)`
//        where `onResolve3(three)` returns transformed value 6,
// 3. Then promise3 resolves the next promise with the transformed value six, which calls:
//       `promise6.resolveAllThens(six)`.
const onResolveStr = (three: 3) => `value is ${three}`;
const promiseStr: Promise<string> = promise3.then(onResolveStr);

const onResolve6 = (three: 3) => 3 * 2;
const promise6: Promise<number> = promise3.then(onResolve6);

promise6.then((six) => six + 8);
