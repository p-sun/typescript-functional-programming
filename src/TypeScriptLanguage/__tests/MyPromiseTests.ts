/* ------------------------------- Simple Then ------------------------------ */

import {
  promise8AfterDelay,
  promise8AfterDelay_mine,
  succeedEventually,
  succeedEventually_mine,
  errorEventually,
  errorEventually_mine,
  assertObjEqual,
  assertEqual,
} from './PromiseTestUtils';

promise8AfterDelay(0).then((n) => {
  assertEqual('1 Promise | no delay', 8, n);
});
promise8AfterDelay_mine(0).then((n) => {
  assertEqual('1 MyPromise | no delay', 8, n);
});

promise8AfterDelay(100).then((n) => {
  assertEqual('1 Promise | with delay', 8, n);
});
promise8AfterDelay_mine(110).then((n) => {
  assertEqual('1 MyPromise | with delay', 8, n);
});

/* ------------------- Return a value of a different type ------------------- */

promise8AfterDelay(0)
  .then((n) => {
    return { myValue: n };
  })
  .then((val) => {
    assertObjEqual('2 Promise | get object | no delay', { myValue: 8 }, val);
  });

promise8AfterDelay_mine(0)
  .then((n) => {
    return { myValue: n };
  })
  .then((val) => {
    assertObjEqual('2 MyPromise | get object | no delay', { myValue: 8 }, val);
  });

promise8AfterDelay(400)
  .then((n) => {
    return { myValue: n };
  })
  .then((val) => {
    assertObjEqual('2 Promise | get object | with delay', { myValue: 8 }, val);
  });

promise8AfterDelay_mine(410)
  .then((n) => {
    return { myValue: n };
  })
  .then((val) => {
    assertObjEqual(
      '2 MyPromise | get object | with delay',
      { myValue: 8 },
      val
    );
  });

/* ------------------ Return a Promise of a different type ------------------ */

promise8AfterDelay(0)
  .then((n) => {
    return succeedEventually('HELLO', 0);
  })
  .then((helloString) => {
    assertEqual(
      `3 Promise | return Promise<string> | no delay`,
      'HELLO',
      helloString
    );
  });
promise8AfterDelay_mine(0)
  .then((n) => {
    return succeedEventually_mine('HELLO', 0);
  })
  .then((helloString) => {
    assertEqual(
      `3 MyPromise | return MyPromise<string> | no delay`,
      'HELLO',
      helloString
    );
  });

promise8AfterDelay(500)
  .then((n) => {
    return succeedEventually('HELLO', 0);
  })
  .then((helloString) => {
    assertEqual(
      `3 Promise | return Promise<string> | with delay`,
      'HELLO',
      helloString
    );
  });
promise8AfterDelay_mine(510)
  .then((n) => {
    return succeedEventually_mine('HELLO', 0);
  })
  .then((helloString) => {
    assertEqual(
      `3 MyPromise | return MyPromise<string> | with delay`,
      'HELLO',
      helloString
    );
  });

/* ------------------- Multiple thens on the same promise ------------------- */

const aPromise = promise8AfterDelay(0);
aPromise.then((n) => {
  assertEqual('4 Promise | multiple thens A | no delay', 8, n);
});
aPromise.then((n) => {
  assertEqual('4 Promise | multiple thens B | no delay', 8, n);
});

const aMyPromise = promise8AfterDelay(0);
aMyPromise.then((n) => {
  assertEqual('4 MyPromise | multiple thens A | no delay', 8, n);
});
aMyPromise.then((n) => {
  assertEqual('4 MyPromise | multiple thens B | no delay', 8, n);
});

const aPromiseWDelay = promise8AfterDelay(600);
aPromiseWDelay.then((n) => {
  assertEqual('5 Promise | multiple thens A | w delay', 8, n);
});
aPromiseWDelay.then((n) => {
  assertEqual('5 Promise | multiple thens B | w delay', 8, n);
});

const aMyPromiseWDelay = promise8AfterDelay(610);
aMyPromiseWDelay.then((n) => {
  assertEqual('5 MyPromise | multiple thens A | w delay', 8, n);
});
aMyPromiseWDelay.then((n) => {
  assertEqual('5 MyPromise | multiple thens B | w delay', 8, n);
});

// /* ------------------------ Return error as a promise ----------------------- */

promise8AfterDelay(0)
  .then((n) => {
    return errorEventually('MyErrorA', 0);
  })
  .catch((error) => {
    assertEqual(`6 Promise | return MyError | no delay`, 'MyErrorA', error);
  });
promise8AfterDelay_mine(0)
  .then((n) => {
    return errorEventually_mine<boolean>('MyErrorA', 0);
  })
  .catch((error) => {
    assertEqual(`6 MyPromise | return MyError | no delay`, 'MyErrorA', error);
  });

promise8AfterDelay(700)
  .then((n) => {
    return errorEventually<boolean>('MyErrorB', 0);
  })
  .catch((error) => {
    assertEqual(`6 Promise | return MyError | w delay`, 'MyErrorB', error);
  });
promise8AfterDelay_mine(710)
  .then((n) => {
    return errorEventually_mine<boolean>('MyErrorB', 0);
  })
  .catch((error) => {
    assertEqual(`6 MyPromise | return MyError | w delay`, 'MyErrorB', error);
  });

export default function runMyPromiseTests() {}
