%hide apply
{-
(A -> B) -> F A -> F B       -- map       Functor

F (A -> B) -> F A -> F B     -- apply     Applicative
(A -> F B) -> T A -> F (T B) -- traverse  Applicative  <--- Let's explore!!!

(A -> F B) -> F A -> F B     -- bind      Monad
F (F A) -> F A               -- join      Monad
-}
data Idea = MkIdea String
data Drawing = MkDrawing String
data Box a = EmptyBox | MkBox a

maybeApply : Maybe (a -> b) -> Maybe a -> Maybe b
maybeApply (Just f) (Just x) = Just (f x)
maybeApply _ _ = Nothing

-- Open the box, apply the function, and use maybeApply to close the box in Maybe's context.
traverse : {A, B: Type} -> (A -> Maybe B) -> Box A -> Maybe (Box B)
traverse f (MkBox a) = maybeApply (Just MkBox) (f a)
traverse f (EmptyBox) = Nothing
-- In this example, A = Idea, B = Drawing
    -- MkBox : idea -> Box idea
    -- Just MkBox : Maybe (?drawing -> Box ?drawing)
    -- f idea : Maybe Drawing

drawIdea : Idea -> Maybe Drawing
drawIdea (MkIdea "Cat") = Just (MkDrawing "Drawing of a cat")
drawIdea _ = Nothing

-- Example usage
exampleBox : Box Idea
exampleBox = MkBox (MkIdea "Cat")

exampleResult : Maybe (Box Drawing)
exampleResult = traverse drawIdea exampleBox  -- Just (MkBox (MkDrawing "Drawing of a cat"))

exampleFailure : Maybe (Box Drawing)
exampleFailure = traverse drawIdea (MkBox (MkIdea "Unknown"))  -- Nothing

{-
Open Question:

Why is traverse defined as
1) traverse: {Applicative F} -> (f : A -> F B) -> T A -> F (T B)
    apply: F (A -> B) -> F A -> F B

instead of
2) traverse: {Monoid B} -> (f : A -> F B) -> T A -> F (T B)
    (*): B -> B -> B
 -}