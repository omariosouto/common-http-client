import { beforeEach } from "vitest";
import { httpMock } from "../src/test";

beforeEach(() => {
  httpMock.reset();
});