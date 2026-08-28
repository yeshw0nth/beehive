"use client";

import { useState } from "react";
import { IntroSequence } from "@/components/intro-sequence";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a] flex flex-col relative overflow-hidden">
      {showIntro && <IntroSequence onComplete={() => setShowIntro(false)} />}
      
      {!showIntro && (
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center p-8 md:p-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="max-w-4xl w-full flex flex-col items-start gap-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Bridge the <br />
              <span className="text-gray-400">Hobby Cliff.</span>
            </h1>
            
            <p className="text-xl md:text-2xl font-medium max-w-2xl leading-relaxed text-gray-600">
              BEE-HIVE is an exclusive Talent-as-a-Service portal designed to 
              align your campus-incubated skills with enterprise-grade opportunities.
            </p>
            
            <div className="pt-8">
              <Link href="/join" passHref>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    className="h-16 px-10 text-lg font-semibold bg-[#1a1a1a] text-white hover:bg-black uppercase tracking-widest"
                  >
                    Enter the Hive
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
