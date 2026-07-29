/**
 * BELLA EOS GOVERNANCE: Policy-as-Code Expression Evaluator
 * Safe, parser-based infix expression evaluator that avoids using eval().
 */

type TokenType = 'IDENTIFIER' | 'NUMBER' | 'STRING' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'EOF';

interface Token {
  type: TokenType;
  value: string;
}

export class PolicyEvaluator {
  private static operators = new Set(['==', '!=', '>=', '<=', '>', '<', '&&', '||']);
  private static operatorPrecedence: Record<string, number> = {
    '||': 1,
    '&&': 2,
    '==': 3, '!=': 3,
    '>': 4, '<': 4, '>=': 4, '<=': 4
  };

  /**
   * Tokenizes an input rule expression string.
   */
  public static tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const len = expr.length;

    while (i < len) {
      const char = expr[i];

      // Skip whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Parentheses
      if (char === '(') {
        tokens.push({ type: 'LPAREN', value: '(' });
        i++;
        continue;
      }
      if (char === ')') {
        tokens.push({ type: 'RPAREN', value: ')' });
        i++;
        continue;
      }

      // Operators check (2-char first)
      if (i + 1 < len) {
        const twoChar = expr.substring(i, i + 2);
        if (twoChar === '==' || twoChar === '!=' || twoChar === '>=' || twoChar === '<=' || twoChar === '&&' || twoChar === '||') {
          tokens.push({ type: 'OPERATOR', value: twoChar });
          i += 2;
          continue;
        }
      }
      if (char === '>' || char === '<') {
        tokens.push({ type: 'OPERATOR', value: char });
        i++;
        continue;
      }

      // String literals (single or double quotes)
      if (char === "'" || char === '"') {
        const quote = char;
        let strVal = '';
        i++;
        while (i < len && expr[i] !== quote) {
          strVal += expr[i];
          i++;
        }
        if (i >= len) {
          throw new Error('Unterminated string literal in rule expression');
        }
        tokens.push({ type: 'STRING', value: strVal });
        i++;
        continue;
      }

      // Numbers
      if (/[0-9]/.test(char)) {
        let numVal = '';
        while (i < len && /[0-9]/.test(expr[i])) {
          numVal += expr[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: numVal });
        continue;
      }

      // Identifiers / Variables
      if (/[a-zA-Z_]/.test(char)) {
        let identVal = '';
        while (i < len && /[a-zA-Z0-9_]/.test(expr[i])) {
          identVal += expr[i];
          i++;
        }
        tokens.push({ type: 'IDENTIFIER', value: identVal });
        continue;
      }

      throw new Error(`Unexpected character: "${char}" in rule expression`);
    }

    tokens.push({ type: 'EOF', value: '' });
    return tokens;
  }

  /**
   * Converts infix tokens to postfix (Reverse Polish Notation) using Shunting-Yard.
   */
  public static toPostfix(tokens: Token[]): Token[] {
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    for (const token of tokens) {
      if (token.type === 'EOF') break;

      if (token.type === 'NUMBER' || token.type === 'STRING' || token.type === 'IDENTIFIER') {
        outputQueue.push(token);
      } else if (token.type === 'OPERATOR') {
        const p1 = this.operatorPrecedence[token.value] || 0;
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type !== 'OPERATOR') break;
          const p2 = this.operatorPrecedence[top.value] || 0;
          if (p2 >= p1) {
            outputQueue.push(operatorStack.pop()!);
          } else {
            break;
          }
        }
        operatorStack.push(token);
      } else if (token.type === 'LPAREN') {
        operatorStack.push(token);
      } else if (token.type === 'RPAREN') {
        let foundLparen = false;
        while (operatorStack.length > 0) {
          const top = operatorStack.pop()!;
          if (top.type === 'LPAREN') {
            foundLparen = true;
            break;
          }
          outputQueue.push(top);
        }
        if (!foundLparen) {
          throw new Error('Mismatched parentheses in rule expression');
        }
      }
    }

    while (operatorStack.length > 0) {
      const top = operatorStack.pop()!;
      if (top.type === 'LPAREN' || top.type === 'RPAREN') {
        throw new Error('Mismatched parentheses in rule expression');
      }
      outputQueue.push(top);
    }

    return outputQueue;
  }

  /**
   * Evaluates postfix expression tokens against context.
   */
  public static evaluate(expr: string, context: Record<string, any>): boolean {
    const tokens = this.tokenize(expr);
    const postfix = this.toPostfix(tokens);
    const stack: any[] = [];

    for (const token of postfix) {
      if (token.type === 'NUMBER') {
        stack.push(Number(token.value));
      } else if (token.type === 'STRING') {
        stack.push(token.value);
      } else if (token.type === 'IDENTIFIER') {
        // Resolve variable from context
        const val = context[token.value];
        stack.push(val);
      } else if (token.type === 'OPERATOR') {
        if (stack.length < 2) {
          throw new Error(`Invalid expression: too few operands for operator ${token.value}`);
        }
        const right = stack.pop();
        const left = stack.pop();
        stack.push(this.applyOperator(token.value, left, right));
      }
    }

    if (stack.length !== 1) {
      throw new Error('Invalid expression: mismatched operands and operators');
    }

    return Boolean(stack[0]);
  }

  private static applyOperator(op: string, left: any, right: any): any {
    switch (op) {
      case '==': return left === right;
      case '!=': return left !== right;
      case '>': return Number(left) > Number(right);
      case '<': return Number(left) < Number(right);
      case '>=': return Number(left) >= Number(right);
      case '<=': return Number(left) <= Number(right);
      case '&&': return Boolean(left) && Boolean(right);
      case '||': return Boolean(left) || Boolean(right);
      default:
        throw new Error(`Unsupported operator: ${op}`);
    }
  }
}
