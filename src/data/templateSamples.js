// One unique sample resume per template card, keyed by template id (see
// data/templates.js). Without this, every card in the picker grid showed
// the exact same person — just recolored — which made 21 templates feel
// like one template in 21 colors. Descriptions use real markup (<ul><li>)
// since entry descriptions render as rich text, not line-split plain text.
import { DANIEL_AVATAR, CAMILA_AVATAR } from './sampleAvatars';

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

TEMPLATE_SAMPLES.chronicle = {
  basics: {
    name: 'Charlotte Bennett',
    title: 'Communications & PR Manager',
    email: 'charlotte.bennett@mailbox.co.uk',
    phone: '+44 7700 900123',
    address: 'London, United Kingdom',
    visibleExtra: [],
  },
  sections: [
    {
      id: 'ch-summary', type: 'summary', title: 'Professional Summary', kind: 'text',
      content: '<p>Communications professional with 6+ years leading media relations, brand storytelling, and crisis response for consumer-facing organisations across the UK and Europe. Skilled at translating complex corporate narratives into clear, credible public messaging that builds trust with press, regulators, and internal stakeholders alike. Comfortable operating under pressure during live news cycles, and known for turning a single well-placed story into a sustained multi-outlet campaign. Passionate about mentoring junior communicators and building repeatable processes that scale press response as an organisation grows.</p>',
    },
    {
      id: 'ch-exp', type: 'experience', title: 'Experience', kind: 'entries',
      entries: [
        {
          id: 'ch-e1', heading: 'Senior Communications Manager', subheading: 'BBC Studios',
          location: 'London, United Kingdom', start: 'Mar 2021', end: 'Present',
          description: bullets(
            'Lead media strategy and press relations for group-wide corporate announcements and product launches.',
            'Serve as primary spokesperson liaison, briefing executives ahead of high-stakes interviews and public appearances.',
            'Manage crisis communications response, cutting average response time to breaking coverage from 6 hours to under 90 minutes.',
            'Built a newsroom contact database of 200+ journalists across print, broadcast, and digital outlets.',
            'Mentor two mid-level communications officers on media strategy and executive briefing preparation.'
          ),
        },
        {
          id: 'ch-e2', heading: 'Public Relations Officer', subheading: 'Ogilvy UK',
          location: 'London, United Kingdom', start: 'Jun 2018', end: 'Feb 2021',
          description: bullets(
            'Ran integrated PR campaigns for FMCG and telecom clients, coordinating press days and launch events.',
            'Tracked and reported media coverage sentiment across five client accounts on a monthly basis.',
            'Drafted press releases, briefing notes, and Q&A documents for client leadership teams.',
            'Trained two junior PR assistants on media list building and pitch writing.'
          ),
        },
        {
          id: 'ch-e3', heading: 'Communications Assistant', subheading: 'Edelman UK',
          location: 'London, United Kingdom', start: 'Sep 2016', end: 'May 2018',
          description: bullets(
            'Supported senior consultants on media outreach for consumer and retail accounts.',
            'Compiled daily media monitoring reports and flagged emerging coverage risks.',
            'Helped organise press events and managed journalist RSVP lists for product launches.'
          ),
        },
      ],
    },
    {
      id: 'ch-skills', type: 'skills', title: 'Skills', kind: 'tags',
      groups: [
        { id: 'ch-sg1', label: 'Communications', tags: ['Media Relations', 'Crisis Communications', 'Executive Messaging', 'Content Strategy', 'Reputation Management'] },
        { id: 'ch-sg2', label: 'Tools', tags: ['Meltwater', 'Cision', 'WordPress', 'Canva', 'Google Analytics'] },
      ],
      tags: ['Media Relations', 'Crisis Communications', 'Executive Messaging', 'Content Strategy', 'Reputation Management', 'Meltwater', 'Cision', 'WordPress', 'Canva', 'Google Analytics'],
    },
    { id: 'ch-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English (native)', 'French (conversational)', 'Spanish (basic)'] },
    {
      id: 'ch-edu', type: 'education', title: 'Education', kind: 'entries',
      entries: [
        { id: 'ch-ed1', heading: 'Bachelor of Arts – Communication & Media Studies', subheading: 'University of Leeds', location: '', start: '2013', end: '2016', description: '' },
      ],
    },
  ],
};

TEMPLATE_SAMPLES.classic = {
  basics: {
    name: 'Michael Reynolds',
    title: 'Attorney & Legal Counsel',
    email: 'michael.reynolds@lawmail.com',
    phone: '+1 (212) 555-0148',
    address: 'New York, NY, USA',
    visibleExtra: [],
  },
  sections: [
    {
      id: 'cl-summary', type: 'summary', title: 'Profile', kind: 'text',
      content: '<p>Attorney admitted to the New York State Bar with 7 years of experience in corporate and commercial law, advising public and private clients on high-value mergers and acquisitions, contract negotiation, and regulatory compliance. Regularly manages multi-jurisdictional due diligence workstreams and coordinates with outside counsel across banking, telecoms, and manufacturing sectors. Recognised for translating dense regulatory language into guidance that non-legal executives can act on quickly, and for holding a calm, detail-oriented line under tight deal timelines.</p>',
    },
    {
      id: 'cl-exp', type: 'experience', title: 'Experience', kind: 'entries',
      entries: [
        {
          id: 'cl-e1', heading: 'Senior Associate', subheading: 'Skadden, Arps, Slate, Meagher & Flom LLP',
          location: 'New York, NY, USA', start: 'Jan 2020', end: 'Present',
          description: bullets(
            'Lead legal due diligence for cross-border M&A transactions valued at over $40 million combined.',
            'Draft and negotiate commercial contracts, joint venture agreements, and shareholder agreements.',
            'Advise clients on compliance with SEC and FTC regulations ahead of major filings.',
            'Coordinate a team of junior associates and paralegals across concurrent live deals.'
          ),
        },
        {
          id: 'cl-e2', heading: 'Associate', subheading: 'Latham & Watkins LLP',
          location: 'New York, NY, USA', start: 'Sep 2016', end: 'Dec 2019',
          description: bullets(
            'Supported corporate transactions, including company incorporations, share transfers, and financings.',
            'Conducted legal research and prepared opinions on employment and regulatory matters.',
            'Represented clients in commercial dispute mediation proceedings.',
            'Drafted closing checklists and managed signature pages for multi-party transactions.'
          ),
        },
        {
          id: 'cl-e3', heading: 'Judicial Law Clerk', subheading: 'Supreme Court of the State of New York',
          location: 'New York, NY, USA', start: 'Sep 2015', end: 'Aug 2016',
          description: bullets(
            'Researched case law and drafted bench memoranda for commercial division judges.',
            'Summarised motion briefs and prepared hearing materials ahead of oral argument.',
            'Observed and reported on trial proceedings for complex commercial litigation matters.'
          ),
        },
      ],
    },
    {
      id: 'cl-skills', type: 'skills', title: 'Skills', kind: 'tags',
      groups: [
        { id: 'cl-sg1', label: 'Practice Areas', tags: ['Corporate Law', 'Mergers & Acquisitions', 'Contract Negotiation', 'Regulatory Compliance'] },
        { id: 'cl-sg2', label: 'Core Skills', tags: ['Legal Research', 'Due Diligence', 'Risk Assessment', 'Client Advisory'] },
      ],
      tags: ['Corporate Law', 'Mergers & Acquisitions', 'Contract Negotiation', 'Regulatory Compliance', 'Legal Research', 'Due Diligence', 'Risk Assessment', 'Client Advisory'],
    },
    { id: 'cl-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English (native)', 'Spanish (conversational)'] },
    {
      id: 'cl-edu', type: 'education', title: 'Education', kind: 'entries',
      entries: [
        { id: 'cl-ed1', heading: 'Juris Doctor (J.D.)', subheading: 'Columbia Law School', location: '', start: '2013', end: '2016', description: '' },
        { id: 'cl-ed2', heading: 'Bachelor of Arts – Political Science', subheading: 'University of Michigan', location: '', start: '2009', end: '2013', description: '' },
      ],
    },
  ],
};

TEMPLATE_SAMPLES.slate = {
  basics: {
    name: 'Lukas Hoffmann',
    title: 'Product Designer',
    email: 'lukas.hoffmann@designmail.de',
    phone: '+49 30 1234 5678',
    address: 'Berlin, Germany',
    visibleExtra: [],
  },
  sections: [
    {
      id: 'sl-summary', type: 'summary', title: 'About Me', kind: 'text',
      content: '<p>Product designer with 5 years of experience shaping fintech and e-commerce products used across Europe. Focused on turning ambiguous problems into clear, testable interfaces backed by user research and a strong design system, and comfortable owning a feature from early discovery sketches through to shipped, measured impact. Enjoys pairing closely with engineers rather than throwing designs over the wall, and mentors newer designers on research methods and critique practice. Outside of core product work, runs an internal Figma-plugin side project used across the design org.</p>',
    },
    {
      id: 'sl-skills', type: 'skills', title: 'Skills', kind: 'tags',
      groups: [
        { id: 'sl-sg1', label: 'Design', tags: ['Figma', 'Design Systems', 'Prototyping', 'Adobe XD', 'Interaction Design'] },
        { id: 'sl-sg2', label: 'Research', tags: ['User Research', 'Usability Testing', 'A/B Testing'] },
      ],
      tags: ['Figma', 'Design Systems', 'Prototyping', 'Adobe XD', 'Interaction Design', 'User Research', 'Usability Testing', 'A/B Testing'],
    },
    { id: 'sl-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['German (native)', 'English (fluent)'] },
    {
      id: 'sl-exp', type: 'experience', title: 'Experience', kind: 'entries',
      entries: [
        {
          id: 'sl-e1', heading: 'Senior Product Designer', subheading: 'N26',
          location: 'Berlin, Germany', start: 'Feb 2022', end: 'Present',
          description: bullets(
            'Own end-to-end design for the mobile banking app used by millions of customers across Europe.',
            'Built and maintain the company-wide design system, cutting new-feature design time by 30%.',
            'Run monthly usability studies with customers to validate flows before engineering handoff.',
            'Mentor two junior designers on research methods, critique practice, and portfolio reviews.'
          ),
        },
        {
          id: 'sl-e2', heading: 'Product Designer', subheading: 'SAP',
          location: 'Berlin, Germany', start: 'Jul 2019', end: 'Jan 2022',
          description: bullets(
            'Designed enterprise dashboards for a cloud platform used by clients across 18 markets.',
            'Partnered with PMs and engineers in weekly critiques to ship two major releases per quarter.',
            'Introduced a component library that reduced UI inconsistencies across three product teams.',
            'Ran quarterly design reviews that surfaced accessibility issues before release.'
          ),
        },
        {
          id: 'sl-e3', heading: 'Junior Product Designer', subheading: 'Zalando',
          location: 'Berlin, Germany', start: 'Aug 2017', end: 'Jun 2019',
          description: bullets(
            'Designed checkout and returns flows for the mobile shopping app.',
            'Supported user interviews and synthesised findings into actionable design recommendations.',
            'Built and maintained a small icon and illustration library used across the app.'
          ),
        },
      ],
    },
    {
      id: 'sl-edu', type: 'education', title: 'Education', kind: 'entries',
      entries: [
        { id: 'sl-ed1', heading: 'Bachelor of Design', subheading: 'Berlin University of the Arts', location: '', start: '2013', end: '2017', description: '' },
      ],
    },
  ],
};

TEMPLATE_SAMPLES.bloom = {
  basics: {
    name: 'Isabela Rocha',
    title: 'Marketing Manager',
    email: 'isabela.rocha@brandmail.com.br',
    phone: '+55 11 98765-4321',
    address: 'São Paulo, Brazil',
    visibleExtra: [],
  },
  sections: [
    {
      id: 'bl-summary', type: 'summary', title: 'Summary', kind: 'text',
      content: '<p>Marketing manager with 6 years of experience running brand campaigns and growth programs for consumer and e-commerce companies across Brazil and Latin America. Combines data-driven digital marketing with strong creative instincts to grow audience, engagement, and revenue at the same time. Comfortable moving between big-picture brand strategy and the performance-marketing details that make a campaign actually convert. Enjoys building and coaching lean marketing teams that ship fast without losing brand consistency.</p>',
    },
    {
      id: 'bl-exp', type: 'experience', title: 'Experience', kind: 'entries',
      entries: [
        {
          id: 'bl-e1', heading: 'Marketing Manager', subheading: 'Nubank',
          location: 'São Paulo, Brazil', start: 'Apr 2021', end: 'Present',
          description: bullets(
            'Lead a team of five running paid social, SEO, and lifecycle email campaigns across the app.',
            'Grew organic traffic by 42% year-over-year through content and SEO investment.',
            'Managed an annual marketing budget of R$ 6M across digital and offline channels.',
            'Launched a referral program that became the second-largest new-customer acquisition channel.'
          ),
        },
        {
          id: 'bl-e2', heading: 'Brand Executive', subheading: 'Magazine Luiza',
          location: 'São Paulo, Brazil', start: 'Jan 2018', end: 'Mar 2021',
          description: bullets(
            'Executed regional brand campaigns across TV, radio, and social media for two core product lines.',
            'Coordinated with agencies on creative production, from brief to final delivery.',
            'Analysed campaign performance data to guide the following quarter’s media spend.',
            'Managed brand guideline compliance across 40+ store and marketplace touchpoints.'
          ),
        },
        {
          id: 'bl-e3', heading: 'Marketing Analyst', subheading: 'Ambev',
          location: 'São Paulo, Brazil', start: 'Feb 2016', end: 'Dec 2017',
          description: bullets(
            'Supported category managers with market research and competitor pricing analysis.',
            'Built monthly performance dashboards tracking campaign reach and sales lift.',
            'Assisted with regional activation events for two flagship product lines.'
          ),
        },
      ],
    },
    {
      id: 'bl-skills', type: 'skills', title: 'Skills', kind: 'tags',
      groups: [
        { id: 'bl-sg1', label: 'Digital Marketing', tags: ['SEO', 'Google Ads', 'Meta Ads', 'Email Marketing', 'Marketing Automation'] },
        { id: 'bl-sg2', label: 'Brand', tags: ['Brand Strategy', 'Content Creation', 'Campaign Management', 'Team Leadership'] },
      ],
      tags: ['SEO', 'Google Ads', 'Meta Ads', 'Email Marketing', 'Marketing Automation', 'Brand Strategy', 'Content Creation', 'Campaign Management', 'Team Leadership'],
    },
    { id: 'bl-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Portuguese (native)', 'English (fluent)', 'Spanish (conversational)'] },
    {
      id: 'bl-edu', type: 'education', title: 'Education', kind: 'entries',
      entries: [
        { id: 'bl-ed1', heading: 'Bachelor of Business Administration – Marketing', subheading: 'University of São Paulo', location: '', start: '2012', end: '2016', description: '' },
      ],
    },
  ],
};

TEMPLATE_SAMPLES.nova = {
  basics: {
    name: 'Ananya Sharma',
    title: 'Data Analyst',
    email: 'ananya.sharma@datamail.in',
    phone: '+91 98765 43210',
    address: 'Bengaluru, India',
    visibleExtra: [],
  },
  sections: [
    {
      id: 'nv-summary', type: 'summary', title: 'Career Summary', kind: 'text',
      content: '<p>Data analyst with 4 years of experience turning raw operational data into dashboards and recommendations that guide real business decisions, not just reporting for its own sake. Comfortable owning a problem end-to-end, from writing the first exploratory SQL query through to a stakeholder-ready presentation that leadership can act on the same week. Known for asking the "so what" question early, so analysis stays tied to a decision instead of becoming a stack of unread charts. Currently deepening experience in experimentation design and causal analysis.</p>',
    },
    {
      id: 'nv-exp', type: 'experience', title: 'Experience', kind: 'entries',
      entries: [
        {
          id: 'nv-e1', heading: 'Senior Data Analyst', subheading: 'Flipkart',
          location: 'Bengaluru, India', start: 'Jun 2022', end: 'Present',
          description: bullets(
            'Build and maintain Power BI dashboards tracking sales and fulfilment trends across regional hubs.',
            'Automated a monthly reporting pipeline in Python, cutting report turnaround from 3 days to 4 hours.',
            'Partner with category teams to model the projected impact of proposed pricing changes.',
            'Designed and analysed A/B tests for two checkout-flow experiments, informing a company-wide rollout.'
          ),
        },
        {
          id: 'nv-e2', heading: 'Data Analyst', subheading: 'Swiggy',
          location: 'Bengaluru, India', start: 'Aug 2020', end: 'May 2022',
          description: bullets(
            'Analysed delivery performance data across 15+ cities to inform operational decisions.',
            'Wrote SQL queries against a growing internal database to support ad-hoc leadership requests.',
            'Presented quarterly insights reports to the operations leadership team.',
            'Built a rider-utilisation model that helped reduce average delivery time by 6%.'
          ),
        },
        {
          id: 'nv-e3', heading: 'Data Analyst Intern', subheading: 'Zomato',
          location: 'Gurugram, India', start: 'Jan 2020', end: 'Jun 2020',
          description: bullets(
            'Cleaned and validated restaurant transaction data ahead of a quarterly reporting cycle.',
            'Built exploratory dashboards in Excel to support the merchant growth team.',
            'Documented data definitions used across three analyst teams.'
          ),
        },
      ],
    },
    {
      id: 'nv-skills', type: 'skills', title: 'Key Skills', kind: 'tags',
      groups: [
        { id: 'nv-sg1', label: 'Analytics', tags: ['SQL', 'Python', 'Power BI', 'A/B Testing'] },
        { id: 'nv-sg2', label: 'Tools', tags: ['Excel', 'Tableau', 'Google Sheets', 'Airflow'] },
      ],
      tags: ['SQL', 'Python', 'Power BI', 'A/B Testing', 'Excel', 'Tableau', 'Google Sheets', 'Airflow'],
    },
    { id: 'nv-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English (fluent)', 'Hindi (native)', 'Kannada (conversational)'] },
    {
      id: 'nv-edu', type: 'education', title: 'Education', kind: 'entries',
      entries: [
        { id: 'nv-ed1', heading: 'Bachelor of Science – Statistics', subheading: 'Indian Statistical Institute', location: '', start: '2016', end: '2020', description: '' },
      ],
    },
  ],
};

TEMPLATE_SAMPLES.codex = {
  basics: {
    name: 'Daniel Kim',
    title: 'Software Engineer',
    email: 'daniel.kim@devmail.ca',
    phone: '+1 (416) 555-0192',
    address: 'Toronto, ON, Canada',
    visibleExtra: [],
  },
  sections: [
    {
      id: 'cx-summary', type: 'summary', title: 'Profile', kind: 'text',
      content: '<p>Full-stack engineer with 5 years building and scaling fintech APIs and customer-facing web apps. Core stack is React, Go, and Postgres; comfortable owning a service from initial design through production on-call, and equally comfortable digging into a slow query as writing a new feature. Cares about developer experience as much as user experience — has led two internal tooling efforts that measurably cut other engineers’ time-to-ship. Enjoys mentoring newer engineers and writing design docs that hold up six months later.</p>',
    },
    {
      id: 'cx-exp', type: 'experience', title: 'Experience', kind: 'entries',
      entries: [
        {
          id: 'cx-e1', heading: 'Senior Software Engineer', subheading: 'Shopify',
          location: 'Toronto, ON, Canada', start: 'Mar 2022', end: 'Present',
          description: bullets(
            'Built and maintain payment settlement APIs processing over 500,000 transactions daily.',
            'Led migration of a core service from a monolith to Go microservices, cutting p99 latency by 35%.',
            'Mentor two junior engineers through code review and pairing sessions.',
            'Built an internal CLI tool that cut local environment setup time from 45 minutes to under 5.'
          ),
        },
        {
          id: 'cx-e2', heading: 'Software Engineer', subheading: 'Wealthsimple',
          location: 'Toronto, ON, Canada', start: 'Jan 2019', end: 'Feb 2022',
          description: bullets(
            'Developed React front-ends and REST APIs for investing products used by over a million clients.',
            'Wrote automated test suites that raised backend coverage from 40% to 85%.',
            'Fixed production incidents as part of a rotating on-call schedule.',
            'Partnered with product and design on two feature launches from spec through GA.'
          ),
        },
        {
          id: 'cx-e3', heading: 'Junior Software Developer', subheading: 'Borrowell',
          location: 'Toronto, ON, Canada', start: 'Jun 2017', end: 'Dec 2018',
          description: bullets(
            'Built internal admin tooling used by the customer operations team.',
            'Fixed bugs and wrote unit tests across the Node.js backend.',
            'Participated in an on-call rotation for a low-traffic internal service.'
          ),
        },
      ],
    },
    {
      id: 'cx-skills', type: 'skills', title: 'Key Skills', kind: 'tags',
      groups: [
        { id: 'cx-sg1', label: 'Languages', tags: ['JavaScript', 'TypeScript', 'Go', 'Python'] },
        { id: 'cx-sg2', label: 'Frameworks & Tools', tags: ['React', 'Node.js', 'Django', 'Docker', 'PostgreSQL'] },
      ],
      tags: ['JavaScript', 'TypeScript', 'Go', 'Python', 'React', 'Node.js', 'Django', 'Docker', 'PostgreSQL'],
    },
    { id: 'cx-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English (fluent)', 'Korean (native)'] },
    {
      id: 'cx-edu', type: 'education', title: 'Education', kind: 'entries',
      entries: [
        { id: 'cx-ed1', heading: 'Bachelor of Science – Computer Science', subheading: 'University of Waterloo', location: '', start: '2013', end: '2017', description: '' },
      ],
    },
  ],
};

TEMPLATE_SAMPLES.ledger = {
  basics: {
    name: 'Fatima Al-Sayed',
    title: 'Chief Financial Officer',
    email: 'fatima.alsayed@financemail.com',
    phone: '+971 50 123 4567',
    address: 'Dubai, United Arab Emirates',
    visibleExtra: [],
  },
  sections: [
    {
      id: 'lg-summary', type: 'summary', title: 'Executive Summary', kind: 'text',
      content: '<p>Finance executive with over 12 years of experience across banking and FMCG, including 4 years at CFO level leading a regional finance function through both growth and cost-discipline cycles. Track record of leading financial strategy, audit readiness, and treasury management for organisations with multi-country operations and boards that expect precise, well-supported numbers.</p><p>Comfortable being the finance voice in the room during high-stakes decisions, and known for building finance teams that business partners actually want to work with rather than avoid.</p>',
    },
    {
      id: 'lg-exp', type: 'experience', title: 'Experience', kind: 'entries',
      entries: [
        {
          id: 'lg-e1', heading: 'Chief Financial Officer', subheading: 'Emirates NBD',
          location: 'Dubai, United Arab Emirates', start: 'Jan 2021', end: 'Present',
          description: bullets(
            'Own financial strategy and reporting for a business unit with over AED 2 billion in annual revenue.',
            'Led a treasury restructuring that reduced foreign exchange exposure by 25%.',
            'Present quarterly financial performance to the board and regional leadership team.',
            'Rebuilt the annual planning process, cutting the budgeting cycle from ten weeks to six.'
          ),
        },
        {
          id: 'lg-e2', heading: 'Finance Manager', subheading: 'PwC Middle East',
          location: 'Dubai, United Arab Emirates', start: 'Jun 2015', end: 'Dec 2020',
          description: bullets(
            'Managed financial reporting and budget consolidation across six regional business units.',
            'Led IFRS 9 implementation ahead of the regulatory deadline.',
            'Supervised a team of eight finance analysts and accountants.',
            'Streamlined the month-end close process, cutting close time from 12 days to 7.'
          ),
        },
        {
          id: 'lg-e3', heading: 'Senior Financial Analyst', subheading: 'National Bank of Fujairah',
          location: 'Fujairah, United Arab Emirates', start: 'Aug 2009', end: 'May 2015',
          description: bullets(
            'Prepared monthly and quarterly financial statements for regulatory submission.',
            'Built variance analysis reports comparing actuals to budget for business unit heads.',
            'Supported the annual external audit process, coordinating document requests across departments.'
          ),
        },
      ],
    },
    {
      id: 'lg-skills', type: 'skills', title: 'Key Skills', kind: 'tags',
      groups: [
        { id: 'lg-sg1', label: 'Finance Leadership', tags: ['Financial Strategy', 'Treasury Management', 'Board Reporting', 'Team Leadership'] },
        { id: 'lg-sg2', label: 'Governance', tags: ['Audit & Compliance', 'IFRS Reporting', 'Risk Management'] },
      ],
      tags: ['Financial Strategy', 'Treasury Management', 'Board Reporting', 'Team Leadership', 'Audit & Compliance', 'IFRS Reporting', 'Risk Management'],
    },
    { id: 'lg-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Arabic (native)', 'English (fluent)'] },
    {
      id: 'lg-edu', type: 'education', title: 'Education', kind: 'entries',
      entries: [
        { id: 'lg-ed1', heading: 'MBA – Finance', subheading: 'London Business School', location: '', start: '2013', end: '2015', description: '' },
        { id: 'lg-ed2', heading: 'Bachelor of Commerce – Accounting', subheading: 'American University of Sharjah', location: '', start: '2005', end: '2009', description: '' },
      ],
    },
  ],
};

TEMPLATE_SAMPLES.amber = {
  basics: {
    name: "Liam O'Connor",
    title: 'IT Project Manager',
    email: 'liam.oconnor@consultmail.com.au',
    phone: '+61 4 1234 5678',
    address: 'Sydney, Australia',
    availability: 'Open to hybrid and remote roles',
    visibleExtra: ['availability'],
  },
  sections: [
    {
      id: 'am-summary', type: 'summary', title: 'Professional Summary', kind: 'text',
      content: '<p>IT project manager and consultant with 7 years leading digital transformation programs for banking and telecom clients across Australia. Skilled at translating executive strategy into agile delivery plans that ship on time and within budget, and at keeping a program on track when scope, stakeholders, or vendors shift midstream. Builds trust with both engineering teams and client sponsors by being transparent about risk early rather than after it becomes a problem. Certified PMP and Scrum practitioner with hands-on experience running multi-vendor delivery.</p>',
    },
    {
      id: 'am-exp', type: 'experience', title: 'Experience', kind: 'entries',
      entries: [
        {
          id: 'am-e1', heading: 'Senior Project Manager', subheading: 'Deloitte Australia',
          location: 'Sydney, Australia', start: 'Sep 2021', end: 'Present',
          description: bullets(
            'Lead delivery of core banking system upgrades for three regional bank clients.',
            'Manage cross-functional teams of up to 20 people across engineering, QA, and change management.',
            'Introduced a standard agile delivery framework now used across the practice’s IT engagements.',
            'Own client-facing status reporting and risk escalation for a AUD 8M program portfolio.'
          ),
        },
        {
          id: 'am-e2', heading: 'IT Project Manager', subheading: 'Telstra',
          location: 'Sydney, Australia', start: 'Mar 2018', end: 'Aug 2021',
          description: bullets(
            'Delivered internal tooling projects supporting customer care and network operations teams.',
            'Ran sprint planning and stand-ups for two scrum teams totaling 14 engineers.',
            'Reduced average project overrun from 18% to 6% by tightening scope and change control.',
            'Coordinated UAT cycles with business stakeholders ahead of three major platform releases.'
          ),
        },
        {
          id: 'am-e3', heading: 'Business Analyst', subheading: 'Commonwealth Bank of Australia',
          location: 'Sydney, Australia', start: 'Feb 2015', end: 'Feb 2018',
          description: bullets(
            'Gathered and documented business requirements for internal process improvement projects.',
            'Facilitated workshops between business stakeholders and technical teams.',
            'Supported UAT planning and defect triage for two core system rollouts.'
          ),
        },
      ],
    },
    {
      id: 'am-skills', type: 'skills', title: 'Key Skills', kind: 'tags',
      groups: [
        { id: 'am-sg1', label: 'Delivery', tags: ['Agile', 'Scrum', 'PMP', 'Change Management', 'Risk Management'] },
        { id: 'am-sg2', label: 'Tools', tags: ['Jira', 'MS Project', 'Confluence'] },
      ],
      tags: ['Agile', 'Scrum', 'PMP', 'Change Management', 'Risk Management', 'Jira', 'MS Project', 'Confluence'],
    },
    { id: 'am-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English (native)'] },
    {
      id: 'am-edu', type: 'education', title: 'Education', kind: 'entries',
      entries: [
        { id: 'am-ed1', heading: 'Bachelor of Science – Information Technology', subheading: 'University of New South Wales', location: '', start: '2011', end: '2015', description: '' },
      ],
    },
  ],
};

TEMPLATE_SAMPLES.willow = {
  basics: {
    name: 'Sophie van der Berg',
    title: 'People & Culture Manager',
    email: 'sophie.vandenberg@peoplemail.nl',
    phone: '+31 6 1234 5678',
    address: 'Amsterdam, Netherlands',
    visibleExtra: [],
  },
  sections: [
    {
      id: 'wl-summary', type: 'summary', title: 'Summary', kind: 'text',
      content: '<p>People operations leader with 8 years building talent and culture programs for fast-growing tech companies across the Netherlands. Believes strong culture is designed deliberately, not left to chance, and partners closely with leadership to make that real through concrete programs rather than posters on a wall. Has led people teams through hypergrowth, a rebrand, and a return-to-office policy shift, and has learned to communicate change in a way that keeps trust intact. Genuinely enjoys the unglamorous parts of the job — writing the policy doc, checking the pay-equity numbers, following up after the survey closes.</p>',
    },
    {
      id: 'wl-skills', type: 'skills', title: 'Key Skills', kind: 'tags',
      groups: [
        { id: 'wl-sg1', label: 'Talent', tags: ['Talent Acquisition', 'Performance Management', 'Succession Planning', 'Compensation & Benefits'] },
        { id: 'wl-sg2', label: 'Culture', tags: ['Employee Engagement', 'DEI Programs', 'Onboarding Design', 'Change Management'] },
      ],
      tags: ['Talent Acquisition', 'Performance Management', 'Succession Planning', 'Compensation & Benefits', 'Employee Engagement', 'DEI Programs', 'Onboarding Design', 'Change Management'],
    },
    { id: 'wl-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Dutch (native)', 'English (fluent)', 'German (conversational)'] },
    {
      id: 'wl-edu', type: 'education', title: 'Education', kind: 'entries',
      entries: [
        { id: 'wl-ed1', heading: 'MSc – Human Resource Management', subheading: 'University of Amsterdam', location: '', start: '2016', end: '2018', description: '' },
        { id: 'wl-ed2', heading: 'Bachelor of Business Administration', subheading: 'Erasmus University Rotterdam', location: '', start: '2010', end: '2014', description: '' },
      ],
    },
    {
      id: 'wl-exp', type: 'experience', title: 'Experience', kind: 'entries',
      entries: [
        {
          id: 'wl-e1', heading: 'Head of People & Culture', subheading: 'Booking.com',
          location: 'Amsterdam, Netherlands', start: 'Jan 2021', end: 'Present',
          description: bullets(
            'Built the company’s first structured performance review cycle, adopted across 4 country offices.',
            'Lead talent acquisition for engineering and product roles, cutting time-to-hire by 35%.',
            'Launched an employee engagement survey program now run quarterly across the business.',
            'Led a compensation-benchmarking project that closed a measurable gender pay gap within one cycle.'
          ),
        },
        {
          id: 'wl-e2', heading: 'HR Business Partner', subheading: 'Adyen',
          location: 'Amsterdam, Netherlands', start: 'Apr 2017', end: 'Dec 2020',
          description: bullets(
            'Partnered with department heads on org design as headcount grew from 60 to 200.',
            'Redesigned the onboarding program, improving new-hire 90-day retention by 20%.',
            'Managed employee relations casework across the Amsterdam and Berlin offices.',
            'Rolled out a manager-training program covering feedback delivery and performance calibration.'
          ),
        },
        {
          id: 'wl-e3', heading: 'HR Coordinator', subheading: 'TomTom',
          location: 'Amsterdam, Netherlands', start: 'Sep 2014', end: 'Mar 2017',
          description: bullets(
            'Coordinated recruitment logistics and candidate communication for engineering hiring.',
            'Maintained HR records and supported payroll data accuracy for a 150-person office.',
            'Assisted in planning quarterly all-hands and team-building events.'
          ),
        },
      ],
    },
  ],
};

TEMPLATE_SAMPLES.clover = {
  basics: {
    name: 'Chioma Eze',
    title: 'Customer Success Manager',
    email: 'chioma.eze@growthmail.com',
    phone: '+234 802 345 6789',
    address: 'Lagos, Nigeria',
    visibleExtra: [],
  },
  sections: [
    {
      id: 'cv-summary', type: 'summary', title: 'About Me', kind: 'text',
      content: '<p>Customer success manager with 5 years helping SaaS customers onboard, adopt, and grow with the product across Nigeria and wider West Africa. Focused on turning first-time users into long-term accounts through proactive, relationship-first support rather than reactive ticket handling. Comfortable being the customer’s advocate internally — flagging product friction to engineering before it turns into churn — while still owning the commercial side of the relationship, including renewals and expansion.</p>',
    },
    {
      id: 'cv-exp', type: 'experience', title: 'Experience', kind: 'entries',
      entries: [
        {
          id: 'cv-e1', heading: 'Customer Success Manager', subheading: 'Paystack',
          location: 'Lagos, Nigeria', start: 'Feb 2022', end: 'Present',
          description: bullets(
            'Own a portfolio of 60+ mid-market accounts, maintaining a 94% annual renewal rate.',
            'Run onboarding programs that cut average time-to-value from 6 weeks to 3 weeks.',
            'Identify upsell opportunities that contributed ₦12M in expansion revenue last year.',
            'Partner with product to prioritise a quarterly customer-feedback roadmap review.'
          ),
        },
        {
          id: 'cv-e2', heading: 'Customer Success Associate', subheading: 'Interswitch',
          location: 'Lagos, Nigeria', start: 'Jun 2019', end: 'Jan 2022',
          description: bullets(
            'Supported 100+ small-business customers through onboarding, training, and renewal conversations.',
            'Maintained a customer satisfaction score above 90% across two consecutive years.',
            'Documented common support issues into a self-serve knowledge base, reducing repeat tickets by 18%.',
            'Trained two new hires on the onboarding playbook and CRM workflows.'
          ),
        },
        {
          id: 'cv-e3', heading: 'Customer Support Representative', subheading: 'Konga',
          location: 'Lagos, Nigeria', start: 'Aug 2017', end: 'May 2019',
          description: bullets(
            'Handled inbound customer queries across live chat and email for the online marketplace.',
            'Resolved order and delivery disputes while maintaining service-level targets.',
            'Escalated recurring product issues to the operations team with supporting data.'
          ),
        },
      ],
    },
    {
      id: 'cv-skills', type: 'skills', title: 'Key Skills', kind: 'tags',
      tags: ['Customer Onboarding', 'Account Management', 'Retention Strategy', 'Renewal Management', 'HubSpot', 'Zoho CRM'],
    },
    { id: 'cv-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English (fluent)', 'Yoruba (native)', 'Igbo (conversational)'] },
    {
      id: 'cv-edu', type: 'education', title: 'Education', kind: 'entries',
      entries: [
        { id: 'cv-ed1', heading: 'Bachelor of Science – Business Administration', subheading: 'University of Lagos', location: '', start: '2013', end: '2017', description: '' },
      ],
    },
  ],
};

TEMPLATE_SAMPLES.portrait = {
  basics: {
    name: 'Daniel Mwangi',
    title: 'Finance Manager',
    email: 'daniel.mwangi@email.com',
    phone: '+254 712 345 678',
    address: 'Nairobi, Kenya',
    linkedin: 'linkedin.com/in/danielmwangi',
    photo: DANIEL_AVATAR,
    visibleExtra: ['linkedin'],
  },
  sections: [
    {
      id: 'p-summary', type: 'summary', title: 'Summary', kind: 'text',
      content: '<p>Finance professional with 8 years of experience across budgeting, financial reporting, and business performance analysis in fast-paced corporate environments. Strong track record of improving reporting accuracy, supporting strategic planning, and partnering with cross-functional teams to guide sound financial decisions. Comfortable owning the monthly close end-to-end and equally comfortable presenting variance drivers directly to department heads.</p><p>Brings a practical, data-driven approach suited to finance leadership roles with regional scope and operational responsibility.</p>',
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
            'Partner with operations and procurement teams to support cost control initiatives.',
            'Mentor a junior financial analyst on forecasting models and reporting standards.'
          ),
        },
        {
          id: 'pe2', heading: 'KCB Group', subheading: 'Senior Financial Analyst',
          location: 'Nairobi, Kenya', start: '01/2019', end: '02/2022',
          description: bullets(
            'Delivered monthly performance reports for leadership across revenue and expense lines.',
            'Improved forecast models to support more accurate quarterly planning decisions.',
            'Owned financial dashboards and presented insights during business review meetings.',
            'Supported the annual budget planning cycle across three regional business units.'
          ),
        },
        {
          id: 'pe3', heading: 'Deloitte East Africa', subheading: 'Financial Analyst',
          location: 'Nairobi, Kenya', start: '06/2017', end: '12/2018',
          description: bullets(
            'Supported account reconciliations, reporting packs, and annual budget preparation.',
            'Coordinated data validation activities to improve consistency across finance reports.',
            'Assisted audit teams with client documentation requests during year-end engagements.'
          ),
        },
        {
          id: 'pe4', heading: 'Safaricom', subheading: 'Finance Intern',
          location: 'Nairobi, Kenya', start: '05/2016', end: '04/2017',
          description: bullets(
            'Assisted with expense tracking and monthly reconciliation.',
            'Prepared spreadsheet updates for budget monitoring.',
            'Supported the finance team during quarterly close with data entry and filing.'
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
TEMPLATE_SAMPLES.lens = {
  basics: {
    name: 'Camila Rivera',
    title: 'Sales Manager',
    email: 'camila.rivera@email.com',
    phone: '+1 305 555 0184',
    address: 'Miami, United States',
    linkedin: 'linkedin.com/in/camila-rivera',
    photo: CAMILA_AVATAR,
    visibleExtra: ['linkedin'],
  },
  sections: [
    {
      id: 'ls-summary', type: 'summary', title: 'Summary', kind: 'text',
      content: '<p>Results-driven sales professional with 6+ years of experience in account growth, client relationship management, and pipeline development across B2B environments. Strong track record of improving conversion rates, supporting revenue targets, and building trust with diverse customer groups in English- and Spanish-speaking markets. Brings a practical, people-focused approach to sales planning, team coordination, and long-term customer retention, and is equally comfortable prospecting new logos as managing a renewal.</p>',
    },
    {
      id: 'ls-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
      entries: [
        {
          id: 'ls-e1', heading: 'BrightPath Business Solutions', subheading: 'Sales Manager',
          location: 'Miami, United States', start: '01/2023', end: 'Present',
          description: bullets(
            'Manage a portfolio of mid-market clients across retail and service sectors.',
            'Lead quarterly sales planning and improved team conversion rates by 14%.',
            'Build strong client relationships that increased renewals and upsell.',
            'Coach two junior account executives on discovery calls and proposal structuring.'
          ),
        },
        {
          id: 'ls-e2', heading: 'Horizon Office Supply', subheading: 'Account Manager',
          location: 'Orlando, United States', start: '03/2020', end: '12/2022',
          description: bullets(
            'Owned inbound and outbound sales activity for regional business accounts.',
            'Delivered tailored product proposals and consistently exceeded revenue goals.',
            'Coordinated with operations teams to improve customer satisfaction.',
            'Ranked top-three sales performer companywide for six consecutive quarters.'
          ),
        },
        {
          id: 'ls-e3', heading: 'SunPeak Telecom', subheading: 'Sales Coordinator',
          location: 'Miami, United States', start: '06/2018', end: '02/2020',
          description: bullets(
            'Supported account execs with lead tracking, reporting, and proposal preparation.',
            'Contributed to pipeline organization and improved follow-up consistency.',
            'Maintained CRM data hygiene across a 500+ contact regional pipeline.'
          ),
        },
      ],
    },
    {
      id: 'ls-edu', type: 'education', title: 'Education', kind: 'entries',
      entries: [
        { id: 'ls-ed1', heading: 'Bachelor of Business Administration', subheading: 'Florida International University', location: 'Miami, United States', start: '2014', end: '2018', description: '' },
        { id: 'ls-ed2', heading: 'Associate Degree in Marketing', subheading: 'Miami Dade College', location: 'Miami, United States', start: '2012', end: '2014', description: '' },
      ],
    },
    {
      id: 'ls-skills', type: 'skills', title: 'Skills', kind: 'tags',
      tags: ['Account Management', 'CRM Management', 'Sales Forecasting', 'Negotiation', 'Client Retention', 'Pipeline Development'],
    },
    { id: 'ls-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English (native)', 'Spanish (fluent)'] },
  ],
};

TEMPLATE_SAMPLES.meridian = {
  basics: {
    name: 'Wei Ling Tan',
    title: 'Operations Director',
    email: 'weiling.tan@opsmail.com',
    phone: '+65 8123 4567',
    address: 'Singapore',
    visibleExtra: [],
  },
  sections: [
    {
      id: 'md-summary', type: 'summary', title: 'Executive Summary', kind: 'text',
      content: '<p>Operations executive with over 10 years scaling logistics and mobility businesses across Southeast Asia. Known for building operational discipline into fast-growing teams without slowing down the pace of growth, and for staying close enough to frontline operations to catch problems before they show up in a dashboard. Has managed operations through a market expansion, a major systems migration, and a period of 3x volume growth, and reports comfortably at both the operating-metric level and the boardroom level.</p>',
    },
    {
      id: 'md-exp', type: 'experience', title: 'Experience', kind: 'entries',
      entries: [
        {
          id: 'md-e1', heading: 'Operations Director', subheading: 'Grab',
          location: 'Singapore', start: 'May 2020', end: 'Present',
          description: bullets(
            'Oversee daily operations across four regional hubs serving over 2 million monthly rides.',
            'Redesigned driver onboarding, cutting average activation time from 9 days to 3 days.',
            'Own the annual operations budget of SGD 12M and report performance directly to the country GM.',
            'Built a data-driven incident response process that reduced service downtime by 40%.'
          ),
        },
        {
          id: 'md-e2', heading: 'Regional Operations Manager', subheading: 'DHL Express',
          location: 'Singapore', start: 'Feb 2016', end: 'Apr 2020',
          description: bullets(
            'Managed warehouse and last-mile delivery operations across the region.',
            'Led a team of 45 field staff and drivers through a period of 3x volume growth.',
            'Implemented route optimisation that cut average delivery cost per order by 22%.',
            'Led the regional rollout of a new warehouse management system across six sites.'
          ),
        },
        {
          id: 'md-e3', heading: 'Operations Supervisor', subheading: 'SingPost',
          location: 'Singapore', start: 'Jan 2012', end: 'Dec 2015',
          description: bullets(
            'Supervised a team of 15 sorting and delivery staff across a regional distribution hub.',
            'Monitored daily throughput targets and escalated bottlenecks to site management.',
            'Assisted in piloting a barcode-scanning process that cut manual sorting errors by 30%.'
          ),
        },
      ],
    },
    {
      id: 'md-skills', type: 'skills', title: 'Key Skills', kind: 'tags',
      groups: [
        { id: 'md-sg1', label: 'Operations', tags: ['Operations Strategy', 'Supply Chain Management', 'Process Improvement'] },
        { id: 'md-sg2', label: 'Leadership', tags: ['P&L Management', 'Team Leadership', 'Change Management'] },
      ],
      tags: ['Operations Strategy', 'Supply Chain Management', 'Process Improvement', 'P&L Management', 'Team Leadership', 'Change Management'],
    },
    { id: 'md-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English (fluent)', 'Mandarin (native)'] },
    {
      id: 'md-edu', type: 'education', title: 'Education', kind: 'entries',
      entries: [
        { id: 'md-ed1', heading: 'MBA', subheading: 'National University of Singapore', location: '', start: '2018', end: '2020', description: '' },
        { id: 'md-ed2', heading: 'Bachelor of Business Administration', subheading: 'Nanyang Technological University', location: '', start: '2008', end: '2012', description: '' },
      ],
    },
  ],
};