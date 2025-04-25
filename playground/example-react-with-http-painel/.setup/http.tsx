"use client";

// TODO: This must be part of common-ui-web library such as the locale library 

import React from "react";
import { HttpClientDashoardSetup } from "./HttpClientDashoardSetup";
import { bookmarks } from "../app/http";


export function HttpClientDashoard() {
  if(process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <HttpClientDashoardSetup
      bookmarks={bookmarks}
    />
  )
}