// The goal is to take an object as input, and output an ADT.
// See GenericADT+Spec.ts and GenericADT+Matchers.ts for details on each method.
// See how to manipulation keys in TypeScript in MappedTypes.ts.

/* -------------------------------------------------------------------------- */
/*                          Generic ADT Type Creator                          */
/* -------------------------------------------------------------------------- */

type ADTFromSpec_<
  S extends Record<string, unknown>,
  K extends keyof S
> = K extends string ? { tag: K } & S[K] : never;

type ADTFromSpec<S extends Record<string, unknown>> = ADTFromSpec_<S, keyof S>;

/* -------------------------------------------------------------------------- */
/*                           Concrete ADT Type Union                          */
/* -------------------------------------------------------------------------- */

type NetworkResponse = ADTFromSpec<{
  success: { json: any; code: number };
  failure: { message: string; code: number };
}>;

type Maybe<T> = ADTFromSpec<{ nothing: {}; just: { value: T } }>;

type Either<L, R> = ADTFromSpec<{ left: { value: L }; right: { value: R } }>;

type Res<T> = ADTFromSpec<{ value: { value: T }; error: { message: string } }>;

/* -------------------------------------------------------------------------- */
/*                      Extract info from ADT union Type                      */
/* -------------------------------------------------------------------------- */

// Extract the ADT element with that tag
type ADTWithTag<
  T extends Record<string, unknown>,
  Tag extends T['tag']
> = T extends { tag: Tag } ? T : never;

// Extract the ADT element with that tag, but omit the 'tag'
type ADTDataWithTag<
  T extends Record<string, unknown>,
  Tag extends T['tag']
> = T extends { tag: Tag } ? Omit<T, 'tag'> : never;

/* -------------------------------------------------------------------------- */
/*                          Concrete ADT Type Creator                         */
/* -------------------------------------------------------------------------- */

function instantiateADT_<
  T extends Record<string, unknown>,
  Tag extends T['tag']
>(tag: Tag, data: ADTDataWithTag<T, Tag>) {
  return { tag, ...data } as unknown as T;
}

function instantiateADT<T extends Record<string, unknown>>(): <
  Tag extends T['tag']
>(
  tag: Tag,
  data: ADTDataWithTag<T, Tag>
) => T {
  return instantiateADT_;
}

/* -------------------------------------------------------------------------- */
/*                                ADT Matchers                                */
/* -------------------------------------------------------------------------- */

type ADTMatchers<T extends Record<string, unknown> & { tag: string }> = {
  [Tag in T['tag']]: (adt: ADTWithTag<T, Tag>) => unknown;
};

type ReturnTypes_<
  T extends Record<string, unknown>,
  K extends keyof T
> = T[K] extends (adt: any) => infer R ? R : never;
type ReturnTypes<T extends Record<string, unknown>> = ReturnTypes_<T, keyof T>;

function matchADT<
  T extends Record<string, unknown> & { tag: string },
  Matchers extends ADTMatchers<T>
>(adt: T, matchers: Matchers): ReturnTypes<Matchers> {
  // @ts-expect-error: 'string' can't be used to index type 'ADTMatchers<T>'.
  return matchers[adt.tag](adt);
}

function matchADTSome<
  T extends Record<string, unknown> & { tag: string },
  Matchers extends Partial<ADTMatchers<T>>
>(adt: T, matchers: Matchers): ReturnTypes<Matchers> {
  // @ts-expect-error: 'string' can't be used to index type 'ADTMatchers<T>'.
  return matchers[adt.tag]?.(adt);
}

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */
type ASSERT<T1, T2> = T1 extends T2 ? true : false;

export default function run() {
  const successADT = instantiateADT<NetworkResponse>()('success', {
    json: null,
    code: 123456,
  });

  // Test that adt is of the correct type
  // AND the result type is a union of the results of the matchers.
  const a0 = matchADT(successADT, {
    success: (adt) => adt.code,
    failure: (adt) => `adt failed with message ${adt.message}`,
  });
  const a0_test: ASSERT<typeof a0, number | string> = true;

  // @ts-expect-error: Property 'failure' is missing in type '{ success: () => number; }'
  const a1 = matchADT(successADT, {
    success: (adt) => 777,
  });

  const a2 = matchADTSome(successADT, {
    success: (adt) => adt.code,
  });

  console.log('a0 success code:', a0); // 123456
  console.log('a2 success code:', a2); // 123456
}
