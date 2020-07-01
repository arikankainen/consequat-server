/* eslint-disable @typescript-eslint/no-explicit-any */

export const isError = (value: any | undefined): value is Error => {
  return value && ((value as Error).message !== undefined);
};