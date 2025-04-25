"use client";

import { Box, Button, Text } from "@omariosouto/common-ui-web/components";
import { getDemoData } from "./http";
import { useAsyncStateQuery } from "@omariosouto/common-ui-web/state";

export function ClientSideScreen() {
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
        Hello! I'm an example that makes HTTP calls
      </Text>
      
      <Text>
        {JSON.stringify(data)}
      </Text>

      <Button
        onClick={async () => {
          await getDemoData()
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            console.warn("Error", error);
          });
        }}
      >
        Click me!
      </Button>
    </Box>
  );
}