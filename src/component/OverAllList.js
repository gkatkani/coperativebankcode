import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import moment from "moment";
import { styled } from "@mui/material/styles";
import { Box, Grid, TableFooter, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { addition, checkForLoanType } from "../helper/Index";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));
const OverAllList = React.forwardRef((props, ref) => {
  const list = props?.list;
  const intialObj = props?.intialObj;
  const remainingAmount = props?.remainingAmount;

  const [grandTotal, setGrandTotal] = useState(0);
  const [grandInterest, setGrandInterest] = useState(0);
  useEffect(() => {
    let rowInterestArray = [];
    let rowLoanAmounArray = [];
    list.forEach((element) => {
      if (element.summaryReport.length > 0) {
        const lastRow = element.summaryReport[element.summaryReport.length - 1];
        rowInterestArray.push(parseFloat(lastRow.sumOfInterest));
        rowLoanAmounArray.push(parseFloat(lastRow.loanPrincipalAmount));
      }
    });
    const rowInterestArraySum = rowInterestArray.reduce((a, b) => a + b, 0);
    const rowLoanAmountArraySum = rowLoanAmounArray.reduce((a, b) => a + b, 0);
    setGrandInterest(rowInterestArraySum);
    setGrandTotal(addition(rowLoanAmountArraySum, rowInterestArraySum));
  }, [list]);
  const getRowAmount = (rowObj) => {
    let temp = "";

    if (rowObj.isDeposit) {
      if (rowObj.depositType === "interest") {
        temp = rowObj?.interestAmount;
      } else {
        temp = rowObj?.loanAmount;
      }
    } else {
      temp = rowObj.loanAmount;
    }
    return temp;
  };
  const getRowType = (rowObj) => {
    let temp = "";

    if (rowObj.isDeposit) {
      if (rowObj.depositType === "interest") {
        temp = "Deposit in Interest";
      } else {
        temp = "Deposit in Principal";
      }
    } else {
      temp = checkForLoanType(moment(rowObj?.loanDate));
    }
    return temp;
  };

  return (
    <Box sx={{ flexGrow: 1 }} ref={ref}>
      <Typography variant="h4">Jila Sahakari Kendriya Bank, Khandwa</Typography>
      <br></br>
      <Grid container spacing={1} alignItems={"left"}>
        <Grid item xs={6}>
          <Typography align={"left"} variant="subtitle1">
            Serial Number :{intialObj.serialNumber}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography align={"left"} variant="subtitle1">
            Name :{intialObj.personName}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography align={"left"} variant="subtitle1">
            Account Number :{intialObj.accountNumber}
          </Typography>
        </Grid>
      </Grid>
      <br></br>
      <Grid container>
        <TableContainer>
          <Table
            sx={{ minWidth: 550 }}
            size="small"
            aria-label="simple table"
            stickyHeader={true}
          >
            <TableHead>
              <StyledTableRow>
                <StyledTableCell align="left">S.no</StyledTableCell>
                <StyledTableCell align="left">Amount</StyledTableCell>
                <StyledTableCell align="left">Type</StyledTableCell>
                <StyledTableCell align="left">Date</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {list.map((row, index) => (
                <StyledTableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <StyledTableCell component="th" scope="row">
                    {index + 1}
                  </StyledTableCell>
                  <StyledTableCell scope="row">
                    {getRowAmount(row)}
                  </StyledTableCell>
                  <StyledTableCell scope="row">
                    {getRowType(row)}
                  </StyledTableCell>
                  <StyledTableCell scope="row">
                    {moment(row?.loanDate).format("DD-MM-YYYY")}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}></TableCell>
                <TableCell colSpan={3} align="right">
                  <Typography variant={"h6"}>
                    Grand Interest :{grandInterest.toFixed(3)}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2}></TableCell>
                <TableCell colSpan={3} align="right">
                  <Typography variant={"h6"}>
                    Grand Amount :{grandTotal.toFixed(3)}
                  </Typography>
                </TableCell>
              </TableRow>
              {remainingAmount > 0 && (
                <TableRow>
                  <TableCell colSpan={2}></TableCell>

                  <TableCell colSpan={3} align="right">
                    <Typography variant={"h6"}>
                      Remaining Amount :{remainingAmount.toFixed(3)}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableFooter>
          </Table>
        </TableContainer>
      </Grid>
    </Box>
  );
});
export default OverAllList;
