import { NextResponse } from "next/server";

const isToThrowError = (_requestCount: number) => {
  // throw when the numbers ends from 0 to 5
  // const lastDigit = requestCount % 10;
  // return lastDigit >= 0 && lastDigit <= 5;
  return false;
}

let requestCount = 0;

export async function GET() {
  requestCount++;

  if (isToThrowError(requestCount)) {
    return NextResponse.json(
      {
        message: `[${requestCount}] - Request number`,
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    {
      message: `[${requestCount}] - Request number`,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    },
  );
}