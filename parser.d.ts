declare function peg$SyntaxError(
  message: any,
  expected: any,
  found: any,
  location: any,
): Error
declare namespace peg$SyntaxError {
  function buildMessage(expected: any, found: any): string
}
declare class peg$SyntaxError {
  constructor(message: any, expected: any, found: any, location: any)
  format(sources: any): string
}
declare function peg$parse(input: any, options: any): any
export declare let StartRules: string[]
export {peg$SyntaxError as SyntaxError, peg$parse as parse}
