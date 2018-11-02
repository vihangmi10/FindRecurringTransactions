import moment from 'moment';

const RECURRENCE_THRESHOLD = 10;

const daysBetweenDates = (date1, date2) => {
    console.log('Date 1 ---- ', date1);
    console.log('Date 2 ---- ', date2);
    let date = moment(date1);
    return  Math.abs(date.diff(date2, 'days'));
};

const recurrencePeriodDifference = (currentDays, existingDays) => {
    console.log('CURRENT DAYS ---- ', currentDays);
    console.log('EXISTING DAYS ---- ', existingDays);
    return Math.abs(currentDays - existingDays) <= RECURRENCE_THRESHOLD;
};

export default {
    daysBetweenDates,
    recurrencePeriodDifference
}