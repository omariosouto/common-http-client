import { beforeEach } from "vitest";
import { httpClientMockReset } from "./test";
import { httpClientClearCache } from "./index";

beforeEach(() => {
  httpClientMockReset();
  httpClientClearCache();
});