"use client";

import React from "react";
import { BigButton as UIBigButton, type BigButtonProps as UIBigButtonProps } from "../ui/BigButton";

export interface BigButtonProps extends Omit<UIBigButtonProps, "icon"> {
  icon?: React.ReactNode;
}

export function BigButton(props: BigButtonProps) {
  return <UIBigButton size="patient" {...props} />;
}
