/* -------------------------------------------------------------------------- */
/*                      Implement a Promise from Scratch                      */
/* -------------------------------------------------------------------------- */

// then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
type ResolveListener<T, S> = (value: T) => S | MyPromise<S>;
// catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
type RejectListener = (err: unknown) => void;

export class MyPromise<T> {
  private result:
    | { tag: 'value'; value: T }
    | { tag: 'error'; error: unknown }
    | { tag: 'pending' } = { tag: 'pending' };

  private resolveListeners: ResolveListener<T, unknown>[] = [];
  private rejectListeners: RejectListener[] = [];

  constructor(
    fn: (
      resolve: (value: T | MyPromise<T>) => void,
      reject: (error: unknown) => void
    ) => void
  ) {
    fn(
      // Define resolve function
      (value) => {
        if (value instanceof MyPromise) {
          value
            .then((awaitedVal: T) => {
              this._resolveListeners(awaitedVal);
            })
            .catch((awaitedError) => {
              this._rejectListeners(awaitedError);
            });
        } else {
          this._resolveListeners(value);
        }
      },
      // Define reject function
      (error) => {
        this._rejectListeners(error);
      }
    );
  }

  then<S>(onfulfilled: ResolveListener<T, S>): MyPromise<S> {
    return new MyPromise<S>((resolve, reject) => {
      if (this.result.tag === 'pending') {
        this.resolveListeners.push((value: T) => {
          resolve(onfulfilled(value));
        });
        this.rejectListeners.push((error: unknown) => {
          reject(error);
        });
      } else if (this.result.tag === 'error') {
        return reject(this.result.error);
      } else {
        return resolve(onfulfilled(this.result.value));
      }
    });
  }

  catch(onrejected: RejectListener) {
    if (this.result.tag === 'pending') {
      this.rejectListeners.push(onrejected);
    } else if (this.result.tag === 'error') {
      onrejected(this.result.error);
    }

    return this;
  }

  _resolveListeners(value: T) {
    this.result = { tag: 'value', value };

    for (const listener of this.resolveListeners) {
      listener(value);
    }
  }

  _rejectListeners(error: unknown) {
    this.result = { tag: 'error', error };

    for (const listener of this.rejectListeners) {
      listener(error);
    }
  }
}

class PromiseBuilder {
  // A promise that will resolve when
  // 1) value is type T
  // 2) value is a promise, and that promise got resolved
  static resolve<T>(value: T | MyPromise<T>): MyPromise<T> {
    return new MyPromise<T>((resolve, reject) => {
      if (value instanceof MyPromise) {
        value
          .then((awaitedVal) => {
            resolve(awaitedVal);
          })
          .catch((error: unknown) => {
            reject(error);
          });
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
}
