import { createClient } from '@supabase/supabase-js';
import DashboardClient, { Submission } from '@/components/admin/dashboard-client';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default async function AdminDashboard() {
  let initialData: Submission[] = [];
  
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching submissions:", error);
    } else if (data) {
      initialData = data as Submission[];
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-[#1E293B]">
      <DashboardClient initialData={initialData} />
    </div>
  );
}
