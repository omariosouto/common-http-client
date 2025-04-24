import AxiosMockAdapter from "axios-mock-adapter";
import { HttpClient } from "src/index";

export function httpMock(httpClientInstance = HttpClient) {
  return new AxiosMockAdapter(httpClientInstance);
}
