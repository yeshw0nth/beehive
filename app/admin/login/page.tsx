"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await loginAdmin(password);
    if (result.success) {
      router.push("/admin");
    } else {
      setError(result.error || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border-4 border-[#1E293B] bg-gray-50 p-8 space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-[#1E293B]">Admin Portal</h1>
          <p className="text-sm text-gray-500 uppercase tracking-wider">Restricted Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold uppercase tracking-wider text-[#1E293B]">Master Key</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-2 border-[#1E293B] focus-visible:ring-0 focus-visible:border-[#F59E0B] rounded-none bg-white"
              placeholder="Enter master key"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 text-lg bg-[#1E293B] text-white hover:bg-[#F59E0B] transition-colors rounded-none font-bold uppercase tracking-widest mt-4"
          >
            {isLoading ? "Authenticating..." : "Enter"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
