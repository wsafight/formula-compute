const operatorReg: RegExp = /[()+\-/* ]/g

export type Operator = '+' | '-' | '*' | '/'

const DEFAULT_CALCULATORS: Record<Operator, Function> = {
  '+': (num1: number, num2: number) => num1 + num2,
  '-': (num1: number, num2: number) => num1 - num2,
  '*': (num1: number, num2: number) => num1 * num2,
  '/': (num1: number, num2: number) => num1 / num2,
}

const OPERATOR_RAND: Record<string, number> = {
  '*': 2, 
  '/': 2,
  '+': 1, 
  '-': 1, 
}


const strToToken = (str: string): string[] => {
    const keys = str.split(operatorReg)
    const tokens: string[] = []
    let temp: string = str

    while (temp.length > 0) {
        if (keys.length > 0 && temp.startsWith(keys[0])) {
            temp = temp.replace(keys[0], '')
            tokens.push(keys.shift() || '')
        }
        else {
            tokens.push(temp[0])
            temp = temp.substring(1)
        }
    }
    return tokens.map(token => token.trim()).filter(Boolean)
}

const tokenToRpn = (tokenList: string[]) => {
    if (!tokenList || tokenList.length <= 0) return []
    const operators: string[] = []

    const isTokenHighRank = (token: string) => {
        const topOperator = operators[operators.length - 1]

        return operators.length === 0 ||
            topOperator === '(' ||
            (OPERATOR_RAND[token] || 0) > (OPERATOR_RAND[topOperator] || 0)
    }

    const outputs = tokenList.reduce((outputs: string[], token: string) => {
        if (!token.match(operatorReg)) outputs.push(token)
        else if (token === '(') operators.push(token)
        else if (token === ')') {
            while (operators.length > 0) {
                const operator = operators.pop()
                if (operator === '(') break
                outputs.push(operator!)
            }
        }
        else {
            while (operators.length >= 0) {
                if (isTokenHighRank(token)) {
                    operators.push(token)
                    break
                }
                outputs.push(operators.pop()!)
            }
        }

        return outputs
    }, [])
    return [...outputs, ...operators]
}


/**
 * 从数据集里获取对应的数据
 */
const getValues = (key: string, values: any) => {
    if (!key) return 0
    if (typeof key === 'string') {
        return values[key] || Number(key) || 0
    }
    return key
}

const calcRpn = function (
  tokens: string[], 
  values: any,
  calculators: Record<Operator, Function>) {
    let numList: string[] = []
    for (const token of tokens) {
        const calculator: Function | undefined = calculators[token as Operator]
        if (!calculator) {
            numList.push(token)
        } else {
            const val2 = getValues(numList.pop()!, values)
            const val1 = getValues(numList.pop()!, values)
            const result = calculator(val1, val2)
            numList.push(result.toNumber())
        }
    }
    return numList.pop()
}


const formulaCompute = (
  template: string, 
  values: Record<string, number>,
  calculators?: Record<Operator, Function>
) => {
    const tokens = strToToken(template)
    const rpn = tokenToRpn(tokens)
    const result = calcRpn(rpn, values, {
      ...calculators,
      ...DEFAULT_CALCULATORS,
    })
    return result
}

const isFormula = (str: string): boolean => {
  if (!str || typeof str !== 'string') {
    return false
  }
  return true
}

export {
  isFormula,
  formulaCompute
}

export default formulaCompute