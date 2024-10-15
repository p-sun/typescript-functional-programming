type Reader<X> = (s: string) => X;

//For reader: A -> F A == A -> (string -> A)
function readerPure<A>(a: A): Reader<A> {
  return () => a;
}

// F (A -> B) -> F A -> F B == Reader<(a: A) => B> -> Reader<A> -> Reader<B>
function readerApply<A, B>(
  readerF: Reader<(a: A) => B>,
  readerA: Reader<A>
): Reader<B> {
  return (s: string) => readerF(s)(readerA(s));
}

type ToString<X> = (x: X) => string; // 'hamburger' is special
const specialString = 'hamburger';

// () => string

// A -> F A == A -> ToString<A> == A -> (a: A) => string
function toStringPure<A>(a: A): ToString<A> {
  return (a: A) => specialString;
}

// F (A -> B) -> F A -> F B == ToString<(a: A) => B> -> ToString<A> -> ToString<B>
function toStringApply<A, B>(
  Ff: (f: (a: A) => B) => string,
  Fa: (x: A) => string
): (b: B) => string {
  return (b: B) => Ff((a: A) => b);
}
