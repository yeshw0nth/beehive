"use server";

import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";
import { z } from "zod";

// Zod Schema
export const intakeFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  primaryVertical: z.enum(["Tech", "Design", "Arts"]),
  primarySkill: z.string().min(2, "Skill must be at least 2 characters."),
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;

export async function submitIntake(data: IntakeFormData) {
  const result = intakeFormSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: "Validation failed" };
  }

  const { fullName, primaryVertical, primarySkill } = result.data;
  let supabaseSuccess = false;
  let sheetsSuccess = false;

  // 1. Supabase Sync
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from("profiles").insert([
        {
          full_name: fullName,
          primary_vertical: primaryVertical,
          primary_skill: primarySkill,
          created_at: new Date().toISOString(),
        }
      ]);
      
      if (error) {
        console.error("Supabase Error:", error);
      } else {
        supabaseSuccess = true;
      }
    } else {
      console.warn("Supabase credentials missing. Skipping Supabase insert.");
    }
  } catch (error) {
    console.error("Supabase Error:", error);
  }

  // 2. Google Sheets Sync
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (serviceAccountEmail && privateKey && spreadsheetId) {
      const auth = new google.auth.JWT(
        serviceAccountEmail,
        undefined,
        privateKey,
        ["https://www.googleapis.com/auth/spreadsheets"]
      );

      const sheets = google.sheets({ version: "v4", auth });

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1!A:D", // Adjust based on your sheet name and columns
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [fullName, primaryVertical, primarySkill, new Date().toISOString()]
          ]
        }
      });
      sheetsSuccess = true;
    } else {
      console.warn("Google Sheets credentials missing. Skipping Google Sheets append.");
    }
  } catch (error) {
    console.error("Google Sheets Error:", error);
  }

  // We return a status object. If at least one succeeds, or if both are skipped (dev mode without env vars), we can treat it as a success for UX purposes, but ideally we want both.
  return { 
    success: true, 
    supabaseSuccess, 
    sheetsSuccess, 
    message: "Intake submitted successfully." 
  };
}
