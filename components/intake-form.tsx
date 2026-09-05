"use client";

import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitIntake } from "@/app/actions/submit-intake";
import { intakeFormSchema, IntakeFormData } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";


const branches = ["ME", "CSE", "ECE", "EEE", "Civil", "CSM", "Other"];

const activityCategories = [
  {
    name: "Software & Tech",
    talents: [
      "React", "Next.js", "Vue", "Tailwind CSS", "Framer Motion",
      "Node.js", "Python", "Java", "Go", "PostgreSQL", "MongoDB",
      "Flutter", "React Native", "Swift", "Kotlin", "AWS", "Docker",
      "Kubernetes", "Vercel", "CI/CD", "Unity", "Unreal Engine",
      "C#", "C++", "Solidity", "Smart Contracts", "DApps"
    ]
  },
  {
    name: "AI & Data Science",
    talents: [
      "TensorFlow", "PyTorch", "Scikit-Learn", "LangChain",
      "OpenAI API", "Midjourney", "Cursor", "Python", "R",
      "Pandas", "PowerBI"
    ]
  },
  {
    name: "Core Engineering",
    talents: [
      "SolidWorks", "AutoCAD", "ANSYS", "Fusion360",
      "Arduino", "Raspberry Pi", "PCB Design", "Microcontrollers",
      "ROS", "Mechatronics", "3D Printing", "CNC Machining"
    ]
  },
  {
    name: "Design & Visuals",
    talents: [
      "Figma", "Framer", "User Research", "Wireframing",
      "Adobe Illustrator", "Photoshop", "Typography", "Blender",
      "Maya", "Cinema 4D", "After Effects", "Lottie", "Painting",
      "Sketching", "Digital Illustration", "Sculpting", "Origami"
    ]
  },
  {
    name: "Media & Writing",
    talents: [
      "Premiere Pro", "DaVinci Resolve", "Final Cut", "Event Photography",
      "Portrait Photography", "Product Photography", "Blogging",
      "Scriptwriting", "Storytelling", "Poetry", "SEO", "Documentation",
      "Ad Copy", "Mixing", "Mastering", "Ableton", "FL Studio"
    ]
  },
  {
    name: "Business & Arts",
    talents: [
      "Logistics", "Resource Allocation", "Agile/Scrum",
      "Social Media Management", "Growth Hacking", "B2B Pitching",
      "Sponsorship Generation", "Client Negotiation", "Financial Modeling",
      "Budgeting", "Excel Mastery", "Vocals", "Acoustic Instruments",
      "Classical Music", "Beatboxing", "DJing", "Classical Dance",
      "Hip-Hop", "Contemporary", "Folk Dance", "Acting", "Stand-up Comedy",
      "Debate", "Public Speaking", "Anchoring", "Competitive Gaming",
      "Twitch/YouTube Streaming", "Commentary", "Team Sports Captaincy",
      "Chess", "Yoga Instruction", "Fitness Coaching"
    ]
  }
];

export function IntakeForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionData, setSubmissionData] = useState<{ rollNumber: string; timestamp: string } | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [showOtherInput, setShowOtherInput] = useState<Record<number, boolean>>({});
  const [otherText, setOtherText] = useState<Record<number, string>>({});

  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      branch: "",
      skillRating: 5,
      termsAgreement: false,
    }
  });

  const coreSkillValue = useWatch({
    control,
    name: "coreSkill",
  }) as string || "";

  const selectedActivities = coreSkillValue ? coreSkillValue.split(", ").filter(Boolean) : [];

  const handleActivityChange = (activity: string, checked: boolean) => {
    let newActivities = [...selectedActivities];
    if (checked) {
      if (!newActivities.includes(activity)) {
        newActivities.push(activity);
      }
    } else {
      newActivities = newActivities.filter(a => a !== activity);
    }
    setValue("coreSkill", newActivities.join(", "), { shouldValidate: true });
  };

  const handleTalentToggle = (talent: string) => {
    const isSelected = selectedActivities.includes(talent);
    handleActivityChange(talent, !isSelected);
  };

  const handleOtherSave = (catIdx: number) => {
    const text = (otherText[catIdx] || "").trim();
    if (text) {
      // Toggle selection of this custom talent if it's not already added
      if (!selectedActivities.includes(text)) {
        handleActivityChange(text, true);
      }
      setOtherText(prev => ({ ...prev, [catIdx]: "" }));
      setShowOtherInput(prev => ({ ...prev, [catIdx]: false }));
    }
  };

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
      setStep((s) => Math.min(s + 1, 3));
    }
  };
  
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinalize = async () => {
    const isValid = await trigger(["termsAgreement"]);
    if (isValid) {
      setShowSummary(true);
    }
  };

  const showHeader = step < 3 && !showSummary && !submissionData;

  if (submissionData) {
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
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] uppercase">Application Received</h2>
          <p className="text-lg font-semibold text-[#F59E0B] uppercase tracking-widest border-b-2 pb-4">Confirmation</p>
        </div>

        <p className="text-[#0F172A] text-xl font-medium max-w-md leading-relaxed pt-2">
          Thank you for registering. Your application has been received.
        </p>
      </motion.div>
    );
  }

  if (showSummary && !submissionData) {
    return (
      <div className="w-full max-w-xl mx-auto space-y-6">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Review Application
          </h1>
          <p className="text-xl text-gray-500">
            Please confirm your details before submitting.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6 border-4 border-[#0F172A] p-8 bg-gray-50">
            <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 border-b-2 border-[#0F172A] pb-2">Review</h3>
            
            <div className="space-y-4 text-sm font-semibold">
              <div>
                <span className="text-gray-500 uppercase tracking-wider block text-xs">Full Name</span>
                <span className="text-[#0F172A] text-base font-bold">{getValues("fullName")}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider block text-xs">Year</span>
                <span className="text-[#0F172A] text-base font-bold">{getValues("rollNumber")}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider block text-xs">Email Address</span>
                <span className="text-[#0F172A] text-base font-bold">{getValues("email")}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider block text-xs">Branch</span>
                <span className="text-[#0F172A] text-base font-bold">{getValues("branch")}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider block text-xs">WhatsApp Number</span>
                <span className="text-[#0F172A] text-base font-bold">{getValues("whatsappNumber")}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider block text-xs">Selected Activities</span>
                <span className="text-[#0F172A] text-base font-bold">{getValues("coreSkill")}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider block text-xs">Skill Rating</span>
                <span className="text-[#0F172A] text-base font-bold">{getValues("skillRating")}/10</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider block text-xs">Terms & Conditions</span>
                <span className="text-[#0F172A] text-base font-bold">{getValues("termsAgreement") ? "Agreed" : "Not Agreed"}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t-2 border-[#0F172A]">
              <Button type="button" variant="outline" onClick={() => setShowSummary(false)} className="flex-1 h-14 text-lg rounded-none border-2 border-[#0F172A] font-bold uppercase hover:bg-gray-100">
                Edit
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 h-14 text-lg bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706] hover:text-white transition-colors rounded-none font-bold uppercase">
                {isSubmitting ? "Syncing..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {showHeader && (
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Enter your details.
          </h1>
          <p className="text-xl text-gray-500">
            Let&apos;s align your skills with the right opportunities.
          </p>
        </div>
      )}

      {/* Progress Grid */}
      <div className="mb-10 flex space-x-1">
        {[1, 2, 3].map((i) => (
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
                  <Label htmlFor="rollNumber" className="text-sm uppercase tracking-wider font-semibold">Year</Label>
                  <Input id="rollNumber" className="h-12 border-2 border-[#0F172A] focus-visible:ring-0 focus-visible:border-[#F59E0B] rounded-none bg-gray-50" {...register("rollNumber")} />
                  {errors.rollNumber && <p className="text-red-500 text-sm font-medium">{errors.rollNumber.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm uppercase tracking-wider font-semibold">Email Address</Label>
                  <Input id="email" type="email" className="h-12 border-2 border-[#0F172A] focus-visible:ring-0 focus-visible:border-[#F59E0B] rounded-none bg-gray-50" {...register("email")} />
                  {errors.email && <p className="text-red-500 text-sm font-medium">{errors.email.message}</p>}
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
              <Button type="button" onClick={() => nextStep(["fullName", "rollNumber", "email", "branch", "whatsappNumber"])} className="w-full h-14 text-lg bg-[#0F172A] text-white hover:bg-[#F59E0B] transition-colors rounded-none font-bold uppercase tracking-widest mt-4">
                Initialize Sequence
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">Phase 2: Skill & Talent Selection</h3>
              <div className="space-y-4">
                <Label className="text-sm uppercase tracking-wider font-semibold text-[#1E293B]">Select a category to expand skills</Label>
                
                <div className="flex flex-wrap gap-2">
                  {activityCategories.map((category, idx) => (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() => setActiveCategory(activeCategory === idx ? null : idx)}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 rounded-none border-2 ${
                        activeCategory === idx
                          ? "border-[#F59E0B] bg-[#1E293B] text-[#F59E0B]"
                          : "border-[#1E293B] text-[#1E293B] bg-white hover:border-[#F59E0B]"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {activeCategory !== null && (
                    <motion.div
                      key={activeCategory}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-4 border-l-4 border-[#F59E0B] pl-4"
                    >
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                        Select Talents: {activityCategories[activeCategory].name}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {activityCategories[activeCategory].talents.map((talent) => {
                          const isSelected = selectedActivities.includes(talent);
                          return (
                            <button
                              key={talent}
                              type="button"
                              onClick={() => handleTalentToggle(talent)}
                              className={`px-3 py-1.5 rounded-none border-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ${
                                isSelected
                                  ? "border-[#F59E0B] text-white bg-[#1E293B]"
                                  : "border-gray-300 text-gray-600 bg-transparent hover:border-[#1E293B] hover:text-[#1E293B]"
                              }`}
                            >
                              {talent}
                            </button>
                          );
                        })}

                        {/* Escape Hatch for custom text */}
                        {showOtherInput[activeCategory] ? (
                          <div className="flex items-center space-x-2 border-2 border-[#1E293B] px-2 py-1 bg-white max-w-[250px]">
                            <input
                              type="text"
                              value={otherText[activeCategory] || ""}
                              onChange={(e) => setOtherText(prev => ({ ...prev, [activeCategory]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleOtherSave(activeCategory);
                                }
                              }}
                              placeholder="Specify talent..."
                              className="text-[10px] font-semibold uppercase tracking-wider text-[#1E293B] bg-transparent outline-none w-full"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleOtherSave(activeCategory)}
                              className="text-[10px] font-extrabold uppercase text-[#F59E0B] hover:text-[#D97706]"
                            >
                              Add
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowOtherInput(prev => ({ ...prev, [activeCategory]: true }))}
                            className="px-3 py-1.5 rounded-none border-2 border-dashed border-gray-400 text-gray-500 bg-transparent hover:border-[#1E293B] hover:text-[#1E293B] text-[10px] font-bold uppercase tracking-wider"
                          >
                            Other (Specify)
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Visual Confirmation of custom skills */}
                {selectedActivities.filter(skill => !activityCategories.flatMap(c => c.talents).includes(skill)).map(customSkill => (
                  <div key={customSkill} className="inline-block mt-2 mr-2 px-3 py-1 bg-gray-100 border-l-2 border-[#F59E0B] text-xs font-bold uppercase text-[#1E293B]">
                    Selected Skill: {customSkill}
                    <button type="button" onClick={() => handleTalentToggle(customSkill)} className="ml-2 text-red-500 font-bold hover:text-red-700">×</button>
                  </div>
                ))}

                {errors.coreSkill && <p className="text-red-500 text-sm font-medium mt-2">{errors.coreSkill.message}</p>}
              </div>

              {/* Dynamic Proficiency Slider appears inline if a skill is selected */}
              <AnimatePresence>
                {selectedActivities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-6 border-t-2 border-gray-200 mt-6"
                  >
                    <Label className="text-sm uppercase tracking-wider font-semibold text-[#1E293B]">
                      Rate your proficiency in {coreSkillValue}
                    </Label>
                    <Controller control={control} name="skillRating" render={({ field }) => (
                      <div className="flex flex-wrap gap-2 justify-between mt-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                          const isSelected = field.value === num;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => field.onChange(num)}
                              className={`w-9 h-9 sm:w-11 sm:h-11 border-2 font-bold text-base sm:text-lg transition-colors duration-150 rounded-none flex items-center justify-center ${
                                isSelected
                                  ? "bg-[#F59E0B] text-white border-[#F59E0B]"
                                  : "border-[#0F172A] text-[#0F172A] hover:border-[#F59E0B] bg-white"
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                    )} />
                    {errors.skillRating && <p className="text-red-500 text-sm font-medium mt-2">{errors.skillRating.message}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14 text-lg rounded-none border-2 border-[#0F172A] font-bold uppercase hover:bg-gray-100">Back</Button>
                <Button type="button" onClick={() => nextStep(["coreSkill", "skillRating"])} className="flex-1 h-14 text-lg bg-[#0F172A] text-white hover:bg-[#F59E0B] transition-colors rounded-none font-bold uppercase">Proceed</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">Phase 3: Commitment</h3>
              <div className="space-y-4 border-l-4 border-[#F59E0B] pl-6 py-2">
                <Controller control={control} name="termsAgreement" render={({ field }) => (
                  <div className="flex items-start space-x-4">
                    <Checkbox id="termsAgreement" checked={field.value} onCheckedChange={field.onChange} className="mt-1 border-2 border-[#0F172A] data-[state=checked]:bg-[#F59E0B] data-[state=checked]:text-white rounded-none w-6 h-6" />
                    <Label htmlFor="termsAgreement" className="text-base font-semibold leading-relaxed cursor-pointer">
                      I agree to the Terms & Conditions.
                    </Label>
                  </div>
                )} />
                {errors.termsAgreement && <p className="text-red-500 text-sm font-medium">{errors.termsAgreement.message}</p>}
              </div>
              <div className="flex gap-4 pt-8">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14 text-lg rounded-none border-2 border-[#0F172A] font-bold uppercase hover:bg-gray-100">Back</Button>
                <Button type="button" onClick={handleFinalize} className="flex-1 h-14 text-lg bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706] hover:text-white transition-colors rounded-none font-bold uppercase">
                  Finalize
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
