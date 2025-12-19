import Dexie, { Table } from 'dexie';

export interface LocalItem {
    id?: number;
    category: string;
    sub_category?: string;
    color: string;
    season: string;
    occasion: string; // 'casual', 'formal', 'party', 'sports', 'other'
    image_blob: string; // Base64 or Blob URL
    notes?: string;
    isFavorite?: boolean;
    created_at: Date;
}

export interface LocalOutfit {
    id?: number;
    name: string;
    season: string;
    occasion: string;
    items: number[]; // Array of Item IDs
    created_at: Date;
}

export interface AppSettings {
    id?: number; // singleton (1)
    openai_key?: string;
    gemini_key?: string;
    anthropic_key?: string;
    openrouter_key?: string;
    openrouter_model?: string;
    nano_banana_key?: string;
    use_online_vton: boolean;
    selected_llm_provider: 'openai' | 'gemini' | 'anthropic' | 'openrouter';

    // Onboarding & Profile
    onboarding_complete?: boolean;
    user_age?: string;
    user_gender?: string;
    user_style?: string;
}

export class WardrobeDB extends Dexie {
    items!: Table<LocalItem>;
    outfits!: Table<LocalOutfit>;
    settings!: Table<AppSettings>;

    constructor() {
        super('WardrobeDB');
        this.version(2).stores({
            items: '++id, category, sub_category, season, occasion, isFavorite',
            outfits: '++id, name, season, occasion',
            settings: '++id'
        });
        // Keep version 1 for backward compatibility if needed, but simplest for this task is just to upgrade.
    }
}

export const db = new WardrobeDB();
