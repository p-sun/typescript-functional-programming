import { MyPromise } from '../3B1_MyPromise';

/* -------------------------------------------------------------------------- */
/*                   Generic Promises for Success and Error                   */
/* -------------------------------------------------------------------------- */

export function succeedEventually<T>(value: T, duration: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (duration === 0) {
      resolve(value);
      return;
    }
    setTimeout(() => {
      resolve(value);
    }, duration);
  });
}

export function errorEventually<T>(
  errorMessage: string,
  duration: number /* milliseconds */
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (duration === 0) {
      reject(errorMessage);
      return;
    }
    setTimeout(() => {
      reject(errorMessage);
    }, duration);
  });
}

export function succeedEventually_mine<T>(
  value: T,
  duration: number /* milliseconds */
): MyPromise<T> {
  return new MyPromise((resolve, reject) => {
    if (duration === 0) {
      resolve(value);
      return;
    }
    setTimeout(() => {
      resolve(value);
    }, duration);
  });
}

export function errorEventually_mine<T>(
  errorMsg: string,
  duration: number /* milliseconds */
): MyPromise<T> {
  return new MyPromise((resolve, reject) => {
    if (duration === 0) {
      reject(errorMsg);
      return;
    }
    setTimeout(() => {
      reject(errorMsg);
    }, duration);
  });
}

/* -------------------------------------------------------------------------- */
/*                               Assertion Utils                              */
/* -------------------------------------------------------------------------- */

export function assertEqual<T>(id: string, expected: T, actual: T) {
  if (actual !== expected) {
    console.warn(`====== ${id} | EXPECTED: ${expected} | ACTUAL: ${actual}`);
  } else {
    console.log(`====== ${id} | OK: ${actual}`);
  }
}

export function assertObjEqual<T>(id: string, expected: T, actual: T) {
  const actualStr = `${JSON.stringify(actual)}`;
  const expectedStr = `${JSON.stringify(expected)}`;
  if (actualStr !== expectedStr) {
    console.warn(
      `====== ${id} | EXPECTED: ${expectedStr} | ACTUAL: ${actualStr}`
    );
  } else {
    console.log(`====== ${id} | OK: ${actualStr}`);
  }
}

/* -------------------------------------------------------------------------- */
/*                           Custom Promises to Test                          */
/* -------------------------------------------------------------------------- */

export function promise8AfterDelay(duration: number): Promise<number> {
  return succeedEventually(8, duration);
}

export function promise8AfterDelay_mine(duration: number): MyPromise<number> {
  return succeedEventually_mine(8, duration);
}
