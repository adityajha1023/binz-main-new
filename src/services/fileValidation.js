export function fileError(file, { types, maxMB, label }) {
  const kind = label.replace(/^(a|an) /, '');
  if (!file) return `Choose ${label} first.`;
  if (!types.includes(file.type)) return `Choose a supported ${kind} format.`;
  if (!file.size) return `This ${kind} is empty. Choose another file.`;
  if (file.size > maxMB * 1024 * 1024) return `Choose ${label} smaller than ${maxMB} MB.`;
  return '';
}
