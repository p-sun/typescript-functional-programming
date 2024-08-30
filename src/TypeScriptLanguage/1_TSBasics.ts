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

class Animal {
  constructor(public name: string) {}

  move(distanceInMeters: number = 0) {
    console.log(`${this.name} moved ${distanceInMeters}m.`);
  }
}

class Bird extends Animal {
  constructor(name: string, public canFly: boolean) {
    super(name);
  }

  fly() {
    if (this.canFly) {
      console.log('I can fly!');
    } else {
      console.log('I cannot fly!');
    }
  }
}

const bird = new Bird('Bird', true);
bird.fly();
bird.move(10);

// throw new Error('This is an error');

function forLoop() {
  for (let i = 0; i < 5; i++) {
    // const element = array[i];
  }
}

export default function run() {}