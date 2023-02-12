/* -------------------------------------------------------------------------- */
/*                      Implement a Promise from Scratch                      */
/* -------------------------------------------------------------------------- */

// This is similar to type from JS Promise:
//   then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
type ResolveListener<T, S> = (value: T) => S | MyPromise<S>;

// This is similar to type from JS Promise:
//   catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
type RejectListener<S> = (err: unknown) => S | MyPromise<S>;

type PromiseResult<T> =
  | { tag: 'value'; value: T }
  | { tag: 'error'; error: unknown };

type PromiseState<T> = PromiseResult<T> | { tag: 'pending' };

export class MyPromise<T> {
  private result: PromiseState<T> = { tag: 'pending' };

  private resolveListeners: ResolveListener<T, unknown>[] = [];
  private rejectListeners: RejectListener<unknown>[] = [];

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

  constructor(
    fn: (
      resolve: (value: T | MyPromise<T>) => void,
      reject: (error: unknown) => void
    ) => void
  ) {
    fn(
      this.applyOrAwait(this.resolveAndAnnounce.bind(this)),
      this.applyOrAwait(this.rejectAndAnnounce.bind(this))
    );
  }

  then<S>(onfulfilled: ResolveListener<T, S>): MyPromise<S> {
    return new MyPromise<S>((_resolve, reject) => {
      this.run((t: T) => _resolve(onfulfilled(t)), reject);
    });
  }

  catch<S>(onrejected: RejectListener<S>): MyPromise<S | T> {
    return new MyPromise((resolve, _reject) => {
      this.run(resolve, (e: unknown) => _reject(onrejected(e)));
    });
  }

  private applyOrAwait<S>(
    fn: (s: S) => void
  ): (value: MyPromise<T> | S) => void {
    return (value) => {
      if (value instanceof MyPromise) {
        value
          .then(this.resolveAndAnnounce.bind(this))
          .catch(this.rejectAndAnnounce.bind(this));
      } else {
        fn(value);
      }
    };
  }

  private run(resolve: (t: T) => void, reject: (e: unknown) => void) {
    if (this.result.tag === 'pending') {
      this.resolveListeners.push((value: T) => {
        resolve(value);
      });
      this.rejectListeners.push((error: unknown) => {
        reject(error);
      });
    } else if (this.result.tag === 'error') {
      reject(this.result.error);
    } else {
      resolve(this.result.value);
    }
  }

  private resolveAndAnnounce(value: T) {
    this.result = { tag: 'value', value };

    for (const listener of this.resolveListeners) {
      listener(value);
    }
  }

  private rejectAndAnnounce(error: unknown) {
    this.result = { tag: 'error', error };

    for (const listener of this.rejectListeners) {
      listener(error);
    }
  }

  // Unused - just showing a "unified" setter
  private setResult<R extends PromiseResult<T>>(result: R) {
    this.result = result;

    // How sad these casts are needed :'(

    const listeners = (
      result.tag === 'value' ? this.resolveListeners : this.rejectListeners
    ) as ((x: R['tag'] extends 'value' ? T : unknown) => void)[];

    const x = (
      result.tag === 'value' ? result.value : result.error
    ) as R['tag'] extends 'value' ? T : unknown;

    for (const listener of listeners) {
      listener(x);
    }
  }
}
