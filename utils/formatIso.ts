export const formatToISO = (d: Date | undefined) => {
  if (!d) return new Date().toISOString();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};
