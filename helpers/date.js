import moment from "moment";

export function convertDateToString(dateString){
  const newDate = moment(dateString).format("YYYY-MM-DD");
  return newDate;
}