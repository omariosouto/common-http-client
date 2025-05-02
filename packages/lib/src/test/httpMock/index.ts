import { AxiosRequestConfig } from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { HttpClient, HttpClientHeaders, HttpClientInternalInstance, HttpMethod, HttpRequestOptions } from "../../index";

type HttpMockHistoryEntry = {} & HttpRequestOptions;
type HttpMockHistory = HttpMockHistoryEntry[];

type MockArrayResponse = [
  status: number,
  data?: any,
  headers?: HttpClientHeaders
];

type MockObjectResponse = {
  status: number;
  data: any;
  headers?: HttpClientHeaders,
  config?: AxiosRequestConfig
};

type MockResponse = MockArrayResponse | MockObjectResponse;

type CallbackResponseSpecFunc = (
  config: AxiosRequestConfig
) => MockResponse | Promise<MockResponse>;

type ResponseSpecFunc = <T = any>(
  statusOrCallback: number | CallbackResponseSpecFunc,
  data?: T,
  headers?: HttpClientHeaders
) => HttpMockAdapter;

type HttpMockAdapter = {
  on: (method: HttpMethod, url: string) => {
    reply: ResponseSpecFunc;
    replyOnce: ResponseSpecFunc;
    replyNetworkError(): HttpMockAdapter;
    replyNetworkErrorOnce(): HttpMockAdapter;
    replyTimeout(): HttpMockAdapter;
    replyTimeoutOnce(): HttpMockAdapter;
    // withDelayInMs(delay: number): RequestHandler;
    // passThrough(): HttpMockAdapter;
    // abortRequest(): HttpMockAdapter;
    // abortRequestOnce(): HttpMockAdapter;
  },
  reset(): void;
  resetHandlers(): void;
  resetHistory(): void;
  restore(): void;
  history: HttpMockHistory;
}

function uppercaseFirst(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function createHttpMock(httpClientInstance = HttpClient): HttpMockAdapter {
  const _httpClientInstance: HttpClientInternalInstance = httpClientInstance as HttpClientInternalInstance;
  const mock = new AxiosMockAdapter(_httpClientInstance._instance);

  const newHttpMock: HttpMockAdapter = {
    reset() {
      mock.reset();
    },
    resetHandlers() {
      mock.resetHandlers();
    },
    resetHistory() {
      mock.resetHistory();
    },
    restore() {
      mock.restore();
    },
    get history() {
      return mock.history.map(({ data, ...item}) => ({
        ...item,
        body: data,
        method: item.method?.toUpperCase(),
      })) as HttpRequestOptions[];
    },
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
        replyNetworkError() {
          mockOn.networkError();
          return newHttpMock;
        },
        replyNetworkErrorOnce() {
          mockOn.networkErrorOnce();
          return newHttpMock;
        },
        replyTimeout() {
          mockOn.timeout();
          return newHttpMock;
        },
        replyTimeoutOnce() {
          mockOn.timeoutOnce();
          return newHttpMock;
        }
      };
    },
  };

  return newHttpMock;
}

export const httpMock = createHttpMock();