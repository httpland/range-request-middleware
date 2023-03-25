// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

// TODO:(miyauci) Packaging and externalization this module.

import { isNotEmpty } from "./deps.ts";

type DIGIT = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Alpha =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";
type alpha = Lowercase<Alpha>;
type ALPHA = Alpha | alpha;
type TChar =
  | "!"
  | "#"
  | "$"
  | "%"
  | "&"
  | "'"
  | "*"
  | "+"
  | "-"
  | "."
  | "^"
  | "_"
  | "`"
  | "|"
  | "~"
  | ALPHA
  | DIGIT;
export type Token = `${TChar}${string}`;
export type AcceptRanges = [Token, ...Token[]];

const ReToken = /^[\w!#$%&'*+.^`|~-]+$/;

export function isTokenFormat(input: string): input is Token {
  return ReToken.test(input);
}

/** Parses string into {@link AcceptRanges}.
 * @throws {SyntaxError} If the input is invalid [`Accept-Ranges`](https://www.rfc-editor.org/rfc/rfc9110.html#section-14.3-2) syntax.
 */
export function parseAcceptRanges(input: string): AcceptRanges {
  const acceptableRanges = input
    .trim()
    .split(",")
    .map((v) => v.trim());

  if (!isNotEmpty(acceptableRanges)) {
    throw SyntaxError(`invalid <Accept-Ranges> syntax. ${input}`);
  }

  acceptableRanges.forEach((token) => {
    if (!isTokenFormat(token)) {
      throw SyntaxError(`invalid <range-unit> syntax. ${token}`);
    }
  });

  return acceptableRanges as AcceptRanges;
}

/** Whether the input has {@link Token} or not.
 * If the input is invalid [`Accept-Ranges`](https://www.rfc-editor.org/rfc/rfc9110.html#section-14.3-2) then `false`.
 */
export function hasToken(input: string, token: Token): boolean {
  try {
    return parseAcceptRanges(input).includes(token);
  } catch {
    return false;
  }
}
