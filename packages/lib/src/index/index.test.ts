import { describe, expect, it } from "vitest";
import { s } from "@omariosouto/common-schema";
import { schemaGenerate } from "@omariosouto/common-schema/test";
import { HttpClient, HttpClientBookmarks } from "./index";
import { httpClientMock } from "../test";

const DemoWireInSchema = s.object({
  message: s.string(),
});

const bookmarks: HttpClientBookmarks = {
  "demo-request": {
    url: "https://mydomain.com/api/",
    methods: {
      GET: {
        response: { 200: DemoWireInSchema }
      },
    }
  },
};

describe("HttpClient Usage", () => {
  describe("WHEN making a query HTTP call", () => {
    it("RETURNs the content as expected", async () => {
      // 0. Set the mock
      httpClientMock.on("GET", "https://site.com/api").reply(200, {
        content: "mocked data",
      });

      // 1. Trigger the request
      const response = await HttpClient.request({
        url: "https://site.com/api",
        method: "GET",
      });

      // 2. Validate the response
      expect(response.body).toEqual({ content: "mocked data" });
      expect(response.status).toEqual(200);
    });

    describe("AND this http call has query parameters", () => {
      it("RETURNs the content as expected", async () => {
        // 0. Set the mock
        httpClientMock.on("GET", "https://site.com/api").reply(200, {
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
        expect(response.status).toEqual(200);
        // 2.1. Validate the request
        expect(httpClientMock.history.length).toEqual(1);
        expect(httpClientMock.history[0]?.params).toEqual({
          param1: "1",
          param2: "2",
        });
      });
    });

    describe("AND this http call has custom headers", () => {
      it("RETURNs the content as expected", async () => {
        // 0. Set the mock
        httpClientMock.on("GET", "https://site.com/api").reply(200, {
          content: "mocked data with headers",
        });

        // 1. Trigger the request
        const response = await HttpClient.request({
          url: "https://site.com/api",
          method: "GET",
          headers: { Authorization: "Bearer token" },
        });

        // 2. Validate the response
        expect(response.body).toEqual({ content: "mocked data with headers" });
        expect(response.status).toEqual(200);
        // 2.1. Validate the request
        expect(httpClientMock.history.length).toEqual(1);
        expect(httpClientMock.history.at(0)?.headers).toEqual(
          expect.objectContaining({
            Authorization: "Bearer token",
          })
        );
      });
    });
  });
  describe("WHEN making a query HTTP call through bookmarks", () => {
    it("RETURNs the content as expected", async () => {
      // 0. Set the mock
      const payloadMock = schemaGenerate(DemoWireInSchema);
      httpClientMock.set({
        "demo-request": {
          "get": {
            status: 200,
            body: payloadMock,
          }
        },
      });

      // 1. Trigger the request
      const response = await HttpClient.request({
        url: "demo-request",
        method: "GET",
        bookmarks,
      });

      // 2. Validate the response
      expect(response.body).toEqual(payloadMock);
      expect(response.status).toEqual(200);
    });
    describe("AND this http call has query parameters", () => {
      it("RETURNs the content as expected", async () => {
        // 0. Set the mock
        const payloadMock = schemaGenerate(DemoWireInSchema);
        httpClientMock.set({
          "demo-request": {
            "get": {
              status: 201,
              body: payloadMock,
            }
          },
        });

        // 1. Trigger the request
        const response = await HttpClient.request({
          url: "demo-request",
          method: "GET",
          params: { param1: "1", param2: (2).toString() },
          bookmarks,
        });

        // 2. Validate the response
        expect(response.body).toEqual(payloadMock);
        expect(response.status).toEqual(201);
        // 2.1. Validate the request
        expect(httpClientMock.history.length).toEqual(1);
        expect(httpClientMock.history[0]?.params).toEqual({
          param1: "1",
          param2: "2",
        });
      });
    });

    describe("AND this http call has custom headers", () => {
      it("RETURNs the content as expected", async () => {
        // 0. Set the mock
        const payloadMock = schemaGenerate(DemoWireInSchema);
        httpClientMock.set({
          "demo-request": {
            "get": {
              status: 201,
              body: payloadMock,
            }
          },
        });

        // 1. Trigger the request
        const response = await HttpClient.request({
          url: "demo-request",
          method: "GET",
          headers: { Authorization: "Bearer token" },
          bookmarks,
        });

        // 2. Validate the response
        expect(response.body).toEqual(payloadMock);
        expect(response.status).toEqual(201);
        // 2.1. Validate the request
        expect(httpClientMock.history.length).toEqual(1);
        expect(httpClientMock.history.at(0)?.headers).toEqual(
          expect.objectContaining({
            Authorization: "Bearer token",
          })
        );
      });
    });
  });
});