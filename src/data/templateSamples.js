// Sample resumes shown in the template picker grid (see data/templates.js).
// Each template gets its own distinct sample so the picker shows varied,
// realistic content rather than the same resume re-skinned four times.
// Descriptions use real markup (<ul><li>) since entry descriptions render
// as rich text, not line-split plain text.
function bullets(...points) {
  return `<ul>${points.map((p) => `<li>${p}</li>`).join('')}</ul>`;
}

export const TEMPLATE_SAMPLES = {
  // ---------------------------------------------------------------------
  // SIMPLE — Customer support / sports-betting background
  // ---------------------------------------------------------------------
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
        id: 's-summary', type: 'summary', title: 'Professional Summary', kind: 'text',
        content: '<p>Dynamic customer support professional with 3+ years of experience delivering high-volume, time-sensitive support in fast-paced digital environments. Passionate about sports and sports gaming, with a strong grasp of online payments, identity verification, and fraud prevention. Known for owning outcomes autonomously, spotting issues before escalation, and using AI tools to drive speed and quality. Excited by Boom Sports’ mission to make Daily Fantasy Sports accessible to every fan.</p>',
      },
      {
        id: 's-exp', type: 'experience', title: 'Experience', kind: 'entries',
        entries: [
          {
            id: 'e1', heading: 'Senior Customer Support Specialist', subheading: 'Betika (SportsPesa Group)',
            location: 'Nairobi, Kenya', start: 'Jan 2022', end: 'Present',
            description: bullets(
              'Managed 100+ daily customer interactions via live chat (Intercom) and email (Zendesk) for one of East Africa’s largest sports-betting platforms.',
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
            id: 'ed1', heading: 'Bachelor of Commerce – Business Information Technology', subheading: 'University of Nairobi',
            location: '', start: '2015', end: '2019', description: '',
          },
        ],
      },
      {
        id: 's-why', type: 'custom', title: 'Why Boom', kind: 'text',
        content: '<p>I thrive in exactly the environment Boom describes — fast-paced, high-ownership, and sports-obsessed. I don’t wait to be told what’s broken; I find it, flag it, and fix it. I’ve grown up watching the rise of DFS in the US and I want to be part of the team that brings that energy to every fan. Boom’s track record of nearly $100 million in player prizes tells me this product is real, and I want to help protect and grow the community behind it.</p>',
      },
    ],
  },

  // ---------------------------------------------------------------------
  // CLASSIC — Marketing / brand management background
  // ---------------------------------------------------------------------
  classic: {
    basics: {
      name: 'Sarah Mitchell',
      title: 'Brand Marketing Manager',
      email: 'sarah.mitchell@mailbox.com',
      phone: '+1 (312) 555-0148',
      address: 'Chicago, IL',
      availability: 'Open to relocation',
      photo: null,
      visibleExtra: ['availability'],
    },
    sections: [
      {
        id: 's-summary', type: 'summary', title: 'Professional Summary', kind: 'text',
        content: '<p>Results-driven brand marketer with 6+ years leading integrated campaigns for consumer goods and grocery-tech brands across North America. Skilled at translating market research into positioning that moves both awareness and revenue. Comfortable owning a budget, briefing agencies, and reporting results straight to leadership.</p>',
      },
      {
        id: 's-exp', type: 'experience', title: 'Experience', kind: 'entries',
        entries: [
          {
            id: 'e1', heading: 'Brand Marketing Manager', subheading: 'Instacart',
            location: 'Chicago, IL', start: 'Mar 2022', end: 'Present',
            description: bullets(
              'Own brand strategy and creative direction for a grocery-delivery platform serving 14 metro markets, overseeing a $1.2M annual campaign budget.',
              'Launched a member-facing rebrand that lifted unaided brand awareness by 21% in target markets within two quarters.',
              'Directed a team of 4 marketers and 3 external agencies across paid, social, and experiential channels.',
              'Partnered with product and data teams to build attribution models, improving marketing-sourced revenue reporting accuracy.',
              'Negotiated sponsorship deals with two regional sporting events, generating 40M+ organic impressions.'
            ),
          },
          {
            id: 'e2', heading: 'Marketing Lead', subheading: 'Target',
            location: 'Minneapolis, MN', start: 'Jul 2019', end: 'Feb 2022',
            description: bullets(
              'Planned and executed seasonal campaigns (Back to School, Holiday) driving up to 65% of quarterly online GMV.',
              'Managed a $600K performance marketing budget across Meta, Google, and programmatic display.',
              'Built a customer segmentation framework used across email and push channels, lifting repeat purchase rate by 14%.',
              'Mentored two marketing associates into lead roles within 18 months.'
            ),
          },
          {
            id: 'e3', heading: 'Marketing Associate', subheading: 'Procter & Gamble',
            location: 'Cincinnati, OH', start: 'Sep 2017', end: 'Jun 2019',
            description: bullets(
              'Supported brand management for a personal care portfolio, coordinating trade marketing activity across 6 regions.',
              'Ran competitor and consumer research that informed a packaging refresh, contributing to a 9% volume uplift.'
            ),
          },
        ],
      },
      {
        id: 's-skills', type: 'skills', title: 'Key Skills', kind: 'tags',
        groups: [
          { id: 'sg1', label: 'Strategy', tags: ['Brand positioning', 'Go-to-market planning', 'Campaign strategy', 'Budget ownership'] },
          { id: 'sg2', label: 'Channels', tags: ['Paid social', 'Programmatic', 'Email/CRM', 'Sponsorships & experiential'] },
          { id: 'sg3', label: 'Analytics', tags: ['Attribution modelling', 'Google Analytics', 'Tableau', 'A/B testing'] },
          { id: 'sg4', label: 'Leadership', tags: ['Team management', 'Agency management', 'Cross-functional collaboration'] },
        ],
        tags: [
          'Brand positioning', 'Go-to-market planning', 'Campaign strategy', 'Budget ownership',
          'Paid social', 'Programmatic', 'Email/CRM', 'Sponsorships & experiential',
          'Attribution modelling', 'Google Analytics', 'Tableau', 'A/B testing',
          'Team management', 'Agency management', 'Cross-functional collaboration',
        ],
      },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English (native)', 'Spanish (conversational)'] },
      {
        id: 's-edu', type: 'education', title: 'Education', kind: 'entries',
        entries: [
          {
            id: 'ed1', heading: 'MBA, Marketing', subheading: 'Kellogg School of Management, Northwestern University',
            location: '', start: '2020', end: '2021', description: '',
          },
          {
            id: 'ed2', heading: 'BA, Communications', subheading: 'University of Wisconsin–Madison',
            location: '', start: '2013', end: '2017', description: '',
          },
        ],
      },
      {
        id: 's-why', type: 'custom', title: 'Why This Role', kind: 'text',
        content: '<p>I want to bring brand discipline to a company scaling fast, where positioning decisions made today shape the next five years of growth. I care about campaigns that are both creatively sharp and provably tied to revenue.</p>',
      },
    ],
  },

  // ---------------------------------------------------------------------
  // SLATE — Software engineering background
  // ---------------------------------------------------------------------
  slate: {
    basics: {
      name: 'Jae-won Kim',
      title: 'Backend Software Engineer',
      email: 'jaewon.kim@devmail.com',
      phone: '+82 10-2345-6789',
      address: 'Seoul, South Korea',
      availability: 'Available for remote or hybrid roles',
      photo: null,
      visibleExtra: ['availability'],
    },
    sections: [
      {
        id: 's-summary', type: 'summary', title: 'Professional Summary', kind: 'text',
        content: '<p>Backend engineer with 5 years building and scaling payment and logistics systems for high-growth startups. Strong in distributed systems, API design, and reliability engineering. Enjoys mentoring junior engineers and driving down on-call load through better tooling.</p>',
      },
      {
        id: 's-exp', type: 'experience', title: 'Experience', kind: 'entries',
        entries: [
          {
            id: 'e1', heading: 'Senior Backend Engineer', subheading: 'Coupang',
            location: 'Seoul, South Korea', start: 'Feb 2022', end: 'Present',
            description: bullets(
              'Designed and shipped a new dispatch-matching service in Go, cutting average driver-assignment latency from 4.2s to 900ms.',
              'Led migration of a monolithic order service to event-driven microservices using Kafka, improving system uptime to 99.95%.',
              'Built internal tooling for on-call engineers that reduced mean-time-to-resolution for P1 incidents by 35%.',
              'Mentored 3 junior engineers through structured code review and pairing, two of whom were promoted within a year.',
              'Introduced contract testing between services, cutting integration-related production bugs by roughly half.'
            ),
          },
          {
            id: 'e2', heading: 'Software Engineer', subheading: 'Toss (Viva Republica)',
            location: 'Seoul, South Korea', start: 'Jan 2020', end: 'Jan 2022',
            description: bullets(
              'Built REST and webhook APIs for a mobile payments platform processing 2M+ transactions monthly.',
              'Implemented idempotency and retry logic that eliminated duplicate-charge incidents reported by merchants.',
              'Wrote and maintained CI/CD pipelines (Jenkins, Docker) that cut deployment time from 40 minutes to under 10.'
            ),
          },
          {
            id: 'e3', heading: 'Junior Developer', subheading: 'Naver',
            location: 'Seongnam, South Korea', start: 'Jul 2018', end: 'Dec 2019',
            description: bullets(
              'Worked within a distributed team building a Rails-based inventory management system for a global client.',
              'Wrote unit and integration tests that raised project test coverage from 52% to 88%.'
            ),
          },
        ],
      },
      {
        id: 's-skills', type: 'skills', title: 'Key Skills', kind: 'tags',
        groups: [
          { id: 'sg1', label: 'Languages', tags: ['Go', 'Python', 'Ruby', 'SQL'] },
          { id: 'sg2', label: 'Infrastructure', tags: ['Kafka', 'Docker', 'Kubernetes', 'AWS'] },
          { id: 'sg3', label: 'Practices', tags: ['Microservices', 'CI/CD', 'Contract testing', 'On-call/incident response'] },
          { id: 'sg4', label: 'Databases', tags: ['PostgreSQL', 'Redis', 'DynamoDB'] },
        ],
        tags: [
          'Go', 'Python', 'Ruby', 'SQL',
          'Kafka', 'Docker', 'Kubernetes', 'AWS',
          'Microservices', 'CI/CD', 'Contract testing', 'On-call/incident response',
          'PostgreSQL', 'Redis', 'DynamoDB',
        ],
      },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Korean (native)', 'English (fluent)'] },
      {
        id: 's-edu', type: 'education', title: 'Education', kind: 'entries',
        entries: [
          {
            id: 'ed1', heading: 'BSc, Computer Science', subheading: 'Yonsei University',
            location: '', start: '2014', end: '2018', description: '',
          },
        ],
      },
      {
        id: 's-why', type: 'custom', title: 'Why This Role', kind: 'text',
        content: '<p>I want to work on systems where reliability actually matters to people’s daily lives — payments, logistics, infrastructure. I like teams that treat on-call pain as a bug to fix, not a cost to accept.</p>',
      },
    ],
  },

  // ---------------------------------------------------------------------
  // BLOOM — UX/product design background
  // ---------------------------------------------------------------------
  bloom: {
    basics: {
      name: 'Lucía Fernández',
      title: 'Product Designer',
      email: 'lucia.fernandez@designmail.com',
      phone: '+34 611 223 344',
      address: 'Barcelona, Spain',
      availability: 'Freelance & full-time considered',
      photo: null,
      visibleExtra: ['availability'],
    },
    sections: [
      {
        id: 's-summary', type: 'summary', title: 'Professional Summary', kind: 'text',
        content: '<p>Product designer with 4+ years designing consumer apps for fast-growing marketplaces, from early discovery through shipped features. Focused on accessible, mobile-first design and grounded in user research. Comfortable prototyping fast and defending decisions with data.</p>',
      },
      {
        id: 's-exp', type: 'experience', title: 'Experience', kind: 'entries',
        entries: [
          {
            id: 'e1', heading: 'Senior Product Designer', subheading: 'Glovo',
            location: 'Barcelona, Spain', start: 'Apr 2023', end: 'Present',
            description: bullets(
              'Lead designer for the courier onboarding flow, redesigning it to cut drop-off by 27% across first-time users.',
              'Ran and synthesized 40+ user interviews across Spain and Italy to inform a new order-tracking experience.',
              'Built and maintain a shared design system used by 6 product squads, reducing design-to-dev handoff time by 30%.',
              'Partnered with data science to design a clearer delivery-fee explainability screen, cutting related support tickets by 22%.'
            ),
          },
          {
            id: 'e2', heading: 'Product Designer', subheading: 'Typeform',
            location: 'Barcelona, Spain', start: 'Jan 2021', end: 'Mar 2023',
            description: bullets(
              'Designed the form-builder editing experience for a SaaS product used by teams in 100+ countries.',
              'Introduced a lightweight usability-testing process using recorded remote sessions, tripling monthly research throughput.',
              'Redesigned the onboarding flow, contributing to a 12% lift in activation.'
            ),
          },
          {
            id: 'e3', heading: 'UX/UI Designer', subheading: 'Freelance',
            location: 'Barcelona, Spain', start: 'Jun 2019', end: 'Dec 2020',
            description: bullets(
              'Designed websites and mobile app interfaces for 8 early-stage European startups.',
              'Delivered end-to-end design work — research, wireframes, prototypes, final UI — on tight timelines and budgets.'
            ),
          },
        ],
      },
      {
        id: 's-skills', type: 'skills', title: 'Key Skills', kind: 'tags',
        groups: [
          { id: 'sg1', label: 'Design', tags: ['Figma', 'Prototyping', 'Design systems', 'Interaction design'] },
          { id: 'sg2', label: 'Research', tags: ['User interviews', 'Usability testing', 'Survey design', 'Journey mapping'] },
          { id: 'sg3', label: 'Collaboration', tags: ['Cross-functional partnership', 'Design critique facilitation', 'Dev handoff'] },
          { id: 'sg4', label: 'Focus Areas', tags: ['Mobile-first UX', 'Accessibility', 'Marketplace design'] },
        ],
        tags: [
          'Figma', 'Prototyping', 'Design systems', 'Interaction design',
          'User interviews', 'Usability testing', 'Survey design', 'Journey mapping',
          'Cross-functional partnership', 'Design critique facilitation', 'Dev handoff',
          'Mobile-first UX', 'Accessibility', 'Marketplace design',
        ],
      },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Spanish (native)', 'Catalan (fluent)', 'English (fluent)'] },
      {
        id: 's-edu', type: 'education', title: 'Education', kind: 'entries',
        entries: [
          {
            id: 'ed1', heading: 'BA, Design', subheading: 'Elisava Barcelona School of Design and Engineering',
            location: '', start: '2015', end: '2019', description: '',
          },
        ],
      },
      {
        id: 's-why', type: 'custom', title: 'Why This Role', kind: 'text',
        content: '<p>I’m drawn to products where good design changes whether someone can access a service, a job, or an income at all — not just whether an app looks polished. I want to keep designing for the constraints real users actually face.</p>',
      },
    ],
  },
};