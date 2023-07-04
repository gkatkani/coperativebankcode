import { Box, Button, Grid, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { KHARIF } from "../constant";
import { useState } from "react";
import moment from "moment";
import { calculateInterest, checkForLoanType } from "../helper/Index";
import DetailedView from "../pages/DetailedView";

const Content = () => {
  const [value, setValue] = useState(null);
  const [amount, setAmount] = useState("");
  const [reportList, setReportList] = useState([]);
  const [totalSum, setTotalSum] = useState(0);

  const generateReport = () => {
    let defaultObj = {
      amount: amount,
      startDate: value,
      loanType: null,
    };
    const loanType = checkForLoanType(defaultObj.startDate);
    defaultObj = {
      ...defaultObj,
      loanType,
    };
    const result = calculateInterest(defaultObj);
    const rowTotalArray = [];
    result.map((item) => {
      let yearDays = item.endDate.getFullYear() % 4 === 0 ? 366 : 365;
      let p = parseFloat(amount);
      let r = parseFloat(item.interestRate) + parseFloat(item.penaltyRate);
      let t = parseFloat(item.dayDiff) / yearDays;
      item.rowTotal = (p * r * t) / 100;
      rowTotalArray.push(item.rowTotal);
      return item;
    });
    const sum = rowTotalArray.reduce((a, b) => a + b, 0);
    setTotalSum(sum);
    setReportList(result);
  };

  return (
    <Box sx={{ width: "100%", padding: "1rem" }}>
      <Grid
        container
        spacing={2}
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
      >
        <Grid md={2} item>
          <TextField id="s.No" label="S.No" variant="outlined" name="sno" />
        </Grid>
        <Grid md={2} item>
          <TextField
            id="accountNumber"
            label="Account Number"
            variant="outlined"
            name="accountNumber"
          />
        </Grid>
        <Grid md={2} item>
          <TextField
            id="personName"
            label="Name"
            variant="outlined"
            name="personName"
          />
        </Grid>
        <Grid md={2} item>
          <TextField
            id="principleAmount"
            label="Principle amount"
            variant="outlined"
            name="principleAmount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Grid>
        <Grid md={2} item>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              format="DD-MM-YYYY"
              value={value}
              onChange={(val) => {
                setValue(val);
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid md={2} item>
          <Button
            variant="contained"
            onClick={() => generateReport()}
            size={"large"}
          >
            Calculate
          </Button>
        </Grid>

        <Grid item md={10}>
          <DetailedView reportList={reportList} totalSum={totalSum} />
        </Grid>
      </Grid>
    </Box>
  );
};
export default Content;
