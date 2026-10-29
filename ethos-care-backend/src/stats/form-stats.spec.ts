import { aggregateFormStats, parseCost } from './form-stats';

describe('aggregateFormStats', () => {
  const item = (category: string, name: string, cost = '') => ({
    category,
    name,
    selected: true,
    cost,
  });

  it('counts requested and approved support items with costs, skipping rejected cases', () => {
    const stats = aggregateFormStats([
      {
        caseType: 'مواد غذائية، دعم موسمي',
        lifecycleStatus: 'APPROVED',
        formData: {
          support: {
            items: [
              item('مواد غذائية', 'لحوم', '500 ج.م'),
              item('مواد غذائية', 'سلة غذائية', '٣٠٠'),
              { category: 'دعم موسمي', name: 'كسوة موسمية', selected: false },
            ],
          },
          classification: { tags: ['أيتام'], degree: 'حالة قصوى' },
        },
      },
      {
        caseType: 'مواد غذائية',
        lifecycleStatus: 'DRAFT',
        formData: {
          support: { items: [item('مواد غذائية', 'لحوم', '400')] },
          classification: { tags: [], degree: 'حالة متوسطة' },
        },
      },
      {
        caseType: 'مواد غذائية',
        lifecycleStatus: 'REJECTED',
        formData: { support: { items: [item('مواد غذائية', 'لحوم', '999')] } },
      },
      { caseType: 'دعم طبي', lifecycleStatus: 'REVIEW', formData: null },
    ]);

    expect(stats.casesCounted).toBe(3);
    const food = stats.supportItems.find((g) => g.category === 'مواد غذائية')!;
    expect(food.items).toEqual([
      { name: 'لحوم', requested: 2, approved: 1, cost: 900 },
      { name: 'سلة غذائية', requested: 1, approved: 1, cost: 300 },
    ]);
    expect(food.requested).toBe(3);
    expect(stats.supportItems.some((g) => g.category === 'دعم موسمي')).toBe(
      false,
    );
    expect(stats.caseTypes.find((t) => t.name === 'مواد غذائية')).toEqual({
      name: 'مواد غذائية',
      requested: 2,
      approved: 1,
      cost: 0,
    });
    expect(stats.classifications).toEqual([
      { name: 'أيتام', requested: 1, approved: 1, cost: 0 },
    ]);
    // درجة بدون تصنيف لا تُحسب
    expect(stats.degrees).toEqual([
      { name: 'حالة قصوى', requested: 1, approved: 1, cost: 0 },
    ]);
  });

  it('parses free-text costs', () => {
    expect(parseCost('١٬٢٥٠ ج.م')).toBe(1250);
    expect(parseCost('')).toBe(0);
    expect(parseCost('مجاني')).toBe(0);
  });
});
