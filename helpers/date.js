export function convertDateToString(dateString){
  const newDate = new Date(dateString);
  return `${newDate.getFullYear()}-${newDate.getMonth()+1}-${newDate.getDate()}`;
}