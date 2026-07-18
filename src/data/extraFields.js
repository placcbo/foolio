export const EXTRA_FIELDS = [
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/yourname', inputType: 'url' },
  { key: 'website', label: 'Website', placeholder: 'yourwebsite.com', inputType: 'url' },
  { key: 'nationality', label: 'Nationality', placeholder: 'Nationality' },
  { key: 'dob', label: 'Date of Birth', placeholder: 'DD/MM/YYYY', inputType: 'date' },
  { key: 'visa', label: 'Visa', placeholder: 'Visa status' },
  { key: 'passportId', label: 'Passport or Id', placeholder: 'ID number' },
  { key: 'availability', label: 'Availability', placeholder: 'e.g. Immediately' },
];

export const EXTRA_FIELDS_MORE = [
  { key: 'drivingLicense', label: 'Driving License', placeholder: 'License category' },
  { key: 'maritalStatus', label: 'Marital Status', placeholder: 'Marital status' },
  { key: 'gender', label: 'Gender', placeholder: 'Gender' },
];

export const ALL_EXTRA_FIELDS = [...EXTRA_FIELDS, ...EXTRA_FIELDS_MORE];

export function getExtraFieldMeta(key) {
  return ALL_EXTRA_FIELDS.find((f) => f.key === key);
}