%default total
%hide Prelude.Functor
%hide Prelude.Applicative
%hide (<*>)
%hide pure

{-
Functor
  fmap: (A -> B) -> F A -> F B
  
Applicative Functor
  pure: A -> F A
  (<*>): F (A -> B) -> F A -> F B   -- apply

Monoidal Functor
  unit: F ()
  (*&*): F A -> F B -> F (A, B)     -- prod

Monoidal Laws:
  map snd (unit *&* x) = x                        left-unit
  map fst (x *&* unit) = x                        right-unit
  (x *&* y) *&* z = fmap asr (x *&* (y *&* z))    associativity
    (x *&* y) : F (X, Y)
    (x *&* y) *&* z : F ((X, Y), Z)
    x *&* (y *&* z) : F (X, (Y, Z))
    asr : (X, (Y, Z)) -> ((X, Y), Z)              associativity right
-}
interface Functor (f : Type -> Type) where
  fmap : (a -> b) -> f a -> f b

interface Functor f => Applicative (f : Type -> Type) where
  pure : a -> f a
  (<*>) : f (a -> b) -> f a -> f b

infixl 6 *&*
interface Functor f => Monoidal (f : Type -> Type) where
  unit : f ()                            -- like "pure ()"
  (*&*) : f a -> f b -> f (a, b)

--------------------------
-- Applicative -> Monoidal
--------------------------
{-
1. Show that given an Applicative you can construct a Monoidal
   Write unit and prod (*&*) in terms of pure and <*>.

   Given:
      pure: A -> F A
      <*>: F (A -> B) -> F A -> F B
      <*>: F (A -> B) -> F A -> F ((A -> B), A)
      (,) : A -> B -> (A, B)

We can save (A->B, A) and apply the function later.
The act of taking a pair in context, is isomorphic to calling the function in context.
Given we have:
    eval(f: (A -> B), a: A): B
We can evaluate the pair of a function and a value.
    map eval (x: F ((A -> B), A)): F B
-}
{-
  pure (,) <*> [1,3,4] <*> [6,2]
= [(,)] <*> [1,3,4] <*> [6,2]
= [(1,), (3,), (4,)] <*> [6,2]
= [(1,6), (1,2), (3,6), (3,2) (4,6), (4,2)]
 -}

-- unit: F ()
unit_ : {f: Type -> Type} -> Applicative f => f () 
unit_ = pure ()

-- (*&*): F A -> F B -> F (A, B)
prod_ : {f: Type -> Type} -> Applicative f => f a -> f b -> f (a, b)
prod_ fa fb = fmap (,) fa <*> fb
  -- (,) : A -> B -> (A, B)
  -- pure (,) : F (A -> B -> (A, B))
  -- pure (,) <*> : F A -> F (B -> (A, B))
  -- fmap (,)     : F A -> F (B -> (A, B))
  -- pure (,) <*> fa : F (B -> (A, B))
  -- pure (,) <*> fa <*> : F B -> F (A, B)
  -- pure (,) <*> fa <*> fb : F (A, B)

{- 
(*&*) : F A -> F B -> F (A, B)
unit : F ()
unit (*&*) : F B -> F ((), B)
unit (*&*) fb : F ((), B)
snd: \(x, y) => y

Prove left unit law:    fmap snd (unit (*&*) fb) = fb
      fmap snd (unit (*&*) fb)
    = fmap snd (fmap (,) unit <*> fb)
    = fmap snd (fmap (,) (pure ()) <*> fb)
    = fmap snd ((pure (,) <*>) (pure ()) <*> fb)
    = fmap snd (pure ((),) <*> fb)
    = fmap snd (fmap ((),) fb)
    = fmap (snd . ((),)) fb
    = fmap id fb
    = fb

fmap first (fb (*&*) unit) = fb -- 

Try to prove monoidal law 1: unit *&* fb = pure () *&* fb
   unit *&* fb
 = prod_ unit fb
 = pure (,) <*> unit <*> fb
 = (pure (,)) <*> (pure ()) <*> fb
 = (pure ((,) ())         ) <*> fb  -- by applicative homomophism law: (pure f) <*> (pure x) = pure (f x)
 = (pure \y => ((), y)    ) <*> fb 
 = ???

Maybe if we say that `\y => ((), y)` is id, then by applicative identity law `(pure id) <*> Fx = Fx`,
this is equal to fb.
 -}

----------------------------------------------------
-- Monoidal -> Applicative
----------------------------------------------------
{-
2. Show that given a Monoidal you can construct an Applicative
   Write pure and <*> in terms of unit and prod *&*.

  Given:
    fmap : (A -> B) -> F A -> F B
    unit : F ()
    (*&*) : F A -> F B -> F (A, B)
-}
-- pure : A -> F A
pure_ : {f: Type -> Type} -> Monoidal f => a -> f a
pure_ a = fmap (const a) unit

eval : (a -> b, a) -> b
eval (f, x) = f x

-- (<*>) : F (A -> B) -> F A -> F B
apply_ : {f: Type -> Type} -> Monoidal f => f (a -> b) -> f a -> f b
apply_ ff fa = fmap eval (ff *&* fa)
  -- eval: (\(f, a) => f a)
  -- ff: F (A -> B)
  -- fa: F A
  -- ff *&* fa : F ((A -> B), A) -- take the functions and values in context, and pair them
  -- fmap eval : F ((A -> B), A) -> F B
  -- fmap eval (ff *&* fa) : F B -- evaluate all the pairs of functions and values

{-
Try to prove applicative law, identity: (pure id) <*> Fx = Fx

  (pure id) <*> fa
= map (\(f, x) => f x) (pure id *&* fa)
= map (\(f, x) => f x) pure (id, extract(fa))
= map (\(f, x) => f x) pure (id, a)
= pure a    ???
 -}

----------------------------------------------------
-- (+) <$> (Just 2) <*> (Just 3)    with Monoidal
----------------------------------------------------
{-
4. How does the (+) <$> (Just 2) <*> (Just 3) example work 
using Monoidal instead (unit, *&*, map)?
    unit: F ()
    (*&*): F A -> F B -> F (A, B)     -- prod
    (<$>): (A -> B) -> F A -> F B     -- map

  map (\(f, a) => f a) ((+) <$> Just 2) *&* Just 3)
= map (\(f, a) => f a) (Just (+2) *&* Just 3)
= map (\(f, a) => f a) Just (+2, 3)
= Just 5
 -}
