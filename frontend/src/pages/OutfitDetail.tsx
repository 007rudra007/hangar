import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AiOutlineDelete, AiOutlineCalendar } from 'react-icons/ai'
import { dataService } from '../services/dataService'
import { Outfit } from '../types'

const OutfitDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [outfit, setOutfit] = useState<Outfit | null>(null)

    useEffect(() => {
        if (id) fetchOutfit(parseInt(id))
    }, [id])

    const fetchOutfit = async (oid: number) => {
        const data = await dataService.getOutfit(oid)
        setOutfit(data || null)
    }

    const handleDelete = async () => {
        if (confirm("Delete this outfit?")) {
            if (id) await dataService.deleteOutfit(parseInt(id))
            navigate('/outfits')
        }
    }

    if (!outfit) return <div>Loading...</div>

    return (
        <div>
            <div className="bg-surface p-6 rounded-xl shadow-sm mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-on-surface mb-2">{outfit.name}</h1>
                        <div className="flex gap-2 text-sm text-on-surface-variant">
                            <span className="flex items-center gap-1 bg-surface-variant px-2 py-1 rounded-lg capitalize">
                                <AiOutlineCalendar /> {outfit.season}
                            </span>
                            <span className="bg-surface-variant px-2 py-1 rounded-lg capitalize">
                                {outfit.occasion}
                            </span>
                        </div>
                    </div>
                    <button onClick={handleDelete} className="text-error hover:bg-error/10 p-2 rounded-lg">
                        <AiOutlineDelete className="text-xl" />
                    </button>
                </div>
            </div>

            <h2 className="text-xl font-bold text-on-surface mb-4">Items in this Outfit</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {outfit.items.map(({ item }) => (
                    <div key={item.id} className="bg-surface rounded-xl shadow-sm overflow-hidden">
                        <div className="aspect-[3/4]">
                            <img src={item.image_path} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2">
                            <p className="font-semibold text-sm capitalize">{item.category}</p>
                            <p className="text-xs text-on-surface-variant">{item.color}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OutfitDetail
