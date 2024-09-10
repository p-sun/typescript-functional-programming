%hide Prelude.Nat
%hide Prelude.Z
%hide Prelude.S
%hide Prelude.plus

data Nat : Type where
  Z : Nat
  S : Nat -> Nat

zero_ = Z
one_ = S Z
two_ = S (one_) -- S (S Z)
four_ = S (S (S (S Z)))
six_ = S (S (S (S (S (S Z)))))

plus: Nat -> Nat -> Nat
plus Z n = n
plus (S m) n = S (plus m n)

three_ = plus one_ two_ -- S (S (S Z))

--------------------------
-- Is Odd
--------------------------
data IsOdd : Nat -> Type where
  Odd1: IsOdd (S Z)
  OddSS: {n: Nat} -> IsOdd n -> IsOdd (S(S(n)))

fiveIsOdd_: IsOdd (S (S (S (S (S Z)))))
fiveIsOdd_ = OddSS (OddSS Odd1)

--------------------------
-- Is Even
-------------------------- 
-- Even can only be instantiated with even Nats.
-- "Even 3" is a Type that has 0 inhabitants. Represents truthiness.
-- "Even 4" is a Type that has 1 inhabitants. Represents falsiness.
-- "Even False" is a malformed term. Constraint solving fails, is a "Unification" error.
data Even : Nat -> Type where
  EvenZ : Even Z
  EvenS : {n: Nat} -> Even n -> Even (S (S n))

-- Proof that 4 is even
fourIsEven_ : Even (S (S (S (S Z))))
fourIsEven_ = EvenS $ EvenS $ EvenZ
--   EvenS (EvenS (EvenZ))
-- = EvenS (EvenS (Even Z))
-- = EvenS (Even (S (S Z))
-- = Even (S (S (S (S Z))))

-- Proof that we cannot have an instance of `Even 3`
--   Even (S (S (S Z)))   Goal type.
-- = EvenS (Even (S Z))   `Even (S Z)` is impossible to instantiate.

------ Adding Even Types ------
sumIsEven: {n, m: Nat} -> Even n -> Even m -> Even (plus n m)
sumIsEven EvenZ evM = evM
sumIsEven (EvenS evN) evM = EvenS (sumIsEven evN evM)

sixIsEven_: Even (S (S (S (S (S (S Z))))))
sixIsEven_ = sumIsEven (EvenS (EvenS EvenZ)) (EvenS EvenZ)
-- = sumIsEven (EvenS (EvenS EvenZ)) $ EvenS EvenZ
-- = EvenS $ sumIsEven (EvenS EvenZ) $ EvenS EvenZ
-- = EvenS $ EvenS $ sumIsEven EvenZ $ EvenS EvenZ
-- = EvenS $ EvenS $ EvenS EvenZ
-- = EvenS $ EvenS $ EvenS $ Even Z
-- = EvenS $ EvenS $ Even S(S(Z))
-- = EvenS $ Even S(S(S(S(Z))))
-- = Even S(S(S(S(S(S(Z))))))
