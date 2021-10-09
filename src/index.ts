
class Token {
    constructor(public name: string, public value: string) {

    }
    show() {
        return `
    name:${this.name}
    value: ${this.value}
    `
    }
}
// const e = new RegExp("abcs")
class Tokenizer {
    constructor(public tokens: Map<RegExp, string>) {

    }
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
                    string = string.slice(match.index + 1)
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
            if (l[0].name == this.s) {
                return l.slice(1)
            }
        }
        return null

    }
}
const id = <T>(x: T): T => x;

class ParserRule {
    params: ParserHelper[]
    constructor(public parameters: (string | ParserHelper)[], public output: string, public func = id) {
        function helper(i: string | ParserHelper): ParserHelper {
            if (typeof i === "string") {
                i = new Single(i)
            }
            return i
        }
        this.params = parameters.map(helper)
    }
    doesMatch(inputLine: Token[]): boolean {
        for (const param of this.params) {
            const t = param.consume(inputLine)
            if (t === null) {
                return false
            }
            inputLine = t
        }
        return inputLine.length == 0
    }
}
class AST {
    constructor(public name: string, public value: Token, public children: AST[]) { }

    evaluate<T>(funcs: Record<string, (x: Token, l: T[]) => T>): T {
        if (!(this.name in funcs)) {
            throw new Error(`unhandled name ${this.name}`)
        }
        const evalled_children = this.children.map(x => x.evaluate(funcs))//list(map(lambda x: x.evaluate(funcs), this.children))
        const func = funcs[this.name]
        return func(this.value, evalled_children)
    }
}
class Parser {
    constructor(public rules: ParserRule[], public tokenizer: Tokenizer) { }

    runParser(tokens: Token[]): AST | null {
        if (tokens.length === 1) {
            return new AST(tokens[0].name, tokens[0], [])
        }
        let ast: AST | null = null
        for (let i = 1; i < tokens.length + 1; i++) {
            // i = t + 1
            for (const rule of this.rules) {
                const test = tokens.slice(0, i)
                if (rule.doesMatch(test)) {
                    const tree = test.map(x => new AST(x.name, x, []))//list(map(lambda x: AST(x.name, x, []), test))
                    const remaining_tokens = [new Token(rule.output, test.map(x => x.value).join("")), ...tokens.slice(i)];
                    ast = this.runParser(remaining_tokens)
                    if (ast === null) {
                        return null
                    } else {
                        ast.children = tree
                    }
                    return ast
                }
            }
        }
        return ast
    }
    parse(inputString: string): AST | null {
        console.log("before tokenizing")
        const tokens = this.tokenizer.tokenize(inputString)
        console.log("tokens is", tokens)
        return this.runParser(tokens)
    }
}
const rule: ParserRule = new ParserRule(["number", "operator", "number"], "expression", (a, _, b) => {
    return a + b
})
// # rule: ParserRule = ParserRule(["expression"], "number")
const rules = [rule]
const m = new Map<RegExp, string>().set(/\d+/, "number",).set(/\+/, "operator")
const tokenizer = new Tokenizer(m)
const myParser = new Parser(rules, tokenizer)
console.log("before parsing")
const exp = myParser.parse("1+1")
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