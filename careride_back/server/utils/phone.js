/**
 * Normalize phone/login to DB format: digits only, US numbers as 11 digits starting with 1.
 * Handles +1 prefix, 10-digit national numbers, and duplicate leading country codes.
 */
function formatLogin(v) {
	let digits = String(v == null ? '' : v).replace(/[^0-9]/g, '');
	if (!digits) return '';

	if (digits.length > 11) {
		digits = digits.slice(-11);
	}

	if (digits.length === 10) {
		digits = '1' + digits;
	}

	return digits;
}

module.exports = { formatLogin };
