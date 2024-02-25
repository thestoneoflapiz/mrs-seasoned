export function leadingZeroes(num){
  // 4 digits only
  let place = 4;
  if(num < 10){
    place = 4;
  }else if(num < 100){
    place = 3;
  }else if(num < 1000){
    place = 2;
  }

  if(num >= 1000){
    return num;
  }
  
  return String(num).padStart(place,"0");
}