type ADTWithTag<
  T extends Record<string, unknown>,
  Tag extends T['tag']
> = T extends { tag: Tag } ? T : never;

type ADTMatchers<T extends Record<string, unknown> & { tag: string }> = {
  [Tag in T['tag']]: (adt: ADTWithTag<T, Tag>) => unknown;
};

type ResultsFromMatchers_<
  T extends Record<string, unknown>,
  K extends keyof T
> = T[K] extends (adt: any) => infer R ? R : never;
type ResultsFromMatchers<T extends Record<string, unknown>> =
  ResultsFromMatchers_<T, keyof T>;

function matchADT<
  T extends Record<string, unknown> & { tag: string },
  Matchers extends ADTMatchers<T>
>(adt: T, matchers: Matchers): ResultsFromMatchers<Matchers> {
  // @ts-expect-error
  return matchers[adt.tag](adt);
}

/* -------------------------------------------------------------------------- */
/*                                Test matchADT                               */
/* -------------------------------------------------------------------------- */

type NetworkResponse =
  | {
      tag: 'success';
      json: any;
      code: number;
    }
  | {
      tag: 'failure';
      message: string;
      code: number;
    };
const successADT = {
  tag: 'success',
  json: null,
  code: 1,
} as NetworkResponse;

// Test: adt is of the correct type AND
// AND the result type is a union of the results of the matchers.
const a0 = matchADT(successADT, {
  success: (adt) => adt.code,
  failure: (adt) => `adt failed with message ${adt.message}`,
});
const a0_test: ASSERT<typeof a0, number | string> = true;

// @ts-expect-error: Property 'failure' is missing in type '{ success: () => number; }'
const a1 = matchADT(successADT, {
  success: () => 7,
});

/* -------------------------------------------------------------------------- */
/*                                 Tests Utils                                */
/* -------------------------------------------------------------------------- */

// Proof that ADTWithTag & ADTMatchers is the same in matchers_paige and matchers_ari.
type ASSERT<T1, T2> = T1 extends T2 ? true : false;

type m1 = ADTWithTag<NetworkResponse, 'success'>;
const m1_test: ASSERT<m1, { tag: 'success'; json: any; code: number }> = true;

type m0 = ADTMatchers<NetworkResponse>;
type m0_expected = {
  success: (adt: { tag: 'success'; code: number; json: any }) => unknown;
  failure: (adt: { tag: 'failure'; code: number; message: string }) => unknown;
};
const m0_test: ASSERT<m0, m0_expected> = true;

type r0 = ResultsFromMatchers<{
  success: (adt: any) => number;
  failure: (adt: any) => string;
}>;
const r0_test: ASSERT<r0, string | number> = true;

export default function run() {}
