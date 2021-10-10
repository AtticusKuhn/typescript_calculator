
class Token {
    constructor(public name: string, public value: string) { }
    show() {
        return `
    name:${this.name}
    value: ${this.value}
    `
    }
}
// const e = new RegExp("abcs")
class Tokenizer {
    constructor(public tokens: Map<RegExp, string>) { }
    tokenize(string: string): Token[] {
        let returning_tokens: Token[] = []
        while (string.length > 0) {
            let correct = false
            this.tokens.forEach((tokenName, pattern) => {
                console.log("trying pattern", pattern)
                // let e = string.match(pattern)
                let match = pattern.exec(string)
                // let match = pattern.match(string, 0)
                if (match !== null) {
                    let m = match[0]
                    returning_tokens.push(new Token(tokenName, m))
                    console.log("match is", m)
                    console.log("and index is", match.index)
                    string = string.slice(match.index + m.length)
                    correct = true
                }
            });
            if (!correct) {
                throw new Error(`no rule for token ${string}`)
                return returning_tokens
            }
        }
        return returning_tokens
    }
}



class ParserHelper {
    consume(l: Token[]): Token[] | null {
        return l.slice(1)
    }
}

class Single extends ParserHelper {
    constructor(public s: string) {
        super()
    }
    consume(l: Token[]): Token[] | null {
        if (l.length > 0) {
            if (l[0].name === this.s) {
                console.log(`in consume, l[0].name is`, l[0].name, `and s is`, this.s)
                return l.slice(1)
            }
        }
        return null

    }
}
const id = <T>(x: T): T => x;
type functype<T, A> = T extends string
    ? string
    : T extends ParserRule<A>
    ? A
    : any
//, K extends (ParserRule<any, any> | string | ParserHelper)[]
function helper<T, K extends (ParserRule<any> | string | ParserHelper)[]>(i: [rules: (ParserRule<any> | string | ParserHelper)[], func: (...x: K) => T]): [rules: (ParserHelper)[], func: (...x: K) => T] {
    let [a, b] = i
    const na = a.map((ax) => {
        if (typeof ax === "string") {
            return new Single(ax)
        } else if (ax instanceof ParserRule) {
            return new Single(ax.name)
        }
        return ax
    })
    // })
    return [na, b]
}
class ParserRule<T> {
    cases: ([rule: (ParserHelper)[], func: (...x: any) => T])[];
    name: string;
    // cases: [rules: (ParserHelper)[], func: (x: typeof rawCases[0]) => T][];
    constructor(name: string) {

        this.cases = []//rawCases.map(helper)
        this.name = name;
        // this.
    }
    registerRule<K extends (ParserRule<any> | string | ParserHelper)[]>(rule: K, func: (...x: K) => T) {
        this.cases.push(helper([rule, func]))
        return this;
    }
    doesMatch(inputLine: Token[]): boolean {
        console.log(`doesMatch called with tokens, ${JSON.stringify(inputLine)}`)
        if (inputLine.length === 0) {
            return false
        }
        loop1: for (const c of this.cases) {
            loop2: for (const param of c[0]) {
                console.log(`in doesMatch, param is`, param, `of case`, c)
                // console.log(`in doesMatch, inputline, ${JSON.stringify(inputLine)}`)
                const t = param.consume(inputLine)
                if (t === null) {
                    continue loop1
                }
                inputLine = t
            }
        }
        return inputLine.length == 0
    }
    run(_tokens: Token[]) {
        for (const c of this.cases) {
            for (const _param of c[0]) {
            }
        }
    }
}
class AST {
    constructor(public name: string, public value: Token, public children: AST[]) { }

    // evaluate<T>(rules: ParserRule<T>[]): T {
    //     for (const rule of rules) {
    //         if (rule.doesMatch(this.children)) {
    //             return
    //         }
    //     }
    //     if (!(this.name in funcs)) {
    //         throw new Error(`unhandled name ${this.name}`)
    //     }
    //     const evalled_children = this.children.map(x => x.evaluate(rules))//list(map(lambda x: x.evaluate(funcs), this.children))
    //     const func = funcs[this.name]
    //     return func(this.value, evalled_children)
    // }
}
class Parser<T> {
    constructor(public rules: [ParserRule<T>, ...ParserRule<any>[]], public tokenizer: Tokenizer) { }

    runMakeTree(tokens: Token[]): AST | null {
        if (tokens.length === 1) {
            return new AST(tokens[0].name, tokens[0], [])
        }
        let ast: AST | null = null
        for (let start = 0; start < tokens.length + 1; start++) {
            for (let end = start + 1; end < tokens.length + 1; end++) {
                // i = t + 1
                for (const rule of this.rules) {
                    const test = tokens.slice(start, end)
                    console.log(`testing ${JSON.stringify(test)}`)
                    if (rule.doesMatch(test)) {
                        console.log(`${JSON.stringify(test)} passed the rule ${rule.name}`)
                        const tree = test.map(x => new AST(x.name, x, []))//list(map(lambda x: AST(x.name, x, []), test))
                        const remaining_tokens = [...tokens.slice(0, start), new Token(rule.name, test.map(x => x.value).join("")), ...tokens.slice(end, tokens.length - 1)];
                        console.log(`remaining_tokens`, remaining_tokens)
                        ast = this.runMakeTree(remaining_tokens)
                        if (ast === null) {
                            throw new Error(`no parse found for ${JSON.stringify(remaining_tokens)}`)
                            return null
                        } else {
                            ast.children = tree
                        }
                        return ast
                    }
                }
            }
        }
        return ast
    }
    makeTree(inputString: string): AST | null {
        console.log("before tokenizing")
        const tokens = this.tokenizer.tokenize(inputString)
        console.log("tokens is", tokens)
        return this.runMakeTree(tokens)
    }
    parse(input: string): T {
        const tokens = this.tokenizer.tokenize(input)
        return this.runParser(tokens)
    }
    runParser(_tokens: Token[]): T {
        //@ts-ignore
        return null
        // for (let i = 1; i < tokens.length + 1; i++) {
        //     for (const rule of this.rules) {
        //         const test = tokens.slice(0, i)
        //         if (rule.doesMatch(test)) {
        //             const tree = test.map(x => new AST(x.name, x, []))//list(map(lambda x: AST(x.name, x, []), test))
        //             const remaining_tokens = [new Token(rule.name, test.map(x => x.value).join("")), ...tokens.slice(i)];
        //             ast = this.runMakeTree(remaining_tokens)
        //             if (ast === null) {
        //                 throw new Error(`no parse found for ${remaining_tokens}`)
        //                 return null
        //             } else {
        //                 ast.children = tree
        //             }
        //             return ast
        //         }
        //     }
        // }
        // }

    }
}
// String
const numberRule = new ParserRule<number>("number");
const operatorRule = new ParserRule<string>("op");
operatorRule.registerRule(["operator"], (x) => x)


numberRule.registerRule<[ParserRule<number>, string, ParserRule<number>]>([numberRule, "op", numberRule], (a, _, b) => {
    //@ts-ignore
    return a + b
})
numberRule.registerRule(["num"], (a) => {
    return parseInt(a)
})
// const plusRule = new ParserRule("expression",
//     [
//         [[numberRule, "operator", numberRule], (a, _, b) => {
//             return a + b`
//         }]
//     ])
// # rule: ParserRule = ParserRule(["expression"], "number")
const rules: [ParserRule<number>, ParserRule<string>] = [numberRule, operatorRule]
const m = new Map<RegExp, string>()
    .set(/\d+/, "num",)
    .set(/\+/, "operator")
const tokenizer = new Tokenizer(m)
const myParser = new Parser<number>(rules, tokenizer)
console.log("before parsing")
const exp = myParser.makeTree("1123+112312+1")
console.log("exp", exp)

// function parseExpression(value: Token, children: AST[]): number {
//     return children[0] + children[2]
// }
// def parseDigit(value: Token, children: List[AST]) -> str:
// return int(value.value)
// def parseOperator(value: Token, children: List[AST]) -> None:
// return children
// def solve(problem: str) -> int:
// result: AST = myParser.parse(problem)
// evalled = result.evaluate({
//     "expression": parseExpression,
//     "number": parseDigit,
//     "operator": parseOperator

// })
// return evalled