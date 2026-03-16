import { Link } from "react-router-dom";
import CityMap from "../Components/CityMap";
import SalaryChart from "../Components/SalaryChart";
import { useEmployees } from "../Context/EmployeeContext";

export default function Analytics() {
	const { audits, employees } = useEmployees();
	const auditCards = Object.values(audits).sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
	const latestAudit = auditCards[0];

	return (
		<div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] px-4 py-8">
			<div className="mx-auto max-w-7xl rounded-[28px] bg-white/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<p className="text-sm text-slate-500">Insights Overview</p>
						<h1 className="text-3xl font-semibold text-slate-900">Employee Analytics</h1>
						<p className="mt-1 text-sm text-slate-500">The merged audit image is surfaced here alongside salary distribution and the city map.</p>
					</div>
					<Link className="rounded-lg border border-slate-300 px-4 py-2" to="/list">
						Back to Directory
					</Link>
				</div>

				<div className="mb-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
					<div className="rounded-2xl bg-slate-50 p-4">
						<h2 className="mb-4 text-lg font-semibold">Latest Audit Image</h2>
						{latestAudit ? (
							<div className="space-y-4">
								<img src={latestAudit.mergedDataUrl} alt={`${latestAudit.name} audit`} className="rounded-2xl border border-slate-200" />
								<div className="grid gap-3 sm:grid-cols-3">
									<div className="rounded-xl bg-white p-3">
										<p className="text-xs uppercase tracking-[0.2em] text-slate-400">Employee</p>
										<p className="mt-2 font-medium text-slate-900">{latestAudit.name}</p>
									</div>
									<div className="rounded-xl bg-white p-3">
										<p className="text-xs uppercase tracking-[0.2em] text-slate-400">City</p>
										<p className="mt-2 font-medium text-slate-900">{latestAudit.city}</p>
									</div>
									<div className="rounded-xl bg-white p-3">
										<p className="text-xs uppercase tracking-[0.2em] text-slate-400">Blob Size</p>
										<p className="mt-2 font-medium text-slate-900">{Math.round((latestAudit.mergedSize ?? 0) / 1024)} KB</p>
									</div>
								</div>
							</div>
						) : (
							<div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
								No merged audit image yet. Capture and sign an employee photo from the details screen first.
							</div>
						)}
					</div>

					<div className="rounded-2xl bg-slate-50 p-4">
						<h2 className="mb-4 text-lg font-semibold">Audit History</h2>
						<div className="space-y-3">
							{auditCards.length > 0 ? (
								auditCards.map((audit) => (
									<div key={audit.employeeId} className="rounded-xl bg-white p-4">
										<p className="font-medium text-slate-900">{audit.name}</p>
										<p className="text-sm text-slate-500">{audit.city} • {audit.department}</p>
										<p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">Updated {new Date(audit.updatedAt).toLocaleString()}</p>
									</div>
								))
							) : (
								<p className="text-sm text-slate-500">Audit history is empty.</p>
							)}
						</div>
					</div>
				</div>

				<div className="grid gap-6 xl:grid-cols-2">
					<div className="rounded-2xl bg-slate-50 p-4">
						<h2 className="mb-4 text-lg font-semibold">Salary by City</h2>
						<div className="overflow-x-auto">
							<SalaryChart data={employees} />
						</div>
					</div>

					<div className="rounded-2xl bg-slate-50 p-4">
						<h2 className="mb-4 text-lg font-semibold">City Presence</h2>
						<CityMap employees={employees} />
					</div>
				</div>
			</div>
		</div>
	);
}
