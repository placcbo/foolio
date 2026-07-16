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
  clean: {
    basics: {
      name: 'Emily Carter',
      title: 'Project Manager',
      email: 'emily.carter@email.com',
      phone: '+1 416 555 2847',
      address: 'Toronto, Canada',
      linkedin: 'linkedin.com/in/emily-carter',
      photo: null,
      visibleExtra: ['linkedin'],
    },
    sections: [
      {
        id: 's-summary', type: 'summary', title: 'Summary', kind: 'text',
        content: '<p>Project Manager with six years of experience coordinating cross-functional initiatives in technology and business operations. Skilled in stakeholder communication, project planning, risk tracking, and delivery governance across complex environments.</p>',
      },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Project Manager', subheading: 'Northbridge Digital', location: 'Toronto, Canada', start: '03/2022', end: '', description: bullets('Managed release plans across product, engineering, and operations teams.', 'Coordinated stakeholder updates, risk reviews, and milestone reporting.') },
          { id: 'e2', heading: 'Project Coordinator', subheading: 'MapleWorks Solutions', location: 'Toronto, Canada', start: '07/2019', end: '02/2022', description: bullets('Supported schedules, budgets, and documentation for transformation projects.', 'Facilitated team meetings and maintained cross-department action logs.') },
        ],
      },
      {
        id: 's-edu', type: 'education', title: 'Education', kind: 'entries',
        entries: [{ id: 'ed1', heading: 'Bachelor of Commerce in Management', subheading: 'Toronto Metropolitan University', location: 'Toronto, Canada', start: '09/2013', end: '05/2017', description: '' }],
      },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Project Planning', 'Risk Management', 'Budget Tracking', 'Stakeholder Management', 'Agile Delivery'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'French'] },
    ],
  },

  minimal: {
    basics: {
      name: 'Lena Hoffmann',
      title: 'Operations Manager',
      email: 'lena.hoffmann@email.com',
      phone: '+49 151 4827 6391',
      address: 'Berlin, Germany',
      linkedin: 'linkedin.com/in/lena-hoffmann',
      photo: null,
      visibleExtra: ['linkedin'],
    },
    sections: [
      {
        id: 's-summary', type: 'summary', title: 'Summary', kind: 'text',
        content: '<p>Operations professional with seven-plus years of experience supporting logistics, process improvement, and cross-functional coordination in fast-paced business environments. Strong track record improving workflows and delivering reliable service levels.</p>',
      },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Operations Manager', subheading: 'Nova Retail Group', location: 'Berlin, Germany', start: '01/2022', end: '', description: bullets('Coordinated daily operations across warehousing, procurement, and support.', 'Improved order accuracy and weekly forecast reporting accuracy.') },
          { id: 'e2', heading: 'Operations Coordinator', subheading: 'Urban Freight Solutions', location: 'Hamburg, Germany', start: '03/2019', end: '12/2021', description: bullets('Coordinated transport schedules and resolved delivery escalations promptly.', 'Standardized reporting processes for weekly management reviews.') },
        ],
      },
      {
        id: 's-edu', type: 'education', title: 'Education', kind: 'entries',
        entries: [{ id: 'ed1', heading: 'M.Sc. Management', subheading: 'Humboldt University of Berlin', location: 'Berlin, Germany', start: '2015', end: '2017', description: '' }],
      },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Process Improvement', 'Supply Chain Coordination', 'Vendor Management', 'KPI Reporting', 'Budget Tracking'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['German', 'English', 'French'] },
    ],
  },

  classic: {
    basics: {
      name: 'Daniel Mercer',
      title: 'Vice President of Sales',
      email: 'daniel.mercer@email.com',
      phone: '+1 312 555 0187',
      address: 'Chicago, IL',
      linkedin: 'linkedin.com/in/daniel-mercer',
      photo: null,
      visibleExtra: ['linkedin'],
    },
    sections: [
      {
        id: 's-summary', type: 'summary', title: 'Summary', kind: 'text',
        content: '<p>Sales professional with 8+ years of experience supporting revenue growth in B2B technology and business services. Skilled in account management, pipeline development, team coordination, and client relationship building.</p>',
      },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Sales Manager', subheading: 'Nexora Solutions', location: 'Chicago, Illinois', start: '2022', end: '', description: bullets('Manage a team of account executives across mid-market accounts.', 'Improve pipeline tracking and weekly forecast reporting accuracy.') },
          { id: 'e2', heading: 'Senior Sales Specialist', subheading: 'BrightPath Systems', location: 'Chicago, Illinois', start: '2019', end: '2022', description: bullets('Delivered quarterly targets through consultative selling and account expansion.', 'Built strong relationships with regional clients in healthcare and finance.') },
        ],
      },
      {
        id: 's-edu', type: 'education', title: 'Education', kind: 'entries',
        entries: [
          { id: 'ed1', heading: 'Professional Certificate in Sales Management', subheading: 'DePaul University', location: 'Chicago, Illinois', start: '2018', end: '2018', description: '' },
          { id: 'ed2', heading: 'Bachelor of Science in Marketing', subheading: 'Indiana University Bloomington', location: 'Bloomington, Indiana', start: '2012', end: '2016', description: '' },
        ],
      },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Sales Strategy', 'Enterprise Account Management', 'Pipeline Management', 'Negotiation', 'Revenue Growth', 'Team Leadership'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Spanish'] },
    ],
  },

  executive: {
    basics: {
      name: 'Marcus Bennett',
      title: 'Senior Software Engineer',
      email: 'marcus.bennett@email.com',
      phone: '+1 206 555 4471',
      address: 'Seattle, WA',
      photo: null,
      visibleExtra: [],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Backend-focused software engineer with 9 years building distributed systems at scale. Comfortable owning services end to end, from design through on-call operations.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Senior Software Engineer', subheading: 'Cascadia Cloud', location: 'Seattle, WA', start: '06/2020', end: '', description: bullets('Led migration of billing services to an event-driven architecture.', 'Mentored four engineers and ran the team’s incident review process.') },
          { id: 'e2', heading: 'Software Engineer', subheading: 'Rainier Systems', location: 'Seattle, WA', start: '08/2016', end: '05/2020', description: bullets('Built internal tooling that cut deployment time by 40%.', 'Owned the payments API serving 2M+ requests per day.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.S. Computer Science', subheading: 'University of Washington', location: 'Seattle, WA', start: '2012', end: '2016', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Distributed Systems', 'Go', 'Kubernetes', 'PostgreSQL', 'System Design', 'Mentorship'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English'] },
    ],
  },

  scholar: {
    basics: {
      name: 'Dr. Priya Nair',
      title: 'Research Scientist',
      email: 'priya.nair@email.com',
      phone: '+1 617 555 3390',
      address: 'Cambridge, MA',
      photo: null,
      visibleExtra: [],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Research scientist specializing in materials chemistry, with a record of published, peer-reviewed work and cross-institution collaboration.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Research Scientist', subheading: 'MIT Materials Lab', location: 'Cambridge, MA', start: '09/2019', end: '', description: bullets('Lead a team investigating solid-state battery electrolytes.', 'Secured $1.2M in continued grant funding across two cycles.') },
          { id: 'e2', heading: 'Postdoctoral Fellow', subheading: 'Caltech', location: 'Pasadena, CA', start: '07/2016', end: '08/2019', description: bullets('Published 11 peer-reviewed papers on nanostructured catalysts.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'Ph.D. Chemistry', subheading: 'Caltech', location: 'Pasadena, CA', start: '2011', end: '2016', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Materials Chemistry', 'Grant Writing', 'Spectroscopy', 'Peer Review', 'Data Analysis'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Hindi', 'Tamil'] },
    ],
  },

  clarity: {
    basics: {
      name: 'Jordan Reyes',
      title: 'Product Designer',
      email: 'jordan.reyes@email.com',
      phone: '+1 415 555 7723',
      address: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/jordan-reyes',
      photo: null,
      visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Product designer focused on B2B SaaS, partnering closely with engineering and product to ship clear, usable interfaces at speed.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Product Designer', subheading: 'Fieldstone', location: 'San Francisco, CA', start: '2021', end: '', description: bullets('Redesigned the onboarding flow, lifting activation by 18%.', 'Built and maintain the company’s design system.') },
          { id: 'e2', heading: 'UX Designer', subheading: 'Lightwell', location: 'Oakland, CA', start: '2018', end: '2021', description: bullets('Ran user research to inform the v2 dashboard redesign.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.F.A. Design', subheading: 'California College of the Arts', location: 'San Francisco, CA', start: '2014', end: '2018', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Interaction Design'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Spanish'] },
    ],
  },

  precision: {
    basics: {
      name: 'Wei Zhang',
      title: 'Data Analyst',
      email: 'wei.zhang@email.com',
      phone: '+1 512 555 9013',
      address: 'Austin, TX',
      photo: null,
      visibleExtra: [],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Data analyst with five years turning operational data into decisions for merchandising and supply chain teams.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Data Analyst', subheading: 'Longhorn Retail Group', location: 'Austin, TX', start: '2021', end: '', description: bullets('Built demand-forecasting dashboards used by 6 regional teams.', 'Automated weekly reporting, saving 8 hours per analyst per week.') },
          { id: 'e2', heading: 'Junior Analyst', subheading: 'Pecan Street Analytics', location: 'Austin, TX', start: '2019', end: '2021', description: bullets('Maintained SQL pipelines feeding the executive KPI dashboard.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.S. Statistics', subheading: 'University of Texas at Austin', location: 'Austin, TX', start: '2015', end: '2019', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['SQL', 'Python', 'Tableau', 'Forecasting', 'A/B Testing'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Mandarin'] },
    ],
  },

  foundation: {
    basics: {
      name: 'Grace Osei',
      title: 'Civil Engineer',
      email: 'grace.osei@email.com',
      phone: '+44 7700 900321',
      address: 'Manchester, UK',
      photo: null,
      visibleExtra: [],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Chartered civil engineer with six years delivering infrastructure projects from design through construction handover.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Civil Engineer', subheading: 'Pennine Infrastructure', location: 'Manchester, UK', start: '2020', end: '', description: bullets('Managed structural design review for three regional bridge projects.', 'Coordinated with contractors to keep two major sites on schedule.') },
          { id: 'e2', heading: 'Graduate Engineer', subheading: 'Mersey Civil Partners', location: 'Liverpool, UK', start: '2017', end: '2020', description: bullets('Supported site surveys and drainage design for housing developments.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.Eng. Civil Engineering', subheading: 'University of Manchester', location: 'Manchester, UK', start: '2013', end: '2017', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Structural Design', 'AutoCAD', 'Site Management', 'Regulatory Compliance', 'Cost Estimation'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Twi'] },
    ],
  },

  horizon: {
    basics: {
      name: 'Sophie Larsen',
      title: 'Marketing Manager',
      email: 'sophie.larsen@email.com',
      phone: '+45 20 34 56 78',
      address: 'Copenhagen, Denmark',
      linkedin: 'linkedin.com/in/sophie-larsen',
      photo: null,
      visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Marketing manager with a performance-marketing background, running multi-channel campaigns for consumer subscription products.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Marketing Manager', subheading: 'Nordhavn Media', location: 'Copenhagen, Denmark', start: '2021', end: '', description: bullets('Grew paid acquisition channels, reducing CAC by 22%.', 'Led a team of four across content, paid, and lifecycle marketing.') },
          { id: 'e2', heading: 'Marketing Specialist', subheading: 'Baltic Brands', location: 'Aarhus, Denmark', start: '2018', end: '2021', description: bullets('Ran email lifecycle programs lifting retention by 15%.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.A. Marketing', subheading: 'Copenhagen Business School', location: 'Copenhagen, Denmark', start: '2014', end: '2018', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Performance Marketing', 'Campaign Strategy', 'SEO', 'Marketing Analytics', 'Team Leadership'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Danish', 'English', 'German'] },
    ],
  },

  meridian: {
    basics: {
      name: 'Carlos Medina',
      title: 'Supply Chain Manager',
      email: 'carlos.medina@email.com',
      phone: '+52 55 1234 5678',
      address: 'Mexico City, Mexico',
      photo: null,
      visibleExtra: [],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Supply chain manager with eight years optimizing manufacturing and distribution networks across Latin America.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Supply Chain Manager', subheading: 'Grupo Andino', location: 'Mexico City, Mexico', start: '2019', end: '', description: bullets('Cut inventory holding costs by 19% through demand-planning improvements.', 'Managed relationships with 40+ regional suppliers.') },
          { id: 'e2', heading: 'Logistics Analyst', subheading: 'Transportes del Norte', location: 'Monterrey, Mexico', start: '2015', end: '2019', description: bullets('Redesigned distribution routes, cutting delivery times by 12%.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.S. Industrial Engineering', subheading: 'Tecnológico de Monterrey', location: 'Monterrey, Mexico', start: '2011', end: '2015', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Demand Planning', 'Vendor Negotiation', 'Logistics', 'ERP Systems', 'Inventory Management'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Spanish', 'English'] },
    ],
  },

  ledger: {
    basics: {
      name: 'Hannah Whitfield',
      title: 'Senior Accountant',
      email: 'hannah.whitfield@email.com',
      phone: '+1 404 555 6620',
      address: 'Atlanta, GA',
      photo: null,
      visibleExtra: [],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>CPA with seven years in corporate accounting, specializing in month-end close, reconciliations, and audit readiness.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Senior Accountant', subheading: 'Peachtree Holdings', location: 'Atlanta, GA', start: '2020', end: '', description: bullets('Own month-end close for three business units.', 'Reduced close timeline from 8 to 5 business days.') },
          { id: 'e2', heading: 'Staff Accountant', subheading: 'Magnolia Financial', location: 'Atlanta, GA', start: '2017', end: '2020', description: bullets('Prepared reconciliations supporting annual external audits.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.B.A. Accounting', subheading: 'University of Georgia', location: 'Athens, GA', start: '2013', end: '2017', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Financial Reporting', 'GAAP', 'Reconciliations', 'NetSuite', 'Audit Support'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English'] },
    ],
  },

  compass: {
    basics: {
      name: 'Oliver Bennett',
      title: 'Management Consultant',
      email: 'oliver.bennett@email.com',
      phone: '+44 20 7946 0958',
      address: 'London, UK',
      linkedin: 'linkedin.com/in/oliver-bennett',
      photo: null,
      visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Management consultant advising mid-market clients on operating model redesign and cost transformation.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Management Consultant', subheading: 'Thornfield Advisory', location: 'London, UK', start: '2021', end: '', description: bullets('Led a cost-transformation program saving a retail client £4.2M annually.', 'Manage a team of three analysts across two concurrent engagements.') },
          { id: 'e2', heading: 'Business Analyst', subheading: 'Kestrel Consulting', location: 'London, UK', start: '2018', end: '2021', description: bullets('Built the operating model for a client’s post-merger integration.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.B.A.', subheading: 'London Business School', location: 'London, UK', start: '2016', end: '2018', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Operating Model Design', 'Cost Transformation', 'Stakeholder Management', 'Financial Modeling'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'French'] },
    ],
  },

  summit: {
    basics: {
      name: 'Natalie Cho',
      title: 'Senior Product Manager',
      email: 'natalie.cho@email.com',
      phone: '+1 650 555 2214',
      address: 'San Jose, CA',
      linkedin: 'linkedin.com/in/natalie-cho',
      photo: null,
      visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Product manager with seven years shipping consumer mobile products, from zero-to-one launches to scaled platform features.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Senior Product Manager', subheading: 'Brightloop', location: 'San Jose, CA', start: '2021', end: '', description: bullets('Launched a referral program driving 30% of new signups.', 'Own the roadmap for the core mobile app used by 4M+ users.') },
          { id: 'e2', heading: 'Product Manager', subheading: 'Fernway', location: 'San Francisco, CA', start: '2018', end: '2021', description: bullets('Shipped the v1 checkout redesign, lifting conversion by 11%.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.S. Business Administration', subheading: 'UC Berkeley', location: 'Berkeley, CA', start: '2014', end: '2018', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Product Strategy', 'Roadmapping', 'A/B Testing', 'User Research', 'SQL'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Korean'] },
    ],
  },

  anchor: {
    basics: {
      name: 'Rachel Kim',
      title: 'Registered Nurse',
      email: 'rachel.kim@email.com',
      phone: '+1 214 555 8834',
      address: 'Dallas, TX',
      photo: null,
      visibleExtra: [],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Registered nurse with six years of acute-care experience, including three in a Level II trauma center.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Registered Nurse', subheading: 'Baylor Scott & White', location: 'Dallas, TX', start: '2021', end: '', description: bullets('Provide direct patient care in a 24-bed trauma unit.', 'Precept new graduate nurses during onboarding rotations.') },
          { id: 'e2', heading: 'Staff Nurse', subheading: 'Parkland Health', location: 'Dallas, TX', start: '2018', end: '2021', description: bullets('Delivered care across med-surg and step-down units.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.S. Nursing', subheading: 'Texas Woman’s University', location: 'Denton, TX', start: '2014', end: '2018', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Trauma Care', 'Patient Assessment', 'EPIC EHR', 'IV Therapy', 'Preceptorship'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Korean'] },
    ],
  },

  bloom: {
    basics: {
      name: 'Isabella Rossi',
      title: 'HR Manager',
      email: 'isabella.rossi@email.com',
      phone: '+39 348 555 0192',
      address: 'Milan, Italy',
      linkedin: 'linkedin.com/in/isabella-rossi',
      photo: null,
      visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>HR manager with six years leading recruiting, employee relations, and people operations for growing tech teams.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'HR Manager', subheading: 'Fabrica Digitale', location: 'Milan, Italy', start: '2021', end: '', description: bullets('Scaled headcount from 40 to 130 while maintaining a 92% offer-accept rate.', 'Rebuilt the performance review process adopted company-wide.') },
          { id: 'e2', heading: 'HR Generalist', subheading: 'Ventura Studio', location: 'Turin, Italy', start: '2018', end: '2021', description: bullets('Managed onboarding and benefits administration for 60 employees.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.A. Human Resources', subheading: 'Bocconi University', location: 'Milan, Italy', start: '2014', end: '2018', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Recruiting', 'Employee Relations', 'Performance Management', 'HRIS', 'Onboarding'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Italian', 'English'] },
    ],
  },

  nordic: {
    basics: {
      name: 'Erik Johansson',
      title: 'DevOps Engineer',
      email: 'erik.johansson@email.com',
      phone: '+46 70 123 45 67',
      address: 'Stockholm, Sweden',
      photo: null,
      visibleExtra: [],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>DevOps engineer focused on reliability and delivery speed, running infrastructure for services handling millions of daily requests.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'DevOps Engineer', subheading: 'Polarstack', location: 'Stockholm, Sweden', start: '2020', end: '', description: bullets('Cut deployment failures by 60% by rebuilding the CI/CD pipeline.', 'Run on-call rotation for a 99.95% uptime SLA.') },
          { id: 'e2', heading: 'Systems Engineer', subheading: 'Baltic Cloud', location: 'Gothenburg, Sweden', start: '2017', end: '2020', description: bullets('Migrated on-prem workloads to Kubernetes on AWS.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.Sc. Computer Engineering', subheading: 'KTH Royal Institute of Technology', location: 'Stockholm, Sweden', start: '2012', end: '2017', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Observability'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Swedish', 'English'] },
    ],
  },

  aster: {
    basics: {
      name: 'Camille Dubois',
      title: 'Graphic Designer',
      email: 'camille.dubois@email.com',
      phone: '+33 6 12 34 56 78',
      address: 'Lyon, France',
      linkedin: 'linkedin.com/in/camille-dubois',
      photo: null,
      visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Graphic designer with five years across branding and editorial design for lifestyle and hospitality clients.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Graphic Designer', subheading: 'Atelier Rhône', location: 'Lyon, France', start: '2021', end: '', description: bullets('Led rebrand for a regional hotel group across 12 properties.', 'Design print and digital campaigns for seasonal launches.') },
          { id: 'e2', heading: 'Junior Designer', subheading: 'Maison Verte', location: 'Lyon, France', start: '2019', end: '2021', description: bullets('Produced packaging design for a line of 20+ retail products.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.A. Graphic Design', subheading: 'École de Condé', location: 'Lyon, France', start: '2016', end: '2019', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Adobe Creative Suite', 'Branding', 'Typography', 'Print Design', 'Art Direction'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['French', 'English'] },
    ],
  },

  birch: {
    basics: {
      name: 'Amara Johnson',
      title: 'Corporate Counsel',
      email: 'amara.johnson@email.com',
      phone: '+1 202 555 4467',
      address: 'Washington, DC',
      photo: null,
      visibleExtra: [],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Corporate counsel with six years advising on commercial contracts, compliance, and vendor risk for a mid-size technology company.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Corporate Counsel', subheading: 'Ashford Technologies', location: 'Washington, DC', start: '2021', end: '', description: bullets('Negotiate enterprise vendor and customer contracts.', 'Built the company’s first data-privacy compliance program.') },
          { id: 'e2', heading: 'Associate Attorney', subheading: 'Prescott & Lane LLP', location: 'Washington, DC', start: '2017', end: '2021', description: bullets('Advised clients on employment and commercial litigation matters.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'J.D.', subheading: 'Georgetown University Law Center', location: 'Washington, DC', start: '2014', end: '2017', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Contract Negotiation', 'Compliance', 'Data Privacy', 'Risk Management', 'Legal Research'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English'] },
    ],
  },

  cedar: {
    basics: {
      name: 'Thomas Berg',
      title: 'Customer Success Manager',
      email: 'thomas.berg@email.com',
      phone: '+1 720 555 3345',
      address: 'Denver, CO',
      linkedin: 'linkedin.com/in/thomas-berg',
      photo: null,
      visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Customer success manager with five years driving retention and expansion for enterprise SaaS accounts.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Customer Success Manager', subheading: 'Summit Software', location: 'Denver, CO', start: '2021', end: '', description: bullets('Manage a $4M portfolio of enterprise accounts with 96% net retention.', 'Built the onboarding playbook adopted across the CS team.') },
          { id: 'e2', heading: 'Account Manager', subheading: 'Highline Tech', location: 'Denver, CO', start: '2018', end: '2021', description: bullets('Grew accounts through upsell, averaging 22% annual expansion.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.A. Communications', subheading: 'University of Colorado Boulder', location: 'Boulder, CO', start: '2014', end: '2018', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Account Management', 'Renewals', 'Onboarding', 'Salesforce', 'Customer Advocacy'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Norwegian'] },
    ],
  },

  slate: {
    basics: {
      name: 'Benjamin Foster',
      title: 'Financial Analyst',
      email: 'benjamin.foster@email.com',
      phone: '+1 617 555 9021',
      address: 'Boston, MA',
      photo: null,
      visibleExtra: [],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Financial analyst with strong experience managing multi-million dollar budgets and building reporting used by senior leadership.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Financial Analyst', subheading: 'GEO Inc.', location: 'Boston, MA', start: '04/2018', end: '', description: bullets('Created budgets and reduced labor and material costs by 15%.', 'Generated financial reports on completed projects with positive results.') },
          { id: 'e2', heading: 'Financial Analyst', subheading: 'Sisco Enterprises', location: 'Boston, MA', start: '09/2014', end: '03/2018', description: bullets('Prepared cash flow analysis, annual budgets, and revenue projections.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.S. Finance', subheading: 'Boston University', location: 'Boston, MA', start: '2010', end: '2014', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Financial Modeling', 'Forecasting', 'Budget Management', 'Excel', 'Variance Analysis'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English'] },
    ],
  },

  ivy: {
    basics: {
      name: 'Charlotte Bishop',
      title: 'Executive Assistant',
      email: 'charlotte.bishop@email.com',
      phone: '+1 646 555 2298',
      address: 'New York, NY',
      photo: null,
      visibleExtra: [],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Executive assistant with seven years supporting C-suite leaders at fast-moving companies, from calendar strategy to board-meeting logistics.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Executive Assistant to the CEO', subheading: 'Harlow Capital', location: 'New York, NY', start: '2020', end: '', description: bullets('Manage complex scheduling across four time zones.', 'Coordinate quarterly board meetings and investor communications.') },
          { id: 'e2', heading: 'Executive Assistant', subheading: 'Brookline Partners', location: 'New York, NY', start: '2016', end: '2020', description: bullets('Supported two senior partners and their client-facing schedules.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.A. Business Communications', subheading: 'Fordham University', location: 'New York, NY', start: '2012', end: '2016', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Calendar Management', 'Travel Coordination', 'Board Support', 'Confidentiality', 'Event Planning'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English'] },
    ],
  },

  presence: {
    basics: {
      name: 'Valentina Souza',
      title: 'Finance Manager',
      email: 'valentina.souza@email.com',
      phone: '+55 11 98765 4321',
      address: 'São Paulo, Brazil',
      linkedin: 'linkedin.com/in/valentina-souza',
      photo: placeholderAvatar('#1c4966'),
      visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Finance manager with seven years across budgeting, financial reporting, and business performance analysis in corporate environments.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Finance Manager', subheading: 'Natura & Co', location: 'São Paulo, Brazil', start: '2022', end: '', description: bullets('Manage monthly budgeting cycles and variance analysis for two business units.', 'Lead reporting improvements that reduced closing timelines by three days.') },
          { id: 'e2', heading: 'Senior Financial Analyst', subheading: 'Raízen', location: 'São Paulo, Brazil', start: '2019', end: '2022', description: bullets('Delivered monthly performance reports for leadership across revenue and expense lines.', 'Improved forecast models to support more accurate quarterly planning.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'MBA in Finance', subheading: 'Fundação Getulio Vargas (FGV)', location: 'São Paulo, Brazil', start: '2020', end: '2022', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Financial Planning', 'Budget Management', 'Forecasting', 'Variance Analysis', 'SAP'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Portuguese', 'English', 'Spanish'] },
    ],
  },

  portrait: {
    basics: {
      name: 'Arjun Mehta',
      title: 'Project Engineer',
      email: 'arjun.mehta@email.com',
      phone: '+91 98765 43210',
      address: 'Ahmedabad, India',
      linkedin: 'linkedin.com/in/arjun-mehta',
      photo: placeholderAvatar('#2f6fb0'),
      visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Project engineer with six years supporting industrial and infrastructure projects, with a consistent focus on quality, safety, and on-time delivery.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Project Engineer', subheading: 'Adani Infrastructure', location: 'Ahmedabad, India', start: '01/2022', end: '', description: bullets('Lead project coordination across teams for utility infrastructure upgrades.', 'Improved project tracking accuracy by standardizing reporting formats.') },
          { id: 'e2', heading: 'Mechanical Engineer', subheading: 'Larsen & Toubro', location: 'Vadodara, India', start: '07/2019', end: '12/2021', description: bullets('Delivered equipment installation support for manufacturing projects.', 'Coordinated inspections and contractor activities to reduce delays.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'Bachelor of Engineering in Mechanical Engineering', subheading: 'Gujarat Technological University', location: 'Ahmedabad, India', start: '2013', end: '2017', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Project Coordination', 'Vendor Management', 'Technical Documentation', 'Site Execution', 'Quality Assurance'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Hindi', 'Gujarati'] },
    ],
  },

  vantage: {
    basics: {
      name: 'Michael Osei',
      title: 'Marketing Director',
      email: 'michael.osei@email.com',
      phone: '+1 470 555 6612',
      address: 'Atlanta, GA',
      linkedin: 'linkedin.com/in/michael-osei',
      photo: placeholderAvatar('#3f6f6b'),
      visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Marketing director with ten years building brand and demand-generation programs for B2B software companies.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Marketing Director', subheading: 'Ferncrest Software', location: 'Atlanta, GA', start: '2020', end: '', description: bullets('Grew pipeline contribution from marketing to 45% of total bookings.', 'Lead a team of eight across brand, content, and demand generation.') },
          { id: 'e2', heading: 'Senior Marketing Manager', subheading: 'Bellhaven Tech', location: 'Atlanta, GA', start: '2016', end: '2020', description: bullets('Rebuilt the company’s positioning ahead of a Series C raise.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.A. Marketing', subheading: 'Emory University', location: 'Atlanta, GA', start: '2010', end: '2014', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Brand Strategy', 'Demand Generation', 'Team Leadership', 'Marketing Analytics', 'Positioning'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English'] },
    ],
  },

  element: {
    basics: {
      name: 'Yuki Tanaka',
      title: 'UX Researcher',
      email: 'yuki.tanaka@email.com',
      phone: '+81 90 1234 5678',
      address: 'Tokyo, Japan',
      linkedin: 'linkedin.com/in/yuki-tanaka',
      photo: placeholderAvatar('#3d2a6b'),
      visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>UX researcher with six years running qualitative and quantitative studies that shape product strategy for consumer apps.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'UX Researcher', subheading: 'Kaede Digital', location: 'Tokyo, Japan', start: '2021', end: '', description: bullets('Run a quarterly research program feeding the product roadmap.', 'Built the team’s first participant-recruitment pipeline.') },
          { id: 'e2', heading: 'Junior UX Researcher', subheading: 'Sora Labs', location: 'Osaka, Japan', start: '2018', end: '2021', description: bullets('Conducted usability testing for three major app redesigns.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.A. Human-Computer Interaction', subheading: 'University of Tokyo', location: 'Tokyo, Japan', start: '2016', end: '2018', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['User Research', 'Usability Testing', 'Survey Design', 'Data Synthesis', 'Figma'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Japanese', 'English'] },
    ],
  },

  keystone: {
    basics: {
      name: 'Patricia Alves',
      title: 'Operations Director',
      email: 'patricia.alves@email.com',
      phone: '+351 912 345 678',
      address: 'Lisbon, Portugal',
      linkedin: 'linkedin.com/in/patricia-alves',
      photo: placeholderAvatar('#5c2340'),
      visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Operations director with twelve years leading multi-site teams and process transformation programs across retail operations.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Operations Director', subheading: 'Lisboa Retail Group', location: 'Lisbon, Portugal', start: '2019', end: '', description: bullets('Oversee operations across 24 stores and a central distribution center.', 'Cut operating costs by 14% through process standardization.') },
          { id: 'e2', heading: 'Regional Operations Manager', subheading: 'Atlantic Commerce', location: 'Porto, Portugal', start: '2014', end: '2019', description: bullets('Managed regional operations for 9 retail locations.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.B.A.', subheading: 'Nova School of Business and Economics', location: 'Lisbon, Portugal', start: '2011', end: '2013', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Operations Management', 'Process Improvement', 'Team Leadership', 'P&L Management', 'Retail Strategy'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Portuguese', 'English', 'Spanish'] },
    ],
  },

  atelier: {
    basics: {
      name: 'Simone Laurent', title: 'Creative Director', email: 'simone.laurent@email.com', phone: '+33 6 45 12 78 90',
      address: 'Paris, France', linkedin: 'linkedin.com/in/simone-laurent', photo: null, visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Creative director with eleven years leading brand and campaign work for fashion and lifestyle clients across Europe.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Creative Director', subheading: 'Maison Lumière', location: 'Paris, France', start: '2020', end: '', description: bullets('Direct creative output across five concurrent fashion accounts.', 'Grew the studio from 6 to 18 people over three years.') },
          { id: 'e2', heading: 'Senior Art Director', subheading: 'Studio Belleville', location: 'Paris, France', start: '2016', end: '2020', description: bullets('Led the visual identity relaunch for a national retail chain.', 'Managed a team of five designers across print and digital.') },
          { id: 'e3', heading: 'Art Director', subheading: 'Agence Nord', location: 'Lille, France', start: '2013', end: '2016', description: bullets('Produced seasonal campaign concepts for three retail clients.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.A. Visual Communication', subheading: 'École des Arts Décoratifs', location: 'Paris, France', start: '2009', end: '2011', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Creative Direction', 'Brand Strategy', 'Art Direction', 'Team Leadership', 'Campaign Development'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['French', 'English', 'Italian'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Adobe Certified Expert', 'Brand Leadership Program (INSEAD)'] },
    ],
  },

  quartz: {
    basics: {
      name: 'Henrik Larsson', title: 'Operations Manager', email: 'henrik.larsson@email.com', phone: '+46 70 234 56 78',
      address: 'Gothenburg, Sweden', linkedin: 'linkedin.com/in/henrik-larsson', photo: placeholderAvatar('#1c4966'), visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Operations manager with nine years driving efficiency programs across manufacturing and logistics operations.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Operations Manager', subheading: 'Volvo Logistics', location: 'Gothenburg, Sweden', start: '2021', end: '', description: bullets('Manage daily operations across two distribution centers.', 'Reduced order-fulfillment time by 21% through process redesign.') },
          { id: 'e2', heading: 'Operations Supervisor', subheading: 'Nordic Manufacturing', location: 'Gothenburg, Sweden', start: '2017', end: '2021', description: bullets('Supervised a 40-person production floor across two shifts.', 'Implemented lean manufacturing practices cutting waste by 15%.') },
          { id: 'e3', heading: 'Production Coordinator', subheading: 'Nordic Manufacturing', location: 'Gothenburg, Sweden', start: '2014', end: '2017', description: bullets('Coordinated scheduling and materials planning for the main line.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.S. Industrial Engineering', subheading: 'Chalmers University of Technology', location: 'Gothenburg, Sweden', start: '2010', end: '2014', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Lean Manufacturing', 'Supply Chain', 'Team Leadership', 'Process Improvement', 'Six Sigma'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Swedish', 'English'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Lean Six Sigma Black Belt', 'PMP Certification'] },
    ],
  },

  lumen: {
    basics: {
      name: 'Bianca Ferreira', title: 'Event & Experience Planner', email: 'bianca.ferreira@email.com', phone: '+351 936 123 456',
      address: 'Porto, Portugal', linkedin: 'linkedin.com/in/bianca-ferreira', photo: null, visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Event planner with eight years producing corporate conferences, product launches, and brand activations across Southern Europe.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Senior Event Planner', subheading: 'Porto Experiences', location: 'Porto, Portugal', start: '2020', end: '', description: bullets('Produce 30+ corporate events annually with budgets up to €500K.', 'Manage a network of 60 vendors across Portugal and Spain.') },
          { id: 'e2', heading: 'Event Planner', subheading: 'Celebra Eventos', location: 'Lisbon, Portugal', start: '2017', end: '2020', description: bullets('Coordinated logistics for product launches and brand activations.', 'Built the agency’s vendor management system, still in use today.') },
          { id: 'e3', heading: 'Event Coordinator', subheading: 'Celebra Eventos', location: 'Lisbon, Portugal', start: '2015', end: '2017', description: bullets('Supported on-site execution for weddings and corporate events.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.A. Hospitality Management', subheading: 'Instituto Superior de Gestão', location: 'Lisbon, Portugal', start: '2011', end: '2015', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Event Production', 'Vendor Management', 'Budgeting', 'Client Relations', 'Logistics'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Portuguese', 'English', 'Spanish'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Certified Meeting Professional (CMP)'] },
    ],
  },

  granite: {
    basics: {
      name: 'Robert Chen', title: 'Senior Management Consultant', email: 'robert.chen@email.com', phone: '+1 312 555 7841',
      address: 'Chicago, IL', linkedin: 'linkedin.com/in/robert-chen', photo: placeholderAvatar('#3f4b54'), visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Management consultant with twelve years advising Fortune 500 clients on operations strategy and organizational transformation.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Senior Consultant', subheading: 'Meridian Strategy Group', location: 'Chicago, IL', start: '2019', end: '', description: bullets('Lead engagement teams of 4-6 on operations strategy projects.', 'Delivered a supply chain redesign saving a client $18M annually.') },
          { id: 'e2', heading: 'Consultant', subheading: 'Meridian Strategy Group', location: 'Chicago, IL', start: '2015', end: '2019', description: bullets('Supported due diligence for six private equity transactions.', 'Built the firm’s standard operating model framework.') },
          { id: 'e3', heading: 'Business Analyst', subheading: 'Harrow Consulting', location: 'Chicago, IL', start: '2012', end: '2015', description: bullets('Analyzed client operations data to identify cost-saving opportunities.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.B.A.', subheading: 'University of Chicago Booth School of Business', location: 'Chicago, IL', start: '2010', end: '2012', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Operations Strategy', 'Due Diligence', 'Financial Modeling', 'Change Management', 'Stakeholder Management'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Mandarin'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Certified Management Consultant (CMC)'] },
    ],
  },

  orchid: {
    basics: {
      name: 'Ana Beatriz Costa', title: 'Content Strategist', email: 'ana.costa@email.com', phone: '+55 21 98765 1234',
      address: 'Rio de Janeiro, Brazil', linkedin: 'linkedin.com/in/ana-costa', photo: null, visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Content strategist with seven years building editorial and social content programs for consumer brands.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Content Strategist', subheading: 'Copacabana Studio', location: 'Rio de Janeiro, Brazil', start: '2021', end: '', description: bullets('Own the content calendar across five brand accounts.', 'Grew combined social following by 65% in eighteen months.') },
          { id: 'e2', heading: 'Content Producer', subheading: 'Ipanema Media', location: 'Rio de Janeiro, Brazil', start: '2018', end: '2021', description: bullets('Produced weekly editorial content for three lifestyle brands.') },
          { id: 'e3', heading: 'Junior Copywriter', subheading: 'Ipanema Media', location: 'Rio de Janeiro, Brazil', start: '2016', end: '2018', description: bullets('Wrote copy for social campaigns and email newsletters.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.A. Communications', subheading: 'Pontifícia Universidade Católica do Rio de Janeiro', location: 'Rio de Janeiro, Brazil', start: '2012', end: '2016', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Content Strategy', 'Copywriting', 'Social Media', 'Editorial Planning', 'SEO'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Portuguese', 'English', 'Spanish'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['HubSpot Content Marketing Certification'] },
    ],
  },

  basalt: {
    basics: {
      name: 'David Whitfield', title: 'Regional Sales Director', email: 'david.whitfield@email.com', phone: '+1 214 555 3392',
      address: 'Dallas, TX', linkedin: 'linkedin.com/in/david-whitfield', photo: placeholderAvatar('#000000'), visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Regional sales director with thirteen years leading enterprise sales teams for industrial equipment manufacturers.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Regional Sales Director', subheading: 'Lonestar Industrial', location: 'Dallas, TX', start: '2018', end: '', description: bullets('Lead a 12-person sales team covering the South-Central region.', 'Grew regional revenue from $22M to $41M over five years.') },
          { id: 'e2', heading: 'Senior Sales Manager', subheading: 'Lonestar Industrial', location: 'Dallas, TX', start: '2013', end: '2018', description: bullets('Managed key accounts representing $9M in annual revenue.') },
          { id: 'e3', heading: 'Territory Sales Manager', subheading: 'Permian Equipment Co.', location: 'Midland, TX', start: '2010', end: '2013', description: bullets('Built the West Texas territory from scratch to $4M in annual sales.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.B.A.', subheading: 'Texas A&M University', location: 'College Station, TX', start: '2006', end: '2010', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Enterprise Sales', 'Team Leadership', 'Key Account Management', 'Sales Forecasting', 'Negotiation'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Spanish'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Certified Sales Leadership Professional'] },
    ],
  },

  cobalt: {
    basics: {
      name: 'Fatima Al-Sayed', title: 'Cloud Solutions Architect', email: 'fatima.alsayed@email.com', phone: '+971 50 123 4567',
      address: 'Dubai, UAE', linkedin: 'linkedin.com/in/fatima-alsayed', photo: null, visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Cloud solutions architect with nine years designing scalable infrastructure for financial services and telecom clients.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Cloud Solutions Architect', subheading: 'Emirates Digital', location: 'Dubai, UAE', start: '2020', end: '', description: bullets('Design multi-region cloud architectures for banking clients.', 'Led migration of a core banking platform to AWS with zero downtime.') },
          { id: 'e2', heading: 'Cloud Engineer', subheading: 'Gulf Technology Partners', location: 'Dubai, UAE', start: '2017', end: '2020', description: bullets('Built infrastructure-as-code pipelines adopted across 8 teams.') },
          { id: 'e3', heading: 'Systems Engineer', subheading: 'Gulf Technology Partners', location: 'Dubai, UAE', start: '2015', end: '2017', description: bullets('Maintained on-prem infrastructure for enterprise clients.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.S. Computer Engineering', subheading: 'American University of Sharjah', location: 'Sharjah, UAE', start: '2011', end: '2015', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['AWS', 'Cloud Architecture', 'Terraform', 'Kubernetes', 'Security Compliance'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Arabic', 'English'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['AWS Certified Solutions Architect – Professional', 'CISSP'] },
    ],
  },

  saffron: {
    basics: {
      name: 'Priya Chandrasekaran', title: 'Brand Manager', email: 'priya.c@email.com', phone: '+91 98765 12340',
      address: 'Mumbai, India', linkedin: 'linkedin.com/in/priya-c', photo: placeholderAvatar('#c23b83'), visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Brand manager with eight years growing consumer packaged goods brands across South Asian markets.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Brand Manager', subheading: 'Sundar Consumer Goods', location: 'Mumbai, India', start: '2021', end: '', description: bullets('Manage a portfolio of three brands worth ₹450 crore in annual revenue.', 'Led a rebrand that grew market share by 6 points in one year.') },
          { id: 'e2', heading: 'Assistant Brand Manager', subheading: 'Sundar Consumer Goods', location: 'Mumbai, India', start: '2018', end: '2021', description: bullets('Managed regional marketing campaigns across 4 states.') },
          { id: 'e3', heading: 'Marketing Executive', subheading: 'Nilgiri Foods', location: 'Bangalore, India', start: '2016', end: '2018', description: bullets('Supported product launches and retail activation programs.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.B.A. Marketing', subheading: 'Indian Institute of Management, Ahmedabad', location: 'Ahmedabad, India', start: '2014', end: '2016', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Brand Management', 'Market Research', 'P&L Ownership', 'Campaign Strategy', 'Retail Marketing'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Hindi', 'Tamil'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Brand Management Certification (Kellogg)'] },
    ],
  },

  sequoia: {
    basics: {
      name: 'Margaret O’Sullivan', title: 'VP of Operations', email: 'margaret.osullivan@email.com', phone: '+353 87 123 4567',
      address: 'Dublin, Ireland', linkedin: 'linkedin.com/in/margaret-osullivan', photo: null, visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Operations executive with fifteen years leading multi-site operations for consumer goods and logistics companies.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'VP of Operations', subheading: 'Emerald Logistics Group', location: 'Dublin, Ireland', start: '2018', end: '', description: bullets('Oversee operations across 14 facilities in Ireland and the UK.', 'Cut operating costs by 17% through a company-wide efficiency program.') },
          { id: 'e2', heading: 'Director of Operations', subheading: 'Emerald Logistics Group', location: 'Dublin, Ireland', start: '2013', end: '2018', description: bullets('Managed operations for the company’s five largest distribution centers.') },
          { id: 'e3', heading: 'Operations Manager', subheading: 'Shannon Freight Services', location: 'Limerick, Ireland', start: '2009', end: '2013', description: bullets('Managed daily operations for a regional freight hub.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.B.A.', subheading: 'Trinity College Dublin', location: 'Dublin, Ireland', start: '2007', end: '2009', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Operations Strategy', 'P&L Management', 'Supply Chain', 'Team Leadership', 'Continuous Improvement'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Irish'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Lean Six Sigma Black Belt'] },
    ],
  },

  marlow: {
    basics: {
      name: 'Diego Fernández', title: 'Art Director', email: 'diego.fernandez@email.com', phone: '+34 611 234 567',
      address: 'Barcelona, Spain', linkedin: 'linkedin.com/in/diego-fernandez', photo: placeholderAvatar('#3d2a6b'), visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Art director with ten years shaping visual identities for music, entertainment, and hospitality brands.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Art Director', subheading: 'Estudio Raval', location: 'Barcelona, Spain', start: '2019', end: '', description: bullets('Direct visual identity work for music festivals and hospitality brands.', 'Managed a creative team of six across branding and motion design.') },
          { id: 'e2', heading: 'Senior Designer', subheading: 'Estudio Raval', location: 'Barcelona, Spain', start: '2015', end: '2019', description: bullets('Designed brand identities for over 20 clients.') },
          { id: 'e3', heading: 'Graphic Designer', subheading: 'Taller Gràfic', location: 'Barcelona, Spain', start: '2013', end: '2015', description: bullets('Produced print and packaging design for local businesses.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.A. Graphic Design', subheading: 'Elisava Barcelona School of Design', location: 'Barcelona, Spain', start: '2009', end: '2013', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Art Direction', 'Brand Identity', 'Typography', 'Motion Design', 'Adobe Creative Suite'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Spanish', 'Catalan', 'English'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Adobe Certified Expert'] },
    ],
  },

  onyx: {
    basics: {
      name: 'Jonathan Reeves', title: 'General Counsel', email: 'jonathan.reeves@email.com', phone: '+1 617 555 8823',
      address: 'Boston, MA', linkedin: 'linkedin.com/in/jonathan-reeves', photo: null, visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>General counsel with fourteen years advising technology companies on corporate governance, M&A, and regulatory compliance.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'General Counsel', subheading: 'Beacon Robotics', location: 'Boston, MA', start: '2019', end: '', description: bullets('Lead a legal team of five supporting a 400-person organization.', 'Closed two acquisitions totaling $80M in combined value.') },
          { id: 'e2', heading: 'Deputy General Counsel', subheading: 'Beacon Robotics', location: 'Boston, MA', start: '2015', end: '2019', description: bullets('Managed commercial contracts and IP strategy.') },
          { id: 'e3', heading: 'Corporate Attorney', subheading: 'Whitfield & Marsh LLP', location: 'Boston, MA', start: '2011', end: '2015', description: bullets('Advised technology clients on financing and M&A transactions.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'J.D.', subheading: 'Boston University School of Law', location: 'Boston, MA', start: '2008', end: '2011', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Corporate Governance', 'M&A', 'IP Strategy', 'Regulatory Compliance', 'Contract Negotiation'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Massachusetts Bar Admission'] },
    ],
  },

  flint: {
    basics: {
      name: 'Chloe Bergström', title: 'Senior Product Designer', email: 'chloe.bergstrom@email.com', phone: '+46 73 456 78 90',
      address: 'Malmö, Sweden', linkedin: 'linkedin.com/in/chloe-bergstrom', photo: placeholderAvatar('#2f6fb0'), visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Product designer with eight years designing consumer fintech products used by millions across the Nordics.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Senior Product Designer', subheading: 'Öresund Bank', location: 'Malmö, Sweden', start: '2021', end: '', description: bullets('Lead design for the bank’s mobile app used by 1.8M customers.', 'Introduced a design system adopted across four product teams.') },
          { id: 'e2', heading: 'Product Designer', subheading: 'Nordkredit', location: 'Copenhagen, Denmark', start: '2018', end: '2021', description: bullets('Designed onboarding flows that lifted activation by 24%.') },
          { id: 'e3', heading: 'UI Designer', subheading: 'Nordkredit', location: 'Copenhagen, Denmark', start: '2016', end: '2018', description: bullets('Designed interfaces for the company’s internal tools.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.A. Interaction Design', subheading: 'Malmö University', location: 'Malmö, Sweden', start: '2012', end: '2016', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Product Design', 'Design Systems', 'User Research', 'Figma', 'Prototyping'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Swedish', 'Danish', 'English'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Nielsen Norman Group UX Certification'] },
    ],
  },

  skyline: {
    basics: {
      name: 'Nathaniel Brooks', title: 'Senior Architect', email: 'nathaniel.brooks@email.com', phone: '+1 212 555 4471',
      address: 'New York, NY', linkedin: 'linkedin.com/in/nathaniel-brooks', photo: null, visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Licensed architect with eleven years designing commercial and mixed-use buildings across the Northeast.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Senior Architect', subheading: 'Brooks & Halstead Architecture', location: 'New York, NY', start: '2019', end: '', description: bullets('Lead design on mixed-use developments valued at $200M+.', 'Manage a project team of eight across design and construction phases.') },
          { id: 'e2', heading: 'Project Architect', subheading: 'Meridian Design Group', location: 'New York, NY', start: '2015', end: '2019', description: bullets('Delivered three LEED-certified commercial buildings.') },
          { id: 'e3', heading: 'Architectural Designer', subheading: 'Meridian Design Group', location: 'New York, NY', start: '2013', end: '2015', description: bullets('Produced design documentation for retail and office projects.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.Arch.', subheading: 'Columbia University GSAPP', location: 'New York, NY', start: '2011', end: '2013', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Architectural Design', 'Revit', 'LEED Certification', 'Project Management', 'Construction Documentation'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Licensed Architect (NY)', 'LEED AP BD+C'] },
    ],
  },

  harbor: {
    basics: {
      name: 'Elena Petrova', title: 'Chief of Staff', email: 'elena.petrova@email.com', phone: '+1 206 555 9012',
      address: 'Seattle, WA', linkedin: 'linkedin.com/in/elena-petrova', photo: placeholderAvatar('#1c4966'), visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Chief of staff with ten years supporting executive leadership teams through scaling and strategic planning.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Chief of Staff', subheading: 'Cascadia Health', location: 'Seattle, WA', start: '2020', end: '', description: bullets('Partner with the CEO on strategic planning and board communications.', 'Lead cross-functional initiatives spanning product, ops, and finance.') },
          { id: 'e2', heading: 'Senior Manager, Strategy', subheading: 'Cascadia Health', location: 'Seattle, WA', start: '2017', end: '2020', description: bullets('Ran the company’s annual strategic planning process.') },
          { id: 'e3', heading: 'Strategy Consultant', subheading: 'Rainier Advisory', location: 'Seattle, WA', start: '2014', end: '2017', description: bullets('Advised healthcare clients on growth strategy.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.B.A.', subheading: 'University of Washington Foster School', location: 'Seattle, WA', start: '2012', end: '2014', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Strategic Planning', 'Executive Communication', 'Cross-Functional Leadership', 'Program Management', 'Board Reporting'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Russian'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Project Management Professional (PMP)'] },
    ],
  },

  crescent: {
    basics: {
      name: 'Giulia Romano', title: 'Fashion Buyer', email: 'giulia.romano@email.com', phone: '+39 340 123 4567',
      address: 'Milan, Italy', linkedin: 'linkedin.com/in/giulia-romano', photo: null, visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Fashion buyer with nine years curating seasonal collections for luxury retail across Italy and France.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Senior Buyer', subheading: 'Galleria Moda', location: 'Milan, Italy', start: '2020', end: '', description: bullets('Manage a €12M seasonal buying budget across womenswear.', 'Grew full-price sell-through rate by 14% through better assortment planning.') },
          { id: 'e2', heading: 'Buyer', subheading: 'Galleria Moda', location: 'Milan, Italy', start: '2016', end: '2020', description: bullets('Curated seasonal collections for eight boutique locations.') },
          { id: 'e3', heading: 'Assistant Buyer', subheading: 'Casa Elegante', location: 'Florence, Italy', start: '2014', end: '2016', description: bullets('Supported vendor negotiations and inventory planning.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.A. Fashion Management', subheading: 'Istituto Marangoni', location: 'Milan, Italy', start: '2010', end: '2014', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Assortment Planning', 'Vendor Negotiation', 'Trend Forecasting', 'Inventory Management', 'Retail Analytics'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Italian', 'English', 'French'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Retail Buying & Merchandising Certificate'] },
    ],
  },

  redwood: {
    basics: {
      name: 'Gregory Ashford', title: 'Managing Director', email: 'gregory.ashford@email.com', phone: '+44 20 7946 1234',
      address: 'London, UK', linkedin: 'linkedin.com/in/gregory-ashford', photo: placeholderAvatar('#5c2340'), visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Managing director with eighteen years leading investment banking teams across M&A advisory and capital markets.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Managing Director', subheading: 'Ashcombe Partners', location: 'London, UK', start: '2017', end: '', description: bullets('Lead the M&A advisory practice, closing £1.2B in deals since 2020.', 'Manage a team of 20 across analysts, associates, and vice presidents.') },
          { id: 'e2', heading: 'Director', subheading: 'Ashcombe Partners', location: 'London, UK', start: '2012', end: '2017', description: bullets('Led deal execution for mid-market M&A transactions.') },
          { id: 'e3', heading: 'Vice President', subheading: 'Blackfriars Capital', location: 'London, UK', start: '2008', end: '2012', description: bullets('Executed capital markets transactions for corporate clients.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.B.A.', subheading: 'London Business School', location: 'London, UK', start: '2006', end: '2008', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['M&A Advisory', 'Capital Markets', 'Deal Execution', 'Team Leadership', 'Financial Modeling'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'French'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Chartered Financial Analyst (CFA)'] },
    ],
  },

  zephyr: {
    basics: {
      name: 'Naledi Khumalo', title: 'Wellness Program Manager', email: 'naledi.khumalo@email.com', phone: '+27 82 123 4567',
      address: 'Cape Town, South Africa', linkedin: 'linkedin.com/in/naledi-khumalo', photo: placeholderAvatar('#0f766e'), visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Wellness program manager with seven years building employee health and wellbeing programs for large employers.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Wellness Program Manager', subheading: 'Table Mountain Health Group', location: 'Cape Town, South Africa', start: '2021', end: '', description: bullets('Run wellbeing programs for 12 corporate clients and 8,000+ employees.', 'Increased program participation by 40% through redesigned onboarding.') },
          { id: 'e2', heading: 'Wellness Coordinator', subheading: 'Table Mountain Health Group', location: 'Cape Town, South Africa', start: '2018', end: '2021', description: bullets('Coordinated on-site wellness events and health screenings.') },
          { id: 'e3', heading: 'Fitness Program Lead', subheading: 'Kloof Wellness Studio', location: 'Cape Town, South Africa', start: '2016', end: '2018', description: bullets('Designed group fitness programming for studio members.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.S. Sports Science', subheading: 'University of Cape Town', location: 'Cape Town, South Africa', start: '2012', end: '2016', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Program Management', 'Health Coaching', 'Employee Engagement', 'Event Planning', 'Data Reporting'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Zulu', 'Afrikaans'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Certified Wellness Program Coordinator'] },
    ],
  },

  vertex: {
    basics: {
      name: 'Samuel Ostrowski', title: 'Investment Analyst', email: 'samuel.ostrowski@email.com', phone: '+1 646 555 2231',
      address: 'New York, NY', linkedin: 'linkedin.com/in/samuel-ostrowski', photo: null, visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Investment analyst with six years covering technology and healthcare equities for an asset management firm.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Investment Analyst', subheading: 'Ostrow Capital Management', location: 'New York, NY', start: '2021', end: '', description: bullets('Cover a $600M technology and healthcare equity portfolio.', 'Published research driving three of the fund’s top-performing positions.') },
          { id: 'e2', heading: 'Research Associate', subheading: 'Ostrow Capital Management', location: 'New York, NY', start: '2019', end: '2021', description: bullets('Built financial models supporting portfolio manager decisions.') },
          { id: 'e3', heading: 'Investment Banking Analyst', subheading: 'Harrow & Vance', location: 'New York, NY', start: '2017', end: '2019', description: bullets('Supported M&A and capital raising transactions for tech clients.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.S. Finance', subheading: 'NYU Stern School of Business', location: 'New York, NY', start: '2013', end: '2017', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Equity Research', 'Financial Modeling', 'Valuation', 'Portfolio Analysis', 'Bloomberg Terminal'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Polish'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['CFA Level II Candidate'] },
    ],
  },

  ember: {
    basics: {
      name: 'Alexis Moreau', title: 'Social Media Director', email: 'alexis.moreau@email.com', phone: '+1 310 555 6642',
      address: 'Los Angeles, CA', linkedin: 'linkedin.com/in/alexis-moreau', photo: placeholderAvatar('#e8615f'), visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Social media director with nine years building creator-led content programs for consumer beauty and lifestyle brands.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Social Media Director', subheading: 'Lumière Beauty', location: 'Los Angeles, CA', start: '2020', end: '', description: bullets('Direct social strategy across Instagram, TikTok, and YouTube.', 'Grew combined following from 400K to 3.2M in three years.') },
          { id: 'e2', heading: 'Social Media Manager', subheading: 'Lumière Beauty', location: 'Los Angeles, CA', start: '2017', end: '2020', description: bullets('Managed the brand’s creator partnership program.') },
          { id: 'e3', heading: 'Social Media Coordinator', subheading: 'Palm & Co.', location: 'Los Angeles, CA', start: '2015', end: '2017', description: bullets('Produced daily content across the brand’s social channels.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.A. Communications', subheading: 'University of Southern California', location: 'Los Angeles, CA', start: '2011', end: '2015', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Social Strategy', 'Creator Partnerships', 'Content Production', 'Community Management', 'Analytics'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'French'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Meta Certified Digital Marketing Associate'] },
    ],
  },

  monarch: {
    basics: {
      name: 'Richard Ellsworth', title: 'Chief Financial Officer', email: 'richard.ellsworth@email.com', phone: '+1 617 555 1123',
      address: 'Boston, MA', linkedin: 'linkedin.com/in/richard-ellsworth', photo: placeholderAvatar('#1c4966'), visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Finance executive with seventeen years leading finance organizations through growth, fundraising, and M&A for technology companies.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Chief Financial Officer', subheading: 'Northstar Analytics', location: 'Boston, MA', start: '2019', end: '', description: bullets('Lead finance, FP&A, and investor relations for a 500-person company.', 'Raised $120M across two funding rounds.') },
          { id: 'e2', heading: 'VP of Finance', subheading: 'Northstar Analytics', location: 'Boston, MA', start: '2015', end: '2019', description: bullets('Built the company’s FP&A function from the ground up.') },
          { id: 'e3', heading: 'Finance Director', subheading: 'Beacon Software', location: 'Boston, MA', start: '2010', end: '2015', description: bullets('Managed financial planning and reporting for a 200-person company.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.B.A.', subheading: 'Harvard Business School', location: 'Boston, MA', start: '2008', end: '2010', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Financial Strategy', 'Fundraising', 'FP&A', 'Investor Relations', 'M&A'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Certified Public Accountant (CPA)'] },
    ],
  },

  juniper: {
    basics: {
      name: 'Freya Nilsen', title: 'Sustainability Manager', email: 'freya.nilsen@email.com', phone: '+47 912 34 567',
      address: 'Oslo, Norway', linkedin: 'linkedin.com/in/freya-nilsen', photo: null, visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Sustainability manager with eight years leading ESG strategy and reporting programs for energy sector clients.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Sustainability Manager', subheading: 'Fjord Energy', location: 'Oslo, Norway', start: '2020', end: '', description: bullets('Lead the company’s ESG strategy and annual sustainability report.', 'Reduced operational carbon footprint by 22% since 2020.') },
          { id: 'e2', heading: 'ESG Analyst', subheading: 'Fjord Energy', location: 'Oslo, Norway', start: '2017', end: '2020', description: bullets('Tracked and reported on emissions data across all facilities.') },
          { id: 'e3', heading: 'Environmental Consultant', subheading: 'Nordisk Miljø', location: 'Bergen, Norway', start: '2015', end: '2017', description: bullets('Advised clients on environmental compliance and permitting.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.S. Environmental Science', subheading: 'University of Oslo', location: 'Oslo, Norway', start: '2013', end: '2015', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['ESG Strategy', 'Sustainability Reporting', 'Carbon Accounting', 'Stakeholder Engagement', 'Regulatory Compliance'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['Norwegian', 'English'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['GRI Certified Sustainability Professional'] },
    ],
  },

  obsidian: {
    basics: {
      name: 'Marcus Kwan', title: 'Chief Technology Officer', email: 'marcus.kwan@email.com', phone: '+1 415 555 7734',
      address: 'San Francisco, CA', linkedin: 'linkedin.com/in/marcus-kwan', photo: placeholderAvatar('#000000'), visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Technology executive with sixteen years leading engineering organizations from early-stage startups through Series D scale.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Chief Technology Officer', subheading: 'Fernbank Systems', location: 'San Francisco, CA', start: '2019', end: '', description: bullets('Lead a 90-person engineering organization across five teams.', 'Scaled platform infrastructure to support 10x user growth.') },
          { id: 'e2', heading: 'VP of Engineering', subheading: 'Fernbank Systems', location: 'San Francisco, CA', start: '2015', end: '2019', description: bullets('Built the company’s engineering org from 8 to 45 people.') },
          { id: 'e3', heading: 'Engineering Manager', subheading: 'Delta Cloud', location: 'San Francisco, CA', start: '2011', end: '2015', description: bullets('Managed the platform infrastructure team.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'M.S. Computer Science', subheading: 'Stanford University', location: 'Stanford, CA', start: '2009', end: '2011', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Engineering Leadership', 'System Architecture', 'Scaling Teams', 'Cloud Infrastructure', 'Technical Strategy'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Cantonese'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['AWS Certified Solutions Architect'] },
    ],
  },

  canyon: {
    basics: {
      name: 'Isabela Marquez', title: 'Creative Producer', email: 'isabela.marquez@email.com', phone: '+1 512 555 4482',
      address: 'Austin, TX', linkedin: 'linkedin.com/in/isabela-marquez', photo: null, visibleExtra: ['linkedin'],
    },
    sections: [
      { id: 's-summary', type: 'summary', title: 'Summary', kind: 'text', content: '<p>Creative producer with seven years managing video and photo production for brand and entertainment clients.</p>' },
      {
        id: 's-exp', type: 'experience', title: 'Professional Experience', kind: 'entries',
        entries: [
          { id: 'e1', heading: 'Creative Producer', subheading: 'Lonestar Media House', location: 'Austin, TX', start: '2021', end: '', description: bullets('Produce 40+ branded video projects annually.', 'Manage production budgets averaging $150K per project.') },
          { id: 'e2', heading: 'Associate Producer', subheading: 'Lonestar Media House', location: 'Austin, TX', start: '2018', end: '2021', description: bullets('Coordinated pre-production and on-set logistics for brand shoots.') },
          { id: 'e3', heading: 'Production Assistant', subheading: 'South Congress Films', location: 'Austin, TX', start: '2017', end: '2018', description: bullets('Supported production crews across commercial video shoots.') },
        ],
      },
      { id: 's-edu', type: 'education', title: 'Education', kind: 'entries', entries: [{ id: 'ed1', heading: 'B.A. Radio-Television-Film', subheading: 'University of Texas at Austin', location: 'Austin, TX', start: '2013', end: '2017', description: '' }] },
      { id: 's-skills', type: 'skills', title: 'Skills', kind: 'tags', tags: ['Video Production', 'Budget Management', 'Vendor Coordination', 'Creative Direction', 'Post-Production'] },
      { id: 's-lang', type: 'languages', title: 'Languages', kind: 'tags', tags: ['English', 'Spanish'] },
      { id: 's-cert', type: 'certificates', title: 'Certificates', kind: 'tags', tags: ['Adobe Premiere Pro Certification'] },
    ],
  },
};
