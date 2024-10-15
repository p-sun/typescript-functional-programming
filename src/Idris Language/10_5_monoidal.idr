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
  unit *&* x = x                        left-unit
  x *&* unit = x                        right-unit
  (x *&* y) *&* z = x *&* (y *&* z)     associativity
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

{-
1. Show that given an Applicative you can construct a Monoidal
   Write unit and prod (*&*) in terms of pure and <*>.

   Given:
      pure: A -> F A
      <*>: F (A -> B) -> F A -> F B
      (,) : A -> B -> (A, B)
-}
-- unit: F ()
unit_ : {f: Type -> Type} -> Applicative f => f () 
unit_ = pure ()

-- (*&*): F A -> F B -> F (A, B)
prod_ : {f: Type -> Type} -> Applicative f => f a -> f b -> f (a, b)
prod_ fa fb = pure (,) <*> fa <*> fb
  -- (,) : A -> B -> (A, B)
  -- pure (,) : F (A -> B -> (A, B))
  -- pure (,) <*> : F A -> F (B -> (A, B))
  -- pure (,) <*> fa : F (B -> (A, B))
  -- pure (,) <*> fa <*> : F B -> F (A, B)
  -- pure (,) <*> fa <*> fb : F (A, B)

{-
2. Show that given a Monoidal you can construct an Applicative
   Write pure and <*> in terms of unit and prod *&*.

  Given:
    fmap: (A -> B) -> F A -> F B
    unit : F ()
    (*&*) : F A -> F B -> F (A, B)
-}
-- pure : A -> F A
pure_ : {f: Type -> Type} -> Monoidal f => a -> f a
pure_ a = fmap (\_ => a) unit

-- (<*>) : F (A -> B) -> F A -> F B
apply_ : {f: Type -> Type} -> Monoidal f => f (a -> b) -> f a -> f b
apply_ ff fa = fmap (\(f, a) => f a) (ff *&* fa)
  -- ff: F (A -> B)
  -- fa: F A
  -- ff *&* fa : F ((A -> B), A)
  -- fmap (\(f, a) => f a) : F ((A -> B), A) -> F B
  -- fmap (\(f, a) => f a) (ff *&* fa) : F B 

{-
Homework:

1. Show that given an Applicative you can construct a Monoidal
  Write unit and *&* in terms of pure and <*>
    Try to prove some laws
2. Show that given a Monoidal you can construct an Applicative
  Write pure and <*> in terms of unit and *&*
    Try to prove some laws

3. Really easy: conclude these two definitions are equivalent

4. How does the (+) <$> (Just 2) <*> (Just 3) example work using Monoidal instead (unit, *&*, map)?

5. Challenge (meant to be thought-provoking)... is there some X where
  Monoidal X is isomorphic to the Nats? Strings?

  A: Monoidal List is isomorphic to the Nats.

6. Is lazy a functor? And if so, is an applicative functor? Also, what is its variance?

  A: Yes, lazy is an applicative functor. It acts like a box that holds a value,
  so it has a fmap and apply.
-}
