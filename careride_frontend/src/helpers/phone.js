/**
 * Match backend server/utils/phone.js formatLogin for US login numbers.
 */
export function formatLogin(v) {
  let digits = String(v == null ? "" : v).replace(/[^0-9]/g, "");
  if (!digits) return "";

  if (digits.length > 11) {
    digits = digits.slice(-11);
  }

  if (digits.length === 10) {
    digits = "1" + digits;
  }

  return digits;
}
