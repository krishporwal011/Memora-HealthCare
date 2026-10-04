"use client";

import React from "react";
import { StatusChip, type StatusLevel } from "../ui/StatusChip";

type StatusVariant = "checkin" | "watch" | "steady";

interface StatusBadgeProps {
  status: StatusVariant;
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return <StatusChip status={status as StatusLevel} label={label} size="sm" />;
}
