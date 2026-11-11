'use client';
// Pieces every Service Master list screen uses.
import React from 'react';
import { Pencil, Plus } from 'lucide-react';
import type { CatalogItem, Kind as ItemKind } from '@/lib/compliance/catalog';
import type { CountryPack } from '@/lib/compliance/types';
import { Badge, btnPrimary, btnSm } from './ui';
import type { Catalog } from './useCatalog';

export interface ViewProps { cat: Catalog; pack: CountryPack; open: (kind: ItemKind, item?: CatalogItem | null, preset?: any, presetId?: string) => void }
export const BASE = '/platform/service-master';
export const TODAY = () => new Date().toISOString().slice(0, 10);
export const Status = ({ it }: { it: CatalogItem }) => (<span className="flex flex-wrap gap-1">{!it.active && <Badge tone="amber">switched off</Badge>}{it.origin !== 'builtin' ? <Badge tone="indigo">added by you</Badge> : it.edited ? <Badge tone="indigo">changed by you</Badge> : null}</span>);
export function Card({ title, right, children, sub }: { title: string; right?: React.ReactNode; children: React.ReactNode; sub?: string }) {
  return (<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"><div><h2 className="text-sm font-bold">{title}</h2>{sub && <p className="text-xs text-slate-500">{sub}</p>}</div>{right}</div>{children}</section>);
}
export const EditBtn = ({ onClick, label = 'Edit' }: { onClick: () => void; label?: string }) => <button type="button" className={btnSm} onClick={onClick}><Pencil className="h-3 w-3" />{label}</button>;
export const AddBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => <button type="button" className={btnPrimary} onClick={onClick}><Plus className="h-4 w-4" />{children}</button>;
