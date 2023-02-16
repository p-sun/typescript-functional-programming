/* -------------------------------------------------------------------------- */
/*                            Pure Functional Tree                            */
/* -------------------------------------------------------------------------- */

class LazyTree {
  constructor(
    public readonly id: string,
    public readonly children: LazyTree[]
  ) {
    Object.freeze(this);
  }

  // Preorder traversal, yielding at each node that pass the predicate.
  // Accumulate result down each branch.
  *reduceDown<S>(
    fn: (parentAcc: S, current: LazyTree) => S,
    predicate: ((current: LazyTree) => boolean) | undefined,
    initAcc: S
  ): Generator<S> {
    function* helper(parentAcc: S, current: LazyTree): Generator<S> {
      const currentAcc = fn(parentAcc, current);
      if (predicate ? predicate(current) : true) {
        yield currentAcc;
      }
      for (let c of current.children) {
        yield* helper(currentAcc, c);
      }
    }
    yield* helper(initAcc, this);
  }
}

/* -------------------------------------------------------------------------- */
/*                             Get Longest Branch                             */
/* -------------------------------------------------------------------------- */

type Branch = { id: string; name: string; length: number };
const EmptyBranch: Branch = { id: '', name: '', length: 0 };

const getLongerBranch = (a: Branch, b: Branch): Branch =>
  a.length >= b.length ? a : b;

const buildCurrentBranch = (parentAcc: Branch, current: LazyTree): Branch => ({
  id: current.id,
  name: parentAcc.name + current.id,
  length: parentAcc.length + 1,
});

// `isLeaf` is a small optimization to avoid unnecessary yielding,
// since only leaves can have the longest branch.
// Can replace with `undefined` get the same getLongestBranch result.
const isLeaf = (current: LazyTree) => current.children.length === 0;

const getLongestBranch = (tree: LazyTree) =>
  lastValue(
    reduce(
      tree.reduceDown(buildCurrentBranch, isLeaf, EmptyBranch),
      getLongerBranch,
      EmptyBranch
    )
  );

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */

export default function run() {
  // A --> B --> C
  // l___________^
  const C = new LazyTree('C', []);
  const B = new LazyTree('B', [C]);
  const A = new LazyTree('A', [B, C]);

  // {id: 'C', name: 'ABC', length: 3}
  console.log('runPureLazyTree: ', getLongestBranch(A));
}

/* -------------------------------------------------------------------------- */
/*                              Generator Helpers                             */
/* -------------------------------------------------------------------------- */

const map = function* <T, S>(
  iterator: Generator<T>,
  fn: (value: T) => S
): Generator<S> {
  let next = iterator.next();
  while (!next.done) {
    yield fn(next.value);
    next = iterator.next();
  }
};

const reduce = function* <T, S>(
  iterator: Generator<T>,
  fn: (acc: S, value: T) => S,
  initAcc: S
): Generator<S> {
  let acc = initAcc;
  yield* map(iterator, (value) => {
    acc = fn(acc, value);
    return acc;
  });
};

const filter = function* <T>(
  iterator: Generator<T>,
  predicate: (value: T) => boolean | undefined
): Generator<T> {
  let next = iterator.next();
  while (!next.done) {
    if (predicate ? predicate(next.value) : true) {
      yield next.value;
    }
    next = iterator.next();
  }
};

// Run the iterator to the end and return the last value.
const lastValue = <T>(iterator: Generator<T>): T => {
  let next = iterator.next();
  let prev = next;
  while (!next.done) {
    prev = next;
    next = iterator.next();
  }
  return prev.value;
};
