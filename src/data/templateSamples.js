// One unique sample resume per template card, keyed by template id (see
// data/templates.js). Without this, every card in the picker grid showed
// the exact same person — just recolored — which made 21 templates feel
// like one template in 21 colors. Descriptions use real markup (<ul><li>)
// since entry descriptions render as rich text, not line-split plain text.
function bullets(...points) {
  return `<ul>${points.map((p) => `<li>${p}</li>`).join('')}</ul>`;
}

// A generic silhouette avatar (not a real or fake photo of a person) for
// templates whose layout features a photo — so the preview shows the photo
// slot actually populated instead of skipping it.
function placeholderAvatar(bg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${bg}"/><circle cx="50" cy="39" r="18" fill="#ffffff" fill-opacity="0.85"/><path d="M50 60c-22 0-38 14-38 32v8h76v-8c0-18-16-32-38-32z" fill="#ffffff" fill-opacity="0.85"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const TEMPLATE_SAMPLES = {
  simple: {
    basics: {
      name: 'Kevin Ndirangu',
      title: 'Customer Support Representative',
      email: 'placbo2@gmail.com',
      phone: '',
      address: 'Nairobi, Kenya',
      availability: 'EST / CST / MST / PST compatible (remote)',
      photo: null,
      visibleExtra: ['availability'],
    },
    sections: [
      {
        id: 's-summary', type: 'summary', title: 'Profile', kind: 'text',
        content: '<p>Dynamic customer support professional with 3+ years of experience delivering high-volume, time-sensitive support in fast-paced digital environments. Passionate about sports and sports gaming, with a strong grasp of online payments, identity verification, and fraud prevention. Known for owning outcomes autonomously, spotting issues before escalation, and using AI tools to drive speed and quality. Excited by Boom Sports\u2019 mission to make Daily Fantasy Sports accessible to every fan.</p>',
      },
      {
        id: 's-exp', type: 'experience', title: 'Experience', kind: 'entries',
        entries: [
          {
            id: 'e1', heading: 'Senior Customer Support Specialist', subheading: 'Betika (SportsPesa Group)',
            location: 'Nairobi, Kenya', start: 'Jan 2022', end: 'Present',
            description: bullets(
              'Managed 100+ daily customer interactions via live chat (Intercom) and email (Zendesk) for one of East Africa\u2019s largest sports-betting platforms.',
              'Resolved high-stakes account, payment, and gameplay disputes with empathy and precision, maintaining a 96%+ CSAT score across 18 consecutive months.',
              'Led identity verification (KYC) reviews during peak sign-up periods, flagging fraud patterns and escalating suspicious accounts to the compliance team.',
              'Monitored real-time platform dashboards for critical site issues; escalated payment gateway outages within 5 minutes, reducing resolution time by 30%.',
              'Trained two junior agents on Zendesk workflows, macros, and escalation protocols, cutting average first-response time from 6 min to under 2 min.',
              'Proactively used AI writing tools (ChatGPT, Claude) to draft support macros and improve response clarity, increasing deflection rate by 18%.'
            ),
          },
          {
            id: 'e2', heading: 'Customer Support Representative', subheading: 'Cellulant',
            location: 'Nairobi, Kenya', start: 'May 2020', end: 'Dec 2021',
            description: bullets(
              'Provided Tier 1 & 2 support for digital payments and mobile money products across 18 African markets, handling billing disputes, failed transactions, and refund requests.',
              'Collaborated with the engineering team to reproduce and document recurring payment bugs, accelerating fix cycles by an average of 2 days.',
              'Built a knowledge-base template library in Zendesk, reducing duplicate tickets by 22% within the first quarter of deployment.',
              'Maintained full compliance with PCI-DSS guidelines when handling sensitive financial data and user verification.'
            ),
          },
          {
            id: 'e3', heading: 'Sports Content & Community Support Intern', subheading: 'SportPesa Kenya',
            location: 'Nairobi, Kenya', start: 'Jan 2019', end: 'Apr 2020',
            description: bullets(
              'Moderated community forums and social channels, responding to contest rule queries and gameplay questions within SLA targets.',
              'Assisted in writing sports-rules FAQs and how-to guides for daily fantasy and in-play betting features.',
              'Escalated VIP account issues to account managers, ensuring white-glove service for high-value players.'
            ),
          },
        ],
      },
      {
        id: 's-skills', type: 'skills', title: 'Key Skills', kind: 'tags',
        groups: [
          { id: 'sg1', label: 'Support Tools', tags: ['Zendesk', 'Intercom', 'Freshdesk', 'Salesforce Service Cloud'] },
          { id: 'sg2', label: 'Sports Knowledge', tags: ['Football (EPL, UCL)', 'Basketball (NBA)', 'American Football (NFL)', 'Daily Fantasy Sports mechanics'] },
          { id: 'sg3', label: 'Payments & Fraud', tags: ['KYC/AML compliance', 'Chargeback management', 'Mobile money', 'PCI-DSS basics'] },
          { id: 'sg4', label: 'AI & Productivity', tags: ['ChatGPT', 'Claude', 'Notion AI'] },
          { id: 'sg5', label: 'Core Competencies', tags: ['High-volume live chat', 'Escalation management', 'CSAT optimisation', 'Remote async work'] },
        ],
        tags: [
          'Zendesk', 'Intercom', 'Freshdesk', 'Salesforce Service Cloud',
          'Football (EPL, UCL)', 'Basketball (NBA)', 'American Football (NFL)', 'Daily Fantasy Sports mechanics',
          'KYC/AML compliance', 'Chargeback management', 'Mobile money', 'PCI-DSS basics',
          'ChatGPT', 'Claude', 'Notion AI',
          'High-volume live chat', 'Escalation management', 'CSAT optimisation', 'Remote async work',
        ],
      },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English (fluent)', 'Swahili (native)'] },
      {
        id: 's-edu', type: 'education', title: 'Education', kind: 'entries',
        entries: [
          {
            id: 'ed1', heading: 'Bachelor of Commerce \u2013 Business Information Technology', subheading: 'University of Nairobi',
            location: '', start: '2015', end: '2019', description: '',
          },
        ],
      },
      {
        id: 's-why', type: 'custom', title: 'Why Boom', kind: 'text',
        content: '<p>I thrive in exactly the environment Boom describes \u2014 fast-paced, high-ownership, and sports-obsessed. I don\u2019t wait to be told what\u2019s broken; I find it, flag it, and fix it. I\u2019ve grown up watching the rise of DFS in the US and I want to be part of the team that brings that energy to every fan. Boom\u2019s track record of nearly $100 million in player prizes tells me this product is real, and I want to help protect and grow the community behind it.</p>',
      },
    ],
  },
};

// Classic shows the same sample content as Simple — identical content next
// to a different design makes the comparison honest in the picker.
TEMPLATE_SAMPLES.classic = TEMPLATE_SAMPLES.simple;
TEMPLATE_SAMPLES.slate = TEMPLATE_SAMPLES.simple;
TEMPLATE_SAMPLES.bloom = TEMPLATE_SAMPLES.simple;

// Portrait sample — its own persona, with a neutral silhouette avatar as
// the photo placeholder (a shape, not a fabricated face).
const PORTRAIT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='300' viewBox='0 0 240 300'>" +
  "<rect width='240' height='300' fill='%23e6ecf2'/>" +
  "<path d='M62 152c0-48 26-80 58-80s58 32 58 80v70H62z' fill='%23241f26'/>" +
  "<circle cx='120' cy='130' r='41' fill='%238a5a3c'/>" +
  "<path d='M79 118c5-27 22-40 41-40s36 13 41 40c-10-15-24-23-41-23s-31 8-41 23z' fill='%23241f26'/>" +
  "<path d='M36 300c0-48 38-79 84-79s84 31 84 79z' fill='%232b4a6f'/>" +
  "<path d='M105 228l15 25 15-25-15-6z' fill='%23f4f2ee'/></svg>";

TEMPLATE_SAMPLES.portrait = {
  basics: {
    name: 'Wanjiku Mwangi',
    title: 'Finance Manager',
    email: 'wanjiku.mwangi@email.com',
    phone: '+254 712 345 678',
    address: 'Nairobi, Kenya',
    linkedin: 'linkedin.com/in/wanjikumwangi',
    photo: PORTRAIT_AVATAR,
    visibleExtra: ['linkedin'],
  },
  sections: [
    {
      id: 'p-summary', type: 'summary', title: 'Summary', kind: 'text',
      content: '<p>Finance professional with 8 years of experience across budgeting, financial reporting, and business performance analysis in fast-paced corporate environments. Strong track record of improving reporting accuracy, supporting strategic planning, and partnering with cross-functional teams to guide sound financial decisions.</p><p>Brings a practical, data-driven approach suited to finance leadership roles with regional scope and operational responsibility.</p>',
    },
    {
      id: 'p-skills', type: 'skills', title: 'Skills', kind: 'tags',
      tags: ['Financial Planning & Analysis', 'Budget Management', 'Forecasting', 'Variance Analysis', 'Financial Reporting', 'Cost Control', 'SAP', 'Advanced Excel'],
    },
    {
      id: 'p-langs', type: 'languages', title: 'Languages', kind: 'tags',
      tags: ['English (Fluent)', 'Swahili (Native)', 'French (Intermediate)'],
    },
    {
      id: 'p-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
      entries: [
        {
          id: 'pe1', heading: 'Twiga Foods', subheading: 'Finance Manager',
          location: 'Nairobi, Kenya', start: '03/2022', end: 'Present',
          description: bullets(
            'Manage monthly budgeting cycles and variance analysis for two business units.',
            'Lead reporting improvements that reduced closing timelines by three days.',
            'Partner with operations and procurement teams to support cost control initiatives.'
          ),
        },
        {
          id: 'pe2', heading: 'KCB Group', subheading: 'Senior Financial Analyst',
          location: 'Nairobi, Kenya', start: '01/2019', end: '02/2022',
          description: bullets(
            'Delivered monthly performance reports for leadership across revenue and expense lines.',
            'Improved forecast models to support more accurate quarterly planning decisions.',
            'Owned financial dashboards and presented insights during business review meetings.'
          ),
        },
        {
          id: 'pe3', heading: 'Deloitte East Africa', subheading: 'Financial Analyst',
          location: 'Nairobi, Kenya', start: '06/2017', end: '12/2018',
          description: bullets(
            'Supported account reconciliations, reporting packs, and annual budget preparation.',
            'Coordinated data validation activities to improve consistency across finance reports.'
          ),
        },
        {
          id: 'pe4', heading: 'Safaricom', subheading: 'Finance Intern',
          location: 'Nairobi, Kenya', start: '05/2016', end: '04/2017',
          description: bullets(
            'Assisted with expense tracking and monthly reconciliation.',
            'Prepared spreadsheet updates for budget monitoring.'
          ),
        },
      ],
    },
    {
      id: 'p-edu', type: 'education', title: 'Education', kind: 'entries',
      entries: [
        { id: 'ped1', heading: 'MBA in Finance', subheading: 'Strathmore Business School', location: 'Nairobi, Kenya', start: '2020', end: '2022', description: '' },
        { id: 'ped2', heading: 'Bachelor of Commerce \u2013 Finance', subheading: 'University of Nairobi', location: 'Nairobi, Kenya', start: '2012', end: '2016', description: '' },
      ],
    },
    {
      id: 'p-certs', type: 'certificates', title: 'Certificates', kind: 'entries',
      entries: [
        { id: 'pc1', heading: 'CPA-K', subheading: 'ICPAK', location: '', start: '2018', end: '', description: '' },
        { id: 'pc2', heading: 'Financial Modeling & Valuation Analyst (FMVA)', subheading: 'Corporate Finance Institute', location: '', start: '2021', end: '', description: '' },
      ],
    },
  ],
};
TEMPLATE_SAMPLES.meridian = TEMPLATE_SAMPLES.simple;