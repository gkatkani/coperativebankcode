import * as React from "react";
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
const DetailedView = ({ reportList, totalSum }) => {
  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table
          sx={{ minWidth: 550 }}
          size="small"
          aria-label="simple table"
          stickyHeader={true}
        >
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>S.no</StyledTableCell>
              <StyledTableCell align="left">Duration</StyledTableCell>
              <StyledTableCell align="left">Start date</StyledTableCell>
              <StyledTableCell align="left">End date</StyledTableCell>
              <StyledTableCell align="left">Days</StyledTableCell>
              <StyledTableCell align="left">Rate</StyledTableCell>
              <StyledTableCell align="left">Penalty</StyledTableCell>
              <StyledTableCell align="left">total</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {reportList.map((row, index) => (
              <StyledTableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <StyledTableCell component="th" scope="row">
                  {index + 1}
                </StyledTableCell>
                <StyledTableCell scope="row">
                  {row?.label ?? "-"}
                </StyledTableCell>
                <StyledTableCell scope="row">
                  {moment(row.startDate).format("DD-MM-YYYY")}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {moment(row.endDate).format("DD-MM-YYYY")}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {row?.dayDiff ?? 0}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {row?.interestRate ?? 0}%
                </StyledTableCell>
                <StyledTableCell align="left">
                  {row?.penaltyRate ?? 0}%
                </StyledTableCell>
                <StyledTableCell align="left">
                  {row?.rowTotal.toFixed(2) ?? 0}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}></TableCell>
              <TableCell colSpan={3} align="right">
                <Typography variant={"h6"}>
                  Total : {totalSum.toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Paper>
  );
};
export default DetailedView;
