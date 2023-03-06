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
/*                                   Monoid                                   */
/* -------------------------------------------------------------------------- */
/*
A monoid has `empty` and `append`.
empty: A			
append: A -> A -> A  

Law of Identity: “Appending an empty function does nothing to element A.”
append(empty, A)
append(A, empty)

Law of associativity:
append(append(A, B), C) === append(A, append(B, C))
*/

/* -------------------------------------------------------------------------- */
/*                                   Monad                                    */
/* -------------------------------------------------------------------------- */
/*
Monads is a pattern to compose functions that return values wrapped in a type.
'F A' is a monad type constructor, it's like a box that wraps around a value of type A.

A -> A                     // Homogeneous functions (includes F A -> F A)

F A -> A                   // Extract   "Take a value out of a box"

A -> F A                   // Pure      "Put a value in a box"
F A -> F (F A)             // Duplicate "Put a box around a box"

`Functors` have a Map, which needs Pure:
(A -> B)   -> F A -> F B   // Map       "Transform a value inside a box"

`Monads` have a Bind, which needs Join & Map:
F (F A) -> F A             // Join (aka `flatten`) "Take a box out of a box"
(A -> F B) -> F A -> F B   // Join . Map === Bind   (aka `flatMap`) 

`Applicatives` have an Apply, which needs Pure OR Map:
F (A -> B) -> F A -> F B   // Apply "Take a function out of a box and apply it to a value inside a box"
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

  const r3 = Optional.some(1234) // Optional<number>
    .apply(Optional.some((n) => `n:${n}`)) // Optional<(n: number) => string>
    .apply(Optional.some((s) => s === 'n:1234')); // Optional(boolean)
  console.log(`Optional(1234) apply": ${r3}`); // Optional(true)
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

Get type of Join.Map, subbing in concrete types for 'f':
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

class Optional<T> {
  private constructor(private readonly data: Data<T>) {}

  /* ---------------------------------- Pure ---------------------------------- */
  // Pure: A -> F A                     "Put a value in a box"
  // Duplicate: F A -> F (F A)          "Put a box around a box"
  static some<T>(t: T): Optional<T> {
    return new Optional({ tag: 'some', value: t });
  }

  // Pure: A -> F A                      "Put a value in a box"
  static none<T>(): Optional<T> {
    return new Optional<T>({ tag: 'none' });
  }

  /* --------------------------------- Extract -------------------------------- */
  // Extract: F A -> A                  "Take a value out of a box"
  getValue(): T | undefined {
    return this.data.tag === 'some' ? this.data.value : undefined;
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

  // Build Map from Bind & Pure without `this.data`. Bind = flatMap, Pure = some.
  // Pure: A -> F A
  // f: A -> B
  // Pure.f: A -> F B        `Pure.f` === `\x => Pure.f(x)`
  //
  // Bind: (A -> F B) -> F A -> F B
  // Map === Bind[\x => Pure.f(x)] = F A -> F B
  map_2<B>(fn: (t: T) => B): Optional<B> {
    return this.flatMap((t) => Optional.some(fn(t)));
  }

  /* --------------------------- Join (aka Flatten) --------------------------- */
  // Join: F (F A) -> F A               "Take a box out of a box"
  flatten(): T extends Optional<infer S> ? Optional<S> : Optional<T> {
    if (this.data.tag === 'some' && this.data.value instanceof Optional) {
      return this.data.value as any;
    } else {
      return this as any;
    }
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

  // Build 'Bind' with 'Join.Map' without `this.data`.
  // Note that we don't need `this.data`.
  // Map:  (A -> B) -> F A -> F B
  // Map2: (A -> F B) -> F A -> F F B
  //       Make Map2's first param to look like Bind's first param.
  // Join: F F A -> F A
  // Bind === Join.Map2: (A -> F B) -> F A -> F B
  flatMap_2<B>(fn: (t: T) => Optional<B>): Optional<B> {
    return this.map(fn).flatten();
  }

  /* ---------------------------------- Apply --------------------------------- */
  // Build 'apply' from scratch.
  // Apply: F (A -> B) -> F A -> F B
  apply<B>(optionalF: Optional<(t: T) => B>): Optional<B> {
    if (this.data.tag === 'some' && optionalF.data.tag === 'some') {
      return Optional.some(optionalF.data.value(this.data.value));
    } else {
      return this as any;
    }
  }

  // Build 'Apply' from 'Map'.
  // Apply: F (A -> B) -> F A -> F B
  apply_2<B>(optionalF: Optional<(t: T) => B>): Optional<B> {
    if (optionalF.data.tag === 'some') {
      return this.map(optionalF.data.value);
    } else {
      return this as any;
    }
  }

  // Build 'Apply' with 'Bind' and 'Map' without `this.data`.
  //
  // f = (A -> B)
  // Optional(f) = F f = F (A->B)
  // Map: (A -> B) -> F A -> F B
  // Bind: (A -> F B) -> F A -> F B
  // Apply: F (A -> B) -> F A -> F B
  apply_3<B>(optional_f: Optional<(t: T) => B>): Optional<B> {
    // (f) => this.map(f):      (f: (t: T) => B) => Optional<B>     (A -> B) -> F B
    // Use arrow fn `(f) => this.map(f)`, otherwise we'd lose the `this` context.
    return optional_f.flatMap((f) => this.map(f));
  }

  /* ---------------------------------- Utils --------------------------------- */

  toString(): string {
    return `Optional(${this.data.tag === 'some' ? this.data.value : 'none'})`;
  }
}
