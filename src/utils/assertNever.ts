/**
 * Exhaustiveness helpers for discriminated unions.
 * Use in switch/if-else branches that should be unreachable.
 */

export function assertNever(value: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}

export function assertUnreachable(value: never): never {
  return assertNever(value);
}
