import { UnionToIntersection } from '../TypeScriptLanguage/5_MappedTypes';

// The goal is to take an object as input, and output a tagged union,
// i.e. An Abstract/Algebratic Data Type (ADT).
type inputSpec = { foo: { a: 8 }; bar: { b: number; c: boolean } };
type outputADT =
  | {
      tag: 'foo';
      a: 8;
    }
  | {
      tag: 'bar';
      b: number;
      c: boolean;
    };

/* -------------------------------------------------------------------------- */
/*                          Generic ADT Type Creator                          */
/* -------------------------------------------------------------------------- */

/* ------------------- Spec -> ADT, by passing `keyof S`. ------------------- */
// `K extends string` unfolds union type K, and union the result.
type ADTFromSpec_<
  S extends Record<string, unknown>,
  K extends keyof S
> = K extends string ? { tag: K } & S[K] : never;
type ADTFromSpec<S extends Record<string, unknown>> = ADTFromSpec_<S, keyof S>;

type m5 = ADTFromSpec<{ foo: { a: 8 }; bar: { b: number; c: boolean } }>;
type m5_expected = { tag: 'foo'; a: 8 } | { tag: 'bar'; b: number; c: boolean };
const m5_test: ASSERT<m5, m5_expected> = true;

/* ------------------- Spec -> ADT, by using 'in' keyword. ------------------- */
// Easier to read than above, but may require `key of S` to be calculated more often.
type ValuesInUnion<T extends Record<string, unknown>> = T[keyof T];
type ADTFromSpec_2<T> = ValuesInUnion<{ [K in keyof T]: { tag: K } & T[K] }>;
type m6 = ADTFromSpec_2<{ foo: { a: 8 }; bar: { b: number; c: boolean } }>;
type m6_expected = { tag: 'foo'; a: 8 } | { tag: 'bar'; b: number; c: boolean };
const m6_test: ASSERT<m6, m6_expected> = true;

/* ------------------------------ ADT -> Spec. ------------------------------ */
// `[_ in T['tag']]` turns a string literal {tag: 'success'} into a key {success: ...}
type SpecFromADT_<T extends Record<string, unknown>> = T extends { tag: string }
  ? { [_ in T['tag']]: Omit<T, 'tag'> }
  : never;
type SpecFromADT<E extends Record<string, unknown>> = UnionToIntersection<
  SpecFromADT_<E>
>;
type m7 = SpecFromADT<
  { tag: 'foo'; a: 8 } | { tag: 'bar'; b: number; c: boolean }
>;
const m7_test: ASSERT<m7, { foo: { a: 8 }; bar: { b: number; c: boolean } }> =
  true;

// Validate it works: Spec -> ADT -> Spec
type m9 = SpecFromADT<
  ADTFromSpec<{ foo: { a: 8 }; bar: { b: number; c: boolean } }>
>;
const m9_test: ASSERT<m9, { foo: { a: 8 }; bar: { b: number; c: boolean } }> =
  true;

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

// Get all tags from an ADT
type t0 = NetworkResponse['tag'];
const t0_test: ASSERT<t0, 'success' | 'failure'> = true;

// Extract the ADT element with that tag
type ADTWithTag<
  T extends Record<string, unknown>,
  Tag extends T['tag']
> = T extends { tag: Tag } ? T : never;
type t2 = ADTWithTag<NetworkResponse, 'success'>;
const t2_test: ASSERT<t2, { tag: 'success'; json: any; code: number }> = true;

// Extract the ADT element with that tag, but omit the 'tag'
type ADTDataWithTag<
  T extends Record<string, unknown>,
  Tag extends T['tag']
> = T extends { tag: Tag } ? Omit<T, 'tag'> : never;
type t1 = ADTDataWithTag<NetworkResponse, 'success'>;
const t1_test: ASSERT<t1, { json: any; code: number }> = true;

/* -------------------------------------------------------------------------- */
/*                Instantiate ADT (pick a type from the union)                */
/* -------------------------------------------------------------------------- */

function instantiateADT_<
  T extends Record<string, unknown>,
  Tag extends T['tag']
>(tag: Tag, data: ADTDataWithTag<T, Tag>) {
  return { tag, ...data } as unknown as T;
}
const i1 = instantiateADT_<NetworkResponse, 'success'>('success', {
  code: 123,
  json: {},
}); // {tag: 'success', code: 123, json: {}}}
// @ts-expect-error: Property 'json' is missing in type '{ code: number; }' but ...
const i2 = instantiateADT_<NetworkResponse, 'success'>('success', {
  code: 123,
});

// Inferring a generic from the parameter:
// instantiateADT_ works but requires the Tag to be passed in as a generic,
// so let's infer Tag from the `tag: Tag` parameter!
// 1) ADT of type T is passed in the generic.
// 2) `tag` parameter is constrained to `T['tag']`
// 3) When a valid `tag` is passed in, Tag type gets inferred
// 4) `data` parameter is constrained according to Tag
function instantiateADT</* 1 */ T extends Record<string, unknown>>(): <
  Tag extends T['tag'] /* 3 */
>(
  tag: Tag /* 2 */,
  data: ADTDataWithTag<T, Tag> /* 4 */
) => T {
  return (tag, data) => {
    return { tag, ...data } as unknown as T;
  };
  // return instantiateADT_; // this works too:
}
const i3 = instantiateADT<NetworkResponse>()('success', {
  code: 123,
  json: {},
}); // {tag: 'success', code: 123, json: {}}}
// @ts-expect-error: Property 'json' is missing in type '{ code: number; }' but ...
const i4 = instantiateADT<NetworkResponse>()('success', { code: 123 });
// @ts-expect-error: Argument of type "notATag" is not assignable
// to parameter of type "success" | "failure"
const i5 = instantiateADT<NetworkResponse>()('notATag', { code: 123 });

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

type ASSERT<T1, T2> = T1 extends T2 ? true : false;
export default function run() {}
