%default total
%hide Prelude.Functor
%hide Prelude.Applicative
%hide (<*>)
%hide (<$>)
%hide pure

-- idris call "type classes" inteface
interface Functor (f : Type -> Type) where
  (<$>) : (a -> b) -> f a -> f b

interface Functor f => Applicative (f : Type -> Type) where
  pure : a -> f a
  (<*>) : f (a -> b) -> f a -> f b

infixl 6 *&*
interface Functor f => Monoidal (f : Type -> Type) where
  unit : f ()                            -- like "pure ()"
  (*&*) : f a -> f b -> f (a, b)

--------------------------
-- Lift
--------------------------
-- "Lift" raises a a function into a context.
--  We say that you can implement Applicatives with pure and apply OR unit and prod.
--  From either of those two sets you can construct liftA2:

liftA2 : {f : Type -> Type} -> Applicative f => (a -> b -> c) -> f a -> f b -> f c
liftA2 f x y = f <$> x <*> y
  -- fmap f fa : f (b -> c)
  -- (fmap f fa) <*> fb : f c
  -- f <$> fa <*> fb : f c

liftA2_ : {f : Type -> Type} -> Monoidal f => (a -> b -> c) -> f a -> f b -> f c
liftA2_ f fa fb = (\(a, b) => f a b) <$> (fa *&* fb)
  -- fa *&* fb : f (a, b)
  -- (\(a, b) => f a b) <$> : f (a, b) -> f c
  -- (\(a, b) => f a b) <$> (fa *&* fb) : f c

liftA3: {f : Type -> Type} -> Applicative f => (a -> b -> c -> d) -> f a -> f b -> f c -> f d
liftA3 f fa fb fc = f <$> fa <*> fb <*> fc
  -- f <$> : f a -> f (b -> c -> d)
  -- f <$> fa : f (b -> c -> d)
  -- f <$> fa <*> : f b -> f (c -> d)
  -- f <$> fa <*> fb :  f (c -> d)
  -- f <$> fa <*> fb <*> : f c -> f d
  -- f <$> fa <*> fb <*> fc : f d

-- liftA0 is isomorphic to pure.
liftA0: {f: Type -> Type} -> Applicative f => (() -> a) -> f () -> f a
liftA0 f _ = pure (f ())

-- liftA1 is just functor map.
liftA1:  {f: Type -> Type} -> Functor f => (a -> b) -> f a -> f b
liftA1 f fa = f <$> fa

--------------------------
-- liftA2 -> Apply
--------------------------
--  If you make pure and liftA2 as your "2 main ingredients" then you can make apply as well.
apply_: {f: Type -> Type} -> Applicative f => f (a -> b) -> f a -> f b
apply_ ff fa = liftA2 id ff fa
  -- liftA2 : (A -> B -> C) -> f A -> f B -> f C
  -- If A = a -> b, B = a, C = b, we can get right type for the output 
  -- liftA2 = ((a -> b) -> a -> b) -> (f (a -> b)) -> f a -> f b
  -- liftA2 id : f (a -> b) -> f a -> f b
