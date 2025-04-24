import axios from 'axios';

export const createHttpClient = () => {
  return axios.create();
};

/*
## It's mandatory to have support for circuit-breaker and cache
- If two components are doing a request for the same place, we should not do the request twice considering a stale time

- https://github.com/barnendu/axios-breaker
- https://www.npmjs.com/package/axios-cache-adapter
*/