--------------------------
-- Person as a Record
--------------------------
-- Quick syntax for inductive types with a single constructor
data Person: Type where
  MkPerson: (name: String) -> (age: Nat) -> Person

personName: Person -> String
personName (MkPerson n _) = n

updatePersonName: (n: String) -> Person -> Person
updatePersonName n (MkPerson _ a) = MkPerson n a

-- A Record is a type with a single constructor, getters for all the fields, updaters for all fields.
record PersonRecord where
  constructor MkPersonRecord
  name: String
  age: Nat

--------------------------
-- Other Types as Records
--------------------------
record Pair (A: Type) (B: Type) where
  constructor MkPair
  first: A
  second: B
