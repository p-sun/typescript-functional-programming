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
foldMap : Foldable t => Monoid m => (a -> m) -> t a -> m
foldMap f ta = foldr (\a, acc => f a <+> acc) neutral ta

--------------------------
-- Foldable List
--------------------------
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
--   Intuition: Lift head into applicative f `a2fb x : f b`, 
--              lift `cons` into f, 
--              apply the lifted cons on the lifted head and the recursive tail.

--------------------------
-- `traverse` & `sequence` can be implemented with each other
--------------------------
-- `sequence` is a special case of `traverse`.
sequence_ : Traversable t => Applicative f => t (f a) -> f (t a)
sequence_ tfa = traverse id tfa
  
traverse__ : Traversable t => Applicative f => Functor t => (a -> f b) -> t a -> f (t b)
traverse__ a2fb ta = sequence (map a2fb ta)
-- map : (A -> B) -> List A -> List B
-- map : (a -> f b) -> List a -> List (f b)     -- let A = a, B = f b
-- map a2fb : List a -> List (f b)
-- map a2fb ta : List (f b)
--
-- sequence : List (F A) -> F (List A)
-- sequence (map a2fb ta) : F (List b)

--------------------------
-- `traverse` can be implemented as folding under an Applicative context
--------------------------
traverse_ : Foldable t => Applicative f => (a -> f b) -> t a -> f ()
traverse_ a2fb ta =
  foldr (\a, acc => a2fb a *> acc) (pure ()) ta
  -- (*>) : Applicative f => f a -> f b -> f b
