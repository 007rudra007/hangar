import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AiOutlinePlus } from 'react-icons/ai'
import { dataService } from '../services/dataService'
import { Outfit } from '../types'

const Outfits = () => {
    const [outfits, setOutfits] = useState<Outfit[]>([])

    useEffect(() => {
        fetchOutfits()
    }, [])

    const fetchOutfits = async () => {
        const data = await dataService.getOutfits()
        setOutfits(data)
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-on-surface">My Outfits</h1>
                <div className="flex gap-2">
                    <Link to="/recommend" className="bg-surface border border-primary text-primary px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-surface-variant transition shadow-sm">
                        Get Recommendation
                    </Link>
                    <Link to="/outfits/new" className="bg-primary text-on-primary px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition shadow-md">
                        <AiOutlinePlus /> Create Outfit
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outfits.map(outfit => (
                    <Link key={outfit.id} to={`/outfits/${outfit.id}`} className="bg-surface rounded-xl shadow-md3-1 overflow-hidden group hover:shadow-md3-2 transition border border-outline/10">
                        <div className="aspect-video bg-surface-variant relative">
                            {outfit.items.length > 0 ? (
                                <div className="grid grid-cols-2 h-full">
                                    {outfit.items.slice(0, 4).map((i, idx) => (
                                        <img key={idx} src={i.item.image_path} className="w-full h-full object-cover" />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-on-surface-variant">No items</div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-on-surface text-lg">{outfit.name}</h3>
                            <div className="flex gap-2 text-xs text-on-surface-variant mt-2">
                                <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full capitalize">{outfit.occasion}</span>
                                <span className="bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full capitalize">{outfit.season}</span>
                            </div>
                            <p className="text-sm text-on-surface-variant mt-2">{outfit.items.length} items</p>
                        </div>
                    </Link>
                ))}
            </div>

            {outfits.length === 0 && (
                <div className="text-center py-20 text-on-surface-variant">
                    No outfits created yet.
                </div>
            )}
        </div>
    )
}

export default Outfits
