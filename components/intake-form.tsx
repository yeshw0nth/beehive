"use client";

import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitIntake } from "@/app/actions/submit-intake";
import { intakeFormSchema, IntakeFormData } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

const verticals = ["Tech", "Design", "Creative Arts", "Public Speaking"] as const;
const proficiencies = ["Beginner", "Intermediate", "Advanced", "Shipped Projects"] as const;
const branches = ["ME", "CSE", "ECE", "EEE", "Civil", "Other"];

export function IntakeForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionData, setSubmissionData] = useState<{ rollNumber: string; timestamp: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      branch: "",
      proficiencyLevel: "",
      sprintAgreement: false,
    }
  });

  const selectedVertical = useWatch({
    control,
    name: "primaryVertical",
  });

  const onSubmit = async (data: IntakeFormData) => {
    setIsSubmitting(true);
    const result = await submitIntake(data);
    setIsSubmitting(false);
    
    if (result.success) {
      setSubmissionData({
        rollNumber: data.rollNumber,
        timestamp: new Date().getTime().toString().slice(-6)
      });
    }
  };

  const nextStep = async (fieldsToValidate: (keyof IntakeFormData)[]) => {
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((s) => Math.min(s + 1, 7));
    }
  };
  
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  if (submissionData) {
    const appCode = `${submissionData.rollNumber.toUpperCase()}-${submissionData.timestamp}`;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center p-8 space-y-6 max-w-2xl mx-auto border-4 border-[#0F172A] p-12 bg-gray-50"
      >
        <div className="w-20 h-20 bg-[#F59E0B] text-white flex items-center justify-center mb-2 clip-hexagon">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] uppercase">Application Received</h2>
          <p className="text-lg font-semibold text-[#F59E0B] uppercase tracking-widest">Triage Pending</p>
        </div>
        
        <div className="bg-white p-6 border-2 border-dashed border-[#0F172A] w-full my-4">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Verification Code</p>
          <p className="text-3xl font-mono font-bold tracking-widest">{appCode}</p>
        </div>

        <p className="text-[#0F172A] text-xl font-medium max-w-md leading-relaxed border-t-2 pt-6">
          Bring your portfolio proof to the <strong className="text-[#F59E0B]">IICGPREC Incubation Space</strong> on <strong className="underline decoration-[#F59E0B] decoration-4 underline-offset-4">Monday at 4:30 PM</strong> for physical pod verification and matchmaking.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress Grid */}
      <div className="mb-10 flex space-x-1">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className={`h-2 flex-1 transition-colors ${step >= i ? 'bg-[#F59E0B]' : 'bg-gray-200'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">Phase 1: Identity</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm uppercase tracking-wider font-semibold">Full Name</Label>
                  <Input id="fullName" className="h-12 border-2 border-[#0F172A] focus-visible:ring-0 focus-visible:border-[#F59E0B] rounded-none bg-gray-50" {...register("fullName")} />
                  {errors.fullName && <p className="text-red-500 text-sm font-medium">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber" className="text-sm uppercase tracking-wider font-semibold">Roll Number</Label>
                  <Input id="rollNumber" className="h-12 border-2 border-[#0F172A] focus-visible:ring-0 focus-visible:border-[#F59E0B] rounded-none bg-gray-50 uppercase" {...register("rollNumber")} />
                  {errors.rollNumber && <p className="text-red-500 text-sm font-medium">{errors.rollNumber.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm uppercase tracking-wider font-semibold">Branch</Label>
                  <Controller control={control} name="branch" render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 border-2 border-[#0F172A] rounded-none bg-gray-50">
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-2 border-[#0F172A]">
                        {branches.map(b => <SelectItem key={b} value={b} className="rounded-none">{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                  {errors.branch && <p className="text-red-500 text-sm font-medium">{errors.branch.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber" className="text-sm uppercase tracking-wider font-semibold">WhatsApp Number</Label>
                  <Input id="whatsappNumber" type="tel" className="h-12 border-2 border-[#0F172A] focus-visible:ring-0 focus-visible:border-[#F59E0B] rounded-none bg-gray-50" {...register("whatsappNumber")} />
                  {errors.whatsappNumber && <p className="text-red-500 text-sm font-medium">{errors.whatsappNumber.message}</p>}
                </div>
              </div>
              <Button type="button" onClick={() => nextStep(["fullName", "rollNumber", "branch", "whatsappNumber"])} className="w-full h-14 text-lg bg-[#0F172A] text-white hover:bg-[#F59E0B] transition-colors rounded-none font-bold uppercase tracking-widest mt-4">
                Initialize Sequence
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">Phase 2: The Nectar</h3>
              <div className="space-y-4">
                <Label className="text-sm uppercase tracking-wider font-semibold">Primary Vertical</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {verticals.map((vertical) => (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={vertical}>
                      <Card className={`cursor-pointer transition-colors border-2 rounded-none shadow-none ${selectedVertical === vertical ? 'border-[#F59E0B] bg-[#F59E0B]/10' : 'border-[#0F172A] hover:border-[#F59E0B]'}`} onClick={() => setValue("primaryVertical", vertical, { shouldValidate: true })}>
                        <CardContent className="p-6 flex items-center justify-between">
                          <span className="font-bold tracking-tight">{vertical}</span>
                          {selectedVertical === vertical && <div className="w-3 h-3 bg-[#F59E0B] clip-hexagon" />}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                {errors.primaryVertical && <p className="text-red-500 text-sm font-medium">{errors.primaryVertical.message}</p>}
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14 text-lg rounded-none border-2 border-[#0F172A] font-bold uppercase hover:bg-gray-100">Back</Button>
                <Button type="button" onClick={() => nextStep(["primaryVertical"])} className="flex-1 h-14 text-lg bg-[#0F172A] text-white hover:bg-[#F59E0B] transition-colors rounded-none font-bold uppercase">Proceed</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">Phase 3: Specifics</h3>
              <div className="space-y-2">
                <Label htmlFor="coreSkill" className="text-sm uppercase tracking-wider font-semibold">Core Skill</Label>
                <Input id="coreSkill" placeholder="e.g., Next.js, Figma, Premiere Pro" className="h-14 text-lg border-2 border-[#0F172A] focus-visible:ring-0 focus-visible:border-[#F59E0B] rounded-none bg-gray-50" {...register("coreSkill")} />
                {errors.coreSkill && <p className="text-red-500 text-sm font-medium">{errors.coreSkill.message}</p>}
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14 text-lg rounded-none border-2 border-[#0F172A] font-bold uppercase hover:bg-gray-100">Back</Button>
                <Button type="button" onClick={() => nextStep(["coreSkill"])} className="flex-1 h-14 text-lg bg-[#0F172A] text-white hover:bg-[#F59E0B] transition-colors rounded-none font-bold uppercase">Proceed</Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">Phase 4: Proficiency</h3>
              <div className="space-y-4">
                <Label className="text-sm uppercase tracking-wider font-semibold">Proficiency Level</Label>
                <Controller control={control} name="proficiencyLevel" render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-3">
                    {proficiencies.map(prof => (
                      <div key={prof} className="flex items-center space-x-3 border-2 border-[#0F172A] p-4 bg-gray-50 hover:border-[#F59E0B] transition-colors cursor-pointer" onClick={() => field.onChange(prof)}>
                        <RadioGroupItem value={prof} id={prof} className="border-[#0F172A] text-[#F59E0B]" />
                        <Label htmlFor={prof} className="cursor-pointer font-bold text-base flex-1">{prof}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )} />
                {errors.proficiencyLevel && <p className="text-red-500 text-sm font-medium">{errors.proficiencyLevel.message}</p>}
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14 text-lg rounded-none border-2 border-[#0F172A] font-bold uppercase hover:bg-gray-100">Back</Button>
                <Button type="button" onClick={() => nextStep(["proficiencyLevel"])} className="flex-1 h-14 text-lg bg-[#0F172A] text-white hover:bg-[#F59E0B] transition-colors rounded-none font-bold uppercase">Proceed</Button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">Phase 5: The Proof</h3>
              <div className="space-y-2">
                <Label htmlFor="portfolioUrl" className="text-sm uppercase tracking-wider font-semibold">Portfolio / Proof of Work</Label>
                <Input id="portfolioUrl" placeholder="GitHub, Behance, Drive, or Live Link" className="h-14 text-lg border-2 border-[#0F172A] focus-visible:ring-0 focus-visible:border-[#F59E0B] rounded-none bg-gray-50" {...register("portfolioUrl")} />
                {errors.portfolioUrl && <p className="text-red-500 text-sm font-medium">{errors.portfolioUrl.message}</p>}
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14 text-lg rounded-none border-2 border-[#0F172A] font-bold uppercase hover:bg-gray-100">Back</Button>
                <Button type="button" onClick={() => nextStep(["portfolioUrl"])} className="flex-1 h-14 text-lg bg-[#0F172A] text-white hover:bg-[#F59E0B] transition-colors rounded-none font-bold uppercase">Proceed</Button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">Phase 6: The Gap</h3>
              <div className="space-y-2">
                <Label htmlFor="desiredCrossSkill" className="text-sm uppercase tracking-wider font-semibold">Desired Cross-Skill for Pod Partner</Label>
                <Input id="desiredCrossSkill" placeholder="What skill do you need in your team?" className="h-14 text-lg border-2 border-[#0F172A] focus-visible:ring-0 focus-visible:border-[#F59E0B] rounded-none bg-gray-50" {...register("desiredCrossSkill")} />
                {errors.desiredCrossSkill && <p className="text-red-500 text-sm font-medium">{errors.desiredCrossSkill.message}</p>}
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14 text-lg rounded-none border-2 border-[#0F172A] font-bold uppercase hover:bg-gray-100">Back</Button>
                <Button type="button" onClick={() => nextStep(["desiredCrossSkill"])} className="flex-1 h-14 text-lg bg-[#0F172A] text-white hover:bg-[#F59E0B] transition-colors rounded-none font-bold uppercase">Proceed</Button>
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">Phase 7: Commitment</h3>
              <div className="space-y-4 border-l-4 border-[#F59E0B] pl-6 py-2">
                <Controller control={control} name="sprintAgreement" render={({ field }) => (
                  <div className="flex items-start space-x-4">
                    <Checkbox id="sprintAgreement" checked={field.value} onCheckedChange={field.onChange} className="mt-1 border-2 border-[#0F172A] data-[state=checked]:bg-[#F59E0B] data-[state=checked]:text-white rounded-none w-6 h-6" />
                    <Label htmlFor="sprintAgreement" className="text-base font-semibold leading-relaxed cursor-pointer">
                      I commit to the 14-Day Micro-Sprint upon cohort selection.
                    </Label>
                  </div>
                )} />
                {errors.sprintAgreement && <p className="text-red-500 text-sm font-medium">{errors.sprintAgreement.message}</p>}
              </div>
              <div className="flex gap-4 pt-8">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14 text-lg rounded-none border-2 border-[#0F172A] font-bold uppercase hover:bg-gray-100">Back</Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 text-lg bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706] hover:text-white transition-colors rounded-none font-bold uppercase tracking-wider">
                    {isSubmitting ? "Syncing..." : "Finalize Intake"}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
