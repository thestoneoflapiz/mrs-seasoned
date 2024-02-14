const now = new Date();

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
  const dateFrom = new Date(fromYear);
  const dateTo = now;

  const years = [];
  for (let i = dateFrom.getFullYear(); i <= dateTo.getFullYear(); i++) {
    years.push(i);
  }

  return years.reverse();
}

export function ConstCurrentDate(){
  return now;
}

export function ConstCurrentDateString(divisor="-"){
  return `${now.getFullYear()}${divisor}${now.getDate()}${divisor}${now.getMonth()+1}`;
}