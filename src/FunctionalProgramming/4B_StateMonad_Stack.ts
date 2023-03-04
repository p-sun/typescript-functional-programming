/* -------------------------------------------------------------------------- */
/*                               The State Monad                              */
/* -------------------------------------------------------------------------- */

// S => [S, A]
//   A - forground type, the unwrapped type you work with outside the monad.
//   S - background type, the data type inside the monad.
//
//   State<S, ???> is a monad.
type State<S, A> = (data: S) => [data: S, result: A];

/* -------------------------------------------------------------------------- */
/*                              State Monad Stack                             */
/* -------------------------------------------------------------------------- */

// A Stack that is a State Monad.
// type Stack<T, Result> = (data: Data<T>) => [data: Data<T>, result: Result];
type Stack<T, Result> = State<Data<T>, Result>;

/* ------------------------------- Stack Data ------------------------------- */

// Note: you can implement stack data as any data structure. e.g. T[]
type Data<T> = { head: T; tail: Data<T> } | undefined;
const emptyData = <T>(): Data<T> => undefined;

/* ---------------------------- Stack Operations ---------------------------- */

const empty =
  <T>(): Stack<T, void> =>
  () =>
    [emptyData(), undefined];

const push =
  <T>(t: T): Stack<T, T> =>
  (d) =>
    [{ head: t, tail: d }, t];

const pop =
  <T>(): Stack<T, T | undefined> =>
  (d) =>
    d ? [d.tail, d.head] : [emptyData<T>(), undefined];

// Bind: F A -> (A -> F B) -> F B
const bind =
  <T, A, B>(s: Stack<T, A>, aToFB: (a: A) => Stack<T, B>): Stack<T, B> =>
  (d1) => {
    const [d2, a] = s(d1);
    return aToFB(a)(d2);
  };

// Pure: A -> F A
const pure =
  <T, A>(a: A): Stack<T, A> =>
  (d) =>
    [d, a];

// Duplicate: F A -> F (F A)
const duplicate =
  <T, A>(s: Stack<T, A>): Stack<T, Stack<T, A>> =>
  (d) =>
    [d, s];

// `(a) => a`:                   F A  -> F A
// `s`:             F (F A)
// Bind:            F    AA  -> (  AA -> F B)  -> F B
// Sub AA = F A:    F (F A)  -> (F A  -> F B)  -> F B
// ∴ Join:          F (F A)                    -> F A
const join =
  <T, A>(s: Stack<T, Stack<T, A>>): Stack<T, A> =>
  (d) => {
    const [d2, s2] = s(d);
    return s2(d2);
  };

// `aToB`:                                 (A -> B)
// `aToB(a)`:                                    B
// `pure(aToB(a))`:                            F B
// `(a) => pure(aToB(a))`:                A -> F B
// Bind:              F A             ->  A -> F B        -> F B
// ∴ Map:             F A             ->   (A -> B)       -> F B
const mapResult = <T, A, B>(s: Stack<T, A>, aToB: (a: A) => B): Stack<T, B> => {
  return bind(s, (a) => pure(aToB(a)));
};

/* ---------------------------------- Utils --------------------------------- */

const runStack =
  <T, R>(s: Stack<T, R>) =>
  (d: Data<T>) =>
    s(d);

const stackDataStr = <T>(data: Data<T>): string =>
  data ? `${data.head}, ${stackDataStr(data.tail)}` : '<end>';

const logStack = <T, S>(s: Stack<T, S>) => {
  const [data, result] = s(undefined);
  console.log(`Data: ${stackDataStr(data)} | Result: ${result}`);
};

/* -------------------------------------------------------------------------- */
/*                                     Run                                    */
/* -------------------------------------------------------------------------- */

function runStackMonad() {
  logStack(empty<number>()); // [] undefined
  logStack(pure(undefined)); // [] undefined

  const stack1 = bind(empty<number>(), () => push(1));
  logStack(stack1); // [1] 1

  const stack321 = bind(
    bind(stack1, (one) => push(2)),
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

  logStack(stack321); // [3, 2, 1] 3
  logStack(join(duplicate(stack321))); // [3, 2, 1] 3

  logStack(mapResult(stack321, (three) => three * 3)); // [3, 2, 1] 9
}

export default function run() {
  runStackMonad();
}
