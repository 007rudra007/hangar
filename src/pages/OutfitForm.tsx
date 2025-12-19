import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dataService } from '../services/dataService'
import { Item } from '../types'
import { toast, Toaster } from 'react-hot-toast'

const OutfitForm = () => {
    const navigate = useNavigate()
    const [items, setItems] = useState<Item[]>([])
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [name, setName] = useState('')
    const [season, setSeason] = useState('summer')
    const [occasion, setOccasion] = useState('casual')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchItems = async () => {
            const data = await dataService.getItems()
            setItems(data)
        }
        fetchItems()
    }, [])

    const toggleItem = (id: number) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(i => i !== id))
        } else {
            setSelectedItems([...selectedItems, id])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedItems.length === 0) {
            toast.error("Select at least one item")
            return
        }
        setLoading(true)
        try {
            await dataService.createOutfit({
                name,
                season,
                occasion,
                items: selectedItems
            })
            toast.success("Outfit Created!")
            navigate('/outfits')
        } catch (err) {
            toast.error("Failed to create outfit")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Toaster />
            <h1 className="text-2xl font-bold text-on-surface mb-6">Create New Outfit</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="bg-surface p-6 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Outfit Name</label>
                        <input
                            type="text"
                            required
                            className="w-full border-none bg-surface-variant text-on-surface p-2 rounded-lg"
                            placeholder="e.g. Summer Date Night"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Occasion</label>
                        <select className="w-full border-none bg-surface-variant text-on-surface p-2 rounded-lg" value={occasion} onChange={e => setOccasion(e.target.value)}>
                            <option value="casual">Casual</option>
                            <option value="formal">Formal</option>
                            <option value="party">Party</option>
                            <option value="sports">Sports</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Season</label>
                        <select className="w-full border-none bg-surface-variant text-on-surface p-2 rounded-lg" value={season} onChange={e => setSeason(e.target.value)}>
                            <option value="summer">Summer</option>
                            <option value="winter">Winter</option>
                            <option value="spring">Spring</option>
                            <option value="autumn">Autumn</option>
                        </select>
                    </div>
                </div>

                <h2 className="text-lg font-semibold">Select Items</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map(item => (
                        <div
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className={`aspect-[3/4] bg-surface rounded-lg overflow-hidden cursor-pointer border-2 transition relative ${selectedItems.includes(item.id) ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-transparent'}`}
                        >
                            <img src={item.image_path} className="w-full h-full object-cover" />
                            {selectedItems.includes(item.id) && (
                                <div className="absolute top-2 right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                    ✓
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="sticky bottom-4 bg-surface p-4 shadow-lg rounded-xl border border-outline/10 flex justify-between items-center">
                    <span className="font-medium text-on-surface">{selectedItems.length} items selected</span>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:bg-indigo-600 transition disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Outfit'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default OutfitForm
