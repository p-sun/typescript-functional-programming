{-
TERM: Whenever you can implement a function of the form: (a,b) -> a = b (like above)
we say that a and b are "propositionally equal".

TERM: Whenever the Idris typechecker can determine if two things are equal,
we call them "judgementally equal".

pluz Z x = x        true judgementally
plus x Z = x        true propositionally

abc : Foo -> Bar
def : Foo
ghi = abc def       true judgementally 

Note, we can try specific xs, and it'll always be equal judgementally!
  plus Z Z = Z                    true, judgementally
  plus (S Z) Z = (S Z)            true, judgementally
  (plus (S Z) Z) = (S (S Z))      true, judgementally

While we can't just say "plus x Z = x" we can say,
"for all x, plus x Z = x". We prove this below by implementing plusZeroRight/plusNatZ.
-}

-- This structure is isomorphic to (Either Bool Nat).
-- So Idris compiler will implement these two similarily.
data Foo : Type where 
  Pickles : Foo
  Apples : Foo
  Bananas: (n: Nat) -> Foo

--------------------------
-- Proving Plus Zero Right - `plus n Z = n`.
--------------------------
-- Recall the definition of plus, so we know `plus Z n = n`:
{-
plus: Nat -> Nat -> Nat
plus Z n = n
plus (S m) n = S (plus m n)
-}

-- Now we prove `plus n Z = n`.
plusZeroRight : (n : Nat) -> (plus n Z) = n
plusZeroRight Z = Refl -- (plus Z Z) == Z
plusZeroRight (S n) = cong S (plusZeroRight n)
-- plusZeroRight (S n) = cong {A=Nat, B=Nat, x=(plus n Z), y=n} S (plusZeroRight n)

--------------------------
-- Finding implementation step-by-step - Method 1
--------------------------
-- plusZeroRight n              Input type of the type signature
-- -> (plus (S n) Z) == (S n)   Output type of the type signature
-- =  (S (plus n Z)) == (S n)
-- = cong S ((plus n Z) == n)
-- = cong S (plusZeroRight n)   Recursively call itself

--------------------------
-- Finding implementation step-by-step - Method 2
--------------------------
plusNatZ_1: (n: Nat) -> plus n Z = n
plusNatZ_1 Z = Refl
plusNatZ_1 (S k) = let recCall = plusNatZ_1 k in
  let icecream = cong in
    ?TODO -- icecream : (0 f : (t -> u)) -> (0 _ : a = b) -> f a = f b

plusNatZ_2: (n: Nat) -> plus n Z = n
plusNatZ_2 Z = Refl
plusNatZ_2 (S k) = let recCall = plusNatZ_2 k in
  let icecream = cong S in
    ?TODO2 -- icecream : (0 _ : ?a = ?b) -> S ?a = S ?b

plusNatZ_3: (n: Nat) -> plus n Z = n
plusNatZ_3 Z = Refl
plusNatZ_3 (S k) = let recCall = plusNatZ_3 k in
  let icecream = cong S recCall in
    ?TODO3 -- icecream : S (plus k 0) = S k

plusNatZ_4: (n: Nat) -> plus n Z = n
plusNatZ_4 Z = Refl
plusNatZ_4 (S k) = let recCall = plusNatZ_4 k in
  cong S recCall

-- Final implementation is the same as plusZeroRight.
plusNatZ: (n: Nat) -> plus n Z = n
plusNatZ Z = Refl
plusNatZ (S k) = cong S (plusNatZ k)