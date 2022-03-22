import { removeJSComments } from '../utils/curriculum-helpers';
import { getErrorMessage } from 'src/utils/general';

type consoleLogOverride = (data: unknown[]) => void;

export const overrideConsoleLog = (override: consoleLogOverride) => {
  // @ts-expect-error will fix later
  console.standardLog = console.log;
  console.log = (...data: unknown[]) => {
    override(data);
    // @ts-expect-error will fix later
    console.standardLog.apply(console, data); // eslint-disable-line prefer-spread
  };
};

export const restoreConsoleLog = () => {
  // @ts-expect-error will fix later
  if (!console.standardLog) {
    throw new Error(
      'Attempted to restore console.log but it has never been overwritten',
    );
  }

  // @ts-expect-error will fix later
  console.log = console.standardLog;
};

interface IFindFirstPassingLineForCondition {
  condition: string;
}

const getCodeEvaluationHelpers = (
  logs: Array<Array<unknown>>,
  codeString: string,
) => {
  const helpers = {
    // right now this only works with primitives
    wasLoggedToConsole: (val: unknown) => {
      return logs.some((logGroup) => logGroup.some((log) => log === val));
    },
    wasFunctionInvoked: (functionName: string) => {
      return codeString.trim().includes(`${functionName}()`);
    },
    isDefined: (variableName: string) =>
      eval(`typeof ${variableName} !== 'undefined'`),
    /**
     * Evaluates a condition for each line of the provided code.
     * Upon finding a line that passes it returns that line's index
     */
    findFirstPassingLineForCondition: ({
      condition,
    }: IFindFirstPassingLineForCondition) => {
      const splitCodeString = codeString.split('\n');
      let codeToEvaluate = '';

      for (let i = 0; i < splitCodeString.length; i++) {
        const currentLine = splitCodeString[i];
        codeToEvaluate += i === 0 ? currentLine : `\n${currentLine}`;
        const context = getEvaluationContext(codeToEvaluate);
        const codeWithCondition = `${codeToEvaluate}\n${condition}`;

        if (evaluateWithContext(codeWithCondition, context)) {
          return {
            index: i,
            passed: true,
          };
        }
      }

      return {
        index: -1,
        passed: false,
      };
    },
    removeWhitespace: (string: string, i = 0, res = ''): string => {
      if (i >= string.length) return res;
      else if (string[i] == ' ')
        return helpers.removeWhitespace(string, i + 1, res);
      else return helpers.removeWhitespace(string, i + 1, (res += string[i]));
    },
  };
  return helpers;
};

export const getEvaluationContext = (
  code: string,
  logs: Array<Array<unknown>> = [],
) => {
  const _codeString = `${code}`;
  return {
    _codeEvaluationHelpers: getCodeEvaluationHelpers(logs, _codeString),
    _helpers: getCodeEvaluationHelpers(logs, _codeString),
    _codeString,
    _internalLogs: logs,
  };
};

export const getCode = (code = '', removeComments?: boolean) =>
  removeComments ? removeJSComments(code) : code;

export const getConsoleLogsFromCodeEvaluation = (
  code: string | undefined,
): Array<string> => {
  if (code === undefined) {
    return [];
  }

  const context = getEvaluationContext(code);
  const logs = [] as Array<string>;

  overrideConsoleLog((...args) => {
    logs.push(args.toString());
    // @ts-expect-error will fix later
    console.standardLog('args', ...args);
  });
  try {
    evaluateWithContext(
      `
    ${code};
  `,
      context,
    );
  } catch (e) {
    logs.push(getErrorMessage(e));
  }

  restoreConsoleLog();
  return logs;
};

// TODO: type context
export const evaluateWithContext = (code: string, context = {}) => {
  // Create an args definition list e.g. "arg1 = this.arg1, arg2 = this.arg2"
  const contextStr = Object.keys(context).length
    ? `let ${Object.keys(context)
        .map((key) => `${key} = this.${key}`)
        .join(',')};`
    : '';
  const evalString = `${contextStr}${code}`;
  /**
   * Call is used to define where "this" within the evaluated code
   * should reference. eval does not accept the likes of
   * eval.call(...) or eval.apply(...) and cannot be an arrow function
   * because of how arrow functions handle 'this'
   */
  return function anonymousFunction() {
    return eval(evalString);
  }.call(context);
};
