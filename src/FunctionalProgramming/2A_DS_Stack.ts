/* -------------------------------------------------------------------------- */
/*                                Mutable Stack                               */
/* -------------------------------------------------------------------------- */
// An ordered list of items that supports push and pop.
//      like a stack of plates in a dinner
//      LIFO - last in is the first out, or alternatively
//      FILO - first in is the last out

class MutableStack<T> {
  constructor(private elements: T[]) {}

  push(t: T): void {
    this.elements.push(t);
  }

  pop(): T | undefined {
    return this.elements.pop();
  }
}

/* -------------------------------------------------------------------------- */
/*                        Immutable Stack -- Full Copy                        */
/* -------------------------------------------------------------------------- */
// Major downside of immutable datastructures:
// * you can spend a lot more time mallocing and memcpying.

class ImmutableStackFullCopy<T> {
  constructor(private elements: T[]) {}

  push(t: T): ImmutableStackFullCopy<T> {
    const newElements = [t, ...this.elements];
    return new ImmutableStackFullCopy(newElements);
  }

  pop(): [T | undefined, ImmutableStackFullCopy<T>] {
    const [head, ...tail] = this.elements;
    return [head, new ImmutableStackFullCopy(tail)];
  }
}

/* -------------------------------------------------------------------------- */
/*                Immutable Stack -- Persistent Data Structures               */
/* -------------------------------------------------------------------------- */
// Reuses major pertions of pre-mutated objects.
// i.e. tail is a reference to the previous stack.

class ImmutableStack<T> {
  constructor(private data: { head: T; tail: ImmutableStack<T> } | undefined) {}

  static empty<T>(): ImmutableStack<T> {
    return new ImmutableStack<T>(undefined);
  }

  toString(): string {
    return this.data
      ? `${this.data.head}, ${this.data.tail.toString()}`
      : '<empty>';
  }

  push(t: T): ImmutableStack<T> {
    return new ImmutableStack({ head: t, tail: this });
  }

  pop(): { head: T | undefined; tail: ImmutableStack<T> } {
    if (this.data) {
      return { head: this.data.head, tail: this.data.tail };
    } else {
      return { head: undefined, tail: this };
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                          Immutable Stack -- onPop                          */
/* -------------------------------------------------------------------------- */
// Can add two levels of function redirection so the stack API is the similar to above:
// Differences to ImmutableStack above:
//    * pop() can't return head since run() can call onPop() async.
//    * describe() can't return string directly like toString(), must return it in a callback instead.
// Constructor:
//    * onPop(data: {head, tail}) -- takes head & tail.
//    * run(onPop) -- runs onPop by passing it head & tail.

class Stack<T> {
  constructor(
    public readonly run: (
      onPop: (data: { head: T; tail: Stack<T> } | undefined) => void
    ) => void
  ) {}

  static empty<T>(): Stack<T> {
    return new Stack((onPop) => {
      onPop(undefined);
    });
  }

  push(t: T): Stack<T> {
    return new Stack((onPop) => {
      onPop({ head: t, tail: this });
    });
  }

  pop(): Stack<T> {
    return new Stack<T>((onPop) => {
      this.run((data) => {
        if (data) {
          data.tail.run(onPop);
        } else {
          onPop(undefined);
        }
      });
    });
  }

  describe(fn: (s: string) => void): void {
    this.run((data) => {
      if (data) {
        data.tail.describe((s) => fn(`${data.head}, ${s}`));
      } else {
        fn('<empty>');
      }
    });
  }
}

/* -------------------------------------------------------------------------- */
/*                                     Run                                    */
/* -------------------------------------------------------------------------- */

function runImmutableStack() {
  const stack0 = ImmutableStack.empty().push(1).push(2).push(3);
  console.log(`ImmutableStack: ${stack0}`); // 3, 2, 1, <empty>

  const { tail: stack1 } = stack0.pop();
  console.log(`ImmutableStack: ${stack1}`); // 2, 1, <empty>

  const { tail: stack2 } = stack1.pop();
  console.log(`ImmutableStack: ${stack2}`); // 1, <empty>

  const { tail: stack3 } = stack2.pop();
  console.log(`ImmutableStack: ${stack3}`); // <empty>

  const { tail: stack4 } = stack3.pop();
  console.log(`ImmutableStack: ${stack4}`); // <empty>
}

function runOnPopStack() {
  let s = new Stack((onPop) => {
    setTimeout(() => {
      onPop({ head: 8, tail: Stack.empty() });
    }, 100);
  });

  s = s.push(9).push(10);
  s.describe(logOnPopStack); // 10, 9, 8, <empty>

  s = s.pop();
  s.describe(logOnPopStack); // 9, 8, <empty>

  s = s.pop();
  s.describe(logOnPopStack); // 8, <empty>

  s = s.pop();
  s.describe(logOnPopStack); // <empty>

  s = s.pop();
  s.describe(logOnPopStack); // <empty>
}

function logOnPopStack(s: string) {
  console.log(`OnPopStack: ${s}`);
}

export default function run() {
  runImmutableStack();
  runOnPopStack();
}
