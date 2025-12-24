import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    admin?: Admin;
}

export interface Admin {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    email_verified_at?: string | null;
    created_at: string;
    updated_at: string;
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
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
    erd?: string;
}

export interface Repository {
    id: number;
    provider: string;
    repo_id: string;
    name: string;
    full_name: string;
    owner_login: string;
    owner_type: string;
    default_branch: string;
    html_url: string;
    ssh_url: string;
    visibility: string;
}

export interface CurrentProject {
    id: number;
    name: string;
    status: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    flash: FlashMessages;
    currentProject?: CurrentProject;
    repository?: Repository | null;
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

// ============================================
// Project-related types (shared across pages)
// ============================================

/**
 * Core Project entity used across all project pages.
 * WHY: This was duplicated in 12+ files, causing sync issues when the backend model changed.
 */
export interface Project {
    id: number;
    name: string;
    brief: string;
    overview: string;
    non_functional_requirements: string;
    technical_details: string;
    status: string;
    c4: string | null;
    erd?: string | null;
    created_at: string;
    updated_at: string;
    prd_is_synced?: boolean;
    brainstorming_scene?: unknown;
    user_id?: number;
}

/**
 * Sections represent the completion status of various project documentation.
 * WHY: Previously defined inline in 8+ files with slight variations.
 */
export interface Sections {
    overview: string | null;
    prd: string | null;
    data_modeling: string | null;
    wireframes?: string | null;
    technical_details?: string | null;
    user_stories?: string | null;
    non_functional_requirements: string | null;
}

/**
 * Version tracking for System Overview iterations.
 */
export interface OverviewVersion {
    id: number;
    project_id: number;
    overview: string;
    version_number: number;
    is_base_version: boolean;
    user_prompt: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Version tracking for PRD iterations.
 */
export interface PRDVersion {
    id: number;
    project_id: number;
    prd_content: string;
    version_number: number;
    is_base_version: boolean;
    user_prompt: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Chat message structure used in AI-assisted editing.
 */
export interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    versionId?: number;
}
