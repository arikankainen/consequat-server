const log = (...params: Array<string | undefined>): void => {
  if (process.env.NODE_ENV === 'development') console.log(...params);
};

const error = (...params: Array<string | undefined>): void => {
  console.error(...params);
};

export default {
  log,
  error
};