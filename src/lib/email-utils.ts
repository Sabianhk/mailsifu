/** Parse RFC 5322 "Name <email>" or bare "email" */
export function parseFromAddress(from: string): { name: string | null; email: string } {
  const match = from.match(/^(.+?)\s*<([^>]+)>\s*$/)
  if (match) return { name: match[1].trim() || null, email: match[2].trim().toLowerCase() }
  return { name: null, email: from.trim().toLowerCase() }
}
