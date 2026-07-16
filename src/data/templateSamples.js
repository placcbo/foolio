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
};
