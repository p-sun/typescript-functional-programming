export class Stack<T> {
  constructor(private readonly elements: T[]) {}

  static empty<T>(): Stack<T> {
    return new Stack([]);
  }

  push(t: T): Stack<T> {
    const newElements = [t, ...this.elements];
    return new Stack(newElements);
  }

  pop(): [Stack<T>, T | undefined] {
    const [head, ...tail] = this.elements;
    return [new Stack(tail), head];
  }

  toString(): string {
    const separator = ', ';
    let reduced = this.elements.reduce(
      (acc, el) => acc + `${el}` + separator,
      '['
    );
    if (reduced.endsWith(separator)) {
      reduced = reduced.slice(0, -2);
    }
    return reduced + ']';
  }

  // Pure: A -> F A
  static pure<T>(a: T): Stack<T> {
    return new Stack([a]);
  }

  // Join: F (F A) -> F A
  join(): T extends Stack<infer S> ? Stack<S> : Stack<T> {
    const newElements = this.elements.reduce(
      (acc, el) =>
        el instanceof Stack ? [...acc, ...el.elements] : [...acc, el],
      [] as unknown[]
    );
    return new Stack(newElements) as any;
  }

  // Map: F A -> (A -> B) -> F B
  map<U>(fn: (t: T) => U): Stack<U> {
    return new Stack(this.elements.map(fn));
  }

  // Bind: F A -> (A -> F B) -> F B
  bind<U>(fn: (t: T) => Stack<U>): Stack<U> {
    return this.map(fn).join();
  }

  // Apply: F A -> F (A -> B) -> F B
  apply<U>(fa: Stack<(t: T) => U>): Stack<U> {
    return fa.bind((f) => this.map(f));
  }
}

function runStack() {
  console.log(`s0: ${Stack.empty<number>()}`); // s0: []

  const s3 = Stack.pure(0).push(1).push(2).push(3);
  console.log(`s3: ${s3}`); // [3, 2, 1, 0]

  const s4 = s3.bind((x) => Stack.pure(x * 10));
  console.log(`s4: ${s4}`); // [30, 20, 10, 0]

  const s5 = s4.map((x) => new Stack([x * 10]));
  console.log(`s5: ${s5}`); // [[300], [200], [100], [0]]

  const s6 = s5.map((x) => x.map((y) => new Stack([y + 6, y + 8])));
  console.log(`s6: ${s6}`); // [[[306, 308]], [[206, 208]], [[106, 108]], [[6, 8]]]

  const s7 = s6.join();
  console.log(`s7: ${s7}`); // [[306, 308], [206, 208], [106, 108], [6, 8]]

  const s8 = s7.join();
  console.log(`s8: ${s8}`); // [306, 308, 206, 208, 106, 108, 6, 8]

  const [s9, r9] = s8.pop();
  console.log(`s9: ${s9}, ${r9}`); // [308, 206, 208, 106, 108, 6, 8], 306]

  const [s10, r10] = s9.pop()[0].pop()[0].pop();
  console.log(`s10: ${s10}, ${r10}`); // [106, 108, 6, 8], 208

  const s11 = s10.apply(new Stack([(x) => x + 10, (x) => x * 100]));
  console.log(`s10: ${s11}`); // [116, 118, 16, 18, 10600, 10800, 600, 800]
}

export default function run() {
  runStack();
}
