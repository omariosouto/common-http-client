import AxiosMockAdapter from "axios-mock-adapter";
import { HttpClientInternalInstance } from "src/contract";
import { HttpClient } from "src/index";

export function httpMock(httpClientInstance = HttpClient) {
  const _httpClientInstance: HttpClientInternalInstance = httpClientInstance as HttpClientInternalInstance;
  return new AxiosMockAdapter(_httpClientInstance._instance);
}
