export type ProgrammedChargeEndMode = 'ongoing' | 'end-date' | 'times';

export type ProgrammedChargeFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY'
  | 'SEMIANNUAL';

type NormalizedProgrammedChargeCadence = {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
};

const formatDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addCadenceStep = (
  value: Date,
  cadence: NormalizedProgrammedChargeCadence,
) => {
  const next = new Date(value);

  if (cadence.frequency === 'DAILY') {
    next.setDate(next.getDate() + cadence.interval);
    return next;
  }

  if (cadence.frequency === 'WEEKLY') {
    next.setDate(next.getDate() + cadence.interval * 7);
    return next;
  }

  if (cadence.frequency === 'MONTHLY') {
    next.setMonth(next.getMonth() + cadence.interval);
    return next;
  }

  next.setFullYear(next.getFullYear() + cadence.interval);
  return next;
};

export const normalizeProgrammedChargeCadence = (
  frequency: ProgrammedChargeFrequency,
  interval: number | string,
): NormalizedProgrammedChargeCadence => {
  if (frequency === 'SEMIANNUAL') {
    return {
      frequency: 'MONTHLY',
      interval: 6,
    };
  }

  const parsedInterval = Number(interval) || 1;

  return {
    frequency,
    interval: parsedInterval > 0 ? parsedInterval : 1,
  };
};

export const resolveProgrammedChargeEndDate = (input: {
  endDate: string;
  endMode: ProgrammedChargeEndMode;
  frequency: ProgrammedChargeFrequency;
  interval: number | string;
  occurrences: string;
  startDate: string;
}) => {
  if (input.endMode === 'ongoing') {
    return '';
  }

  if (input.endMode === 'end-date') {
    return input.endDate;
  }

  const occurrenceCount = Number(input.occurrences);

  if (!Number.isInteger(occurrenceCount) || occurrenceCount < 2) {
    return '';
  }

  const cadence = normalizeProgrammedChargeCadence(
    input.frequency,
    input.interval,
  );
  let current = new Date(`${input.startDate}T00:00:00`);

  for (let index = 1; index < occurrenceCount; index += 1) {
    current = addCadenceStep(current, cadence);
  }

  return formatDate(current);
};