# typescript-functional-programming

A variety of functional programming examples in TypeScript.

See [Index.ts](https://github.com/p-sun/typescript-functional-programming/blob/main/index.ts) for contents.

## Functional Programming Fundamentals

- Map & Reduce
- Data Structures & recursion: Stack & Tree
- Lazy evaluation, Stream
- Monads

## Promises

- A simplified implementation of JS Promises. [MyPromise.ts]
- A `Promise.all` implementation that uses advanced TS type inference. [MyPromiseAll.ts]

## Parser Combinator & Math Evaluator

- A FP Parser Combinator where parser functions can be combined like regex. [ParserCombinator.ts]
- A tokenizer for math formulas using the Parser Combinator, to split `"(123+45)*6"` into "tokens" such as `["(", "123", "+", "45"...]`. [Tokenizer.ts]
- A math formula evaluator that evaluates the tokens from the Tokenizer into a numeric result. e.g. "(123+45)\*6" becomes the number 1008.[EvaluatorTests.ts]

## TypeScript Language

- TS Basics: Arrays, objects, types, keyof, instanceof
- Method overloading with types
- Ways to infer types
