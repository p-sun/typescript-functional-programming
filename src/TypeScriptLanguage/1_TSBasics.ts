console.log(Array.from('0123')); // ['0', '1', '2', '3']

// --------------------
// Arrays

const arr = ['00', '11', '22', '33'];

function forLoops() {
  for (let i = 0; i < arr.length; i++) {
    console.log(`i: ${i} | value: ${arr[i]}`)
  }

  for (const n of arr) {
    console.log(`value: ${n}`)
  }

  for (const [i, n] of arr.entries()) { // ES2015
    console.log(`i: ${i} | value: ${n}`);
  }

  arr.forEach((n, i) => {
    console.log(`i: ${i} | value: ${n}`);
  });
}

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
  fox() { }
  '🦊'() { }
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
  constructor(public name: string) { }

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

const bird: Animal = new Bird('Bird', true);
bird.move(10)
if (bird instanceof Bird) {
  bird.fly()
}

// Type Narrowing
type TaggedAnimal =
  { tag: "pigeon", fly: () => void, birdId?: number } |
  { tag: "person", name: string }

const handleAnimal = (animal: TaggedAnimal) => {
  if (animal.tag === "pigeon") {
    animal.fly()
  }
  if ("fly" in animal) {
    animal.fly()
    delete animal.birdId
  }
}

// Class Declaration ------
class Counter {
  private _count: number = 0;

  get count(): number {
    return this._count;
  }

  set count(value: number) {
    this._count = value;
  }
}

class ConstructorExample {
  constructor(public readonly readOnly: string, public readWrite: number, private privateOnly: boolean) { }

  doStuff() {
    this.readOnly
    this.readWrite
    this.privateOnly
  }
}
const constructorExample = new ConstructorExample('read only', 42, true);
constructorExample.readOnly
constructorExample.readWrite = 43
// constructorExample.privateOnly // Cannot access

// Error Handling ------
// throw new Error('This is an error');

export default function run() { }