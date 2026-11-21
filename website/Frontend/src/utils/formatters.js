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

/**
 * Automatically format numeric counts/values into Indian compact format:
 * - < 1,000: raw number (e.g. 0, 4, 12, 950)
 * - 1,000 to 99,999: k (e.g. 1k, 1.5k, 12.4k, 99k)
 * - 1,00,000 to 99,99,999: Lakhs (or L if short) (e.g. 1 Lakh, 2.5 Lakhs, 25 Lakhs)
 * - >= 1,00,00,000: Cr (e.g. 1 Cr, 2.5 Cr, 15 Cr)
 */
export function formatAutoCompactNumber(val, options = {}) {
  if (val === undefined || val === null || isNaN(val)) return '0';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '0';

  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs < 1000) {
    return sign + (options.decimals != null ? abs.toFixed(options.decimals) : Math.round(abs));
  }
  if (abs < 100000) {
    const k = abs / 1000;
    const raw = (k % 1 === 0 || k >= 100) ? k.toFixed(0) : k.toFixed(1);
    const cleaned = raw.includes('.') ? raw.replace(/\.?0+$/, '') : raw;
    return `${sign}${cleaned}k`;
  }
  if (abs < 10000000) {
    const lakh = abs / 100000;
    const raw = (lakh % 1 === 0 || lakh >= 100) ? lakh.toFixed(0) : lakh.toFixed(lakh >= 10 ? 1 : 2);
    const cleaned = raw.includes('.') ? raw.replace(/\.?0+$/, '') : raw;
    const unit = options.short ? 'L' : (parseFloat(cleaned) === 1 ? 'Lakh' : 'Lakhs');
    return `${sign}${cleaned}${options.short ? unit : ' ' + unit}`;
  }
  const cr = abs / 10000000;
  const raw = (cr % 1 === 0 || cr >= 100) ? cr.toFixed(0) : cr.toFixed(cr >= 10 ? 1 : 2);
  const cleaned = raw.includes('.') ? raw.replace(/\.?0+$/, '') : raw;
  const unit = 'Cr';
  return `${sign}${cleaned}${options.short ? unit : ' ' + unit}`;
}
