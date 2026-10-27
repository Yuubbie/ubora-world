export function isSensitiveInquiryContent(content: string) {
  return (
    /PASSWORD RESET/i.test(content) ||
    /\/reset-password\?token=/i.test(content) ||
    /reset link was removed from chat/i.test(content)
  );
}

export function sanitizeInquiryContent(content: string) {
  if (!isSensitiveInquiryContent(content)) return content;
  return "Password reset was requested. The reset link was removed from chat for security.";
}
