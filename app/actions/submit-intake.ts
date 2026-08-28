"use server";

import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";
import { intakeFormSchema, IntakeFormData } from "@/lib/schema";

export async function submitIntake(data: IntakeFormData) {
  const result = intakeFormSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: "Validation failed" };
  }

  const payload = result.data;
  let supabaseSuccess = false;
  let sheetsSuccess = false;

  // 1. Supabase Sync (Targeting 'submissions' table)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
    
    if (supabaseUrl !== "https://placeholder.supabase.co") {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from("submissions").insert([
        {
          full_name: payload.fullName,
          roll_number: payload.rollNumber,
          branch: payload.branch,
          whatsapp_number: payload.whatsappNumber,
          primary_vertical: payload.primaryVertical,
          core_skill: payload.coreSkill,
          proficiency_level: payload.proficiencyLevel,
          portfolio_url: payload.portfolioUrl,
          desired_cross_skill: payload.desiredCrossSkill,
          sprint_agreement: payload.sprintAgreement,
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

  // 2. Google Sheets Sync (Defensive)
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "placeholder@example.com";
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "placeholder-key").replace(/\\n/g, "\n");
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || "placeholder-id";

    if (serviceAccountEmail !== "placeholder@example.com") {
      const auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
      });

      const sheets = google.sheets({ version: "v4", auth });

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1!A:K",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [
              payload.fullName, 
              payload.rollNumber, 
              payload.branch,
              payload.whatsappNumber,
              payload.primaryVertical, 
              payload.coreSkill, 
              payload.proficiencyLevel,
              payload.portfolioUrl,
              payload.desiredCrossSkill,
              payload.sprintAgreement ? "Yes" : "No",
              new Date().toISOString()
            ]
          ]
        }
      });
      sheetsSuccess = true;
    } else {
      console.warn("Google Sheets credentials missing. Skipping Google Sheets append.");
    }
  } catch (error) {
    // We catch and log so it doesn't throw a fatal 500 error if Sheets fails
    console.warn("Google Sheets Sync Failed:", error);
  }

  // Return success as long as we validated, even if env vars are missing (for dev), or if supabase succeeded
  return { 
    success: true, 
    supabaseSuccess, 
    sheetsSuccess, 
    message: "Intake submitted successfully." 
  };
}
