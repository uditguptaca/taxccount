'use client';
import React from 'react';
import './t1.css';

/** Every T1 screen sits inside this: the stylesheet only applies within it. */
export default function Scope({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`t1-scope ${className}`}>{children}</div>;
}
