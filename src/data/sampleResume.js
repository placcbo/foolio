export const SAMPLE_RESUME = {
  basics: {
    name: 'James Miller',
    title: 'Financial Analyst',
    email: 'james.miller@email.com',
    phone: '+1 617 947 5112',
    address: 'Oak Street 333, Boston, United States, 02101',
    photo: null,
  },
  sections: [
    {
      id: 'sample-summary',
      type: 'summary',
      title: 'Summary',
      kind: 'text',
      content:
        'Experienced Financial Analyst with strong background in managing multi-million budgets. Provides analysis and accounting support within product development. Works to reduce expenses and develop operating budgets.',
    },
    {
      id: 'sample-experience',
      type: 'experience',
      title: 'Experience',
      kind: 'entries',
      entries: [
        {
          id: 'sample-exp-1',
          heading: 'Financial Analyst',
          subheading: 'GEO Inc.',
          location: 'Boston',
          start: 'Apr 2012',
          end: 'Aug 2018',
          description:
            'Created budgets and reduced labor and material costs by 15%.\nGenerated financial reports on completed projects with positive results.\nDeveloped financial statements, cash flow charts and balance sheets.',
        },
        {
          id: 'sample-exp-2',
          heading: 'Financial Analyst',
          subheading: 'Sisco Enterprises Inc.',
          location: 'Boston',
          start: 'Sep 2008',
          end: 'Mar 2012',
          description:
            'Reports, cash flow analysis, annual budgets, monthly forecasts and revenue projections.\nAnalyzed corporate accounts and advised in negotiations for budget savings.\nCoordinated key finance reports and presented results to management.',
        },
      ],
    },
    {
      id: 'sample-education',
      type: 'education',
      title: 'Education',
      kind: 'entries',
      entries: [
        {
          id: 'sample-edu-1',
          heading: 'Bachelor of Science',
          subheading: 'Boston University',
          location: '',
          start: 'Sep 2000',
          end: 'May 2004',
          description: 'Graduated summa cum laude.',
        },
        {
          id: 'sample-edu-2',
          heading: 'High School Diploma',
          subheading: 'Camden High School',
          location: 'Boston',
          start: 'Sep 1996',
          end: 'May 2000',
          description: '',
        },
      ],
    },
    {
      id: 'sample-skills',
      type: 'skills',
      title: 'Skills',
      kind: 'tags',
      tags: ['Financial Analysis', 'Strategic Planning', 'Trend Analysis', 'Market Assessment', 'Team Leadership'],
    },
    {
      id: 'sample-languages',
      type: 'languages',
      title: 'Languages',
      kind: 'tags',
      tags: ['English', 'German'],
    },
  ],
};
