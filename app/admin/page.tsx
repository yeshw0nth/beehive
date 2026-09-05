import { prisma } from '@/lib/prisma';
import DashboardClient, { Submission } from '@/components/admin/dashboard-client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let initialData: Submission[] = [];
  
  try {
    const data = await prisma.submission.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    initialData = data.map(sub => ({
      id: sub.id,
      full_name: sub.fullName,
      roll_number: sub.rollNumber,
      branch: sub.branch,
      whatsapp_number: sub.whatsappNumber,
      email: sub.email,
      skills_data: sub.skillsData,
      terms_agreement: sub.termsAgreement,
      triage_status: sub.triageStatus,
      created_at: sub.createdAt.toISOString()
    })) as Submission[];
  } catch (error) {
    console.error("Error fetching submissions:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-[#1E293B]">
      <DashboardClient initialData={initialData} />
    </div>
  );
}
