// Indian currency and number formatters for Net Infotech System

export function formatINR(val) {
  if (val === undefined || val === null || isNaN(val)) return "₹0";
  const num = Math.round(Number(val));
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const str = absNum.toString();
  let result = "";
  if (str.length <= 3) {
    result = str;
  } else {
    const lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    result = formattedOther + "," + lastThree;
  }
  return (isNegative ? "-₹" : "₹") + result;
}

export function formatNumberINR(val) {
  if (val === undefined || val === null || isNaN(val)) return "0";
  const num = Math.round(Number(val));
  const str = Math.abs(num).toString();
  if (str.length <= 3) return (num < 0 ? "-" : "") + str;
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return (num < 0 ? "-" : "") + formattedOther + "," + lastThree;
}
