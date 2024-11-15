%default total
{-
--------------------------
-- Applicative Laws
--------------------------

An applicative is a functor along with 2 more functions:
pure  :: a -> f a
(<*>) :: f (a -> b) -> f a -> f b

---------
Applicative Laws:

1. Identity:     id : X -> X, fx : F X

  (pure id) <*> Fx = Fx

2. Homomorphism: f : A -> B, x : A

  (pure f) <*> (pure x) = pure (f x)

3. Interchange: x : A, Ff : F (A -> B)
  " <*> pure = pure <*> "

  Ff <*> (pure x) = (pure (\f => f x)) <*> Ff

4. Composition: Fx : F A, Fg: F (A -> B), Ff: F (B -> C)

    Question what is the type of (pure (.))?

    (.) -> (B -> C) -> (A -> B) -> (A -> C)
    pure: A -> F A
    pure (.) : F ((B -> C) -> (A -> B) -> (A -> C))

    (pure (.)) <*> : F (B -> C) -> F ((A -> B) -> (A -> C))
    (pure (.)) <*> Ff : F ((A -> B) -> (A -> C))
    (pure (.)) <*> Ff <*> : F (A -> B) -> F (A -> C)
    (pure (.)) <*> Ff <*> Fg : F (A -> C)
    (pure (.)) <*> Ff <*> Fg <*> : F A -> F C
    (pure (.)) <*> Ff <*> Fg <*> Fx : F C

    Fx : F A
    Fg <*> Fx : F B
    Ff <*> (Fg <*> Fx) : F C

  Composition Law:
    (pure (.)) <*> Ff <*> Fg <*> Fx = Ff <*> (Fg <*> Fx)

    which is like

    (f . g) x = f (g x)

5. Naturality: (which you couldn't break in FP if you wanted to, but can in math.)

---------
fyi. Another way to think of law 2 (Homomorphism) is that we can swap `pure` and "function application".
  apply(pure(f), pure(a)) = pure(funcApply(f,a))
  (pure f) <*> (pure x) = pure (f x)

"Functor application (apply) on lifted args (pure(f), pure(a))
is the same as
lifted function application of the args.  pure(funcApply(f,a))"

i.e. "`apply` is `funcApply`'s __adjoint__."

---------
---------

Can you make apply from map?
  Cheeky answer: if you could we wouldn't have invented Applicatives.
  This means NOT ALL FUNCTORS CAN BE APPLICATIVES.

Can you make map from apply AND pure? Yes!
  map: (A -> B) -> F A -> F B

  pure: A -> F A
  apply: F (A -> B) -> F A -> F B

  f: A -> B
  pure f : F (A -> B)
  apply (pure f) : F A -> F B
  \f => apply (pure f) : (A -> B) -> F A -> F B
  \f => (apply . pure) f : (A -> B) -> F A -> F B
  apply . pure : (A -> B) -> F A -> F B

  apply . pure = map

  Note we haven't proven the laws work, but IF apply and pure are correct then this works.

  For any Applicative we have apply . pure = map.

  This is why we often call them "Applicative Functors",
    functors that can be "applied" (to values and functions).

  Comment, it is often casually said that Applicatives are the
    "halfway point between Functors and Monads"
-}