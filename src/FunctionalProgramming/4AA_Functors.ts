/* -------------------------------------------------------------------------- */
/*                              What is a Functor                             */
/* -------------------------------------------------------------------------- */
/**
 A functor FA has a map function adheres to two laws:
 Law 1: map id FA = FA
 Law 2: map g (map f FA) = map (x => g(f(x))) FA
 */

 // ReverseList is NOT a functor because it violates both laws.
class ReverseList<A> {
    constructor(private readonly data: A[]) {}
  
    map<B>(f: (a: A) => B): ReverseList<B> {
      const result = this.data.slice() 
      result.reverse() 
      return new ReverseList(result.map(f)) 
    }
  }
  
  const aList = new ReverseList([1, 2, 3]) 
  
  // Violates functor law 1: map id fa = fa
  // [3, 2, 1]
  const k = aList.map((x) => x) 
  
  // Violates functor law 2: map g (map f FA) = map (x => g(f(x))) FA
  //  map g (map f FA) = ['1?', '2?', '3?']
  const p = aList.map((x) => x.toString()).map((x) => x + '?') 
  
  // map (x => g(f(x))) FA = ['3?', '2?', '1?']
  const q = aList.map((x) => x.toString() + '?') 
  
/* -------------------------------------------------------------------------- */
/*                            Do Functors Compose?                            */
/* -------------------------------------------------------------------------- */
/**
Question: Given functors F & G, do functors F.G compose?
i.e. Can we make F.G's map function so that it satisfies both functor laws?

Proof:
F is a functor
  a) for all A : Type, F A is a Type
     (F : Type -> Type)
  b) F is paired with a function 
     fmap: (A  -> B) -> F A -> F B
  c) Functor law 1: 
     fmap id = id
  d) Functor law 2: 
     (fmap p) . (fmap q) = fmap (p . q)

G is a functor
  a) for all A : Type, G A is a Type
     (G : Type -> Type)
  b) G is paired with a function
     gmap: (A -> B) -> G A -> G B
  c) Functor law 1: gmap id = id
  d) Functor law 2: (gmap p) . (gmap q) = gmap (p . q)

Show F.G is a functor
  a) F.G: Type -> Type
  b) Let F.G's map = fmap . gmap
     map: (A -> B) -> F (G A) -> F (G B)
  c) Prove Functor law 1:
     map id = (fmap . gmap) id = fmap (gmap id) = fmap id = id
  d) Prove Functor law 2:
     (map p) . (map q) = ((fmap. gmap) p) . ((fmap . gmap) q)
      = (fmap (gmap p)) . (fmap (gmap q))
      = fmap ((gmap p) . (gmap q))
      = fmap (gmap (p . q))
      = (fmap . gmap) (p . q)
      = map (p . q)
 */

class WithAHat<T> {
    private readonly data: [T, 'Hat']

    constructor(value: T) {
      this.data = [value, 'Hat']
    }

    map<B>(f: (a: T) => B): WithAHat<B> {
        return new WithAHat(f(this.data[0]))
    }
}

class Maybe<T> {
    constructor(private readonly data: T | undefined) {}

    map<B>(f: (a: T) => B): Maybe<B> {
        if (this.data === undefined) {
            return new Maybe<B>(undefined)
        } else {
            return new Maybe(f(this.data))
        }
    }
}

function maybeWithAHatMap<A, B>(f: (a: A) => B, fa: Maybe<WithAHat<A>>): Maybe<WithAHat<B>> {
  // F.G
    return fa.map((withAHatA) => withAHatA.map(f))
}

const AtoB = (n: number): string => { return `n: ${n}`} 
const fgA = new Maybe<WithAHat<number>>(new WithAHat(8))
const fgB = maybeWithAHatMap(AtoB, fgA)

/* -------------------------------------------------------------------------- */
/*                                 Isomophism                                 */
/* -------------------------------------------------------------------------- */


/**
type Functor<T> = {
  map<A, B>(f: (_: A) => B, fa: this<A>) : this<B>
}




Bifunctor:  Const<A, B> = A
Functor (functors are waiting for a type):  Const<A, ?> = A
Concrete Functor: 

Const is like the identity function, but it's a functor.
*/

/** 
Functors compose:

Reader<T, > will read the generic argument T



Arrow<A, B> = A => B
Arrow3<A, B, C› = A => (B => C) = Arrow<A, Arrow<B,
•С>>

Мар2<K1, К2, V> = Мар<К1, Мар<К2, V»> = Мар<|K1, K2), V>

Because they compose, we can always put T in the Some_Functor<T>.
 */



export default function run() { }