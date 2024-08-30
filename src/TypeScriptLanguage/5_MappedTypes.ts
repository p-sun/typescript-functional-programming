/* -------------------------------------------------------------------------- */
/*                    Keeping sublist in sync with main list                  */
/* -------------------------------------------------------------------------- */

type IceCream =
  | 'vanilla'
  | 'strawberry'
  | 'chocoloate'
  | 'black walnut'
  | 'butter pecan';

const nuttyFlavors = [
  'black walnut',
  'butter pecan',
] as const satisfies readonly IceCream[];

function hasNuts(flavor: IceCream): flavor is typeof nuttyFlavors[number] {
  return (nuttyFlavors as unknown as IceCream[]).includes(flavor);
}

/* -------------------------------------------------------------------------- */
/*             Use `keyof MyType` to constrain function parameters            */
/* -------------------------------------------------------------------------- */

type RGBColor = {
  red: number;
  green: number;
  blue: number;
};
const cyan: RGBColor = {
  red: 1,
  green: 0,
  blue: 1,
};

type RBGComponent = keyof RGBColor;
// Can only assign ‘red’, ‘green’, or ‘blue’ here.
const greenComponent: RBGComponent = 'green';

function getComponent(c: RGBColor, comp: RBGComponent): number {
  return c[comp];
}

function getComponent255(c: RGBColor, comp: RBGComponent) {
  return getComponent(c, comp) * 255;
}

// you can only put 'red', 'green', or 'blue' here, awesome!!!
getComponent255(cyan, 'red');

/* -------------------------------------------------------------------------- */
/*                      Extract constant values as types                      */
/* -------------------------------------------------------------------------- */

type Cat = {
  breed: string;
  age: number;
};

const allCats = {
  smoothie: {
    breed: 'british longhair',
    age: 8,
  },
  dianbo: {
    breed: 'blue golden shaded british shorthair',
    age: 2,
  },
} as const;
// In TS 4.9+, we can append this after `as const` instead of using CatTypeChecker:
// satisfies { [key: string]: Cat}

// Checks that every object in `allCats` is of type `Cat`.
const CatTypeChecker: { [key: string]: Cat } = allCats;

// type CatNames = "smoothie" | "dianbo"
type CatName = keyof typeof allCats;

// type CatBreeds = "british longhair" | "blue golden shaded british shorthair"
type CatBreed = typeof allCats[CatName]['breed'];

// Why would we want this? You can pass CatNames as a parameter to functions, instead of the whole Cat!
const getCat = (name: CatName) => allCats[name];
console.log(getCat('smoothie').age);

/* -------------------------------------------------------------------------- */
/*                   Embed value in under a key in a Record                   */
/* -------------------------------------------------------------------------- */
// 5.0.4+ only

type UnitInfo = {
  abbreviation: string,
  conversionFromSI: number,
  humanName: string,
}

function embedKey<
  const Info extends Record<string, unknown>,
>() {
  return <const Key extends string, const R extends {[k: string]: Omit<Info, Key>}>(k: Key, r: R) => {
    const result = {} as {[K in keyof R]: R[K] & {[k in Key]: K}} 

    for (const item of Object.keys(r)) {
      result[item as keyof R] = {...r[item], [k]: item } as any
    }

    return result
  }
}

// Embed `{ humanName: "meter" }` inside the `meter` key.
const DistanceUnits = embedKey<UnitInfo>()('humanName', {
  meter: { abbreviation: 'm', conversionFromSI: 1 },
  centimeter: { abbreviation: 'cm', conversionFromSI: 100 },
  foot: { abbreviation: 'ft', conversionFromSI: 5280/1609 },
  inch: { abbreviation: 'in', conversionFromSI: 5280/1609 * 12 },
})

type DistanceUnit = keyof typeof DistanceUnits

const aUnit : DistanceUnit = 'meter'
const {humanName, conversionFromSI} = DistanceUnits[aUnit]

/* -------------------------------------------------------------------------- */
/*           Union type before conditional `extends` is distributed           */
/* -------------------------------------------------------------------------- */

// Union type `T` before `extends` in a conditional type, is distributed across the results.
// Note how `UnfoldUnion` has `T extends unknown` which changes the output type, compared to `SimpleUnion`.
type UnfoldUnion<T> = T extends unknown ? { a: T; b: T } : never;
type b0 = UnfoldUnion<'foo' | 'bar'>;
type b0_expected = { a: 'foo'; b: 'foo' } | { a: 'bar'; b: 'bar' };
type b0_equivalent =
  | ({ a: 'foo'; b: 'foo' } extends unknown ? { a: 'foo'; b: 'foo' } : never)
  | ({ a: 'bar'; b: 'bar' } extends unknown ? { a: 'bar'; b: 'bar' } : never);
const b0_test: ASSERT<b0, b0_expected> = true;
const b0_test2: ASSERT<b0, b0_equivalent> = true;

// Comparison without the `T extends unknown`
type SimpleUnion<T> = { a: T; b: T };
type b1 = SimpleUnion<'foo' | 'bar'>;
type b1_expected = { a: 'foo' | 'bar' } & { b: 'foo' | 'bar' };
const b1_test: ASSERT<b1, b1_expected> = true;

/* -------------------------------------------------------------------------- */
/*                            Union to Intersection                           */
/* -------------------------------------------------------------------------- */

// Use string literals as keys
type Flags<T extends string> = { [P in T]: boolean }; // Record<T, boolean>;
type LetterFlags = Flags<'a' | 'b' | 'c'>;
const flag_test: LetterFlags = { a: true, b: false, c: true };

// Get Keys in a record
type GetKeys<U> = U extends Record<infer K, any> ? K : never;
type g0 = GetKeys<{ a: string } | { b: number }>; // "a" | "b"

// Make `{ a: string } | { b: number }`` into `{ a: string } & { b: number }`
export type UnionToIntersection<U extends object> = {
  [K in GetKeys<U>]: U extends Record<K, infer T> ? T : never;
};
type u1 = UnionToIntersection<{ a: string } | { b: number }>;
type u1_expected = { a: string } & { b: number };
const u1_test: ASSERT<u1, u1_expected> = true;

// Same behavior as `UnionToIntersection`, but result type is messier.
// An example of using nested `extends` to iterate through an union and `infer` to intersect the results.
type UnionToIntersection_2<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
type u2 = UnionToIntersection_2<{ a: string } | { b: number }>;
const u2_test: ASSERT<u2, u1_expected> = true;

/* -------------------------------------------------------------------------- */
/*                            Intersection to Union                           */
/* -------------------------------------------------------------------------- */

type IntersectionToUnion_<
  T extends Record<string, unknown>,
  K extends keyof T
> = K extends unknown ? { [_ in K]: T[K] } : never;
type IntersectionToUnion<T extends Record<string, unknown>> =
  IntersectionToUnion_<T, keyof T>;
type iu0 = IntersectionToUnion<{ a: number; b: Int16Array }>;
const iu0_test: ASSERT<iu0, { a: number } | { b: Int16Array }> = true;

/* -------------------------------------------------------------------------- */
/*                    Extract keys and values from a Record                   */
/* -------------------------------------------------------------------------- */

// Check if specific tag exists in an intersection type
type HasTag<T> = 'tag' extends keyof T ? true : false;
const k3: HasTag<{ tag: string; a: number }> = true;

// Get keys in an intersection type
type k0 = keyof { a: any; b: any };
const k0_test: ASSERT<k0, 'a' | 'b'> = true;

// Note in `keyof` of this union type, the result is `never`
// b/c no keys exist in both branches of the union.
type k01 = keyof ({ a: any } | { b: any });

// Get keys in an union type
type KeysInUnion<T> = T extends Record<infer K, any> ? K : never;
type k1 = KeysInUnion<{ a: any } | { b: any }>;
const k1_test: ASSERT<k1, 'a' | 'b'> = true;

// Union together all values inside every key
type ValuesInUnion<T extends Record<string, unknown>> = T[keyof T];
type v1 = ValuesInUnion<{ foo: { a: 8 }; bar: { b: number; c: boolean } }>;
type v1_expected = { a: 8 } | { b: number; c: boolean };
const v1_test: ASSERT<v1, v1_expected> = true;

/* -------------------------------------------------------------------------- */
/*                      Mapped Type in function vs in type                    */
/* -------------------------------------------------------------------------- */
// Academic exploration of how to get values in mapped types by rearranging a single ADT element.
// Not useful functions.

type TagData = {
  [key: string]: unknown;
  tag?: never;
};

/* -------------- ElementSpec instance --> ADTElement instance -------------- */
function makeTaggedElement<Tag extends string, Data extends TagData>(
  tag: Tag,
  data: Data // Data extends { tag: string } ? never : Data
) {
  return { tag, ...data };
}
const c1 = makeTaggedElement('foo', { a: 8, b: true });
const c1_test: ASSERT<typeof c1, { tag: 'foo'; a: number; b: boolean }> = true;
// @ts-expect-error
//  Fails when when `tag` key exists because TagData doesn't include Tag key.
//  Expected error on `tag`: "Type 'string' is not assignable to type 'undefined'"
const c2 = makeTaggedElement('foo', { a: 8, b: true, tag: 'a' });

/* ----------------------- ElementSpec --> ADTElement ----------------------- */
type TaggedElement<Tag extends string, Data extends TagData> = {
  tag: Tag;
} & Data;
type c3 = TaggedElement<'foo', { a: number; b: boolean }>;
const c3_test: c3 = { tag: 'foo', a: 8, b: true };
// @ts-expect-error
//   Type '{ a: number; b: boolean; tag: string; }' does not satisfy the constraint 'TagData'.
//   Type 'string' is not assignable to type 'undefined'
type c4 = TaggedElement<'foo', { a: number; b: boolean; tag: string }>;

/* --------------------------- ADTElement --> Tag --------------------------- */
type TagFromElement<T extends { tag: string }> = T['tag'];
type t2 = TagFromElement<c3>;
const t2_test: t2 = 'foo';

/* -------------------------------------------------------------------------- */
/*                         Test Types with Assertions                         */
/* -------------------------------------------------------------------------- */

type ASSERT<T1, T2> = T1 extends T2 ? true : false;

const test1: ASSERT<'expected', 'expected'> = true;
const test2: ASSERT<'actual', 'expected'> = false;

export default function run() {}
