import { z } from "zod";

// Zod Schema for 7-Phase Intake
export const intakeFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  rollNumber: z.string().min(1, "Year is required."),
  branch: z.string().min(2, "Branch is required."),
  whatsappNumber: z.string().min(10, "Valid WhatsApp number is required."),
  
  email: z.string().email("Valid email is required."),
  coreSkill: z.string().min(2, "Please select at least one activity."),
  proficiencyLevel: z.string().min(2, "Proficiency level is required."),
  sprintAgreement: z.boolean().refine(val => val === true, {
    message: "You must agree to the 14-Day Micro-Sprint.",
  }),
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;
