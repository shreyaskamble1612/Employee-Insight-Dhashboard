import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import VirtualizedTable from "../Components/VirtualizedTable";
import { useAuth } from "../Context/AuthContext";
import { useEmployees } from "../Context/EmployeeContext";

export default function List() {
  const [query, setQuery] = useState("");
  const { logout, user } = useAuth();
  const { employees, loading, error } = useEmployees();

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return employees;
    }

    return employees.filter((employee) => {
      return [employee.name, employee.city, employee.department, employee.email]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [employees, query]);

  const averageSalary = Math.round(
    filteredEmployees.reduce((sum, employee) => sum + employee.salary, 0) / Math.max(filteredEmployees.length, 1)
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-8">
      <div className="mx-auto max-w-7xl rounded-[28px] bg-white/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Signed in as {user?.username}</p>
            <h1 className="text-3xl font-semibold text-slate-950">Employee Insights Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Custom virtualization keeps the grid responsive even when the dataset grows.</p>
          </div>

          <div className="flex gap-3">
            <Link className="rounded-lg bg-slate-900 px-4 py-2 text-white" to="/analytics">
              View Analytics
            </Link>
            <button type="button" className="rounded-lg border border-slate-300 px-4 py-2" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Employees</p>
            <p className="text-2xl font-semibold">{filteredEmployees.length}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Cities</p>
            <p className="text-2xl font-semibold">{new Set(filteredEmployees.map((employee) => employee.city)).size}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Average Salary</p>
            <p className="text-2xl font-semibold">₹{averageSalary.toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Departments</p>
            <p className="text-2xl font-semibold">{new Set(filteredEmployees.map((employee) => employee.department)).size}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search employees by name, city, department, or email"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-0 placeholder:text-slate-400 md:max-w-md"
          />
          <p className="text-sm text-slate-500">Row rendering is capped to the visible viewport plus overscan buffer.</p>
        </div>

        {error ? <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</p> : null}

        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Loading employees...
          </div>
        ) : (
          <VirtualizedTable
            data={filteredEmployees}
            renderRow={(employee, index, rowHeight) => (
              <Link
                key={employee.id}
                to={`/details/${employee.id}`}
                className="grid grid-cols-[2.4fr_1.4fr_1.2fr_1fr] gap-4 border-b border-slate-100 px-5 py-4 transition hover:bg-slate-50"
                style={{ height: rowHeight }}
              >
                <div>
                  <p className="font-medium text-slate-900">{employee.name}</p>
                  <p className="text-sm text-slate-500">#{String(index + 1).padStart(3, "0")} • {employee.email}</p>
                </div>
                <p className="text-sm text-slate-600">{employee.department}</p>
                <p className="text-sm text-slate-600">{employee.city}</p>
                <p className="text-sm font-semibold text-slate-900">₹{employee.salary.toLocaleString("en-IN")}</p>
              </Link>
            )}
          />
        )}
      </div>
    </div>
  );
}