import moment from "moment";
import {
  INTEREST_ARRAY,
  KHARIF,
  KHARIF_MAX_LIMIT,
  KHARIF_MIN_LIMIT,
  RABI,
} from "../constant";

export const checkForLoanType = (momentObj) => {
  const month = moment(momentObj).month() + 1;
  return KHARIF_MIN_LIMIT <= month && month <= KHARIF_MAX_LIMIT ? KHARIF : RABI;
};
export const getCurrentFinancialDates = (date) => {
  let financialStartDate = null;
  let financialEndDate = null;
  if (date.getMonth() + 1 <= 3) {
    financialStartDate = new Date(`${date.getFullYear()}-04-01`);
    financialEndDate = new Date(`${date.getFullYear()}-03-31`);
  } else {
    financialStartDate = new Date(`${date.getFullYear() + 1}-04-01`);
    financialEndDate = new Date(`${date.getFullYear() + 1}-03-31`);
  }
  financialStartDate.setHours(0, 0, 0, 0);
  financialEndDate.setHours(0, 0, 0, 0);
  return {
    financialStartDate: financialStartDate,
    financialEndDate: financialEndDate,
  };
};
export const getNextDate = (date) => {
  const dateObj = new Date(date);
  dateObj.setDate(dateObj.getDate() + 1);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};
export const getPrevioustDate = (date) => {
  const dateObj = new Date(date);
  dateObj.setDate(dateObj.getDate() - 1);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

export const getExceptionArray = (startDate, endDate, data) => {
  if (data.exceptions.length > 0) {
    data.exceptions.forEach((elem, index) => {
      if (elem.startDate === null) {
        elem.startDate = startDate;
      } else {
        const localStartDateObj = new Date(elem.startDate);
        localStartDateObj.setHours(0, 0, 0, 0);
        elem.startDate = localStartDateObj;
        if (startDate.getTime() > localStartDateObj.getTime()) {
          elem.startDate = startDate;
        }
      }
      if (elem.endDate === null) {
        elem.endDate = endDate;
      } else {
        const localEndObj = new Date(elem.endDate);
        localEndObj.setHours(0, 0, 0, 0);
        elem.endDate = localEndObj;
        if (endDate.getTime() < localEndObj.getTime()) {
          elem.endDate = endDate;
        }
      }
    });
    return data.exceptions;
  }
  return [];
};

export const calculateInterest = (obj) => {
  const tempArray = [];
  const year = moment(obj.startDate).year();
  const month = moment(obj.startDate).month();
  const date = moment(obj.startDate).date();

  const loanSanctionDate = new Date(moment(obj.startDate));
  loanSanctionDate.setHours(0, 0, 0, 0);
  const dateKey = obj.loanType === KHARIF ? "kharifDate" : "RabiDate";
  const interestArrayForApply = INTEREST_ARRAY.filter(
    (item) => new Date(item[dateKey]).getTime() > loanSanctionDate.getTime()
  );

  if (interestArrayForApply.length > 0) {
    const limitDate = new Date(interestArrayForApply[0][dateKey]);
    limitDate.setHours(0, 0, 0, 0);
    const { financialEndDate } = getCurrentFinancialDates(limitDate);
    tempArray.push({
      startDate: loanSanctionDate,
      endDate: limitDate,
      dayDiff: getDaysBetweenTwoDateObj(loanSanctionDate, limitDate),
      interestRate: interestArrayForApply[0]["interestRateTillDueDate"],
      penaltyRate: 0,
      label: interestArrayForApply[0]["label"],
    });
    if (limitDate.getTime() <= financialEndDate.getTime()) {
      const currentDate = getNextDate(
        moment(tempArray[tempArray.length - 1]["endDate"]).format("YYYY-MM-DD")
      );
      const exceptionArray = getExceptionArray(
        currentDate,
        financialEndDate,
        interestArrayForApply[0]
      );

      if (exceptionArray.length > 0) {
        exceptionArray.forEach((item) => {
          tempArray.push({
            startDate: item.startDate,
            endDate: item.endDate,
            dayDiff: getDaysBetweenTwoDateObj(currentDate, financialEndDate),
            interestRate: item.rate,
            penaltyRate: interestArrayForApply[0]["penaltyInterestRate"],
            label: interestArrayForApply[0]["label"],
          });
        });
      } else {
        tempArray.push({
          startDate: currentDate,
          endDate: financialEndDate,
          dayDiff: getDaysBetweenTwoDateObj(currentDate, financialEndDate),
          interestRate: interestArrayForApply[0]["interestRateTillDueDate"],
          penaltyRate: interestArrayForApply[0]["penaltyInterestRate"],
          label: interestArrayForApply[0]["label"],
        });
      }
    }
    //start loop and run till 31-03-2023
    const endDate = new Date("2023-03-31");
    endDate.setHours(0, 0, 0, 0);
    while (
      tempArray[tempArray.length - 1]["endDate"].getTime() < endDate.getTime()
    ) {
      const internalLimitDate = tempArray[tempArray.length - 1]["endDate"];
      internalLimitDate.setHours(0, 0, 0, 0);

      const {
        financialStartDate: internalFinancialStartDate,
        financialEndDate: internalFinancialEndDate,
      } = getCurrentFinancialDates(internalLimitDate);
      let internalStartDate = null;
      let internalEndDate = null;

      if (internalLimitDate.getTime() === internalFinancialEndDate.getTime()) {
        internalStartDate = internalFinancialStartDate;
        internalEndDate = internalFinancialEndDate;
        internalEndDate.setFullYear(internalEndDate.getFullYear() + 1);
      } else {
        internalStartDate = internalLimitDate;
        internalEndDate = internalFinancialEndDate;
      }
      const interestArrayObj = interestArrayForApply.find(
        (x) => x.year === internalStartDate.getFullYear()
      );
      const exceptionArray = getExceptionArray(
        internalStartDate,
        internalEndDate,
        interestArrayObj
      );

      if (exceptionArray.length > 0) {
        exceptionArray.forEach((item) => {
          tempArray.push({
            startDate: item.startDate,
            endDate: item.endDate,
            dayDiff: getDaysBetweenTwoDateObj(item.startDate, item.endDate),
            interestRate: item.rate,
            penaltyRate: interestArrayObj.penaltyInterestRate,
            label: interestArrayObj.label,
          });
        });
      } else {
        tempArray.push({
          startDate: internalStartDate,
          endDate: internalEndDate,
          dayDiff: getDaysBetweenTwoDateObj(internalStartDate, internalEndDate),
          interestRate: interestArrayObj.defaulterInterestRate,
          penaltyRate: interestArrayObj.penaltyInterestRate,
          label: interestArrayObj.label,
        });
      }
    }

    return tempArray;
  } else {
    return [];
  }
};

export const getDaysBetweenTwoDateObj = (fromDate, toDate) => {
  const result = Math.floor((toDate.getTime() - fromDate.getTime()) / 86400000);
  return result + 1;
};
