"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTriageStatus } from "@/app/actions/update-status";
import { logoutAdmin } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export interface Submission {
  id: string;
  full_name: string;
  roll_number: string;
  branch: string;
  whatsapp_number: string;
  email: string | null;
  skills_data: any;
  terms_agreement: boolean;
  created_at: string;
  triage_status?: string;
}

export default function DashboardClient({ initialData }: { initialData: Submission[] }) {
  const router = useRouter();
  const [data, setData] = useState<Submission[]>(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      // Next.js will refetch server components and pass new initialData.
      // We could use useEffect to update local state, but usually server components 
      // replace the client component props. We'll add a useEffect for that.
    });
  };

  const handleStatusChange = async (rollNumber: string, newStatus: string) => {
    // Optimistic update
    const prevData = [...data];
    setData(data.map(d => d.roll_number === rollNumber ? { ...d, triage_status: newStatus } : d));
    
    const result = await updateTriageStatus(rollNumber, newStatus);
    if (!result.success) {
      alert("Failed to update status: " + result.error);
      setData(prevData); // revert
    }
  };

  const exportCSV = () => {
    if (filteredData.length === 0) return;
    
    const headers = ["Name", "Year", "Branch", "WhatsApp", "Email", "Skills JSON", "Avg Rating", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(d => [
        `"${d.full_name || ''}"`,
        `"${d.roll_number || ''}"`,
        `"${d.branch || ''}"`,
        `"${d.whatsapp_number || ''}"`,
        `"${d.email || ''}"`,
        `"${JSON.stringify(d.skills_data || []).replace(/"/g, '""')}"`,
        (d.skills_data && Array.isArray(d.skills_data) && d.skills_data.length > 0) ? (d.skills_data.reduce((a: number, c: any) => a + c.rating, 0) / d.skills_data.length).toFixed(1) : 0,
        `"${d.triage_status || 'Pending'}"`,
        `"${new Date(d.created_at).toLocaleDateString()}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `beehive_candidates_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe data mapping
  const safeData = data.map(d => ({
    ...d,
    triage_status: d.triage_status || "Pending",
    skills_data: Array.isArray(d.skills_data) ? d.skills_data : []
  }));

  // Filtering
  const filteredData = safeData.filter(d => {
    const skillsString = d.skills_data.map((s: any) => s.skill).join(" ");
    const matchesSearch = 
      (d.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.roll_number || "").toLowerCase().includes(search.toLowerCase()) ||
      skillsString.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || d.triage_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPIs
  const totalApps = safeData.length;
  let totalRating = 0;
  let ratingCount = 0;
  safeData.forEach(d => {
    d.skills_data.forEach((s: any) => {
      totalRating += s.rating;
      ratingCount++;
    });
  });
  const avgSkill = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "0.0";
  
  const statusCounts = safeData.reduce((acc, curr) => {
    acc[curr.triage_status] = (acc[curr.triage_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-[#1E293B] pb-4">
        <div>
          <h1 className="text-4xl font-extrabold uppercase tracking-tight text-[#1E293B]">Candidate Triage</h1>
          <p className="text-gray-500 font-semibold uppercase tracking-wider text-sm mt-1">BEE-HIVE Admin Portal</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Button onClick={handleRefresh} disabled={isPending} className="bg-[#1E293B] text-white hover:bg-[#F59E0B] rounded-none font-bold uppercase">
            {isPending ? "Syncing..." : "Live Sync"}
          </Button>
          <Button variant="outline" onClick={exportCSV} className="border-2 border-[#1E293B] text-[#1E293B] hover:bg-gray-100 rounded-none font-bold uppercase">
            Export CSV
          </Button>
          <Button variant="ghost" onClick={() => logoutAdmin()} className="text-red-600 font-bold uppercase rounded-none hover:bg-red-50">
            Logout
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border-4 border-[#1E293B] bg-white p-6">
          <p className="text-sm font-bold uppercase text-gray-500 mb-2 tracking-wider">Total Applications</p>
          <p className="text-5xl font-extrabold text-[#1E293B]">{totalApps}</p>
        </div>
        <div className="border-4 border-[#1E293B] bg-white p-6">
          <p className="text-sm font-bold uppercase text-gray-500 mb-2 tracking-wider">Avg Skill Rating</p>
          <p className="text-5xl font-extrabold text-[#F59E0B]">{avgSkill}<span className="text-xl text-gray-400">/10</span></p>
        </div>
        <div className="border-4 border-[#1E293B] bg-white p-6 md:col-span-2">
          <p className="text-sm font-bold uppercase text-gray-500 mb-2 tracking-wider">Triage Breakdown</p>
          <div className="flex gap-6 mt-2">
            <div>
              <span className="block text-2xl font-bold text-[#1E293B]">{statusCounts["Pending"] || 0}</span>
              <span className="text-xs uppercase font-bold text-gray-500">Pending</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-green-600">{statusCounts["Selected"] || 0}</span>
              <span className="text-xs uppercase font-bold text-gray-500">Selected</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-blue-600">{statusCounts["Waitlist"] || 0}</span>
              <span className="text-xs uppercase font-bold text-gray-500">Waitlist</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-red-600">{statusCounts["Rejected"] || 0}</span>
              <span className="text-xs uppercase font-bold text-gray-500">Rejected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-gray-100 p-4 border-2 border-[#1E293B]">
        <Input 
          placeholder="Search name, roll number, or skills..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-none border-2 border-[#1E293B] focus-visible:ring-0 focus-visible:border-[#F59E0B]"
        />
        <Select value={statusFilter} onValueChange={(val) => val !== null && setStatusFilter(val)}>
          <SelectTrigger className="w-full md:w-[200px] rounded-none border-2 border-[#1E293B]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-2 border-[#1E293B]">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Selected">Selected</SelectItem>
            <SelectItem value="Waitlist">Waitlist</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border-4 border-[#1E293B] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#1E293B]">
              <TableRow className="hover:bg-[#1E293B]">
                <TableHead className="text-white font-bold uppercase tracking-wider text-xs whitespace-nowrap">Name</TableHead>
                <TableHead className="text-white font-bold uppercase tracking-wider text-xs whitespace-nowrap">Year</TableHead>
                <TableHead className="text-white font-bold uppercase tracking-wider text-xs whitespace-nowrap">Email</TableHead>
                <TableHead className="text-white font-bold uppercase tracking-wider text-xs whitespace-nowrap">Skills & Ratings</TableHead>
                <TableHead className="text-white font-bold uppercase tracking-wider text-xs whitespace-nowrap">Status</TableHead>
                <TableHead className="text-white font-bold uppercase tracking-wider text-xs whitespace-nowrap">Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, idx) => (
                <TableRow key={row.roll_number || row.id || idx.toString()} className="border-b-2 border-gray-100 hover:bg-gray-50">
                  <TableCell className="font-bold whitespace-nowrap">{row.full_name}</TableCell>
                  <TableCell className="text-gray-600 font-medium">{row.roll_number}</TableCell>
                  <TableCell className="text-gray-600 font-medium">{row.email || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs text-xs font-semibold">
                    <div className="flex flex-col gap-1">
                      {row.skills_data.map((s: any, i: number) => (
                        <div key={i} className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-1 last:pb-0">
                          <span title={s.skill} className="truncate max-w-[150px]">{s.skill}</span>
                          <Badge variant="outline" className="rounded-none border-[#F59E0B] text-[#F59E0B] font-bold text-[10px] px-1 py-0 h-4 min-w-[30px] flex items-center justify-center">
                            {s.rating}/10
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select value={row.triage_status} onValueChange={(val) => val !== null && handleStatusChange(row.roll_number, val)}>
                      <SelectTrigger className="w-[130px] h-8 text-xs font-bold rounded-none border-2 border-[#1E293B]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-2 border-[#1E293B]">
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Selected">Selected</SelectItem>
                        <SelectItem value="Waitlist">Waitlist</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {row.whatsapp_number ? (
                      <a 
                        href={`https://wa.me/${row.whatsapp_number.replace(/\D/g,'')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#F59E0B] hover:underline font-bold text-xs uppercase tracking-wider flex items-center gap-1"
                      >
                        WhatsApp
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-gray-500 font-semibold uppercase tracking-wider">
                    No candidates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
