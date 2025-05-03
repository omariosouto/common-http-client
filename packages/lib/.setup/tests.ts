import { beforeEach } from "vitest";
import { httpClientMockReset } from "../src/test";
import { httpClientClearCache } from "../src/index";

beforeEach(() => {
  httpClientMockReset();
  httpClientClearCache();
});