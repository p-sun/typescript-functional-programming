import {
  and,
  repeat,
  or,
  ParseOutput,
  sequence,
  repeatOnceOrMore,
  str,
} from '../ParserCombinator';

const w = str('w');
const o = str('o');
const r = str('r');
const l = str('l');
const wo = and(w, o);
const w_or_wo = or(w, wo);

describe('test Parser Combinator', () => {
  it('Should be able to parse `str`', () => {
    // w on 'world'
    expect(results(w.run('world'))).toStrictEqual(['w']);

    // w on 'orld' - Parser ERROR
    expect(w.run('orld').data.successful).toBe(false);

    // w on 'world'
    expect(str('w').run('world').data).toMatchObject({
      candidates: [
        {
          result: 'w',
          token: {
            pos: 1,
            targetString: 'world',
            value: undefined,
            valueText: 'w',
          },
        },
      ],
      successful: true,
    });

    // wor on 'world'
    expect(str('wor').run('world').data).toMatchObject({
      candidates: [
        {
          result: 'wor',
          token: {
            pos: 3,
            targetString: 'world',
            value: undefined,
            valueText: 'wor',
          },
        },
      ],
      successful: true,
    });
  });

  it('Should be able to parse `or`', () => {
    // w|o on 'world'
    expect(results(or(w, o).run('world'))).toStrictEqual(['w']);

    // w|o on 'orld'
    expect(results(or(w, o).run('orld'))).toStrictEqual(['o']);
  });

  it('Should be able to parse `and`', () => {
    // wo on 'world'
    expect(results(and(w, o).run('world'))).toStrictEqual([['w', 'o']]);

    // wor on 'world' #1
    expect(results(and(and(w, o), r).run('world'))).toStrictEqual([
      [['w', 'o'], 'r'],
    ]);

    // wor on 'world' #2
    expect(results(and(w, and(o, r)).run('world'))).toStrictEqual([
      ['w', ['o', 'r']],
    ]);

    // ro on 'world' - Fail on first element in 'and'
    expect(and(r, o).run('world').data.successful).toBe(false);

    // wr on 'world' - Fail on 2nd element in 'and'
    expect(and(w, r).run('world').data.successful).toBe(false);
  });

  it('Should be able to parse `sequence`', () => {
    // wo on 'world'
    expect(results(sequence(w, o).run('world'))).toStrictEqual([['w', 'o']]);

    // worl on 'world'
    expect(results(sequence(w, o, r, l).run('world'))).toStrictEqual([
      ['w', 'o', 'r', 'l'],
    ]);

    // worl on 'world'
    expect(results(w.chain(o).chain(r).chain(l).run('world'))).toStrictEqual([
      ['w', 'o', 'r', 'l'],
    ]);

    // w|wo on 'world'
    expect(results(w_or_wo.run('world'))).toStrictEqual(['w', ['w', 'o']]);
  });

  it('`and`, `sequence`, and `chain` should do the same thing', () => {
    // (w|wo)o on 'world' #1, typed w unknown
    expect(results(sequence(w_or_wo, o).run('world'))).toStrictEqual([
      ['w', 'o'],
    ]);

    // (w|wo)o on 'world' #2
    // `and` does the same thing as `sequence`, but is typed.
    expect(results(and(w_or_wo, o).run('world'))).toStrictEqual([['w', 'o']]);

    // (w|wo)o on 'world' #3
    // `and` does the same thing as `sequence`, but is typed.
    expect(results(w_or_wo.chain(o).run('world'))).toStrictEqual([['w', 'o']]);

    // (w|wo)r on 'world'
    // `and` does the same thing as `sequence`, but is typed.
    expect(results(w_or_wo.chain(r).run('world'))).toStrictEqual([
      ['w', 'o', 'r'],
    ]);
  });

  it('`mapResults` should return output with reformatted results.', () => {
    expect(
      results(
        or(str('h'), str('he'))
          .mapResults((s) => ({ helloVal: s }))
          .run('hello')
      )
    ).toStrictEqual([
      {
        helloVal: 'h',
      },
      {
        helloVal: 'he',
      },
    ]);
  });

  it('`reduceResults` should return output with reformatted results.', () => {
    expect(
      results(
        or(str('h'), str('he'))
          .reduceResults((acc, s) => `${acc}#${s}`, 'INITIAL')
          .run('hello')
      )
    ).toStrictEqual(['INITIAL#h', 'INITIAL#h#he']);
  });

  it('`many` should repeat a parser 0 or more times', () => {
    // r*  world
    expect(repeat(r).run('world').data.successful).toEqual(true);

    // r*  world
    expect(results(repeat(r).run('world'))).toStrictEqual([[]]);

    // r*  r
    expect(results(repeat(r).run('r'))).toStrictEqual([[], ['r']]);

    // r*  rrr
    expect(results(repeat(r).run('rrr'))).toStrictEqual([
      [],
      ['r'],
      ['r', 'r'],
      ['r', 'r', 'r'],
    ]);
  });

  it('`many` should repeat a parser 0 or more times, and append its results to previous parser', () => {
    // wr* on `w`
    expect(results(w.chain(repeat(r)).run('w'))).toStrictEqual([['w', []]]);

    // wr* on `wr`
    expect(results(w.chain(repeat(r)).run('wr'))).toStrictEqual([
      ['w', []],
      ['w', ['r']],
    ]);

    // wr* on `wrrr`
    expect(results(w.chain(repeat(r)).run('wrrr'))).toStrictEqual([
      ['w', []],
      ['w', ['r']],
      ['w', ['r', 'r']],
      ['w', ['r', 'r', 'r']],
    ]);

    // (w|wo)o(r*) on `worrrld`
    expect(
      results(or(w, and(w, o)).chain(o).chain(repeat(r)).run('worrrld'))
    ).toStrictEqual([
      ['w', 'o', []],
      ['w', 'o', ['r']],
      ['w', 'o', ['r', 'r']],
      ['w', 'o', ['r', 'r', 'r']],
    ]);

    // (w|wo)o(r*)l on `worrrld`
    expect(
      results(
        or(w, and(w, o)).chain(o).chain(repeat(r)).chain(l).run('worrrld')
      )
    ).toStrictEqual([['w', 'o', ['r', 'r', 'r'], 'l']]);
  });

  it('`repeatOnceOrMore` should match at least once', () => {
    // wr+ on `w`
    expect(results(w.chain(repeatOnceOrMore(r)).run('w'))).toStrictEqual([]);

    // wr+ on `wr`
    expect(results(w.chain(repeatOnceOrMore(r)).run('wr'))).toStrictEqual([
      ['w', ['r']],
    ]);
  });

  it('`str` should match from a set of strings', () => {
    // (a|bb|ccc) on `a`
    expect(results(str('a', 'bb', 'ccc').run('a'))).toStrictEqual(['a']);

    // (a|bb|ccc) on `ccc`
    expect(results(str('a', 'bb', 'ccc').run('ccc'))).toStrictEqual(['ccc']);

    // (bb|ccc) on `a`
    expect(str('bb', 'ccc').run('a').data.successful).toBe(false);

    // (bb|ccc) on `b`
    expect(str('bb', 'ccc').run('b').data.successful).toBe(false);
  });

  it('`template`', () => {});
});

/* -------------------------------------------------------------------------- */
/*                                 Assert Type                                */
/* -------------------------------------------------------------------------- */

assertResultType<string | [string, string]>(w_or_wo.run('world'));

assertResultType<[[string, string], string]>(and(and(w, o), r).run('world'));

assertResultType<[string, string, string]>(w.chain(o).chain(r).run('world'));

assertResultType<[string, string, string]>(sequence(w, o, r).run('world'));

function assertResultType<ExpectedResult>(
  actual: ParseOutput<unknown, ExpectedResult>
) {}

/* -------------------------------------------------------------------------- */
/*                                 Test Utils                                 */
/* -------------------------------------------------------------------------- */
function results<TKind, TResult>(output: ParseOutput<TKind, TResult>) {
  return output.candidates.map((c) => c.result);
}
