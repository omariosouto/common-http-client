import { AxiosRequestConfig } from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { HttpClientBookmarks, HttpClientHeaders, HttpMethod, HttpRequestOptions } from "../../index";
import { getInstances } from "../../index/createHttpClient/instances";


type HttpClientBookmarkMocks = {
  [key: string]: {
    [key in HttpMethod]?: {
      status: number;
      body: any;
    };
  };
}

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
  set: any;
  on: (method: HttpMethod, url: string, params?: {
    bookmarks?: HttpClientBookmarks;
    params?: Record<string, string>;
  }) => {
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
  let internalMocks: AxiosMockAdapter[] = [];

  function refreshMocks() {
    const currentInstances = getInstances();
    internalMocks = currentInstances.map((instance) => {
      const existing = internalMocks.find(({ axiosInstance }: any) => {
        return axiosInstance === instance;
      });
      return existing || new AxiosMockAdapter(instance);
    });
  }

  const newHttpMock: HttpMockAdapter = {
    reset() {
      refreshMocks();
      internalMocks.forEach((mock) => mock.reset());
    },
    resetHandlers() {
      refreshMocks();
      internalMocks.forEach((mock) => mock.resetHandlers());
    },
    resetHistory() {
      refreshMocks();
      internalMocks.forEach((mock) => mock.resetHistory());
    },
    restore() {
      refreshMocks();
      internalMocks.forEach((mock) => mock.restore());
    },
    get history() {
      refreshMocks();
      return internalMocks.reduce((acc, mock) => {
        const history = mock.history.map(({ data, ...item }) => ({
          ...item,
          body: data,
          method: item.method?.toUpperCase(),
        })) as HttpRequestOptions[];
        return [...acc, ...history];
      }, [] as HttpMockHistory);
    },
    on(method, url, { params, bookmarks } = {}) {
      refreshMocks();

      type MockMethod =
        | "onGet"
        | "onPost"
        | "onPut"
        | "onPatch"
        | "onDelete"
        | "onHead"
        | "onOptions";

      let normalizedUrl = url;

      if(bookmarks) {
        const bookmarkUrl = bookmarks[url]?.url;
        if (!bookmarkUrl) throw new Error(`Bookmark ${url} not found`);
        
        normalizedUrl = bookmarkUrl;
      }

      if(params) {
        const urlParams = Object.keys(params).reduce((acc, key) => {
          const value = params[key];
          if (value) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, string>);

        normalizedUrl = Object.keys(urlParams).reduce((url, key) => {
          return url.replace(`:${key}`, urlParams[key] || '');
        }, normalizedUrl);
      }

      const mockMethod = `on${uppercaseFirst(method.toLowerCase())}` as MockMethod;
      const mockOns = internalMocks.map((mock) => mock[mockMethod](normalizedUrl));

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
    },
    // TODO: Implement this
    set(bookmarkMocks: HttpClientBookmarkMocks) {
      refreshMocks();
      const mocks = internalMocks;

      mocks.forEach((mock) => {
        mock.onAny().reply((config) => {
          const { method } = config;
          const bookmark = (config as any).bookmark;

          if(bookmarkMocks[bookmark]) {
            const bookmarkEntry = bookmarkMocks[bookmark]?.[method as HttpMethod];
            const status = bookmarkEntry?.status ?? 500;
            const body = bookmarkEntry?.body ?? {};
            return [status, body];
          }

          return [500, {}];
        });
      });


      // // Expected order of requests:
      // const responses = [
      //   ["GET", "/foo", 200, { foo: "bar" }],
      //   ["POST", "/bar", 200],
      //   ["PUT", "/baz", 200],
      // ];

      // // Match ALL requests
      // mock.onAny().reply((config) => {
      //   const [method, url, ...response] = responses.shift();
      //   if (config.url === url && config.method.toUpperCase() === method)
      //     return response;
      //   // Unexpected request, error out
      //   return [500, {}];
      // });
    }
  };

  return newHttpMock;
}

export const httpClientMock = createHttpMock();

export const httpClientMockReset = () => {
  httpClientMock.reset();
  httpClientMock.restore();
}