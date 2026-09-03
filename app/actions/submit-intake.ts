"use server";

import { google } from "googleapis";
import { intakeFormSchema, IntakeFormData } from "@/lib/schema";
import { prisma } from "@/lib/prisma";

export async function submitIntake(data: IntakeFormData) {
  const result = intakeFormSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: "Validation failed" };
  }

  const payload = result.data;
  let supabaseSuccess = false;
  let sheetsSuccess = false;

  // 1. Prisma Sync (Targeting 'submissions' table)
  try {
    await prisma.submission.create({
      data: {
        fullName: payload.fullName,
        rollNumber: payload.rollNumber,
        branch: payload.branch,
        whatsappNumber: payload.whatsappNumber,
        primaryVertical: payload.email, // using email as primary_vertical as before
        coreSkill: payload.coreSkill,
        skillRating: payload.skillRating,
        termsAgreement: payload.termsAgreement,
        triageStatus: "pending",
      }
    });
    supabaseSuccess = true;
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return { success: false, error: error.message || "Failed to save submission to the database." };
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
        range: "Sheet1!A:I",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [
              payload.fullName, 
              payload.rollNumber, 
              payload.branch,
              payload.whatsappNumber,
              payload.email, 
              payload.coreSkill, 
              payload.skillRating,
              payload.termsAgreement ? "Yes" : "No",
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

  return { 
    success: true, 
    supabaseSuccess, 
    sheetsSuccess, 
    message: "Intake submitted successfully." 
  };
}
