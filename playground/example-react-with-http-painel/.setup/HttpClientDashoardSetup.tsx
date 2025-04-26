"use client";
import React from "react";
import { bookmarkMock, HttpClientBookmarks } from "@omariosouto/common-http-client";
import { schemaGenerate } from "@omariosouto/common-schema/test";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Button } from "@omariosouto/common-ui-web/components";
// TODO: Move this to common-ui-web
interface HttpClientDashoard {
  bookmarks: HttpClientBookmarks;
}

export function HttpClientDashoardSetup({
  bookmarks
}: HttpClientDashoard) {
  const [intercepted, setIntercepted] = React.useState({
    "demo-request::get": {
      "message": "mocked-api-requests"
    }
  });
  const [httpStateURL, setHttpStateURL] = React.useState("");

  bookmarkMock.set(intercepted);

  React.useEffect(() => {
    // get http_state from url
    const urlParams = new URLSearchParams(window.location.search);
    const httpState = urlParams.get("http_state");
    if (httpState) {
      const decoded = atob(httpState);
      const parsed = JSON.parse(decoded);
      setIntercepted(parsed);
      bookmarkMock.set(parsed);
    }
  }, []);

  React.useEffect(() => {
    setHttpStateURL(window.location.origin + window.location.pathname + `?http_state=${btoa(JSON.stringify(intercepted))}`);
  }, [intercepted]);

  return (
    <>
      HTTP Visualizer ON: {process.env.NODE_ENV}
      <Button
        data-url={httpStateURL}
        onClick={(e) => {
          const url = (e.target as HTMLButtonElement).dataset.url;
          if (!url) {
            return;
          }
          navigator.clipboard.writeText(url);
        }}
      >
        Copy URL - {httpStateURL}
      </Button>
      <table>
        <thead>
          <tr>
            <td>
              Bookmark
            </td>
            <td>
              Methods
            </td>
          </tr>
        </thead>
        <tbody>
          {Object.entries(bookmarks).map(([bookmark, config]: any) => {
            return (
              <tr key={bookmark}>
                <td>
                  {bookmark}
                </td>
                <td>
                  <ul className="pl-10 list-disc">
                    {Object.entries(config.methods).map(([method, { request, response }]: any) => {
                      // console.log(response);
                      return (
                        <li key={bookmark + method}>
                          <div>
                            {method}:
                          </div>
                          {request && (
                            <div>
                              request
                            </div>
                          )}
                          {response && (
                            <div>
                              response:
                              <ul className="pl-10 list-disc">
                                {Object.entries(response).map(([code, schema]: any) => {
                                  const key = `${bookmark}::${method}`;
                                  const generated = schemaGenerate(schema);
                                  const jsonSchema = zodToJsonSchema(schema);
                                  return (
                                    <li
                                      key={key}
                                      className="flex"
                                    >
                                      <div>
                                        <input
                                          name=""
                                          type="checkbox"
                                          checked={Object.keys(intercepted).includes(key)}
                                          onChange={() => {
                                            setIntercepted((prev: any) => {
                                              if (prev[key]) {
                                                console.log("remove key");
                                                return Object.entries(prev).reduce((_prev, [k, v]) => {
                                                  if (k === key) {
                                                    return {
                                                      ..._prev,
                                                    };
                                                  }

                                                  return {
                                                    ..._prev,
                                                    [k]: v
                                                  };
                                                }, {});
                                              }
                                              if (!prev[key]) {
                                                console.log("add key");
                                                const newState = {
                                                  ...prev,
                                                  [key]: generated
                                                };

                                                return newState;
                                              }

                                              return {
                                                ...prev,
                                              };
                                            })
                                          }}
                                        />
                                        {code}:
                                      </div>
                                      <pre>
                                        <code>
                                          {JSON.stringify(jsonSchema)}
                                        </code>
                                      </pre>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <pre className="bg-amber-100">
        <code>
          {JSON.stringify(intercepted, null, 2)}
        </code>
      </pre>
    </>
  );
}