/* -------------------------------------------------------------------------- */
/*                           State Monad as a Class                           */
/* -------------------------------------------------------------------------- */

// runState: S => [S, A]
//   S - background type, the data type inside the monad.
//   A - forground type, the unwrapped type you work with outside the monad.
//
//   State<S, ???> is a monad.
export class State<S, A> {
  constructor(private readonly runState: (s: S) => [S, A]) {}

  static empty<S>(): State<S, void> {
    return new State((s) => [s, undefined]);
  }

  // A -> F A
  static pure<S, A>(a: A): State<S, A> {
    return new State((s) => [s, a]);
  }

  // F A -> (A -> B) -> F B
  map<B>(fn: (a: A) => B): State<S, B> {
    return new State((s) => {
      const [newS, a] = this.runState(s);
      return [newS, fn(a)];
    });
  }

  // F A -> (A -> F B) -> F B
  bind<B>(fn: (a: A) => State<S, B>): State<S, B> {
    return new State((s) => {
      const [newS, a] = this.runState(s);
      return fn(a).runState(newS);
    });
  }

  // F (F A) -> F A
  join<A extends State<S, any>>(
    this: State<S, A>
  ): State<S, A extends State<S, infer InnerA> ? State<S, InnerA> : never> {
    return new State((s) => {
      const [newS, a] = this.runState(s);
      return a.runState(newS);
    });
  }

  // F A -> F (A -> B) -> F B
  apply<B>(this: State<S, (a: A) => B>, fa: State<S, A>): State<S, B> {
    return new State((s) => {
      const [newS, a] = fa.runState(s);
      const [newS2, f] = this.runState(newS);
      const b = f(a);
      return [newS2, b];
    });
  }
  /* ---------------------------------- Utils --------------------------------- */

  run(s: S): [S, A] {
    return this.runState(s);
  }

  // Extract state from background (bg) to foreground (fg)
  //                 bg  -> [fg, result]
  getState(): State<S, S> {
    return new State((s) => {
      const [newS, a] = this.runState(s);
      return [newS, newS];
    });
  }

  toString(): string {
    const [newS, a] = this.runState(undefined as any);
    return `[State] ${a}`; // Recursively run toString() on nested States
  }
}

/* -------------------------------------------------------------------------- */
/*                        State Monad as Pure Functions                       */
/* -------------------------------------------------------------------------- */

// We can implement monads as pure functions or as classes.
namespace FunctionVersion {
  // F A = State<S, A>
  // F B = State<S, B>
  type State<S, A> = (s: S) => [S, A];

  // A -> F A
  export function pure<S, A>(a: A): State<S, A> {
    return (s) => [s, a];
  }

  // F A -> (A -> B) -> F B
  function map<S, A, B>(fa: State<S, A>, fn: (a: A) => B): State<S, B> {
    return (s) => {
      const [newS, a] = fa(s);
      return [newS, fn(a)];
    };
  }

  // F A -> (A -> F B) -> F B
  function bind<S, A, B>(
    fa: State<S, A>,
    fn: (a: A) => State<S, B>
  ): State<S, B> {
    return (s) => {
      const [newS, a] = fa(s);
      return fn(a)(newS);
    };
  }

  // F (F A) -> F A
  function join<S, A>(ffa: State<S, State<S, A>>): State<S, A> {
    return (s) => {
      const [newS, a] = ffa(s);
      return a(newS);
    };
  }

  // F (A -> B) -> F A -> F B
  function apply<S, A, B>(
    fab: State<S, (a: A) => B>,
    fa: State<S, A>
  ): State<S, B> {
    return (s) => {
      const [newS, a] = fa(s);
      const [newS2, f] = fab(newS);
      const b = f(a);
      return [newS2, b];
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                               Run State Monad                              */
/* -------------------------------------------------------------------------- */

function runStateMonad() {
  console.log('--- runState() ---');

  const s1 = State.pure<number, string>('Hello');
  console.log(`s1: ${s1.run(100)}`); // 100,hello

  const s2 = s1.map((x) => x + 'World');
  console.log(`s2: ${s2.run(100)}`); // 100,hello world

  // State<number, string>
  const s3 = s2.bind((x) => State.pure(x + '-33'));
  console.log(`s3: ${s3}`); // [State] HelloWorld-33

  // State<number, State<unknown, string>>
  const s4 = s3.map((x) => State.pure<number, string>(x + '-44'));
  console.log(`s4: ${s4}`); // [State] [State] HelloWorld-33-44

  // State<number, State<unknown, State<unknown, string>>>
  const s5 = s4.map((x) => State.pure<number, State<number, string>>(x));
  console.log(`s5: ${s5}`); //  [State] [State] [State] HelloWorld-33-44

  // @ts-expect-error
  s3.join(); // ERROR: Join is for nested States. s3 is `State<number, string>`.
  s4.join(); // OK
  s5.join(); // OK
  console.log(`s5.join(): ${s5.join()}`); // [State] [State] HelloWorld-33-44
}

/* -------------------------------------------------------------------------- */
/*                                     Run                                    */
/* -------------------------------------------------------------------------- */

export default function run() {
  runStateMonad();
}
