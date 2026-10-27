import { Input } from "@/components/ui/input";
import type { JobFilters } from "@/lib/jobs/jobs.functions";

export function AdvancedJobFilters({ filters, onChange }: { filters: JobFilters; onChange: (patch: Partial<JobFilters>) => void }) {
  const fields = [["company", "Employer"], ["city", "City"], ["region", "State / region"], ["skill", "Explicit skill"], ["industry", "Industry"], ["employment", "Employment type"], ["source", "Verified source"], ["currency", "Salary currency"]] as const;
  return <details className="col-span-full border-t border-border pt-3"><summary className="cursor-pointer py-2 text-sm font-medium text-primary">More filters</summary><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {fields.map(([key, label]) => <label key={key} className="space-y-1 text-sm">{label}<Input aria-label={label} value={filters[key]} maxLength={key === "currency" ? 3 : 80} onChange={(e) => onChange({ [key]: e.target.value })} /></label>)}
    <label className="space-y-1 text-sm">Minimum advertised salary<Input type="number" min={0} max={1e9} aria-label="Minimum advertised salary" value={filters.salary || ""} onChange={(e) => onChange({ salary: Number(e.target.value) })} /></label>
    <label className="space-y-1 text-sm">Experience in years<Input type="number" min={0} max={80} aria-label="Experience in years" value={filters.experience || ""} onChange={(e) => onChange({ experience: Number(e.target.value) })} /></label>
    <label className="space-y-1 text-sm">Application checked within<select aria-label="Application checked within" className="h-10 w-full rounded-md border border-input bg-background px-3 text-foreground" value={filters.checked} onChange={(e) => onChange({ checked: Number(e.target.value) })}><option value={0}>Any current check</option><option value={15}>15 minutes</option><option value={30}>30 minutes</option></select></label>
  </div></details>;
}