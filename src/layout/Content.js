import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useRef, useState } from "react";
import {
  addition,
  calculateInterest,
  checkForLoanType,
  filterDepositEnteries,
  manageRecovery,
  sortByDate,
  validateNumbers,
} from "../helper/Index";
import DetailedView from "../pages/DetailedView";
import moment from "moment";
import OverAllList from "../component/OverAllList";
import { BASIC_TRANSACTION_ROW, INITIALIZE, TRANSACTION } from "../constant";
import { useReactToPrint } from "react-to-print";
const Content = () => {
  const [reportList, setReportList] = useState([]);
  const [disabledCalculate, setDisabledCalculate] = useState(false);
  const [totalInterest, setTotalInterest] = useState(0);
  const [intialObj, setInitialObj] = useState({ ...INITIALIZE });
  const [transactionList, setTransactionList] = useState(TRANSACTION);
  const [sortedTransactionList, setSortedTransactionList] = useState([]);
  const [overAllSummary, setOverAllSummary] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
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
    //sorting alist by its ascending orderconsole.log("transactionListCopy ====> ", transactionListCopy);
    const sortedList = sortByDate(transactionListCopy);
    const depositList = filterDepositEnteries(transactionListCopy);

    sortedList.map((elem) => {
      elem.summaryReport = [];
      if (!elem?.isDeposit) {
        let defaultObj = {
          amount: parseFloat(elem?.loanAmount),
          loanSanctionDate: elem?.loanDate,
          loanType: null,
        };

        const loanType = checkForLoanType(defaultObj.loanSanctionDate);

        defaultObj = {
          ...defaultObj,
          loanType,
        };
        // calculate  the interest for a given time
        const result = calculateInterest(defaultObj);
        // adjust recovery and interest by modifying time interval
        const list = manageRecovery([...result], { ...elem }, [...depositList]);
        elem.summaryReport = list;
        setReportList([...reportList, ...list]);
        //const interest = rowTotalArray.reduce((a, b) => a + b, 0);

        // console.log("result ======> ", list);
      }
      return elem;
    });
    setSortedTransactionList([...sortedList]);

    if (depositList.length > 0) {
      let amount = 0;
      depositList.forEach((element) => {
        amount =
          amount + element?.settleLoanAmount + element?.settleInterestAmount;
      });
      setRemainingAmount(amount);
    }
  };

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
                {row.depositType === "interest" && (
                  <Grid item>
                    <TextField
                      id={`interestAmount${index}`}
                      label={row?.interestAmountLabel}
                      variant="outlined"
                      name="interestAmount"
                      value={row?.interestAmount}
                      disabled={disabledCalculate}
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
                )}
                {row.depositType === "principal" && (
                  <Grid item>
                    <TextField
                      id={`loanAmount${index}`}
                      label={row?.loanAmountLabel}
                      variant="outlined"
                      name="loanAmount"
                      value={row?.loanAmount}
                      disabled={disabledCalculate}
                      onChange={(e) => {
                        if (validateNumbers(e.target.value)) {
                          let tempTransactionList = [...transactionList];
                          tempTransactionList[index].loanAmount =
                            e.target.value;
                          setTransactionList([...tempTransactionList]);
                        }
                      }}
                      size={"small"}
                    />
                  </Grid>
                )}
                <Grid item>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      id={`date${index}`}
                      sx={{ maxWidth: "222px" }}
                      label="DD-MM-YYYY"
                      format="DD-MM-YYYY"
                      value={
                        row?.loanDate instanceof Date
                          ? moment(new Date(row?.loanDate))
                          : row.loanDate
                      }
                      disabled={disabledCalculate}
                      onChange={(val) => {
                        if (moment(val).isValid()) {
                          const tempTransactionList = transactionList;
                          tempTransactionList[index].loanDate = moment(val);
                          tempTransactionList[index].loanType =
                            checkForLoanType(new Date(moment(val)));
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
            ) : (
              <Grid container spacing={1} className="mr_bm_20">
                <Grid item>
                  <TextField
                    id={`loanAmount${index}`}
                    label="principal amount"
                    variant="outlined"
                    name="loanAmount"
                    value={row?.loanAmount}
                    disabled={disabledCalculate}
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
                      disabled={disabledCalculate}
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
                disabled={disabledCalculate}
                variant="contained"
                onClick={() => {
                  setReportList([]);
                  calculate([...transactionList]);
                  setDisabledCalculate(true);
                  // setEnableCalculate(false);
                  // generateReport();
                }}
              >
                Calculate
              </Button>
            </Grid>
            <Grid item>
              <Button
                disabled={disabledCalculate}
                variant="contained"
                onClick={() => {
                  setTransactionList([
                    ...transactionList,
                    { ...BASIC_TRANSACTION_ROW },
                  ]);
                }}
              >
                Add Loan
              </Button>
            </Grid>
            <Grid item>
              <Button
                disabled={disabledCalculate}
                variant="contained"
                onClick={() => {
                  setTransactionList([
                    ...transactionList,
                    {
                      ...BASIC_TRANSACTION_ROW,
                      depositType: "principal",
                      isDeposit: true,
                      loanAmountLabel: "Deposit in principal",
                    },
                  ]);
                }}
              >
                Deposit in Principal
              </Button>
            </Grid>
            <Grid item>
              <Button
                disabled={disabledCalculate}
                variant="contained"
                onClick={() => {
                  setTransactionList([
                    ...transactionList,
                    {
                      ...BASIC_TRANSACTION_ROW,
                      depositType: "interest",
                      isDeposit: true,
                      loanAmountLabel: "Deposit in principal",
                    },
                  ]);
                }}
              >
                Deposit in Interest
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={handlePrint}>
                Print
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setDisabledCalculate(false);
                  setInitialObj({ ...INITIALIZE });
                  setReportList([]);
                  setSortedTransactionList([]);
                  setTransactionList(TRANSACTION);
                  setTotalInterest(0);
                  setOverAllSummary([]);
                  setRemainingAmount(0);
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
            <OverAllList
              ref={componentRef}
              list={sortedTransactionList}
              intialObj={intialObj}
              remainingAmount={remainingAmount}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item md={10}>
            <Typography variant="h4">Current Summary</Typography>
            <DetailedView
              reportList={reportList}
              totalInterest={totalInterest}
              amount={intialObj?.loanAmount === "" ? 0 : intialObj?.loanAmount}
            />
          </Grid>
        </Grid>
        {/* table part */}
      </Grid>
    </Box>
  );
};
export default Content;
