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

----- Is Even --------
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

-- `$` is Haskell for braces from current position to the end of the expression. e.g.
-- (S (S (S Z))) == $ S $ S $ S Z

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
