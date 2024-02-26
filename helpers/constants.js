import moment from "moment";

export function ConstMonths(){
  var monthsFull = ["January","February","March","April","May","June","July",
            "August","September","October","November","December"];
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
  return {
    monthsFull,
    months
  }
}

export function ConstYears(fromYear){
  const dateFrom = parseInt(moment(fromYear).format("YYYY"));
  const dateTo = parseInt(moment().format("YYYY"));

  const years = [];
  for (let i = dateFrom; i <= dateTo; i++) {
    years.push(i);
  }

  return years.reverse();
}

export function ConstCurrentDateString(divisor="-"){
  return moment().format(`YYYY${divisor}MM${divisor}DD`);
}

export function ConstCurrentDateTimeString(divisor="-"){
  return moment().format(`YYYY${divisor}MM${divisor}DD hh:mm A`);
}

export function ItemTypes(){
  return [
    "Chicken", "Pork", "Beef", "Rice", 
    "Condiments", "Packaging", "Vegetables", 
    "Seafood", "Processed", "Others"
  ]
}

export function MOPs(){
  return [
    "Cash", "GCash", "Bank Transfer",
    "Card", "Others"
  ]
}