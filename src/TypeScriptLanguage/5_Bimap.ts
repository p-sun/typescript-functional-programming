// Bimap creates two maps: keyToValue, and valueToKey.
// It's a way to showcase how to use TS types,
// to create functions whose name comes from the type.

function Capitalize<S extends string>(s: S): Capitalize<S> {
    return s as Capitalize<S>
}

class Bimap<K, V, KeyName extends string, ValueName extends string> {
    private keyToValue = new Map<K, V>()
    private valueToKey = new Map<V, K>()

    constructor(keyName: KeyName, valueName: ValueName) {
        this.get = {
            [`${valueName}For${Capitalize(keyName)}`]: (key: K) =>
                this.keyToValue.get(key),
            [`${keyName}For${Capitalize(valueName)}`]: (value: V) =>
                this.valueToKey.get(value),
        } as any
    }

    valueForKey(key: K): V | undefined {
        return this.keyToValue.get(key)
    }

    readonly get: {
        [k in `${KeyName}For${Capitalize<ValueName>}`]: (v: V) => K | undefined
    } & {
        [k in `${ValueName}For${Capitalize<KeyName>}`]: (k: K) => V | undefined
    } = null as any

    static create<K, V>() {
        return <KeyName extends string, ValueName extends string>(
            keyName: KeyName,
            valueName: ValueName
        ) => {
            return new Bimap<K, V, KeyName, ValueName>(keyName, valueName)
        }
    }
}

const bimap = Bimap.create<string, number>()('username', 'id')

const id = bimap.get.idForUsername('alice')
const username = bimap.get.usernameForId(1)

export default {}