-- Note: Comment out the %hide sections and this will still typecheck,
-- because this is how the interfaces are defined in Idris2.

--------------------------
-- Functor
--------------------------
%hide Functor
interface Functor f where
  fmap : (a -> b) -> f a -> f b

--------------------------
-- Applicative
--------------------------
%hide Applicative
%hide apply
%hide pure
interface Functor f => Applicative f where
  pure : a -> f a
  apply : f (a -> b) -> f a -> f b

{- Applicative to Monoidal  -}
unit_ : Applicative f => f ()
unit_ = pure ()

pair : a -> b -> (a, b)
pair = (,)

prod_ : Applicative f => f a -> f b -> f (a, b)
prod_ = apply . (fmap pair)
-- prod_ fa fb = apply (fmap pair fa) fb
-- prod_ fa = apply (fmap pair fa)
-- prod_ = apply . fmap pair
--
-- pair : a -> b -> (a, b)
-- fmap : (A -> B) -> F A -> F B            -- make B = b -> (a, b), A = a
-- fmap pair : f a -> f (b -> (a, b))        
-- fmap pair fa : f (b -> (a, b))
--
-- apply : F (A -> B) -> F A -> F B         -- make A = b, B = (a, b)
-- apply (fmap pair fa) : f (b -> (a, b)) -> f b -> f (a, b)        
-- apply (fmap pair fa) fb : f (a, b)

--------------------------
-- Monoidal
--------------------------
interface Functor f => Monoidal f where
  unit : f ()
  prod : f a -> f b -> f (a, b)

{- Monoidal to Applicative -}
pure_ : Monoidal f => a -> f a
pure_ a = fmap (\_ => a) unit

eval : (a -> b, a) -> b
eval (f, a) = f a

apply_ : Monoidal f => f (a -> b) -> f a -> f b
apply_ fa2b fa = fmap eval (prod fa2b fa)
-- prod : F A -> F B -> F (A, B)    -- Make A = (a -> b), B = a
-- prod fa2b fa : f ((a -> b), a)

-- eval : (a -> b, a) -> b
-- fmap : (A -> B) -> F A -> F B    -- Make A = (a -> b, a), B = a
-- fmap eval : f (a -> b, a) -> f a
-- fmap eval (prod fa2b fa) : f a

--------------------------
-- Monad
--------------------------
{- Monad to Applicative -}

%hide Monad
%hide join
interface Monad f where
    bind : (a -> f b) -> f a -> f b
    join : f (f a) -> f a

apply__ : Monad f => f (a -> b) -> f a -> f b
apply__ fa2b fa = ?H
