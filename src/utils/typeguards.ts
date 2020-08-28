/* eslint-disable @typescript-eslint/no-explicit-any */

export const isError = (value: any | undefined): value is Error => {
  return value && value instanceof Error && value.message !== undefined;
};
