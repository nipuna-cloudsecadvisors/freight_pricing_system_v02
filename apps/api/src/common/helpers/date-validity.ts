export function isDateValid(date: any): boolean {
  if (!date) return false;
  
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

export function isRateExpired(validTo: Date): boolean {
  return new Date() > validTo;
}

export function isRateExpiringSoon(validTo: Date, warningDays: number = 7): boolean {
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + warningDays);
  
  return new Date() <= validTo && validTo <= warningDate;
}

export function getDaysUntilExpiry(validTo: Date): number {
  const now = new Date();
  const diffTime = validTo.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
