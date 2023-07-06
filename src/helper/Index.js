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
export const validateNumbers = (s) => {
  var rgx = /^[0-9]*\.?[0-9]*$/;
  return s.match(rgx);
};
export const addition = (a, b) => {
  return parseFloat(a) + parseFloat(b);
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
  let tempArray = [];
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
      const localEndObj = new Date(elem.endDate);
      localEndObj.setHours(0, 0, 0, 0);
      elem.endDate = localEndObj;
      if (endDate.getTime() < localEndObj.getTime()) {
        elem.endDate = endDate;
      }
      if (startDate.getTime() < elem.endDate.getTime()) {
        tempArray.push({ ...elem });
      }
    });
    return tempArray;
  }
  return [];
};

export const calculateInterest = (obj) => {
  const tempArray = [];
  const loanSanctionDate = new Date(moment(obj.loanSanctionDate));
  loanSanctionDate.setHours(0, 0, 0, 0);
  const month = new Date(moment(obj.loanSanctionDate)).getMonth() + 1;
  let year = new Date(moment(obj.loanSanctionDate)).getFullYear();
  if (month < 4) {
    year = year - 1;
  }

  const dateKey = obj.loanType === KHARIF ? "kharifDate" : "RabiDate";
  const interestArrayForApply = INTEREST_ARRAY.find(
    (item) => item.year === year
  );

  if (interestArrayForApply !== undefined) {
    const limitDate = new Date(interestArrayForApply[dateKey]);
    limitDate.setHours(0, 0, 0, 0);
    const { financialEndDate } = getCurrentFinancialDates(limitDate);
    tempArray.push({
      startDate: loanSanctionDate,
      endDate: limitDate,
      dayDiff: getDaysBetweenTwoDateObj(loanSanctionDate, limitDate),
      interestRate: interestArrayForApply.interestRateTillDueDate,
      penaltyRate: 0,
      label: interestArrayForApply.label,
    });
    if (limitDate.getTime() <= financialEndDate.getTime()) {
      const currentDate = getNextDate(
        moment(tempArray[tempArray.length - 1]["endDate"]).format("YYYY-MM-DD")
      );
      let tempYear = currentDate.getFullYear();
      if (currentDate.getMonth() + 1 < 4) {
        tempYear = currentDate.getFullYear() - 1;
      }

      const refreshInterestArrayForApply = INTEREST_ARRAY.find(
        (x) => x.year === tempYear
      );
      const exceptionArray = getExceptionArray(
        currentDate,
        financialEndDate,
        refreshInterestArrayForApply
      );

      if (exceptionArray.length > 0) {
        exceptionArray.forEach((item) => {
          tempArray.push({
            startDate: item.startDate,
            endDate: item.endDate,
            dayDiff: getDaysBetweenTwoDateObj(item.startDate, item.endDate),
            interestRate: item.rate,
            penaltyRate: refreshInterestArrayForApply.penaltyInterestRate,
            label: refreshInterestArrayForApply.label,
          });
        });
      } else {
        tempArray.push({
          startDate: currentDate,
          endDate: financialEndDate,
          dayDiff: getDaysBetweenTwoDateObj(currentDate, financialEndDate),
          interestRate: refreshInterestArrayForApply.defaulterInterestRate,
          penaltyRate: refreshInterestArrayForApply.penaltyInterestRate,
          label: refreshInterestArrayForApply.label,
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
      const interestArrayObj = INTEREST_ARRAY.find(
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
