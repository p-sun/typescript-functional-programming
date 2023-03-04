/* -------------------------------------------------------------------------- */
/*                  Make a sandwhich with `map` and `reduce`                  */
/* -------------------------------------------------------------------------- */

// Step 1: Start with an array of ingredients.
const items = ['🥬', '🍅', '🧀'];

// Step 2: Slice all the items.
// Use `map` to perform an action on every item.
// ['sliced 🥬', 'sliced 🍅', 'sliced 🧀'];
const slicedItems = items.map((item) => `sliced ${item}`);

// Step 3: Assemble a sandwhich.
// Use `reduce` to combine multiple items into one item.
// 'MY SANDWHICH: sliced 🥬 | sliced 🍅 | sliced 🧀 |'
const sandwhich = slicedItems.reduce(
  (sandwhich, item) => `${sandwhich} ${item} | `,
  'MY SANDWHICH: '
);

/* -------------------------------------------------------------------------- */
/*                          Implement Map from Scrach                         */
/* -------------------------------------------------------------------------- */

// F A -> (A -> B) -> F B
// "give me an F A and an (A -> B) and I will give you an F B)
function arrayMap<T, S>(list: S[], fn: (n: S) => T): T[] {
  const result: T[] = [];
  for (const n of list) {
    result.push(fn(n));
  }

  return result;
}

// ['num: 1', 'num: 2', 'num: 3']
const m = arrayMap([1, 2, 3], (n) => 'num: ' + n.toString());

/* -------------------------------------------------------------------------- */
/*                        Implement Reduce from Scratch                       */
/* -------------------------------------------------------------------------- */

function arrayReduce<T, S>(
  list: T[],
  fn: (acc: S, element: T) => S,
  initialValue: S
): S {
  let result = initialValue;
  for (const element of list) {
    result = fn(result, element);
  }

  return result;
}

// '-1-2-3'
const n = arrayReduce([1, 2, 3], (acc, x) => acc + '-' + x.toString(), '');
