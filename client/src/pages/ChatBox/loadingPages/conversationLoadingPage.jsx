import React from "react";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";

const ConversationLoadingPage = ({ index, modeTheme }) => {
  return (
    // <Grid container spacing={3} key={index} className="mt-2 px-3 ">
    //   {/* First item (rectangular) on the right side */}
    //   <Grid item xs={3} sm={2} md={3}>
    //     <Stack spacing={1}>
    //       {/* <Skeleton variant="text" sx={{ fontSize: "1rem" }} /> */}
    //       <Skeleton
    //         variant="circular"
    //         width={70}
    //         height={70}
    //         className={`${modeTheme === "dark" ? "bg-white" : ""}`}
    //       />
    //       {/* <Skeleton variant="rounded" height={60} /> */}
    //     </Stack>
    //   </Grid>
    //   <Grid item xs={9} sm={10} md={9}>
    //     <Skeleton
    //       variant="rounded"
    //       height={70}
    //       className={`${modeTheme === "dark" ? "bg-white" : ""}`}
    //     />
    //   </Grid>
    // </Grid>
    <div class="rounded-md py-3 md:px-0 px-2 w-full my-1">
      <div class="animate-pulse flex space-x-4 items-center">
        <div class="rounded-full bg-slate-700 h-[60px] w-[60px]"></div>
        <div class="flex-1 space-y-6 py-1 items-center">
          <div class="h-5 bg-slate-700 rounded"></div>
          <div class="space-y-3">
            <div class="grid grid-cols-3 gap-4">
              <div class="h-4 bg-slate-700 rounded col-span-2"></div>
              {/* <div class="h-4 bg-slate-700 rounded col-span-1"></div> */}
            </div>
            {/* <div class="h-2 bg-slate-700 rounded"></div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationLoadingPage;
