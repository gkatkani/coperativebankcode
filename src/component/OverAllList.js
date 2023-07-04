import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import moment from "moment";
import { styled } from "@mui/material/styles";
import { TableFooter, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { addition } from "../helper/Index";

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
const OverAllList = ({ list }) => {
  const [grandTotal, setGrandTotal] = useState(0);
  const [grandInterest, setGrandInterest] = useState(0);
  useEffect(() => {
    let rowInterestArray = [];
    let rowLoanAmounArray = [];
    list.forEach((element) => {
      rowInterestArray.push(parseFloat(element.interestSum));
      rowLoanAmounArray.push(parseFloat(element.loanAmount));
    });
    const rowInterestArraySum = rowInterestArray.reduce((a, b) => a + b, 0);
    const rowLoanAmountArraySum = rowLoanAmounArray.reduce((a, b) => a + b, 0);
    setGrandInterest(rowInterestArraySum);
    setGrandTotal(addition(rowLoanAmountArraySum, rowInterestArraySum));
  }, [list]);
  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <br></br>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table
          sx={{ minWidth: 550 }}
          size="small"
          aria-label="simple table"
          stickyHeader={true}
        >
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="left">S.no</StyledTableCell>
              <StyledTableCell align="left">Loan Amount</StyledTableCell>
              <StyledTableCell align="left">Loan Type</StyledTableCell>
              <StyledTableCell align="left">Loan date</StyledTableCell>
              <StyledTableCell align="left">Interest</StyledTableCell>
              <StyledTableCell align="left">Total</StyledTableCell>
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
                  {row?.loanAmount ?? "-"}
                </StyledTableCell>
                <StyledTableCell scope="row">{row?.loanType}</StyledTableCell>
                <StyledTableCell scope="row">
                  {moment(row?.loanSanctionDate).format("DD-MM-YYYY")}
                </StyledTableCell>

                <StyledTableCell align="left">
                  {row?.interestSum}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {row?.interestWithPrincipal}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}></TableCell>
              <TableCell colSpan={3} align="right">
                <Typography variant={"h6"}>
                  Grand Interest :{grandInterest}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={5}></TableCell>
              <TableCell colSpan={3} align="right">
                <Typography variant={"h6"}>
                  Grand Amount :{grandTotal}
                </Typography>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Paper>
  );
};
export default OverAllList;
