import { describe, expect, it } from "vitest";
import { HttpClient } from "./index";
import { httpMock } from "src/test";

describe("HttpClient", () => {
  describe("WHEN making an HTTP call", () => {
    it("RETURNs it's mock it as expected", async () => {
      httpMock.on("GET", "https://example.com").reply(200, {
        data: "mocked data",
      });

      const { data } = await HttpClient.request({
        method: "GET",
        url: "https://example.com",
      });      

      expect(data).toEqual({ data: "mocked data" });
    });
  });
});