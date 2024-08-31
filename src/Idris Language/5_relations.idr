%hide Prelude.plus
%hide Builtin.Refl

plus: Nat -> Nat -> Nat
plus Z n = n
plus (S m) n = S (plus m n)

--------------------------
-- Equal
--------------------------
-- Same as the definition of Equal below
-- data (==) : a -> b -> Type where
--   Refl : x == x

data (==) : {A : Type} -> A -> A -> Type where
  Refl : {A : Type} -> {a: A} -> a == a

-- Equal is useful for creating proofs
onePlusOneEqualsTwo_ : (plus (S Z) (S Z)) == (S (S Z))
onePlusOneEqualsTwo_ = Refl

-- Can't instantiate with non-equal types
oneNotEqualThree_ : (S Z) == (S (S (S Z)))
-- oneNotEqualThree_ = Refl

--------------------------
-- Equivalence Relations
-- An equivalence relation is reflexive, symmetric, and transitive.
--------------------------
refl: {A : Type} -> {x : A} -> x == x
refl = Refl

symm: {A : Type} -> {x, y : A} -> x == y -> y == x
symm Refl = Refl

trans: {A : Type} -> {x, y, z : A} -> x == y -> y == z -> x == z
trans Refl x_eq_z = x_eq_z
-- trans {x=x, y=x, z=y} (Refl {a=x}) x_eq_z = x_eq_z
-- Other implementations that also work:
-- trans Refl = id
-- trans Refl Refl = Refl

-- Congruence follows above 3 laws, so it's an equivalence relation.
-- Congruence - We can apply a function on both sides of an equal sign.
cong : {T, U : Type} -> {x, y : T} -> (f: T -> U) -> x == y -> (f x) == (f y)
-- cong f Refl = Refl
-- cong f {x, y=x} (Refl {a=x}) = Refl {A=U, a=(f x)}
-- ^ Note that the implicit types for both Refl are different.

--------------------------
-- Less than or equal
--------------------------

------ Less than or equal, as a function ------
isLeq : Nat -> Nat -> Bool
isLeq Z _ = True
isLeq (S m) Z = False
isLeq (S m) (S n) = isLeq m n

oneIsLeqThree_ = isLeq (S Z) (S (S (Z))) -- True
twoIsLeqTwo_ = isLeq (S (S (Z))) (S (S (Z))) -- True

------ Less than or equal, as a data type ------
data LEQ : Nat -> Nat -> Type where
  LEQZ : (n: Nat) -> LEQ Z n
  LEQS : {m, n: Nat} -> LEQ m n -> LEQ (S m) (S n)

-- `LEQ m n` can only be instantiated when m <= n
zeroLeqTwo_ : LEQ Z (S(S(Z)))
zeroLeqTwo_ = LEQZ (S(S(Z)))

twoLeqFour_ : LEQ (S(S(Z))) (S(S(S(S(Z)))))
twoLeqFour_ = LEQS (LEQS (LEQZ (S(S(Z)))))

------ Other relations involving '<=' ------
leqSqueeze : {m,n: Nat} -> LEQ m n -> LEQ n m -> m == n
leqSqueeze (LEQZ Z) _ = Refl
leqSqueeze (LEQZ (S _)) _ impossible
leqSqueeze (LEQS lmn) (LEQS lnm) = cong S (leqSqueeze lmn lnm)

leqTrans : {m,n,o: Nat} -> LEQ m n -> LEQ n o -> LEQ m o

--------------------------
-- Plus Relations
--------------------------
plusZeroRight : (n : Nat) -> (plus n Z) == n
plusZeroRight Z = Refl -- (plus Z Z) == Z
plusZeroRight (S n) = cong S (plusZeroRight n)
-- plusZeroRight (S n) = cong {A=Nat, B=Nat, x=(plus n Z), y=n} S (plusZeroRight n)

-- How did we know how to implement the 2nd line?
-- plusZeroRight n              Input type of the type signature
-- -> (plus (S n) Z) == (S n)   Output type of the type signature
-- =  (S (plus n Z)) == (S n)
-- = cong S ((plus n Z) == n)
-- = cong S (plusZeroRight n)   Recursively call itself
