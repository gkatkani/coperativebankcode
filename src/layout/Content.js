import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState } from "react";
import {
  addition,
  calculateInterest,
  checkForLoanType,
  manageRecovery,
  validateNumbers,
} from "../helper/Index";
import DetailedView from "../pages/DetailedView";
import moment from "moment";
import OverAllList from "../component/OverAllList";
import { BASIC_TRANSACTION_ROW, INITIALIZE, TRANSACTION } from "../constant";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

const Content = () => {
  const [enableCalculate, setEnableCalculate] = useState(true);
  const [reportList, setReportList] = useState([]);
  const [totalInterest, setTotalInterest] = useState(0);
  const [intialObj, setInitialObj] = useState({ ...INITIALIZE });
  const [transactionList, setTransactionList] = useState(TRANSACTION);
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
  const calculate = (transactionListCopy) => {
    //sorting alist by its ascending order
    const sortedList = transactionListCopy.sort(function (a, b) {
      return (
        new Date(moment(a.loanDate)).getTime() -
        new Date(moment(b.loanDate)).getTime()
      );
    });

    const depositList = transactionListCopy
      .filter((x) => x.isDeposit)
      .map((x, ind) => {
        x.id = ind;
        x.loanDate = new Date(moment(x.loanDate));
        x.loanDate.setHours(0, 0, 0, 0);
        return x;
      });

    sortedList.forEach((elem) => {
      if (!elem?.isDeposit) {
        let defaultObj = {
          amount: parseFloat(elem?.loanAmount),
          loanSanctionDate: elem?.loanDate,
          loanType: null,
        };

        const loanType = checkForLoanType(
          defaultObj.loanSanctionDate,
          depositList
        );

        defaultObj = {
          ...defaultObj,
          loanType,
        };
        // calculate  the interest for a given time
        const result = calculateInterest(defaultObj);
        console.log("result ======> ", result);
        // adjust recovery and interest by modifying time interval
        const list = manageRecovery([...result], { ...elem }, [...depositList]);

        //const interest = rowTotalArray.reduce((a, b) => a + b, 0);

        // console.log("result ======> ", list);
      }
    });

    // const result = calculateInterest(defaultObj);
    // const rowTotalArray = [];
    // result.map((item) => {
    //   let p = parseFloat(intialObj?.loanAmount);
    //   let r = parseFloat(item.interestRate) + parseFloat(item.penaltyRate);
    //   let t = parseFloat(item.dayDiff) / 365;
    //   item.rowTotal = (p * r * t) / 100;
    //   rowTotalArray.push(item.rowTotal);
    //   return item;
    // });
    // const interest = rowTotalArray.reduce((a, b) => a + b, 0);
    // setOverAllSummary([
    //   ...overAllSummary,
    //   {
    //     ...intialObj,
    //     interestSum: interest,
    //     interestWithPrincipal: addition(interest, intialObj?.loanAmount),
    //     loanType: checkForLoanType(defaultObj.loanSanctionDate),
    //   },
    // ]);

    // setTotalInterest(interest);
    // setReportList(result);
  };
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  }));
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container>
        {/* form part */}
        <Grid item xs={6}>
          {/* basic info */}
          <Grid container spacing={1} className="mr_bm_20">
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
                size={"small"}
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
                size={"small"}
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
                size={"small"}
              />
            </Grid>
          </Grid>
          {/* basic info */}
          {/* loan amount + recovery + date */}
          {transactionList.map((row, index) =>
            row.isDeposit ? (
              <Grid container spacing={1} className="mr_bm_20">
                <Grid item>
                  <TextField
                    id={`interestAmount${index}`}
                    label={row?.interestAmountLabel}
                    variant="outlined"
                    name="interestAmount"
                    value={row?.interestAmount}
                    onChange={(e) => {
                      if (validateNumbers(e.target.value)) {
                        const tempTransactionList = transactionList;
                        tempTransactionList[index].interestAmount =
                          e.target.value;
                        setTransactionList([...tempTransactionList]);
                      }
                    }}
                    size={"small"}
                  />
                </Grid>
                <Grid item>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      id={`date${index}`}
                      sx={{ maxWidth: "222px" }}
                      label="DD-MM-YYYY"
                      format="DD-MM-YYYY"
                      value={row?.loanDate}
                      onChange={(val) => {
                        if (moment(val).isValid()) {
                          const tempTransactionList = transactionList;
                          tempTransactionList[index].loanDate = val;
                          setTransactionList([...tempTransactionList]);
                        }
                      }}
                      minDate={moment(new Date("2002-04-01"))}
                      maxDate={moment(new Date("2023-03-31"))}
                      slotProps={{ textField: { size: "small" } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item>
                  <TextField
                    id={`loanAmount${index}`}
                    label={row?.loanAmountLabel}
                    variant="outlined"
                    name="loanAmount"
                    value={row?.loanAmount}
                    onChange={(e) => {
                      if (validateNumbers(e.target.value)) {
                        let tempTransactionList = [...transactionList];
                        tempTransactionList[index].loanAmount = e.target.value;
                        setTransactionList([...tempTransactionList]);
                      }
                    }}
                    size={"small"}
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={1} className="mr_bm_20">
                <Grid item>
                  <TextField
                    id={`loanAmount${index}`}
                    label="principal amount"
                    variant="outlined"
                    name="loanAmount"
                    value={row?.loanAmount}
                    onChange={(e) => {
                      if (validateNumbers(e.target.value)) {
                        let tempTransactionList = [...transactionList];
                        tempTransactionList[index].loanAmount = e.target.value;
                        setTransactionList([...tempTransactionList]);
                      }
                    }}
                    size={"small"}
                  />
                </Grid>
                <Grid item>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      id={`date${index}`}
                      sx={{ maxWidth: "222px" }}
                      label="DD-MM-YYYY"
                      format="DD-MM-YYYY"
                      value={row?.loanDate}
                      onChange={(val) => {
                        if (moment(val).isValid()) {
                          const tempTransactionList = transactionList;
                          tempTransactionList[index].loanDate = val;
                          setTransactionList([...tempTransactionList]);
                        }
                      }}
                      minDate={moment(new Date("2002-04-01"))}
                      maxDate={moment(new Date("2023-03-31"))}
                      slotProps={{ textField: { size: "small" } }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            )
          )}

          {/* loan amount + recovery + date */}
          {/* action buttons */}
          <Grid container spacing={1} className="mr_bm_20">
            <Grid item>
              <Button
                variant="contained"
                onClick={() => {
                  calculate([...transactionList]);
                  // setEnableCalculate(false);
                  // generateReport();
                }}
              >
                Calculate
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={() => {
                  setTransactionList([
                    ...transactionList,
                    { ...BASIC_TRANSACTION_ROW },
                  ]);
                }}
              >
                Add New Loan
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={() => {
                  setTransactionList([
                    ...transactionList,
                    {
                      ...BASIC_TRANSACTION_ROW,
                      isDeposit: true,
                      loanAmountLabel: "Deposit in principal",
                    },
                  ]);
                }}
              >
                Add New Deposit
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={() => {
                  setInitialObj({ ...INITIALIZE });
                  setReportList([]);
                  setOverAllSummary([]);
                  setEnableCalculate(true);
                  setTransactionList([...TRANSACTION]);
                }}
              >
                Clear All
              </Button>
            </Grid>
          </Grid>
          {/* action buttons */}
        </Grid>
        {/* form part */}
        {/* table part */}
        <Grid item xs={6}>
          <Grid container>
            <Grid item md={10}>
              <Typography>Overall Summary</Typography>
              <OverAllList list={overAllSummary} />
            </Grid>
          </Grid>
          <Grid container>
            <Grid item md={10}>
              <Typography variant="h4">Current Summary</Typography>
              <DetailedView
                reportList={reportList}
                totalInterest={totalInterest}
                amount={
                  intialObj?.loanAmount === "" ? 0 : intialObj?.loanAmount
                }
              />
            </Grid>
          </Grid>
        </Grid>
        {/* table part */}
      </Grid>
    </Box>
  );
};
export default Content;
