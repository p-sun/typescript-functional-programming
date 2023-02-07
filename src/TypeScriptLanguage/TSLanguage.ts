console.log(Array.from('0123')); // ['0', '1', '2', '3']

// Arrays

const arr = ['00', '11', '22', '33'];

// ES2015
for (const [index, value] of arr.entries()) {
  console.log('array1 | index:', index, 'value:', value);
}

arr.forEach((value, index) => {
  console.log('array2 | index:', index, 'value:', value);
});

// --------------------
// Destructuring

const [first] = arr;
// first === '00'

const [head, ...tail] = [1, 2, 3, 4];
// head === 1
// tail === [2, 3, 4]

// --------------------
// Keys
class EmojiClass {
  fox() {}
  '🦊'() {}
}

const emojiClass = new EmojiClass();
emojiClass.fox(); // OK
// emojiClass.'🦊'(); // NOT allowed
emojiClass['🦊'](); // OK

// Trick: If you know for sure you will assign it before you use it
const class2: EmojiClass = undefined as unknown as EmojiClass;
// This solves the problem of having an optional type.
const class3: EmojiClass | undefined = undefined;

// 'Private' is not actually private
// `#` makes it more private.
class Hamburger {
  private cheese: string = 'Cheese!';
  #hCheese: string = '#Cheese!';
}
const h = new Hamburger();
// h.cheese // Not allowed
(h as any)['cheese']; // OK
(h as any).cheese; // OK

// h.#hCheese // Not allowed
// h['#hCheese'] // Not allowed
// (h as any).#hCheese; // Not Allowed

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
