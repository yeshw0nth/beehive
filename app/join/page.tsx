import { IntakeForm } from "@/components/intake-form";
import Link from "next/link";

export const metadata = {
  title: "Join | BEE-HIVE",
  description: "Join the BEE-HIVE Talent-as-a-Service platform.",
};

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-white text-[#1a1a1a] flex flex-col pt-12 px-6">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <header className="mb-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
            BEE HIVE
          </Link>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">
            Intake Protocol
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center pb-24">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Enter your details.
            </h1>
            <p className="text-xl text-gray-500">
              Let&apos;s align your skills with the right opportunities.
            </p>
          </div>

          <IntakeForm />
        </div>
      </div>
    </main>
  );
}
