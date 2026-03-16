/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const EMPLOYEE_ENDPOINT = import.meta.env.VITE_EMPLOYEE_ENDPOINT;

const fallbackEmployees = [
  { id: 1, name: "Aarav Sharma", city: "Mumbai", salary: 82000, department: "Engineering", email: "aarav.sharma@example.com" },
  { id: 2, name: "Priya Verma", city: "Delhi", salary: 76000, department: "Design", email: "priya.verma@example.com" },
  { id: 3, name: "Rohan Iyer", city: "Bangalore", salary: 91000, department: "Product", email: "rohan.iyer@example.com" },
  { id: 4, name: "Neha Joshi", city: "Pune", salary: 68000, department: "Operations", email: "neha.joshi@example.com" },
  { id: 5, name: "Kabir Mehta", city: "Mumbai", salary: 87000, department: "Engineering", email: "kabir.mehta@example.com" },
  { id: 6, name: "Anaya Kapoor", city: "Delhi", salary: 73000, department: "HR", email: "anaya.kapoor@example.com" },
  { id: 7, name: "Vihaan Rao", city: "Bangalore", salary: 95000, department: "Data", email: "vihaan.rao@example.com" },
  { id: 8, name: "Isha Nair", city: "Pune", salary: 71000, department: "Finance", email: "isha.nair@example.com" }
];

const EmployeeContext = createContext(null);

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const parseSalary = (value, fallback) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = Number(value.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(cleaned)) {
      return cleaned;
    }
  }

  return fallback;
};

const normalizeEmployees = (payload) => {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.TABLE_DATA?.data)
        ? payload.TABLE_DATA.data
        : [];

  const normalized = source
    .map((employee, index) => {
      const cityFallback = fallbackEmployees[index % fallbackEmployees.length];

      if (Array.isArray(employee)) {
        const [name, department, city, employeeId, , salary] = employee;

        return {
          id: String(employeeId ?? index + 1),
          name: name ?? `Employee ${index + 1}`,
          city: city ?? cityFallback.city,
          salary: parseSalary(salary, cityFallback.salary),
          department: department ?? cityFallback.department,
          email: `${String(name ?? `employee-${index + 1}`).toLowerCase().replace(/\s+/g, ".")}@example.com`
        };
      }

      return {
        id: String(employee.id ?? employee.employee_id ?? index + 1),
        name: employee.name ?? employee.employee_name ?? employee.full_name ?? `Employee ${index + 1}`,
        city: employee.city ?? employee.location ?? cityFallback.city,
        salary: parseSalary(employee.salary ?? employee.ctc ?? employee.package, cityFallback.salary),
        department: employee.department ?? employee.team ?? employee.designation ?? cityFallback.department,
        email: employee.email ?? `${String(employee.name ?? employee.employee_name ?? `employee-${index + 1}`).toLowerCase().replace(/\s+/g, ".")}@example.com`
      };
    })
    .filter((employee) => employee.name && employee.city);

  return normalized.length > 0 ? normalized : fallbackEmployees.map((employee) => ({ ...employee, id: String(employee.id) }));
};

export function EmployeeProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [audits, setAudits] = useState(() => safeParse(localStorage.getItem("employee-audits"), {}));

  useEffect(() => {
    localStorage.setItem("employee-audits", JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    const controller = new AbortController();

    const loadEmployees = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(EMPLOYEE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: "test",
            password: "123456"
          }),
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Employee API failed with status ${response.status}`);
        }

        const payload = await response.json();
        const normalized = normalizeEmployees(payload);
        console.log("Employee API status:", response.status);
        console.log("Employee API rows normalized:", normalized.length);
        setEmployees(normalized);
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          return;
        }

        console.error("Employee API fetch error:", fetchError);
        setEmployees(normalizeEmployees([]));
        setError("Using fallback employee data because the remote API is unavailable.");
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();

    return () => {
      controller.abort();
    };
  }, []);

  const value = useMemo(() => ({
    employees,
    loading,
    error,
    audits,
    getEmployeeById: (employeeId) => employees.find((employee) => String(employee.id) === String(employeeId)),
    saveAuditImage: (employeeId, audit) => {
      setAudits((current) => ({
        ...current,
        [employeeId]: {
          ...audit,
          employeeId: String(employeeId),
          updatedAt: new Date().toISOString()
        }
      }));
    }
  }), [audits, employees, error, loading]);

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
}

export function useEmployees() {
  const context = useContext(EmployeeContext);

  if (!context) {
    throw new Error("useEmployees must be used inside EmployeeProvider");
  }

  return context;
}