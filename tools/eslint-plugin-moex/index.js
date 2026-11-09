const FUNCTION_TYPES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

const isFunction = (node) => Boolean(node) && FUNCTION_TYPES.has(node.type);

const collectOwnReturns = (sourceCode, fnNode) => {
  const returns = [];

  const walk = (node) => {
    if (!node || typeof node.type !== "string") {
      return;
    }

    if (node !== fnNode && isFunction(node)) {
      return;
    }

    if (node.type === "ReturnStatement") {
      returns.push(node);
      return;
    }

    sourceCode.visitorKeys[node.type].forEach((key) => {
      const child = node[key];

      if (Array.isArray(child)) {
        child.forEach(walk);
      } else {
        walk(child);
      }
    });
  };

  walk(fnNode.body);

  return returns;
};

const singleExit = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Одна точка выхода из функции: единственный return и только последним оператором",
    },
    schema: [],
    messages: {
      multiple: "У функции должен быть ровно один выход: найдено {{count}} return.",
      notLast:
        "Единственный return обязан быть последним оператором тела функции — ранние выходы запрещены.",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;

    const check = (node) => {
      const returns = collectOwnReturns(sourceCode, node);

      const isBlockBody = node.body.type === "BlockStatement";
      const last = isBlockBody ? node.body.body.at(-1) : undefined;
      const isTailReturn = returns.length === 1 && last === returns[0];

      const problems = [
        returns.length > 1 && [
          returns[1],
          { messageId: "multiple", data: { count: String(returns.length) } },
        ],
        returns.length === 1 && !isTailReturn && [
          returns[0],
          { messageId: "notLast" },
        ],
      ].filter(Boolean);

      problems.forEach(([target, message]) =>
        context.report({ node: target, ...message }),
      );
    };

    return {
      FunctionDeclaration: check,
      FunctionExpression: check,
      ArrowFunctionExpression: check,
    };
  },
};

export default {
  meta: { name: "eslint-plugin-moex", version: "1.0.0" },
  rules: { "single-exit": singleExit },
};
