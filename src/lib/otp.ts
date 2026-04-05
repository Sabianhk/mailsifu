/**
 * OTP extraction from email subject + body.
 * Uses ordered heuristics: keyword-context (high) → subject pattern (medium) → isolated codes (low).
 * Supports both pure-digit (123456) and alphanumeric (VT79NA) codes.
 */

// Alphanumeric OTP pattern: 4-8 chars, must contain at least one digit (lookahead)
const CODE_PATTERN = '(?=[A-Z]*\\d)[A-Z0-9]{4,8}'
const CODE_RE = new RegExp(`\\b(${CODE_PATTERN})\\b`, 'i')

const BODY_KEYWORD_PATTERNS: RegExp[] = [
  // "code is 123456" / "code is VT79NA", "OTP: 123456", "token: 123456"
  new RegExp(`(?:otp|code|token|pin|passcode|verification|auth(?:entication)?|one.?time)[\\s\\S]{0,60}?\\b(${CODE_PATTERN})\\b`, 'i'),
  // "123456 is your code / otp / token"
  new RegExp(`\\b(${CODE_PATTERN})\\b[\\s\\S]{0,30}?(?:is your|is the|as your)[\\s\\S]{0,20}?(?:code|otp|token|pin)`, 'i'),
  // "enter 123456" / "use 123456"
  new RegExp(`(?:enter|use|submit)[\\s\\S]{0,20}?\\b(${CODE_PATTERN})\\b`, 'i'),
]

const SUBJECT_PATTERNS: RegExp[] = [
  // "code: 123456", "OTP VT79NA", etc.
  new RegExp(`(?:otp|code|token|pin|verification)[^A-Z0-9]{0,12}(${CODE_PATTERN})`, 'i'),
  // standalone code in subject
  CODE_RE,
]

export interface OtpResult {
  otpCode: string | null
  confidence: string | null
}

/** Strip HTML tags to get plain text for OTP extraction */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim()
}

export function extractOtp(subject: string, bodyText: string | null, bodyHtml?: string | null): OtpResult {
  // Build text to search: prefer bodyText, fall back to stripped HTML
  const text = bodyText?.trim() || (bodyHtml ? stripHtml(bodyHtml) : null)

  // 1. Keyword context in body (high confidence)
  if (text) {
    for (const pattern of BODY_KEYWORD_PATTERNS) {
      const match = text.match(pattern)
      if (match?.[1]) return { otpCode: match[1], confidence: 'high' }
    }
  }

  // 2. Subject patterns (medium confidence)
  for (const pattern of SUBJECT_PATTERNS) {
    const match = subject.match(pattern)
    if (match?.[1]) return { otpCode: match[1], confidence: 'medium' }
  }

  // 3. Fallback: any isolated code in body (low confidence)
  if (text) {
    const match = text.match(CODE_RE)
    if (match?.[1]) return { otpCode: match[1], confidence: 'low' }
  }

  return { otpCode: null, confidence: null }
}
