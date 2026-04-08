import { describe, expect, it } from 'vitest';

import { getDefaultExpandedSections } from '@/components/finance/transaction/transaction-editor-model';

describe('transaction-editor-model', () => {
  it('keeps the schedule section open by default when editing', () => {
    expect(getDefaultExpandedSections(true)).toEqual(['core', 'schedule', 'details']);
  });

  it('keeps the route flow visible by default when creating', () => {
    expect(getDefaultExpandedSections(false)).toEqual(['core', 'route', 'schedule']);
  });
});