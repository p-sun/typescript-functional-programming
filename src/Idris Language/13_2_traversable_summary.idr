-- Note: Comment out the %hide sections and this will still typecheck,
-- because this is how the interfaces are defined in Idris2.

--------------------------
-- Foldable
--------------------------
%hide Foldable
%hide foldl
%hide foldr
%hide foldMap

-- `fold` - Collapses a structure into a single result.
-- foldr -- Combine elements, starting from the right-most element.
-- foldl -- Combine elements, starting from the left-most element.
interface Foldable t where
  foldr : (a -> b -> b) -> b -> t a -> b
  foldl : (b -> a -> b) -> b -> t a -> b

-- Combine elements into a Monoid. (aka concatMap)
-- Like we are mapping (a -> b) and t a to t b, and then smashing the t b down to b.
-- Note that t doesn't have to be a functor, so foldMap is not map.
------ foldMap from foldr
foldMap : Foldable t => Monoid m => (a -> m) -> t a -> m
foldMap f ta = foldr (\a, acc => f a <+> acc) neutral ta

------ foldr from foldMap
foldr_ : Foldable t => Monoid m => (a -> m -> m) -> t a -> m
foldr_ fn ta = foldMap (\a => fn a) ta neutral

----- Foldable List
implementation Foldable List where
  foldr fn z [] = z
  foldr fn z (x :: xs) = fn x (foldr fn z xs)
  foldl fn z [] = z
  foldl fn z (x :: xs) = foldl fn (fn z x) xs

listFoldMap : Monoid m => (a -> m) -> List a -> m
listFoldMap f [] = neutral
listFoldMap f (x :: xs) = (f x) <+> (listFoldMap f xs)
-- listFoldMap = foldMap  -- same as above

--------------------------
-- Traversable
--------------------------
%hide Traversable
%hide traverse
%hide sequence

-- `traverse` is a shape-preserving iteration under an Applicative context.
-- Another intuition is that `traverse` is a ‘map’ under an Applicative context that reassembles the structure `t b` (instead of `folding` it into a single value `b`).
interface Traversable t where
  traverse : Applicative f => (a -> f b) -> t a -> f (t b)
  sequence : Applicative f => t (f a) -> f (t a)
  sequence = traverse id

--------------------------
-- Traversable List, with Promise as the Applicative
--------------------------
Promise : Type -> Type

-- Traverse a structure (List) while combining effects under an Applicative (Promise).
traverseListOfPromises : (Nat -> Promise String) -> List Nat -> Promise (List String)
-- Note: map gives us `List (Promise String)`, traverse gives us `Promise (List String)`.
mapListOfPromises : (Nat -> Promise String) -> List Nat -> List (Promise String)

traverseList : Applicative f => (a -> f b) -> List a -> f (List b)
traverseList _ [] = pure []
traverseList a2fb (x :: xs) = (::) <$> a2fb x <*> traverseList a2fb xs
-- traverseList f xs : f (List b)
-- (<*>) : F (A -> B) -> F A -> F B     -- apply. Let A = List b, B = List b
-- (<*>) : f (List b -> List b) -> f (List b) -> f (List b)
-- 
-- a2fb x : f b
-- (::) : b -> List b -> List b         -- cons
-- (<$>) : (A -> B) -> F A -> F B       -- fmap, Let A = b, B = List b -> List b
-- (<$>) : (b -> List b -> List b) -> f b -> f (List b -> List b)
-- (::) <$> (a2fb x) : f (List b -> List b)
--    Intuition: `map` lifts the function `cons` into the context of `f`.
-- 
-- (::) <$> a2fb x <*> traverseList a2fb xs : f (List b)
-- apply (fmap cons (a2fb x)) (traverseList a2fb xs) : f (List b)
--   Intuition: Lift head `x` into applicative f with `a2fb x : f b`, 
--              lift `cons` into f, 
--              apply the lifted cons on the lifted head and the recursive tail.

--------------------------
-- `traverse` & `sequence` can be implemented with each other
--------------------------
-- `sequence` is a special case of `traverse`.
sequence_ : Traversable t => Applicative f => t (f a) -> f (t a)
sequence_ tfa = traverse id tfa
  
traverse_ : Traversable t => Applicative f => Functor t => (a -> f b) -> t a -> f (t b)
traverse_ a2fb ta = sequence (map a2fb ta)
-- map : (A -> B) -> List A -> List B
-- map : (a -> f b) -> List a -> List (f b)     -- let A = a, B = f b
-- map a2fb : List a -> List (f b)
-- map a2fb ta : List (f b)
--
-- sequence : List (F A) -> F (List A)
-- sequence (map a2fb ta) : F (List b)

--------------------------
-- Some Foldables are Traversable
--------------------------
-- Note result signature has `f ()` instead of `f (t b)`
almostTraverse_ : Foldable t => Applicative f => (a -> f b) -> t a -> f ()
almostTraverse_ a2fb ta = foldr (\a, acc => a2fb a *> acc) (pure ()) ta
-- (*>) : Applicative f => f a -> f b -> f b

--------------------------
-- All Traversable are Foldable
--------------------------
-- Prove "All Traversable are Foldable" above is true by implementing foldMap, using `Const x` as the Applicative in traverse.
-- (We have a Foldable as long as we have a foldMap, b/c  we can implement foldr/l from foldMap.)

------ Implement `Const x` as an Applicative
record Const x (A : Type) where
  constructor MkConst
  getConst : x

implementation Semigroup x => Semigroup (Const x a) where
  (<+>) (MkConst x1) (MkConst x2) = MkConst (x1 <+> x2)

implementation Monoid x => Monoid (Const x a) where
  neutral = MkConst neutral

implementation Monoid x => Functor (Const x) where
  map _ (MkConst x) = MkConst x

implementation Monoid x => Applicative (Const x) where
  pure _ = MkConst neutral
  (MkConst x1) <*> (MkConst x2) = MkConst (x1 <+> x2)

------ Make foldMap from traverse (with `Const x` as the Applicative in traverse).
foldMap_ : (Traversable t, Monoid m) => (a -> m) -> t a -> m
foldMap_ a2m ta = getConst $ traverse (\a => MkConst {A=Type} (a2m a)) ta
--                                                a2m a      : m
--                        \a => MkConst {A=Type} (a2m a)     : a -> Const m Type
--              traverse (\a => MkConst {A=Type} (a2m a)) ta : Const m (t Type)
--   getConst $ traverse (\a => MkConst {A=Type} (a2m a)) ta : m
