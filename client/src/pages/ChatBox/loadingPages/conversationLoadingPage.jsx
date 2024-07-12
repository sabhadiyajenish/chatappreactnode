import React from "react";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";

const ConversationLoadingPage = ({ index, modeTheme }) => {
  return (
    <Grid container spacing={3} key={index} className="mt-2 px-3 ">
      {/* First item (rectangular) on the right side */}
      <Grid item xs={3} sm={2} md={3}>
        <Stack spacing={1}>
          {/* <Skeleton variant="text" sx={{ fontSize: "1rem" }} /> */}
          <Skeleton
            variant="circular"
            width={70}
            height={70}
            className={`${modeTheme === "dark" ? "bg-white" : ""}`}
          />
          {/* <Skeleton variant="rounded" height={60} /> */}
        </Stack>
      </Grid>
      <Grid item xs={9} sm={10} md={9}>
        <Skeleton
          variant="rounded"
          height={70}
          className={`${modeTheme === "dark" ? "bg-white" : ""}`}
        />
      </Grid>
    </Grid>
  );
};

export default ConversationLoadingPage;
