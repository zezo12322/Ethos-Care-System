export function buildCasePdfFilename(
  applicantName: string,
  shortId: string,
): string {
  const safeName = applicantName
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .slice(0, 60);

  return `case-${shortId}-${safeName || 'report'}.pdf`;
}
