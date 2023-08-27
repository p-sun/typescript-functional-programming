/* -------------------------------------------------------------------------- */
/*                                 Result ADT                                 */
/* -------------------------------------------------------------------------- */
type Result<T> = { tag: 'value'; value: T } | { tag: 'error'; message: string };

/* ------------------------ Instantiate ADT `Result` ------------------------ */
function ResultError<T>(message: string): Result<T> {
  return { tag: 'error', message };
}

function ResultValue<T>(value: T): Result<T> {
  return { tag: 'value', value };
}

/* -------------------- Functional Programming with ADTs -------------------- */
function ResultMap<T, S>(r: Result<T>, f: (t: T) => S): Result<S> {
  return ResultMatch(r, {
    error: (e) => ResultError(e),
    value: (v) => ResultValue(f(v)),
  });
}

function ResultMatch<T, S>(
  r: Result<T>,
  matchers: {
    error: (message: string) => S;
    value: (value: T) => S;
  }
): S {
  if (r.tag === 'error') {
    return matchers.error(r.message);
  } else {
    return matchers.value(r.value);
  }
}

function ResultPartialMatch<T, S>(
  r: Result<T>,
  matchers: Partial<{
    error: (message: string) => S;
    value: (value: T) => S;
  }>,
  otherwise: () => S
): S {
  if (r.tag === 'error' && matchers.error) {
    return matchers.error(r.message);
  } else if (r.tag === 'value' && matchers.value) {
    return matchers.value(r.value);
  }
  return otherwise();
}

/* -------------------------------------------------------------------------- */
/*                                     Run                                    */
/* -------------------------------------------------------------------------- */
function squareRootResult(n: number): Result<number> {
  if (n < 0) {
    return ResultError(`Cannot take square root of negative: ${n}`);
  } else {
    return ResultValue(Math.sqrt(n));
  }
}

export default function run() {
  const r1 = squareRootResult(66); // {tag: 'value', value: 8.12403840463596}
  const r2 = ResultMap(squareRootResult(66), (x) => Math.floor(x)); // {tag: 'value', value: 8}
  console.log(r1, r2);

  const r3 = squareRootResult(-7); // {tag: 'error', message: 'Cannot take square root of negative: -7'}
  const r4 = ResultMap(squareRootResult(-7), (x) => Math.floor(x)); // Same error as above
  console.log(r3, r4);

  const r5 = ResultPartialMatch(
    ResultValue('hello'),
    { value: (x) => x + 'world' },
    () => 'otherwise'
  ); // 'helloworld'
  const r6 = ResultPartialMatch(ResultValue('hello'), {}, () => 'otherwise'); // 'otherwise'
  console.log(r5, r6);
}
