import moment from "moment";
import { MAXIMUM_DATE, MINIMUM_DATE } from "../constant";

export const validateForAmountAndDate = (list) => {
  return list.filter(
    (x) =>
      x.loanDate === null ||
      new Date(moment(x.loanDate)).getTime() <=
        new Date(MINIMUM_DATE).getTime() ||
      new Date(moment(x.loanDate)).getTime() >=
        new Date(MAXIMUM_DATE).getTime() ||
      (x.loanAmount === "" && !x.isDeposit) ||
      (x.loanAmount === null && !x.isDeposit)
  );
};
