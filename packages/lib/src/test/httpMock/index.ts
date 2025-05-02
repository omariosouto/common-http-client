import { AxiosRequestConfig } from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { HttpClientHeaders, HttpMethod, HttpRequestOptions } from "../../index";
import { getInstances } from "../../index/createHttpClient/instances";

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

export function createHttpMock(): HttpMockAdapter {
  // TODO: This must be live updated
  const mocks = getInstances().map((instance) => {
    const mock = new AxiosMockAdapter(instance);
    return mock;
  });

  const newHttpMock: HttpMockAdapter = {
    reset() {
      mocks.forEach((mock) => {
        mock.reset();
      });
    },
    resetHandlers() {
      mocks.forEach((mock) => {
        mock.resetHandlers();
      });
    },
    resetHistory() {
      mocks.forEach((mock) => {
        mock.resetHistory();
      });
    },
    restore() {
      mocks.forEach((mock) => {
        mock.restore();
      });
    },
    get history() {
      // return mock.history.map(({ data, ...item}) => ({
      //   ...item,
      //   body: data,
      //   method: item.method?.toUpperCase(),
      // })) as HttpRequestOptions[];
      return mocks.reduce((acc, mock) => {
        const history = mock.history.map(({ data, ...item }) => ({
          ...item,
          body: data,
          method: item.method?.toUpperCase(),
        })) as HttpRequestOptions[];
        return [...acc, ...history];
      }, [] as HttpMockHistory);
    },
    on(method, url) {
      type MockMethod =
        | "onGet"
        | "onPost"
        | "onPut"
        | "onPatch"
        | "onDelete"
        | "onHead"
        | "onOptions";
    
      const mockMethod = `on${uppercaseFirst(method.toLowerCase())}` as MockMethod;
    
      const mockOns = mocks.map((mock) => mock[mockMethod](url));
      console.log("mocks", mocks.length);
    
      return {
        reply(...args) {
          mockOns.forEach((mockOn) => mockOn.reply(...args));
          return newHttpMock;
        },
        replyOnce(...args) {
          mockOns.forEach((mockOn) => mockOn.replyOnce(...args));
          return newHttpMock;
        },
        replyNetworkError() {
          mockOns.forEach((mockOn) => mockOn.networkError());
          return newHttpMock;
        },
        replyNetworkErrorOnce() {
          mockOns.forEach((mockOn) => mockOn.networkErrorOnce());
          return newHttpMock;
        },
        replyTimeout() {
          mockOns.forEach((mockOn) => mockOn.timeout());
          return newHttpMock;
        },
        replyTimeoutOnce() {
          mockOns.forEach((mockOn) => mockOn.timeoutOnce());
          return newHttpMock;
        },
      };
    }
  };

  return newHttpMock;
}

export const httpMock = createHttpMock();