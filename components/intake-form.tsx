"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { intakeFormSchema, IntakeFormData, submitIntake } from "@/app/actions/submit-intake";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const verticals = ["Tech", "Design", "Arts"] as const;

export function IntakeForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
  });

  const selectedVertical = watch("primaryVertical");

  const onSubmit = async (data: IntakeFormData) => {
    setIsSubmitting(true);
    const result = await submitIntake(data);
    setIsSubmitting(false);
    
    if (result.success) {
      setIsSuccess(true);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center p-8 space-y-4"
      >
        <div className="w-16 h-16 bg-[#1a1a1a] text-white flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome to the Hive.</h2>
        <p className="text-gray-500 max-w-md">Your profile has been synchronized. We will reach out when the right opportunity matches your skillset.</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="mb-8 flex space-x-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 ${step >= i ? 'bg-[#1a1a1a]' : 'bg-gray-200'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-lg font-medium">What is your full name?</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  className="h-14 text-lg border-2 border-gray-200 focus-visible:ring-0 focus-visible:border-[#1a1a1a] transition-colors rounded-none"
                  {...register("fullName")}
                />
                {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
              </div>
              <Button type="button" onClick={nextStep} className="w-full h-14 text-lg bg-[#1a1a1a] text-white hover:bg-black rounded-none">
                Continue
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <Label className="text-lg font-medium">Select your primary vertical</Label>
                <div className="grid grid-cols-1 gap-4">
                  {verticals.map((vertical) => (
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} key={vertical}>
                      <Card 
                        className={`cursor-pointer transition-colors border-2 rounded-none shadow-none ${selectedVertical === vertical ? 'border-[#1a1a1a] bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setValue("primaryVertical", vertical, { shouldValidate: true })}
                      >
                        <CardContent className="p-6 flex items-center justify-between">
                          <span className="text-xl font-semibold tracking-tight">{vertical}</span>
                          {selectedVertical === vertical && (
                            <div className="w-4 h-4 bg-[#1a1a1a]" />
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                {errors.primaryVertical && <p className="text-red-500 text-sm">{errors.primaryVertical.message}</p>}
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14 text-lg rounded-none border-2">
                  Back
                </Button>
                <Button type="button" onClick={nextStep} className="flex-1 h-14 text-lg bg-[#1a1a1a] text-white hover:bg-black rounded-none">
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="primarySkill" className="text-lg font-medium">What is your primary skill?</Label>
                <Input
                  id="primarySkill"
                  placeholder={selectedVertical === 'Tech' ? 'e.g., React, Python, Node.js' : selectedVertical === 'Design' ? 'e.g., Figma, UI/UX, Blender' : 'e.g., Copywriting, Video Editing'}
                  className="h-14 text-lg border-2 border-gray-200 focus-visible:ring-0 focus-visible:border-[#1a1a1a] transition-colors rounded-none"
                  {...register("primarySkill")}
                />
                {errors.primarySkill && <p className="text-red-500 text-sm">{errors.primarySkill.message}</p>}
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14 text-lg rounded-none border-2">
                  Back
                </Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 text-lg bg-[#1a1a1a] text-white hover:bg-black rounded-none">
                    {isSubmitting ? "Submitting..." : "Submit"}
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
