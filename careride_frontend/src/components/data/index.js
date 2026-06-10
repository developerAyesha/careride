// cartype: 1=Wheelchair, 2=Gurney (from backend car.js model)
export const carTypes = [
  { id: 1, label: "Wheelchair" },
  { id: 2, label: "Gurney/Stretcher" },
];

// status: 0-new, 1=accepted, 3=pick up, 4=work, 10-complete, 20-cancel, 21-reject, 22-expired, 25-cancel by client, 26-cancel vendor, 27-cancel admin
export const orderStatuses = [
  { id: 0,  label: "New",                  class: "badge-soft-info" },
  { id: 1,  label: "Accepted",             class: "badge-soft-primary" },
  { id: 3,  label: "Pick Up",              class: "badge-soft-warning" },
  { id: 4,  label: "In Work",              class: "badge-soft-warning" },
  { id: 10, label: "Complete",             class: "badge-soft-success" },
  { id: 20, label: "Cancelled",            class: "badge-soft-danger" },
  { id: 21, label: "Rejected",             class: "badge-soft-danger" },
  { id: 22, label: "Expired",              class: "badge-soft-secondary" },
  { id: 25, label: "Cancelled by Client",  class: "badge-soft-danger" },
  { id: 26, label: "Cancelled by Vendor",  class: "badge-soft-danger" },
  { id: 27, label: "Cancelled by Admin",   class: "badge-soft-danger" },
];

// vendor status: 0-new, 1-approved, 2-declined
export const vendorStatuses = [
  { id: 0, label: "New" },
  { id: 1, label: "Approved" },
  { id: 2, label: "Declined" },
];

// escort: 1=Spouse, 2=Son, 3=Daughter, 4=Other
export const escortTypes = [
  { id: 0, label: "No escort" },
  { id: 1, label: "Spouse" },
  { id: 2, label: "Son" },
  { id: 3, label: "Daughter" },
  { id: 4, label: "Other" },
];

// gender: m, f  — uses "key" field (not "id") per multiselect track-by and validation
export const genderTypes = [
  { key: "m", label: "Male" },
  { key: "f", label: "Female" },
];

// overtime time slider steps: 0:00 - 24:00
export const timeline = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  name: `${String(i).padStart(2, "0")}:00`,
}));

// Google Maps Autocomplete fields
export const mapFields = [
  "address_components",
  "formatted_address",
  "geometry",
  "name",
  "utc_offset_minutes",
];
