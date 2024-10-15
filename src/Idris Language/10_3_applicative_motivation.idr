%hide (<$>)
%hide (<*>)
%default total

--------------------------
-- Why do we need the apply function?
--------------------------
-- Let's define a new infix map operator on the Maybe functor!
-- `f <$> fa`    is    `map f fa`
(<$>): {A, B: Type} -> (f: A -> B) -> Maybe A -> Maybe B
(<$>) f (Just a) = Just (f a)
(<$>) _ _ = Nothing

-- How do you compute (Just 3) + (Just 5)? ------------------

justPlusThree: Maybe (Nat -> Nat)
justPlusThree = plus <$> (Just 3) -- Just (plus 3)
  -- Just 3 : Maybe Int
  -- plus : Int -> Int -> Int
  -- <$> : (Int -> (Int -> Int)) -> Maybe Int -> Maybe (Int -> Int)

-- Note we can't pass (Just 5) b/c it doesn't typecheck:
-- eightWrong = (plus <$> Just 3) (Just 5)

{-
(plus <$> Just 3) <*> (Just 5)      which is the same as
justPlusThree <*> (Just 5)
What then is the signature of <*> ? Hey, it looks like apply's signature!

<*> : Maybe (Int -> Int) -> Maybe Int -> Maybe Int
 -}

(<*>): {A, B: Type} -> Maybe (A -> B) -> Maybe A -> Maybe B
(<*>) (Just f) (Just a) = Just (f a)
(<*>) _ _ = Nothing

justEight: Maybe Nat
justEight = ((+) <$> Just 3) <*> (Just 5)

--------------------------
-- <$> and <*> as infix ops make functor application look like function application!!!
--------------------------
{-
If p and q are Ints we write
    (+)      p      q

If they are under an applicative we write
    (+) <$> Fp <*> Fq
-}
--------------------------
-- Plus takes 2 args. What about applying a function that takes 3 args?
--------------------------
IsInRange : Int -> Int -> Int -> Bool
IsInRange val min max = val >= min && val <= max

-- Function application.        Is 0 < 1 < 10? Yes.
test5: IsInRange 1 0 10 = True
test5 = Refl

-- Functor application
test6: (IsInRange <$> Just 1 <*> Just 0 <*> Just 10) = Just True
test6 = Refl

{-
How does `isInRange <$> Just 1 <*> Just 0 <*> Just 10` work?

-- (<$>) : (A -> B) -> F A -> F B      
-- Let F = Maybe, A = Int, B = Int -> Int -> Bool
(<$>) :      (Int -> Int -> Int -> Bool) -> Maybe Int -> Maybe (Int -> Int -> Bool)
isInRange <$> :                             Maybe Int -> Maybe (Int -> Int -> Bool)
isInRange <$> (Just 1) :                                 Maybe (Int -> Int -> Bool)

-- (<*>): F (A -> B) -> F A -> F B
-- Let F (A -> B) = Maybe (Int -> Int -> Bool). Thus A = Int, B = Int -> Bool
isInRange <$> (Just 1) <*> :                Maybe Int -> Maybe (Int -> Bool)
isInRange <$> (Just 1) <*> (Just 0) :                    Maybe (Int -> Bool)

-- (<*>): F (A -> B) -> F A -> F B
-- Let F (A -> B) = Maybe (Int -> Bool). Thus A = Int, B = Bool
isInRange <$> (Just 1) <*> (Just 0) <*> :   Maybe Int -> Maybe (Bool)
isInRange <$> (Just 1) <*> (Just 0) <*> (Just 10) :       Maybe Bool

---------
Which is "like":
isInRange 1 0 10 : Bool

---------
Check the implementation of the Maybe's (<$>) & (<*>) :

isInRange <$> (Just 1) <*> (Just 0) <*> (Just 10) : Maybe Bool
  (Just (isInRange 1)) <*> (Just 0) <*> (Just 10)
  (Just (isInRange 1 0))            <*> (Just 10)
  (Just (isInRange 1 0 10))
  Just True

isInRange <$> (Just 1) <*> Nothing <*> (Just 10) : Maybe Bool
  (Just (isInRange 1)) <*> Nothing <*> (Just 10)
  Nothing <*> (Just 10)
  Nothing
-}
