/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */

export default function run() {
  // A --> B --> C
  // l___________^
  const C = new Tree('C', []);
  const B = new Tree('B', [C]);
  const A = new Tree('A', [B, C]);

  // {id: 'C', name: 'ABC', length: 3}
  console.log('getLongestBranch preorder: ', getLongestBranchPreorder(A));

  // {id: 'A', name: 'CBA', length: 3}
  console.log('getLongestBranch postorder: ', getLongestBranchPostorder(A));
}

/* -------------------------------------------------------------------------- */
/*                             Get Longest Branch                             */
/* -------------------------------------------------------------------------- */
/* 
The purpose of `getLongestBranch...()` is to explore lazy FP data structures.
For the easiest way to solve this problem, see 2B `longestBranch()`.

GOALS:
1. Transform RECURSIVE TREE traversal problem into a LAZY FP problem,
   traversing one node at a time using next(). Uses a callstack as deep as the tree.
2. Compose solution with tiny FP methods.
3. `buildCurrentBranch()` - Fold data from child node to Branch accumulator.
4. `getLongerBranch` - Fold Generator results into a single result, passed to `reduce()`.

Note this solution builds the longest branch name from root to leaves using the stack,
whereas the `longestBranch()` solution bubbles the name from leaves to root.
 */
const getLongestBranchPreorder = (tree: Tree) =>
  finalValue(
    reduce(
      tree.preorderReducer(buildCurrentBranch, isLeaf, EmptyBranch),
      getLongerBranch,
      EmptyBranch
    )
  );

const getLongestBranchPostorder = (tree: Tree) =>
  finalValue(
    reduce(
      tree.postOrderReducer(buildCurrentBranch, isLeaf, EmptyBranch),
      getLongerBranch,
      EmptyBranch
    )
  );

const buildCurrentBranch = (acc: Branch, current: Tree): Branch => ({
  id: current.id,
  name: acc.name + current.id,
  length: acc.length + 1,
});

// `isLeaf` is a small optimization to avoid unnecessary yielding,
// since only leaves can have the longest branch.
// Can replace with `undefined` get the same getLongestBranch result.
const isLeaf = (current: Tree) => current.children.length === 0;

const getLongerBranch = (a: Branch, b: Branch): Branch =>
  a.length >= b.length ? a : b;

type Branch = { id: string; name: string; length: number };
const EmptyBranch: Branch = { id: '', name: '', length: 0 };

/* -------------------------------------------------------------------------- */
/*                            Pure Functional Tree                            */
/* -------------------------------------------------------------------------- */

class Tree {
  constructor(public readonly id: string, public readonly children: Tree[]) {
    Object.freeze(this);
  }

  // Preorder traversal, yielding at each node that pass the predicate.
  // Accumulate result DOWN each branch, from root to leaves.
  *preorderReducer<S>(
    reduceDown: (parentAcc: S, current: Tree) => S,
    predicate: ((current: Tree) => boolean) | undefined,
    initAcc: S
  ): Generator<S> {
    function* helper(parentAcc: S, current: Tree): Generator<S> {
      const currentAcc = reduceDown(parentAcc, current);
      if (predicate ? predicate(current) : true) {
        yield currentAcc;
      }
      for (let c of current.children) {
        yield* helper(currentAcc, c);
      }
    }
    yield* helper(initAcc, this);
  }

  // Postorder traversal, yielding at each node that pass the predicate.
  // Accumulate result UP each branch, from leaves to root.
  *postOrderReducer<S>(
    reduceUp: (acc: S, current: Tree) => S,
    predicate: ((current: Tree) => boolean) | undefined,
    initAcc: S
  ): Generator<S> {
    for (let c of this.children) {
      const childReducers = c.postOrderReducer(reduceUp, predicate, initAcc);
      yield* map(childReducers, (childAcc) => reduceUp(childAcc, this));
    }
    if (predicate ? predicate(this) : true) {
      yield reduceUp(initAcc, this);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                        Iterate through a generator                         */
/* -------------------------------------------------------------------------- */

// Run the iterator to the end and return the last value.
const finalValue = <T>(iterator: Generator<T>): T => {
  let next = iterator.next();
  let prev = next;
  while (!next.done) {
    prev = next;
    next = iterator.next();
  }
  return prev.value;
};

/* -------------------------------------------------------------------------- */
/*                       Functor Methods for Generators                       */
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
  predicate: (value: T) => boolean
): Generator<T> {
  let next = iterator.next();
  while (!next.done) {
    if (predicate(next.value)) {
      yield next.value;
    }
    next = iterator.next();
  }
};
