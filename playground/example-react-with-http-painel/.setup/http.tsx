"use client";

import React from "react";
import { HttpClientDashoardSetup } from "./HttpClientDashoardSetup";
import { HttpClient } from "@omariosouto/common-http-client";
import { bookmarks } from "../app/http";


export function HttpClientDashoard() {
  if(process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <HttpClientDashoardSetup
      httpClients={[HttpClient]}
      bookmarks={bookmarks}
    />
  )
}