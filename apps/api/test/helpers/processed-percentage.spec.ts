import { calculateProcessedPercentage } from '../../src/common/helpers/processed-percentage';

describe('Processed Percentage Logic', () => {
  describe('calculateProcessedPercentage', () => {
    it('should return 100% when specific line has responded', () => {
      const preferredLineId = 'line-1';
      const responses = [
        { requestedLineId: 'line-1', createdAt: new Date() },
        { requestedLineId: 'line-2', createdAt: new Date() },
      ];

      const percentage = calculateProcessedPercentage(preferredLineId, responses);
      expect(percentage).toBe(100);
    });

    it('should return 0% when specific line has not responded', () => {
      const preferredLineId = 'line-1';
      const responses = [
        { requestedLineId: 'line-2', createdAt: new Date() },
        { requestedLineId: 'line-3', createdAt: new Date() },
      ];

      const percentage = calculateProcessedPercentage(preferredLineId, responses);
      expect(percentage).toBe(0);
    });

    it('should return 100% when any line has responded and no specific line preferred', () => {
      const preferredLineId = null;
      const responses = [
        { requestedLineId: 'line-1', createdAt: new Date() },
      ];

      const percentage = calculateProcessedPercentage(preferredLineId, responses);
      expect(percentage).toBe(100);
    });

    it('should return 0% when no responses and no specific line preferred', () => {
      const preferredLineId = null;
      const responses: any[] = [];

      const percentage = calculateProcessedPercentage(preferredLineId, responses);
      expect(percentage).toBe(0);
    });
  });
});
