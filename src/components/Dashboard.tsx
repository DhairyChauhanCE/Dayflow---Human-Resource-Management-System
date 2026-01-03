import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { EmployeeDashboard } from "./EmployeeDashboard";
import { AdminDashboard } from "./AdminDashboard";

interface DashboardProps {
  employee: any;
}

export function Dashboard({ employee }: DashboardProps) {
  if (employee.role === "admin" || employee.role === "hr") {
    return <AdminDashboard employee={employee} />;
  }

  return <EmployeeDashboard employee={employee} />;
}
