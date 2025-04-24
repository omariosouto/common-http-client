import AxiosMockAdapter from "axios-mock-adapter";
import { HttpClient } from "../createHttpClient/HttpClient";

export function httpMock(httpClientInstance = HttpClient) {
  return new AxiosMockAdapter(httpClientInstance);
}
