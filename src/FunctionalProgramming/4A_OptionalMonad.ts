/* -------------------------------------------------------------------------- */
/*                              Compose Operator                              */
/* -------------------------------------------------------------------------- */
/*
'.' is the "compose" operator:
    (g . f)                  // Regular parenthesis notation we're used to
=== \x => g(f(x))            // Lambda notation
=== g f                      // Haskell notation. The 'x' is automatically curried.
*/

/* -------------------------------------------------------------------------- */
/*                                   Monads                                   */
/* -------------------------------------------------------------------------- */
/*
Monads are a way to compose functions that return values wrapped in a context.

A -> A                     // Homogeneous functions (includes F A -> F A)

A -> F A                   // Pure ("add an F to A")
F A -> F (F A)             // Duplicate ("add an F to an F")

F A -> A                   // Extract ("remove an F from A")
F (F A) -> F A             // Join (aka `flatten`. "removes an F from an F")

(A -> B)   -> F A -> F B   // Map                   (`Functors` have a Map)
(A -> F B) -> F A -> F B   // Join . Map === Bind   (aka `flatMap`. `Monads` have a Bind, Map, and Join)
*

/* -------------------------------------------------------------------------- */
/*                                     Run                                    */
/* -------------------------------------------------------------------------- */
// The Optional monad allows us to chain functions `fn: (A -> F B)` using flatMap(fn).
// `flatMap` is often called `bind`. In Haskell's, this is the >>= operator.

export default function run() {
  const r1 = Optional.some('99,3') // Optional<string>      "99,3"
    .flatMap(split) // Optional<[string, string]>           ["99", "3"]
    .flatMap(parse) // Optional<[number, number]>           [99, 3]
    .flatMap(divide); // Optional<number>                   33
  console.log(`"99,3": ${r1}}`); // Optional(33)

  const r2 = Optional.some('99,aaa') // Optional<string>    "99,aaa"
    .flatMap(split) // Optional<[string, string]>           ["99", "aaa"]
    .flatMap(parse) // Optional<[number, number]>           Optional(none)
    .flatMap(divide); // Optional<number>                   Optional(none)
  console.log(`"99,aaa": ${r2}}`); // Optional(none)
}

// A -> F B
function split(s: string): Optional<[string, string]> {
  const r = s.split(',');
  const left = r[0];
  const right = r[1];
  return r.length === 2 && left.length > 0 && right.length > 0
    ? Optional.some([left, right])
    : Optional.none();
}

// A -> F B
function parse(strs: [string, string]): Optional<[number, number]> {
  const x = parseInt(strs[0]);
  const y = parseInt(strs[1]);
  return x && y ? Optional.some([x, y]) : Optional.none();
}

// A -> F B
function divide(nums: [number, number]): Optional<number> {
  const [x, y] = nums;
  return y !== 0 ? Optional.some(x / y) : Optional.none();
}

/* -------------------------------------------------------------------------- */
/*                     flatMap_2: Make Bind with Join.Map                     */
/* -------------------------------------------------------------------------- */
/* 2 ways of getting the type of type of Bind === Join.Map:
    
Get type of Join.Map, without involving 'f':
    Map:       (A -> [B])   -> F A -> F [B]              // Add [braces] to make [B] easier to see.
             (A -> [F B])   -> F A -> F [F B]            // Sub `[F B]` into `[B]`.
    Join:                             F F B   -> F B
Bind=Join.Map: (A -> F B)   -> F A            -> F B     // Apply Join to the result of Map.

Get type of Join.Map, subbing in the concrete types for 'f':
    f:          A -> [F B]
    Map:       (A -> [B])   -> F A -> F [B]
    Map(f):                    F A -> F [F B]            // Sub `f`, thus sub `[F B]` into `[B]`.
    Join:                             F F B   -> F B
Bind=Join.(Map f):             F A            -> F B     // Apply Join to the result of Map(f).
Bind=Join.Map: (A -> F B)   -> F A ->   F B              // Curry f.
*/

/* -------------------------------------------------------------------------- */
/*                               Optional Monad                               */
/* -------------------------------------------------------------------------- */

type Data<T> = { tag: 'some'; value: T } | { tag: 'none' };

type FlattenOnce<T> = T extends Optional<infer S> ? Optional<S> : Optional<T>;
type FlattenAll<T> = T extends Optional<infer S> ? FlattenAll<S> : Optional<T>;

class Optional<T> {
  private constructor(private readonly data: Data<T>) {}

  /* ---------------------------------- Pure ---------------------------------- */
  // Pure: A -> F A
  static some<T>(t: T): Optional<T> {
    return new Optional({ tag: 'some', value: t });
  }

  // Pure: A -> F A
  static none<T>(): Optional<T> {
    return new Optional<T>({ tag: 'none' });
  }

  /* --------------------------------- Extract -------------------------------- */
  // Extract: F A -> A                 "removes an F from F A"
  getValue(): T | undefined {
    return this.data.tag === 'some' ? this.data.value : undefined;
  }

  /* --------------------------- Join (aka Flatten) --------------------------- */
  // Join: F (F A) -> F A               "removes an F from F F A")
  private flattenOnce(): FlattenOnce<T> {
    if (this.data.tag === 'some' && this.data.value instanceof Optional) {
      return this.data.value as any;
    } else {
      return this as any;
    }
  }

  // Flatten recursively.
  // F F F F F A -> F A
  flatten(): FlattenAll<T> {
    if (this.data.tag === 'some' && this.data.value instanceof Optional) {
      return this.data.value.flatten() as any;
    } else {
      return this as any;
    }
  }

  /* ----------------------------------- Map ---------------------------------- */
  // Build Map from scratch.
  // Map: (A -> B) -> F A -> F B
  map<B>(fn: (t: T) => B): Optional<B> {
    if (this.data.tag === 'some') {
      return Optional.some(fn(this.data.value));
    } else {
      return this as any;
    }
  }

  // Build Map from Bind & Pure.    e.g. Bind = flatMap, Pure = some.
  // Pure: A -> F A
  // f: A -> B
  // Pure.f: A -> F B        `Pure.f` === `\x => Pure.f(x)`
  //
  // Bind: (A -> F B) -> F A -> F B
  // Bind[\x => Pure.f(x)] = F A -> F B
  map_2<B>(fn: (t: T) => B): Optional<B> {
    return this.flatMap((t) => Optional.some(fn(t)));
  }

  /* ------------------------------ Bind/FlatMap ------------------------------ */
  // Build Bind from scratch.
  // Bind: (A -> F B) -> F A -> F B
  flatMap<B>(fn: (t: T) => Optional<B>): Optional<B> {
    if (this.data.tag === 'some') {
      return fn(this.data.value);
    } else {
      return this as any;
    }
  }

  // Alternatively, build 'Bind' with 'Join.Map'.
  // Note that we don't need `this.data`.
  // Map: (A -> B) -> F A -> F B
  // Map2: (A -> F B) -> F A -> F F B     // Make Map2's first param to look like Bind's first param.
  // Join: F F A -> F A
  // Bind === Join.Map2: (A -> F B) -> F A -> F B
  flatMap_2<B>(fn: (t: T) => Optional<B>): Optional<B> {
    return this.map(fn).flattenOnce();
  }

  /* ---------------------------------- Utils --------------------------------- */

  toString(): string {
    return `Optional(${this.data.tag === 'some' ? this.data.value : 'none'})`;
  }
}
