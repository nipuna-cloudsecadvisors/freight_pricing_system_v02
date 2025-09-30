import { isDateValid, isRateExpired, isRateExpiringSoon } from '../../src/common/helpers/date-validity';

describe('Date Validity Helpers', () => {
  describe('isDateValid', () => {
    it('should return true for valid dates', () => {
      expect(isDateValid('2024-01-01')).toBe(true);
      expect(isDateValid('2024-12-31')).toBe(true);
      expect(isDateValid(new Date('2024-06-15'))).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isDateValid('invalid-date')).toBe(false);
      expect(isDateValid('')).toBe(false);
      expect(isDateValid(null)).toBe(false);
      expect(isDateValid(undefined)).toBe(false);
    });
  });

  describe('isRateExpired', () => {
    it('should return true for expired rates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isRateExpired(pastDate)).toBe(true);
    });

    it('should return false for future rates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isRateExpired(futureDate)).toBe(false);
    });
  });

  describe('isRateExpiringSoon', () => {
    it('should return true for rates expiring within 7 days', () => {
      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + 3);
      expect(isRateExpiringSoon(expiringDate, 7)).toBe(true);
    });

    it('should return false for rates expiring after 7 days', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      expect(isRateExpiringSoon(futureDate, 7)).toBe(false);
    });
  });
});
