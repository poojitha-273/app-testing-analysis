import { createClient } from "@supabase/supabase-js";

// Base URL clean up to ensure no duplicated /rest/v1/ in request paths
const RAW_SUPABASE_URL = "https://efuqtcaefocuvynmhwyg.supabase.co/rest/v1/";
const SUPABASE_PUBLIC_KEY = "sb_publishable_9t-u_-YkqFWJvU5LgEIfyQ_BjMlHSqj";

// Strip /rest/v1/ or trailing slashes to format as standard Supabase project origin host
const SUPABASE_URL = RAW_SUPABASE_URL.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
export { SUPABASE_URL, SUPABASE_PUBLIC_KEY };

