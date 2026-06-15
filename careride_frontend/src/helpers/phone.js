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

export function formatLoginDisplay(v) {
  const digits = formatLogin(v);
  if (!digits) return "";

  const national =
    digits.length === 11 && digits.startsWith("1")
      ? digits.slice(1)
      : digits.slice(-10);

  if (national.length !== 10) return "";

  return `+1 ${national}`;
}

export function pasteAsLoginDisplay(evt) {
  const text = evt.clipboardData?.getData("text") || "";
  const formatted = formatLoginDisplay(text);
  if (!formatted) return null;
  evt.preventDefault();
  return formatted;
}
