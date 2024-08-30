data Nat : Type where
  Z : Nat
  S : Nat -> Nat

plus: Nat -> Nat -> Nat
plus Z n = n
plus (S m) n = S (plus m n)

zero_ = Z
one_ = S Z
two_ = S (one_) -- S (S Z)
three_ = plus one_ two_ -- S (S (S Z))
four_ = S (S (S (S Z))) -- plus (S (S Z)) (S (S Z))  -- S (S (S (S Z)))
six_ = S (S (S (S (S (S Z))))) -- plus (S (S Z)) (S (S Z))  -- S (S (S (S Z)))

------ Is Even ------
-- IsEven can only be instantiated with even Nats.
data IsEven : Nat -> Type where
  EvenZ : IsEven Z
  EvenS : {n: Nat} -> IsEven n -> IsEven (S (S n))

-- Proof that 4 is even
fourIsEven_ : IsEven (S (S (S (S Z))))
fourIsEven_ = EvenS (EvenS (EvenZ))
--   EvenS (EvenS (EvenZ))
-- = EvenS (EvenS (IsEven Z))
-- = EvenS (IsEven (S (S Z))
-- = IsEven (S (S (S (S Z))))

-- Proof that we cannot have an instance of `IsEven 3`
--   IsEven (S (S (S Z)))   Goal type.
-- = EvenS (IsEven (S Z))   `IsEven (S Z)` is impossible to instantiate.

-- `$` is Haskell for braces from current position to the end of the expression. e.g.
-- (S (S (S Z))) == $ S $ S $ S Z

------ Adding IsEven Types ------
sumIsEven: {n, m: Nat} -> IsEven n -> IsEven m -> IsEven (plus n m)
sumIsEven EvenZ evM = evM
sumIsEven (EvenS evN) evM = EvenS (sumIsEven evN evM)

sixIsEven_: IsEven (S (S (S (S (S (S Z))))))
sixIsEven_ = sumIsEven (EvenS (EvenS EvenZ)) (EvenS EvenZ)
-- = sumIsEven (EvenS (EvenS EvenZ)) $ EvenS EvenZ
-- = EvenS $ sumIsEven (EvenS EvenZ) $ EvenS EvenZ
-- = EvenS $ EvenS $ sumIsEven EvenZ $ EvenS EvenZ
-- = EvenS $ EvenS $ EvenS EvenZ
-- = EvenS $ EvenS $ EvenS $ IsEven Z
-- = EvenS $ EvenS $ IsEven S(S(Z))
-- = EvenS $ IsEven S(S(S(S(Z))))
-- = IsEven S(S(S(S(S(S(Z))))))

------ Is Odd ------
data IsOdd : Nat -> Type where
  Odd1: IsOdd (S Z)
  OddSS: {n: Nat} -> IsOdd n -> IsOdd (S(S(n)))

fiveIsOdd_: IsOdd (S (S (S (S (S Z)))))
fiveIsOdd_ = OddSS (OddSS Odd1)

--------------------------
-- Predicates as Types
--------------------------
data Bool : Type where
  True : Bool
  False : Bool

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

--------------------------
-- Equal
--------------------------
-- Same thing:
-- data Equal : a -> b -> Type where
--   Refl : Equal x x

data Equal : {A : Type} -> A -> A -> Type where
  Refl : {A : Type} -> {a: A} -> Equal a a

-- Equal is useful for creating proofs
onePlusOneEqualsTwo_ : Equal (plus (S Z) (S Z)) (S (S Z))
onePlusOneEqualsTwo_ = Refl

-- Can't instantiate with non-equal types
oneNotEqualThree_ : Equal (S Z) (S (S (S Z)))
-- oneNotEqualThree_ = Refl

--------------------------
-- Math Axioms
--------------------------
  
-- Congruence. You can apply a function on both sides of an equal sign.
cong : {A, B : Type} -> (f : A -> B) -> {x, y : A} -> Equal x y -> Equal (f x) (f y)
cong f Refl = Refl

plusZeroRight : (n : Nat) -> Equal (plus n Z) n
plusZeroRight Z = Refl
plusZeroRight (S n) = cong S (plusZeroRight n)
