"use client";
import React from "react";
import { HttpClientBookmarks, HttpClientInstance } from "@omariosouto/common-http-client";
import { schemaGenerate } from "@omariosouto/common-schema/test";
import { zodToJsonSchema } from "zod-to-json-schema";

interface HttpClientDashoard {
  httpClients: HttpClientInstance[];
  bookmarks: HttpClientBookmarks;
}

export function HttpClientDashoardSetup({
  httpClients,
  bookmarks
}: HttpClientDashoard) {
  const [intercepted, setIntercepted] = React.useState({});

  React.useEffect(() => {
    console.log("run!");
  }, [intercepted]);

  return (
    <>
      HTTP Visualizer ON: {process.env.NODE_ENV}
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
                      console.log(response);
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