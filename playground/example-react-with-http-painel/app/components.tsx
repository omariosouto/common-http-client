"use client";

import { Box, Button, Text } from "@omariosouto/common-ui-web/components";
import { getDemoData } from "./http";
import { useAsyncStateQuery } from "@omariosouto/common-ui-web/state";
import React from "react";

export function ClientSideScreen() {
  const [success, setSuccess] = React.useState();
  const [err, setErr] = React.useState();
  const { data } = useAsyncStateQuery({
    // staleTime: 2000 * 60 * 5, // 5 minutes
    staleTime: 10 * 1000,
    // staleTime: 0,
    queryFn: async () => {
      const response = await getDemoData();
      // TODO: Change response.data --> response.body
      return response;
    },
  });

  return (
    <Box>
      <Text>
        SSG
      </Text>
      
      <Text>
        {JSON.stringify(data)}
      </Text>

      <Button
        onClick={async () => {
          await getDemoData()
          .then((response) => {
            console.log(response);
            setSuccess(response);
          })
          .catch((error) => {
            console.warn("Error", error);
            setErr(error);
          });
        }}
      >
        Click me!
      </Button>
      <Box>
        <Text>
          success:
          {JSON.stringify(success)}
        </Text>
      </Box>
      <Box>
        <Text>
          err:
          {JSON.stringify(err)}
        </Text>
      </Box>
    </Box>
  );
}