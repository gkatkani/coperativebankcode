import moment from "moment";
import {
  DAYS_IN_YEAR,
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
export const isAmountEmpty = (amount) =>
  amount === "" || amount === 0 || amount === null;
export const getSimpleInterest = (p, r, t) => p * r * (t / DAYS_IN_YEAR) * 0.01;
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
      loanPrincipalAmount: obj.amount,
      startDate: loanSanctionDate,
      endDate: limitDate,
      dayDiff: getDaysBetweenTwoDateObj(loanSanctionDate, limitDate),
      interestRate: interestArrayForApply.interestRateTillDueDate,
      penaltyRate: 0,
      label: interestArrayForApply.label,
      isDeposit: false,
      rowTotal: 0,
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
            loanPrincipalAmount: obj.amount,
            startDate: item.startDate,
            endDate: item.endDate,
            dayDiff: getDaysBetweenTwoDateObj(item.startDate, item.endDate),
            interestRate: item.rate,
            penaltyRate: refreshInterestArrayForApply.penaltyInterestRate,
            label: refreshInterestArrayForApply.label,
            isDeposit: false,
            rowTotal: 0,
          });
        });
      } else {
        tempArray.push({
          loanPrincipalAmount: obj.amount,
          startDate: currentDate,
          endDate: financialEndDate,
          dayDiff: getDaysBetweenTwoDateObj(currentDate, financialEndDate),
          interestRate: refreshInterestArrayForApply.defaulterInterestRate,
          penaltyRate: refreshInterestArrayForApply.penaltyInterestRate,
          label: refreshInterestArrayForApply.label,
          isDeposit: false,
          rowTotal: 0,
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
            loanPrincipalAmount: obj.amount,
            startDate: item.startDate,
            endDate: item.endDate,
            dayDiff: getDaysBetweenTwoDateObj(item.startDate, item.endDate),
            interestRate: item.rate,
            penaltyRate: interestArrayObj.penaltyInterestRate,
            label: interestArrayObj.label,
            isDeposit: false,
            rowTotal: 0,
          });
        });
      } else {
        tempArray.push({
          loanPrincipalAmount: obj.amount,
          startDate: internalStartDate,
          endDate: internalEndDate,
          dayDiff: getDaysBetweenTwoDateObj(internalStartDate, internalEndDate),
          interestRate: interestArrayObj.defaulterInterestRate,
          penaltyRate: interestArrayObj.penaltyInterestRate,
          label: interestArrayObj.label,
          isDeposit: false,
          rowTotal: 0,
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
/*
first param contain all list of interest fro individual loan with start and end date
second param conatin individual row of load from form submit
sorted list of deposit by date
*/
export const manageRecovery = (
  dayWiseInterestList = [],
  loanObj,
  depositList = []
) => {
  let tempList = [];
  let localDepositRows = [...depositList];
  let localDayWiseInterestList = [];
  // day wise list for individual loan enteries
  dayWiseInterestList.forEach((item) => {
    const itemCopy = { ...item };
    const filterDepositRows = localDepositRows.filter(
      (x) =>
        x.loanDate.getTime() >= item.startDate.getTime() &&
        x.loanDate.getTime() <= item.endDate.getTime()
    );

    if (filterDepositRows.length > 0) {
      let tempList = [];

      filterDepositRows.forEach((subItem, subIndex) => {
        if (subItem.loanDate.getTime() <= item.endDate.getTime()) {
          const localEndDateObj = getPrevioustDate(
            moment(subItem.loanDate).format("YYYY-MM-DD")
          );
          const lastLocalDate =
            tempList.length > 0
              ? tempList[tempList.length - 1].endDate
              : item.startDate;
          const localStartDateObj = getNextDate(
            moment(lastLocalDate).format("YYYY-MM-DD")
          );

          tempList.push({
            ...itemCopy,
            startDate: localStartDateObj,
            endDate: localEndDateObj,
            dayDiff: getDaysBetweenTwoDateObj(
              localStartDateObj,
              localEndDateObj
            ),
            isDeposit: subIndex === 0 ? false : true,
          });
          if (subIndex === filterDepositRows.length - 1) {
            const lastLocalDate = tempList[tempList.length - 1].endDate;
            const localStartDateObj = getNextDate(
              moment(lastLocalDate).format("YYYY-MM-DD")
            );
            if (lastLocalDate.getTime() < itemCopy.endDate.getTime()) {
              tempList.push({
                ...itemCopy,
                startDate: localStartDateObj,
                endDate: itemCopy.endDate,
                dayDiff: getDaysBetweenTwoDateObj(
                  localStartDateObj,
                  itemCopy.endDate
                ),
                isDeposit: true,
              });
            }
          }
        }
      });

      localDayWiseInterestList.push(...tempList);
    } else {
      localDayWiseInterestList.push(item);
    }
  });
  let interestSum = 0;
  let finalInterestList = [];
  localDayWiseInterestList.forEach((item) => {
    if (item.isDeposit) {
      let p = item.loanPrincipalAmount;
      let r = parseFloat(item.interestRate) + parseFloat(item.penaltyRate);
      let t = parseFloat(item.dayDiff) / DAYS_IN_YEAR;
      item.rowTotal = getSimpleInterest(p, r, t);
      interestSum += item.rowTotal;
      item.sumOfInterest = interestSum;
    } else {
      let p = loanObj?.loanAmount;
      let r = parseFloat(item.interestRate) + parseFloat(item.penaltyRate);
      let t = parseFloat(item.dayDiff) / DAYS_IN_YEAR;
      item.rowTotal = getSimpleInterest(p, r, t);
      interestSum += item.rowTotal;
      item.sumOfInterest = interestSum;
      finalInterestList.push(item);
    }
  });
  console.log("localDayWiseInterestList ====> ", localDayWiseInterestList);
  // dayWiseInterestList.forEach((item) => {

  //   let p = parseFloat(loanObj?.loanAmount);
  //   let r = parseFloat(item.interestRate) + parseFloat(item.penaltyRate);
  //   let t = parseFloat(item.dayDiff) / DAYS_IN_YEAR;
  //   item.rowTotal = getSimpleInterest(p, r, t);
  //   interestSum += item.rowTotal;
  //   item.sumOfInterest = interestSum;
  //   tempList.push(item);
  // });

  return tempList;
};
