"use server";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function updateTriageStatus(rollNumber: string, status: string) {
  if (!supabaseUrl || !supabaseKey) {
    return { success: false, error: "Supabase credentials missing" };
  }

  try {
    const { error } = await supabase
      .from('submissions')
      .update({ triage_status: status })
      .eq('roll_number', rollNumber);

    if (error) {
      console.error("Error updating triage status:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}
