export function normalizeUSPhone(text: string) {
  let digits = text.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export function formatUSPhone(digits: string) {
  const a = digits.slice(0, 3);
  const b = digits.slice(3, 6);
  const c = digits.slice(6, 10);
  if (!digits) return "";
  if (digits.length < 4) return `(${a}`;
  if (digits.length < 7) return `(${a}) ${b}`;
  return `(${a}) ${b}-${c}`;
}

// stored numbers are E.164 (+14155550134). only US numbers get the pretty
// treatment — anything else passes through rather than being sliced into a
// wrong-looking US shape.
export function displayPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const isUS =
    (digits.length === 11 && digits.startsWith("1")) || digits.length === 10;
  if (!isUS) return value;
  return formatUSPhone(normalizeUSPhone(value));
}
