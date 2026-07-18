import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listNewsletters from "./tools/list-newsletters";
import getNewsletter from "./tools/get-newsletter";
import getMyProfile from "./tools/get-my-profile";
import listMyPageVisits from "./tools/list-my-page-visits";

// The OAuth issuer must be the direct Supabase host (SUPABASE_URL is rewritten
// to the `.lovable.cloud` proxy on publish, which mcp-js rejects). The project
// ref is inlined at build time via `import.meta.env.VITE_SUPABASE_PROJECT_ID`.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "dibya-mishra-mcp",
  title: "Dibya Ranjan Mishra — Site MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Dibya Ranjan Mishra portfolio site. Read published newsletter issues, look up a newsletter by slug, fetch the signed-in user's profile, and list the signed-in user's recent page visits. All tools act as the authenticated user via Supabase RLS.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listNewsletters, getNewsletter, getMyProfile, listMyPageVisits],
});
