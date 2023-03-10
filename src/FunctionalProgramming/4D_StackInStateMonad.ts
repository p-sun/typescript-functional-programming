import { Stack } from './4B_StackMonad';
import { State } from './4C_StateMonad';

/* -------------------------------------------------------------------------- */
/*                           Push and Pop - Method 1                          */
/* -------------------------------------------------------------------------- */

namespace Method1 {
  // State function: S -> [S, A]
  function push<T>(t: T): State<Stack<T>, T> {
    return new State((s) => [s.push(t), t]);
  }

  // State function: S -> [S, A]
  function pop<T>(): State<Stack<T>, T | undefined> {
    return new State((s) => s.pop());
  }

  export function runStateStack() {
    console.log('--- runStateStack() ---');

    const stack0 = Stack.empty<number>();
    const stack123 = Stack.empty<number>().push(1).push(2).push(3);

    // const s1: State<Stack<number>, void>
    const emptyState = State.empty<Stack<number>>();
    console.log(`s1: ${emptyState.run(stack123)}`); // s1: [3, 2, 1],undefined

    const s2 = emptyState.bind((_) => push(4));
    console.log(`s2: ${s2.run(stack123)}`); // s2: [4, 3, 2, 1],4

    const s456 = emptyState
      .bind((_) => push(4))
      .bind((_) => push(5))
      .bind((_) => push(6));
    console.log(`s3: ${s456.run(stack123)}`); // s3: [6, 5, 4, 3, 2, 1],6

    const s4 = emptyState
      .bind((_) => push(4))
      .bind((_) => push(5))
      .bind((_) => push(6))
      .bind((_) => pop())
      .map((n) => {
        console.log('Popped: ', n); // 6
        return n;
      })
      .bind((_) => pop())
      .map((n) => {
        console.log('Popped: ', n); // 5
        return n;
      })
      .bind((_) => pop())
      .map((n) => {
        console.log('Popped: ', n); // 4
        return n;
      })
      .bind((_) => pop())
      .map((n) => {
        console.log('Popped: ', n); // undefined
        return n;
      });
    console.log(`s4: ${s4.run(stack0)}`); // s4: [],undefined

    const s5 = emptyState
      .bind((_) => push(3))
      .bind((_) => push(4))
      .bind((_) => push(5)) //  [5, 4, 3],5
      // Map the S in State<S, A>
      .bind((_) => new State((s) => [s.map((n) => n * 10), undefined]));
    console.log(`s5: ${s5.run(stack0)}`); // s5: [50, 40, 30],undefined
  }
}
/* -------------------------------------------------------------------------- */
/*                           Push and Pop - Method 2                          */
/* -------------------------------------------------------------------------- */

namespace Method2 {
  function put<S, T>(newS: S, r: T): State<S, T> {
    return new State((s) => [newS, r]);
  }

  // State function: S -> [S, A]
  function push<T>(t: T): (s: Stack<T>) => State<Stack<T>, T> {
    return (s) => put(s.push(t), t);
  }

  function pop<T>(s: Stack<T>): State<Stack<T>, T | undefined> {
    const [newS, a] = s.pop();
    return put(newS, a);
  }

  export function runStateStack_2() {
    console.log('--- runStateStack_2() ---');

    const stack123 = Stack.empty<number>().push(1).push(2).push(3);

    const test = State.empty<Stack<number>>()
      .getState()
      .bind(push(4))
      .getState()
      .bind(push(4))
      .getState()
      .bind(pop);
    console.log(`test: ${test.run(stack123)}`); // s1: [3, 2, 1],undefined
  }
}

export default function run() {
  Method1.runStateStack();
  Method2.runStateStack_2();
}
