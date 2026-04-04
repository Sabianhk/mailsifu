/**
 * OTP extraction from email subject + body.
 * Uses ordered heuristics: keyword-context (high) → subject pattern (medium) → isolated digits (low).
 */

const BODY_KEYWORD_PATTERNS: RegExp[] = [
  // "code is 123456", "OTP: 123456", "token: 123456"
  /(?:otp|code|token|pin|passcode|verification|auth(?:entication)?|one.?time)[^\d]{0,25}(\d{4,8})/i,
  // "123456 is your code / otp / token"
  /(\d{4,8})[^\d]{0,20}(?:is your|is the|as your)[^\d]{0,20}(?:code|otp|token|pin)/i,
  // "enter 123456" / "use 123456"
  /(?:enter|use|submit)[^\d]{0,12}(\d{4,8})/i,
]

const SUBJECT_PATTERNS: RegExp[] = [
  // "code: 123456", "OTP 123456", etc.
  /(?:otp|code|token|pin|verification)[^\d]{0,12}(\d{4,8})/i,
  // standalone digit sequence in subject
  /\b(\d{4,8})\b/,
]

export interface OtpResult {
  otpCode: string | null
  confidence: string | null
}

export function extractOtp(subject: string, bodyText: string | null): OtpResult {
  // 1. Keyword context in body (high confidence)
  if (bodyText) {
    for (const pattern of BODY_KEYWORD_PATTERNS) {
      const match = bodyText.match(pattern)
      if (match?.[1]) return { otpCode: match[1], confidence: 'high' }
    }
  }

  // 2. Subject patterns (medium confidence)
  for (const pattern of SUBJECT_PATTERNS) {
    const match = subject.match(pattern)
    if (match?.[1]) return { otpCode: match[1], confidence: 'medium' }
  }

  // 3. Fallback: any isolated digit run in body (low confidence)
  if (bodyText) {
    const match = bodyText.match(/\b(\d{4,8})\b/)
    if (match?.[1]) return { otpCode: match[1], confidence: 'low' }
  }

  return { otpCode: null, confidence: null }
}
