import { describe, expect, it } from "vitest";
import { HttpClient } from "./index";
import { httpMock } from "../test";

describe("HttpClient Usage", () => {
  describe("WHEN making a query HTTP call", () => {
    // TODO: Add example using bookmarks 
    it("RETURNs the content as expected", async () => {
      // 0. Set the mock
      httpMock.on("GET", "https://site.com/api").reply(200, {
        content: "mocked data",
      });

      // 1. Trigger the request
      const response = await HttpClient.request({
        url: "https://site.com/api",
        method: "GET",
      });

      // 2. Validate the response
      expect(response.body).toEqual({ content: "mocked data" });
    });

    describe("AND this http call has query parameters", () => {
      // TODO: Add example using bookmarks
      it("RETURNs the content as expected", async () => {
        // 0. Set the mock
        httpMock.on("GET", "https://site.com/api").reply(200, {
          content: "mocked data with query",
        });

        // 1. Trigger the request
        const response = await HttpClient.request({
          url: "https://site.com/api",
          method: "GET",
          params: { param1: "1", param2: (2).toString() },
        });

        // 2. Validate the response
        expect(response.body).toEqual({ content: "mocked data with query" });
        // 2.1. Validate the request
        expect(httpMock.history[0]?.params).toEqual({
          param1: "1",
          param2: "2",
        });
      });
    });
  });
});