import { beforeEach } from "vitest";
import { httpMock } from "../src/test";
import { clearCache } from "../src/index";

beforeEach(() => {
  httpMock.reset();
  clearCache();
});