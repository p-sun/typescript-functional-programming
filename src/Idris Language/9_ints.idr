%default total
%hide Prelude.Ordering
%hide Prelude.minus
{-
Make an inductive data type `NInt` that is isomorphic to the integers. Implement its add function.

"Structural recursion" is when you literally use a subexpression. `%default total` checks for this.
    Note that `P a` is NOT a subexpression of `P (S a)`.
    The only subexpressions of `P (S a)` are `S a` and `a`.

"Bounded recursion" is when the "depth of the term" shrinks. Idris doesn't support checking for bounded recursion.
    `add (P (S k)) (N (S j)) = add (P k) (N j)`
 -}

--------------------------
-- Ordering
--------------------------
data Ordering : Type where
  LE : Ordering
  EQ : Ordering
  GE : Ordering

compareNat : Nat -> Nat -> Ordering
compareNat 0 0 = EQ
compareNat (S m) (S n) = compareNat m n
compareNat (S _) 0 = GE
compareNat 0 (S _) = LE

testC1_: compareNat 2 1 = GE
testC1_ = Refl
--------------------------
-- minus -- same behavior as Prelude.minus
--------------------------
minus: Nat -> Nat -> Nat
minus 0 a = 0
minus a 0 = a
minus (S a) (S b) = minus a b

-- Test how Prelude.minus works
test1_: minus 6 2 = 4
test1_ = Refl

test2_: minus 2 4 = 0
test2_ = Refl

--------------------------
-- Integer
--------------------------
data NInt: Type where
    Zero: NInt
    P: Nat -> NInt
    N: Nat -> NInt

plusNInt: NInt -> NInt -> NInt 
plusNInt Zero b = b
plusNInt a Zero = a
plusNInt (P a) (P b) = P (a + b + 1)
plusNInt (N a) (N b) = N (a + b + 1)
plusNInt (P a) (N b) = case compareNat a b of
  EQ => Zero
  GE => P (minus a (b+1))
  LE => N (minus b (a+1))
plusNInt (N a) (P b) =  case compareNat a b of
  EQ => Zero
  GE => N (minus a (b+1))
  LE => P (minus b (a+1))

--------------------------
-- Tests
--------------------------
-- 1 + 3 = 4
test3_ : plusNInt (P 0) (P 2) = (P 3)
test3_ = Refl
-- -1 + -3 = -4
test5_ : plusNInt (N 0) (N 2) = (N 3)
test5_ = Refl

-- 5 + -2 = 3
test4_ : plusNInt (P 4) (N 1) = P 2
test4_ = Refl
test8_ : plusNInt (N 1) (P 4) = P 2
test8_ = Refl

-- 2 + -5 = -3
test6_ : plusNInt (N 4) (P 1) = N 2
test6_ = Refl
test7_ : plusNInt (P 1) (N 4) = N 2
test7_ = Refl
