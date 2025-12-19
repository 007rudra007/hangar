import { db, LocalItem, LocalOutfit } from '../db'
import { Item, Outfit } from '../types'

// Helper to convert File to Base64
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = error => reject(error)
    })
}

// Data Service
export const dataService = {
    // Items
    getItems: async (): Promise<Item[]> => {
        const items = await db.items.toArray()
        return items.map(mapLocalItemToItem)
    },

    getItem: async (id: number): Promise<Item | undefined> => {
        const item = await db.items.get(id)
        return item ? mapLocalItemToItem(item) : undefined
    },

    createItem: async (data: Omit<LocalItem, 'id' | 'created_at'>): Promise<Item> => {
        const id = await db.items.add({
            ...data,
            created_at: new Date()
        })
        const item = await db.items.get(id)
        return mapLocalItemToItem(item!)
    },

    deleteItem: async (id: number) => {
        return db.items.delete(id)
    },

    toggleFavorite: async (id: number) => {
        const item = await db.items.get(id)
        if (item) {
            await db.items.update(id, { isFavorite: !item.isFavorite })
        }
    },

    // Outfits
    getOutfits: async (): Promise<Outfit[]> => {
        const outfits = await db.outfits.toArray()
        // We need to resolve items for each outfit
        const resolvedOutfits = await Promise.all(outfits.map(async (o) => {
            const items = await db.items.where('id').anyOf(o.items).toArray()
            return {
                id: o.id!,
                name: o.name,
                season: o.season,
                occasion: o.occasion,
                created_at: o.created_at.toISOString(),
                items: items.map(i => ({ item: mapLocalItemToItem(i) }))
            }
        }))
        return resolvedOutfits
    },

    getOutfit: async (id: number): Promise<Outfit | undefined> => {
        const o = await db.outfits.get(id)
        if (!o) return undefined
        const items = await db.items.where('id').anyOf(o.items).toArray()
        return {
            id: o.id!,
            name: o.name,
            season: o.season,
            occasion: o.occasion,
            created_at: o.created_at.toISOString(),
            items: items.map(i => ({ item: mapLocalItemToItem(i) }))
        }
    },

    createOutfit: async (data: Omit<LocalOutfit, 'id' | 'created_at'>): Promise<number> => {
        return db.outfits.add({
            ...data,
            created_at: new Date()
        })
    },

    deleteOutfit: async (id: number) => {
        return db.outfits.delete(id)
    }
}

// Mapper
const mapLocalItemToItem = (local: LocalItem): Item => {
    return {
        id: local.id!,
        category: local.category,
        color: local.color,
        season: local.season,
        occasion: local.occasion,
        notes: local.notes,
        isFavorite: local.isFavorite,
        image_path: local.image_blob, // This is a Data URL now, so <img src={image_path} /> works
        created_at: local.created_at.toISOString()
    }
}
