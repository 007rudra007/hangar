export interface User {
    id: number;
    email: string;
    name?: string;
}

export interface Item {
    id: number;
    image_path: string;
    category: string;
    color: string;
    season: string;
    occasion: string;
    notes?: string;
    isFavorite?: boolean;
    created_at: string;
}

export interface Outfit {
    id: number;
    name: string;
    season?: string;
    occasion?: string;
    main_image_path?: string;
    items: Array<{ item: Item }>;
    created_at: string;
}

export interface BasePhoto {
    id: number;
    image_path: string;
    created_at: string;
}

export interface TryOnImage {
    id: number;
    image_path: string;
    item_id: number;
    base_photo_id: number;
    created_at: string;
}
