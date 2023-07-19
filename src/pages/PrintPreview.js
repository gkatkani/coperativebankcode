import { Box, Grid, Typography } from "@mui/material";
import React, { forwardRef } from "react";
import OverAllList from "../component/OverAllList";

const PrintPreview = forwardRef((props, ref) => {
  const list = props?.list;
  const intialObj = props?.intialObj;
  const remainingAmount = props?.remainingAmount;
  return (
    <Box sx={{ flexGrow: 1 }} ref={ref}>
      <div style={{ margin: 30 }}>
        <Typography variant="h4">
          Jila Sahakari Kendriya Bank, Khandwa
        </Typography>
        <br />
        <Grid container spacing={3}>
          <OverAllList
            list={list}
            intialObj={intialObj}
            remainingAmount={remainingAmount}
          />
        </Grid>
      </div>
    </Box>
  );
});
export default PrintPreview;
