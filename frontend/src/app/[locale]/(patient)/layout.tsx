import React from "react";
import { PatientBottomBar } from "@/components/patient/PatientBottomBar";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col justify-between min-h-[calc(100vh-60px)]">
      <div className="flex-1 flex flex-col">{children}</div>
      <PatientBottomBar />
    </div>
  );
}
