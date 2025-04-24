import { AxiosHeaders, AxiosRequestConfig } from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { HttpClientInternalInstance, HttpMethod } from "src/contract";
import { HttpClient } from "src/index";

type MockArrayResponse = [
  status: number,
  data?: any,
  headers?: AxiosHeaders
];

type MockObjectResponse = {
  status: number;
  data: any;
  headers?: AxiosHeaders,
  config?: AxiosRequestConfig
};

type MockResponse = MockArrayResponse | MockObjectResponse;

type CallbackResponseSpecFunc = (
  config: AxiosRequestConfig
) => MockResponse | Promise<MockResponse>;

type ResponseSpecFunc = <T = any>(
  statusOrCallback: number | CallbackResponseSpecFunc,
  data?: T,
  headers?: AxiosHeaders
) => HttpMockAdapter;

type HttpMockAdapter = {
  on: (method: HttpMethod, url: string) => {
    reply: ResponseSpecFunc;
    replyOnce: ResponseSpecFunc;
    // TODO: Add support for these too
    // networkError(): HttpMockAdapter;
    // networkErrorOnce(): HttpMockAdapter;
    // timeout(): HttpMockAdapter;
    // timeoutOnce(): HttpMockAdapter;

    // withDelayInMs(delay: number): RequestHandler;
    // passThrough(): HttpMockAdapter;
    // abortRequest(): HttpMockAdapter;
    // abortRequestOnce(): HttpMockAdapter;
  }
}

function uppercaseFirst(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function createHttpMock(httpClientInstance = HttpClient): HttpMockAdapter {
  const _httpClientInstance: HttpClientInternalInstance = httpClientInstance as HttpClientInternalInstance;
  const mock = new AxiosMockAdapter(_httpClientInstance._instance);

  const newHttpMock: HttpMockAdapter = {
    on(method, url) {
      type MockMethod = "onGet" | "onPost" | "onPut" | "onPatch" | "onDelete" | "onHead" | "onOptions";
      const mockMethod = `on${uppercaseFirst(method.toLocaleLowerCase())}` as MockMethod;
      const mockOn = mock[mockMethod](url);
      return {
        reply(...args) { // TODO: Organize the args better
          mockOn.reply(...args);
          return newHttpMock;
        },
        replyOnce(...args) { // TODO: Organize the args better
          mockOn.replyOnce(...args);
          return newHttpMock;
        },
      };
    },
  };

  return newHttpMock;
}

export const httpMock = createHttpMock();