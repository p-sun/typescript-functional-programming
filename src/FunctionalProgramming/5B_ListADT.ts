/* -------------------------------------------------------------------------- */
/*                                  List ADT                                  */
/* -------------------------------------------------------------------------- */
type ListADT<T> =
  | { tag: 'empty' }
  | { tag: 'concat'; head: T; tail: ListADT<T> };

/* -------------------------------------------------------------------------- */
/*                                     Run                                    */
/* -------------------------------------------------------------------------- */
export default function runCreateList() {
  const emptyList: ListADT<string> = { tag: 'empty' };

  const oneItemList: ListADT<string> = {
    tag: 'concat',
    head: 'ONE',
    tail: emptyList,
  };

  const twoItemList: ListADT<string> = {
    tag: 'concat',
    head: 'TWO',
    tail: oneItemList,
  };

  console.log(JSON.stringify(twoItemList, null, 2));
  /**
    {
    "tag": "concat",
    "head": "TWO",
    "tail": {
        "tag": "concat",
        "head": "ONE",
        "tail": {
        "tag": "empty"
        }
    }
    }
   */
}
