import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Partner {
  id: number;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
  partners_url: string;
  colls_url: string;
  lock_version: number;
  rel_path: string;
  collections: Collection[];
}

export interface Collection {
  id: string;
  partner_id: string;
  owner_id: string;
  code: string;
  display_code: string;
  name: string;
  coll_type: string;
  classification: string;
  created_at: string;
  updated_at: string;
  quota: number;
  ready_for_content: boolean;
  partner_url: string;
  owner_url: string;
  ses_url: string;
  ies_url: string;
  lock_version: number;
  rel_path: string;
  partner: Partner;
}
