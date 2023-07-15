import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useRef, useState } from "react";
import {
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
import {
  BASIC_TRANSACTION_ROW,
  INITIALIZE,
  MAXIMUM_DATE,
  MINIMUM_DATE,
  TRANSACTION,
} from "../constant";
import { useReactToPrint } from "react-to-print";
import CalculateTwoToneIcon from "@mui/icons-material/CalculateTwoTone";
import AddCircleOutlineTwoToneIcon from "@mui/icons-material/AddCircleOutlineTwoTone";
import CreditScoreTwoToneIcon from "@mui/icons-material/CreditScoreTwoTone";
import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import PrintTwoToneIcon from "@mui/icons-material/PrintTwoTone";
import RestartAltTwoToneIcon from "@mui/icons-material/RestartAltTwoTone";
const Content = () => {
  const [reportList, setReportList] = useState([]);
  const [disabledCalculate, setDisabledCalculate] = useState(false);
  const [showError, setShowError] = useState(false);
  const [totalInterest, setTotalInterest] = useState(0);
  const [intialObj, setInitialObj] = useState({ ...INITIALIZE });
  const [transactionList, setTransactionList] = useState(TRANSACTION);
  const [sortedTransactionList, setSortedTransactionList] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

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
      {showError && (
        <Snackbar
          open={showError}
          vertical={"top"}
          horizontal={"center"}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          autoHideDuration={6000}
          onClose={() => setShowError(false)}
        >
          <Alert
            onClose={() => setShowError(false)}
            severity="error"
            sx={{ width: "100%" }}
          >
            Error in input — <strong>Invalid Date Or Amount!</strong>
          </Alert>
        </Snackbar>
      )}
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
                      minDate={moment(new Date(MINIMUM_DATE))}
                      maxDate={moment(new Date(MAXIMUM_DATE))}
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
                  const list = transactionList.filter((x) => {
                    return (
                      x.loanDate === null ||
                      new Date(moment(x.loanDate)).getTime() <
                        new Date(MINIMUM_DATE).getTime() ||
                      new Date(moment(x.loanDate)).getTime() >=
                        new Date(MAXIMUM_DATE).getTime() ||
                      x.loanAmount === "" ||
                      x.loanAmount === null
                    );
                  });
                  if (list.length === 0) {
                    setShowError(false);
                    setReportList([]);
                    calculate([...transactionList]);
                    setDisabledCalculate(true);
                  } else {
                    setShowError(true);
                  }
                }}
                startIcon={<CalculateTwoToneIcon />}
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
                startIcon={<AddCircleOutlineTwoToneIcon />}
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
                startIcon={<AccountBalanceWalletTwoToneIcon />}
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
                startIcon={<CreditScoreTwoToneIcon />}
              >
                Deposit in Interest
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={handlePrint}
                startIcon={<PrintTwoToneIcon />}
              >
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
                  setRemainingAmount(0);
                  window.location.reload();
                }}
                startIcon={<RestartAltTwoToneIcon />}
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
          {reportList.length > 0 && (
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
          )}
        </Grid>
        {/* table part */}
      </Grid>
    </Box>
  );
};
export default Content;
