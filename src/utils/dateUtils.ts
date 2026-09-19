// Date formatting utilities for Thai Buddhist Era (พ.ศ.) and ISO Dates

export function formatToThaiDate(isoDateStr?: string): string {
  if (!isoDateStr) return '-';
  try {
    const parts = isoDateStr.split('T')[0].split('-');
    if (parts.length < 3) return isoDateStr;
    const year = parseInt(parts[0], 10) + 543;
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const THAI_MONTHS = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    return `${day} ${THAI_MONTHS[monthIndex] || ''} พ.ศ. ${year}`;
  } catch (e) {
    return isoDateStr;
  }
}

export function formatToThaiShortDate(isoDateStr?: string): string {
  if (!isoDateStr) return '-';
  try {
    const parts = isoDateStr.split('T')[0].split('-');
    if (parts.length < 3) return isoDateStr;
    const year = (parseInt(parts[0], 10) + 543).toString().slice(-2);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const THAI_SHORT_MONTHS = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    return `${day} ${THAI_SHORT_MONTHS[monthIndex] || ''} ${year}`;
  } catch (e) {
    return isoDateStr;
  }
}

export function getFiscalYearFromDate(isoDateStr?: string): string {
  if (!isoDateStr) return '2570';
  const d = new Date(isoDateStr);
  const month = d.getMonth() + 1; // 1-12
  const gregorianYear = d.getFullYear();
  // Thai Fiscal year runs from Oct 1 to Sep 30
  const fiscalGregorian = month >= 10 ? gregorianYear + 1 : gregorianYear;
  return (fiscalGregorian + 543).toString();
}
