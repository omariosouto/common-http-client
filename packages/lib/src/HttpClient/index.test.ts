import { describe, it, expect } from "vitest";
import { createHttpClient } from "./index";

describe("HttpClient", () => {
  it("should be a function", () => {
    expect(createHttpClient).toBeTypeOf("function");
  });
})