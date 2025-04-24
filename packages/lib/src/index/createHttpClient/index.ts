import axios from 'axios';

export const createHttpClient = () => {
  return axios.create();
};