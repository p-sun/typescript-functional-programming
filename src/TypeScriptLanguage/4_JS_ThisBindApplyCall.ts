/*
Function.prototype.bind():
  * `this` context:
    * Non-arrow functions have their own `this` value, from the __function context__.
      i.e. Where the function is defined.
    * Arrow functions maintain the value of `this` from the outermost __caller context__.
  
  * 'bind' only works on non-arrow functions.
  * Use non-arrow functions if you need `object.method()` syntax
  * `this` context work the same in classes and objects.
  
Function.prototype.apply():
  * apply() calls a function with a given `this` value, and arguments as an array.

Function.prototype.call():
  * apply() calls a function with a given `this` value, and arguments individually.
*/

/* -------------------------------------------------------------------------- */
/*                     Binding `this` to an arrow function                    */
/* -------------------------------------------------------------------------- */

const pokemon = {
  name: 'Pikachu',
  // Use non-arrow functions if you need `object.method()` syntax
  // 'this' is the pokemon
  getName: function () {
    return this.name;
  },
  getName_es6() {
    return this.name;
  },
  // `this` is the caller of `getName_fail`, not the pokemon
  getName_fail: () => {
    // @ts-expect-error
    return this.name;
    //     ^^^^ Object is possibly 'undefined'.
  },
};

const logPokemonName = function (this: any) {
  console.log(this.getName() + ', I choose you!'); // Pikachu, I choose you!
  console.log(this.getName_es6() + ', I choose you!'); // Pikachu, I choose you!
  console.log(this.getName_fail() + ', I choose you!'); // undefined, I choose you!
};

logPokemonName.bind(pokemon)(); // Returns new function logPokemonName, and binds pokemon to 'this' in that function.

/* -------------------------------------------------------------------------- */
/*                                    Utils                                   */
/* -------------------------------------------------------------------------- */

// @ts-expect-error
this.toString = function toString() {
  return '<<Outer>>';
};

console.assert(`${this}`, '<<Outer>>');

/* -------------------------------------------------------------------------- */
/*                         'this' and arrow functions                         */
/* -------------------------------------------------------------------------- */

// Non-arrow functions have their own `this` value, from the __function context__.
// i.e. Where the function is defined.
const nonArrowFn = function (this: any, s: string) {
  if (this) {
    this.toString = function toString() {
      return '<<nonArrowFn>>';
    };
  }

  console.log(`Caller: ${s} -> nonArrowFn | this: ${this}`);
};
nonArrowFn('Outer'); // this: undefined
new (nonArrowFn as any)('new Outer'); // this: <<nonArrowFn>>

// Arrow functions maintain the value of `this` from the __caller context__.
const arrowFn = (s: string) => {
  if (this) {
    // @ts-expect-error
    this.toString = function toString() {
      //^^^ Object is possibly 'undefined'
      return '<<arrowFn>>';
    };
  }

  console.log(`Caller: ${s} -> arrowFn | this: ${this}`);
};
arrowFn('@@@@Outer'); // this: <<<Outer>>>

/* -------------------------------------------------------------------------- */
/*                          Function.prototype.bind()                         */
/* -------------------------------------------------------------------------- */
// 'this' and arrow function, in classes and objects

class MyClass {
  toString() {
    return '<<MyClass>>';
  }

  run() {
    console.log(`MyClass -> run | this ${this}`); // 'this' is <<<MyClass>>>

    nonArrowFn('MyClass'); // this: undefined
    nonArrowFn.bind(this)('MyClass bind this'); // this: <<MyClass>>

    arrowFn('MyClass'); // this: <<Outer>>
    arrowFn.bind(this)('MyClass bind this'); // this: <<Outer>>
  }
}

// 'this' context work the same in classes and objects.
const myObj = {
  toString() {
    return '<<MyObject>>';
  },

  run() {
    console.log(`MyObject -> run | this ${this}`); // 'this' is <<<MyClass>>>

    nonArrowFn('MyObject'); // this: undefined
    nonArrowFn.bind(this)('MyObject bind this'); // this: <<MyClass>>

    arrowFn('MyObject'); // this: <<Outer>>
    arrowFn.bind(this)('MyObject bind this'); // this: <<Outer>>
  },
};

const myClass = new MyClass();
myClass.run();
myObj.run();

// 'bind' creates a new function with a new 'this' value, and the same function body.
// NOTE: 'bind' only works on non-arrow functions.
nonArrowFn('Outer'); // this: undefined
nonArrowFn.bind(this)('Outer bind this'); // this: <<<Outer>>>
nonArrowFn.bind(myClass)('Outer bind myClass'); // this: <<<MyClass>>>

arrowFn('Outer'); // this: <<<Outer>>>

/* -------------------------------------------------------------------------- */
/*                'this' cannot be changed for arrow functions.               */
/* -------------------------------------------------------------------------- */

arrowFn.bind(this)('Outer bind this'); // this: <<<Outer>>>
arrowFn.bind(myClass)('Outer bind myClass'); // this: <<<Outer>>>

arrowFn.apply(myClass, ['Outer apply this']); // this: <<<Outer>>>

arrowFn.call(myClass, 'Outer call this'); // this: <<<Outer>>>

/* -------------------------------------------------------------------------- */
/*                         Function.prototype.apply()                         */
/* -------------------------------------------------------------------------- */
// The apply() method calls the specified function with a given `this` value,
// with arguments provided as an array.

nonArrowFn.apply(myClass, ['Outer apply this']); // this: <<<MyClass>>>
const c1 = Math.max.apply(null, [1, 2, 3]); // 3

/* -------------------------------------------------------------------------- */
/*                          Function.prototype.call()                         */
/* -------------------------------------------------------------------------- */
// The call() method calls the function with a given `this` value,
// with arguments provided individually.
nonArrowFn.call(myClass, 'Outer call this'); // this: <<<MyClass>>>
const c2 = Math.max.call(null, 1, 2, 3); // 3

/* -------------------------------------------------------------------------- */
/*                                     Run                                    */
/* -------------------------------------------------------------------------- */

export default function run() {}
