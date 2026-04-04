import {
  normalizeProgrammedChargeCadence,
  resolveProgrammedChargeEndDate,
} from '@/lib/finance/programmed-charge';

describe('programmed-charge', () => {
  it('normalizes semiannual cadence to monthly every six months', () => {
    expect(normalizeProgrammedChargeCadence('SEMIANNUAL', '1')).toEqual({
      frequency: 'MONTHLY',
      interval: 6,
    });
  });

  it('derives the end date from the number of occurrences', () => {
    expect(
      resolveProgrammedChargeEndDate({
        endDate: '',
        endMode: 'times',
        frequency: 'MONTHLY',
        interval: '1',
        occurrences: '3',
        startDate: '2026-04-03',
      }),
    ).toBe('2026-06-03');
  });

  it('returns an empty end date for ongoing programmed charges', () => {
    expect(
      resolveProgrammedChargeEndDate({
        endDate: '2026-06-03',
        endMode: 'ongoing',
        frequency: 'MONTHLY',
        interval: '1',
        occurrences: '3',
        startDate: '2026-04-03',
      }),
    ).toBe('');
  });
});