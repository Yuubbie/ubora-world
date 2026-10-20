export const SITE_URL = "https://uboraworld.com.ng";
export const SITE_NAME = "Ubora World";
export const SITE_TAGLINE =
  "NOUN CBT practice, past questions and course summaries for National Open University of Nigeria students.";
export const SITE_DESCRIPTION =
  "Ubora World is CBT practice, past questions, and course summaries for NOUN students. Revise GST, Criminology, Economics, Political Science and more. 10-day free trial. Fees and TMAs stay on the official NOUN portals.";

export function courseSlug(code: string) {
  return code.replace(/[\s_-]/g, "").toLowerCase();
}
