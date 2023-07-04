import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState } from "react";
import {
  addition,
  calculateInterest,
  checkForLoanType,
  validateNumbers,
} from "../helper/Index";
import DetailedView from "../pages/DetailedView";
import moment from "moment";
import OverAllList from "../component/OverAllList";
import { INITIALIZE } from "../constant";

const Content = () => {
  const [enableCalculate, setEnableCalculate] = useState(true);
  const [reportList, setReportList] = useState([]);
  const [totalInterest, setTotalInterest] = useState(0);
  const [intialObj, setInitialObj] = useState({ ...INITIALIZE });
  const [overAllSummary, setOverAllSummary] = useState([]);
  const generateReport = () => {
    let defaultObj = {
      amount: intialObj?.loanAmount,
      loanSanctionDate: intialObj?.loanSanctionDate,
      loanType: null,
    };

    const loanType = checkForLoanType(defaultObj.loanSanctionDate);

    defaultObj = {
      ...defaultObj,
      loanType,
    };

    const result = calculateInterest(defaultObj);
    const rowTotalArray = [];
    result.map((item) => {
      let p = parseFloat(intialObj?.loanAmount);
      let r = parseFloat(item.interestRate) + parseFloat(item.penaltyRate);
      let t = parseFloat(item.dayDiff) / 365;
      item.rowTotal = (p * r * t) / 100;
      rowTotalArray.push(item.rowTotal);
      return item;
    });
    const interest = rowTotalArray.reduce((a, b) => a + b, 0);
    setOverAllSummary([
      ...overAllSummary,
      {
        ...intialObj,
        interestSum: interest,
        interestWithPrincipal: addition(interest, intialObj?.loanAmount),
        loanType: checkForLoanType(defaultObj.loanSanctionDate),
      },
    ]);

    setTotalInterest(interest);
    setReportList(result);
  };

  return (
    <Box sx={{ width: "100%", padding: "1rem" }}>
      <Grid container spacing={3}>
        <Grid container item spacing={1}>
          <Grid item>
            <TextField
              id="serialNumber"
              label="Serial Number"
              variant="outlined"
              name="serialNumber"
              value={intialObj?.serialNumber}
              onChange={(e) => {
                setInitialObj({
                  ...intialObj,
                  serialNumber: e.target.value,
                });
              }}
            />
          </Grid>
          <Grid item>
            <TextField
              id="accountNumber"
              label="Account Number"
              variant="outlined"
              name="accountNumber"
              value={intialObj?.accountNumber}
              onChange={(e) => {
                setInitialObj({
                  ...intialObj,
                  accountNumber: e.target.value,
                });
              }}
            />
          </Grid>
          <Grid item>
            <TextField
              id="personName"
              label="Name"
              variant="outlined"
              name="personName"
              value={intialObj?.personName}
              onChange={(e) => {
                setInitialObj({
                  ...intialObj,
                  personName: e.target.value,
                });
              }}
            />
          </Grid>

          <Grid item>
            <TextField
              id="loanAmount"
              label="principal amount"
              variant="outlined"
              name="loanAmount"
              value={intialObj?.loanAmount}
              onChange={(e) => {
                if (validateNumbers(e.target.value)) {
                  setInitialObj({
                    ...intialObj,
                    loanAmount: e.target.value,
                  });
                }
              }}
            />
          </Grid>
          <Grid item>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="DD-MM-YYYY"
                format="DD-MM-YYYY"
                value={intialObj?.loanSanctionDate}
                onChange={(val) => {
                  if (moment(val).isValid()) {
                    setInitialObj({
                      ...intialObj,
                      loanSanctionDate: val,
                    });
                  }
                }}
                minDate={moment(new Date("2002-04-01"))}
                maxDate={moment(new Date("2023-03-31"))}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
        <Grid container item spacing={3}>
          <Grid item>
            {enableCalculate && (
              <Button
                variant="contained"
                onClick={() => {
                  setEnableCalculate(false);
                  generateReport();
                }}
                size={"large"}
                disabled={
                  intialObj.loanAmount === "" ||
                  parseFloat(intialObj.loanAmount) <= 0 ||
                  intialObj.loanSanctionDate === "" ||
                  intialObj.loanSanctionDate === null ||
                  new Date(moment(intialObj.loanSanctionDate)).getTime() <
                    new Date("2002-04-01").getTime() ||
                  new Date(moment(intialObj.loanSanctionDate)).getTime() >
                    new Date("2023-03-31").getTime()
                }
              >
                Calculate
              </Button>
            )}
            {!enableCalculate && (
              <Button
                variant="contained"
                onClick={() => {
                  setEnableCalculate(true);
                  setInitialObj({
                    ...intialObj,
                    loanAmount: "",
                    loanSanctionDate: null,
                  });
                  setReportList([]);
                }}
                size={"large"}
                disabled={
                  intialObj.loanAmount === "" ||
                  parseFloat(intialObj.loanAmount) <= 0 ||
                  intialObj.loanSanctionDate === "" ||
                  intialObj.loanSanctionDate === null ||
                  new Date(moment(intialObj.loanSanctionDate)).getTime() <
                    new Date("2002-04-01").getTime() ||
                  new Date(moment(intialObj.loanSanctionDate)).getTime() >
                    new Date("2023-03-31").getTime()
                }
              >
                Add New Loan
              </Button>
            )}
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => {
                setInitialObj({ ...INITIALIZE });
                setReportList([]);
                setOverAllSummary([]);
                setEnableCalculate(true);
              }}
              size={"large"}
            >
              Clear All
            </Button>
          </Grid>
        </Grid>
        <Grid container item spacing={3}>
          <Grid item md={10}>
            <Typography variant="h4">Current Summary</Typography>
            <DetailedView
              reportList={reportList}
              totalInterest={totalInterest}
              amount={intialObj?.loanAmount === "" ? 0 : intialObj?.loanAmount}
            />
          </Grid>
        </Grid>
        <Grid container item spacing={3}>
          <Grid item md={10}>
            <Typography>Overall Summary</Typography>
            <OverAllList list={overAllSummary} />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Content;
