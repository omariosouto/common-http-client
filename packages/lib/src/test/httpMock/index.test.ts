import { describe, expect, it } from "vitest";
import { createHttpClient, HttpClient } from "../../index";
import { httpMock } from "../test";

describe("httpMock", () => {
  describe("WHEN using the default HttpClient", () => {
    it("always RETURNs it's mock it as expected", async () => {
      httpMock.on("GET", "https://example.com").reply(200, {
        message: "default",
      });

      const { body } = await HttpClient.request({
        method: "GET",
        url: "https://example.com",
      });

      expect(body).toEqual({ message: "default" });
    });
  });

  describe("WHEN using the default HttpClient AFTER it has been set once", () => {
    it("If no mock was set, an error must be thrown", async () => {
      await expect(
        HttpClient.request({
          method: "GET",
          url: "https://example.com",
        })
      ).rejects.toThrowError("Request failed with status code 404");
    });
  });

  describe("WHEN using a custom HttpClient", () => {
    it("always RETURNs it's mock it as expected", async () => {
      const CustomHttpClient = createHttpClient();

      httpMock
        .on("POST", "https://example.com")
        .reply(200, {
          message: "custom",
        })

      httpMock
        .on("GET", "https://example.com")
        .reply(200, {
          message: "default",
        });

      const customHttpResponse = await CustomHttpClient.request({
        method: "POST",
        url: "https://example.com",
        body: {
          message: "custom payload",
        }
      });
      expect(customHttpResponse.body).toEqual({ message: "custom" });

      const defaultHttpResponse = await HttpClient.request({
        method: "GET",
        url: "https://example.com",
      });

      expect(defaultHttpResponse.body).toEqual({ message: "default" });
    });
  });
});