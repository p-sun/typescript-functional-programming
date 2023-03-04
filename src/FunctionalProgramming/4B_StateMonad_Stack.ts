/* -------------------------------------------------------------------------- */
/*                               The State Monad                              */
/* -------------------------------------------------------------------------- */

// S => [S, A]
//   A - forground type, the unwrapped type you work with outside the monad.
//   S - background type, the data type inside the monad.
//
// State<S, ???> is a monad.
type State<S, A> = (data: S) => [data: S, result: A];

/* -------------------------------------------------------------------------- */
/*                              State Monad Stack                             */
/* -------------------------------------------------------------------------- */

/* ------------------------------- Stack Data ------------------------------- */

// Note: you can implement stack data as any data structure. e.g. T[]
type StackData<T> = { head: T; tail: StackData<T> } | undefined;

function emptyData<T>(): StackData<T> {
  return undefined;
}

/* ---------------------------- Stack Operations ---------------------------- */

// A Stack that is a State Monad.
// type Stack<T, Result> = (data: Data<T>) => [data: Data<T>, result: Result];
type Stack<T, Result> = State<StackData<T>, Result>;

const empty =
  <T>(): Stack<T, void> =>
  () =>
    [emptyData(), undefined];

const pure =
  <T>(t: T): Stack<T, T> =>
  () =>
    [{ head: t, tail: emptyData() }, t];

const push =
  <T>(t: T): Stack<T, T> =>
  (d) =>
    [{ head: t, tail: d?.tail }, t];

const pop =
  <T>(): Stack<T, T | undefined> =>
  (d) =>
    d ? [d.tail, d.head] : [emptyData<T>(), undefined];

// Bind: F A -> (A -> F B) -> F B
const bind =
  <T, A, B>(s: Stack<T, A>, fn: (a: A) => Stack<T, B>): Stack<T, B> =>
  (d) => {
    const [data, result] = s(d);
    return fn(result)(data);
  };

/* ---------------------------------- Utils --------------------------------- */

const runStack =
  <T, R>(s: Stack<T, R>) =>
  (d: StackData<T>) =>
    s(d);

const logStack = <T, S>(s: Stack<T, S>) => {
  const [data, result] = s(emptyData());
  console.log(`Data: ${data} | Result: ${result}`);
};

/* -------------------------------------------------------------------------- */
/*                                     Run                                    */
/* -------------------------------------------------------------------------- */

function runStackMonad() {
  const stack1 = bind(empty<number>(), () => push(1));
  logStack(stack1); // [1] 1

  const stack321 = bind(
    bind(pure(1), (one) => push(2)),
    (two) => push(3)
  );
  logStack(stack321); // [3, 2, 1] 3

  const stack21 = bind(stack321, (s) => pop());
  logStack(stack21); // [2, 1] 3

  // We can chain many stack operations together using 'bind'.
  // The operations look imperative even though they are pure functions.
  const stackEnd = bind(
    bind(
      bind(
        bind(
          bind(
            bind(empty<number>(), () => push(1)),
            () => push(2)
          ),
          () => push(3)
        ),
        (three) => pop()
      ),
      (two) => pop()
    ),
    (one) => pop()
  );
  logStack(stackEnd); // [] 1
}

export default function run() {
  runStackMonad();
}
