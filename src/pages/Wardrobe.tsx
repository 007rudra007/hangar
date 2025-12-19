import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AiOutlinePlus, AiOutlineSearch, AiOutlineCloudDownload } from 'react-icons/ai'
import { dataService } from '../services/dataService'
import { pdfService } from '../services/pdfService'
import { Item } from '../types'
import { toast, Toaster } from 'react-hot-toast'

const Wardrobe = () => {
    const [items, setItems] = useState<Item[]>([])
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        const data = await dataService.getItems()
        setItems(data)
    }

    const filteredItems = items.filter(item => {
        const matchesCategory = filter === 'all' || item.category === filter
        const matchesSearch = item.color.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const handleExportPDF = async () => {
        try {
            await pdfService.generateWardrobePDF(items)
            toast.success("PDF Downloaded!")
        } catch (e) {
            toast.error("Export Failed")
        }
    }

    return (
        <div className="pb-24">
            <Toaster />
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-sans font-bold text-on-surface">My Wardrobe</h1>
                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-64">
                        <AiOutlineSearch className="absolute left-4 top-3.5 text-outline text-xl" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-12 pr-4 py-3 rounded-full bg-surface-variant text-on-surface-variant border-none focus:ring-2 focus:ring-primary transition"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={handleExportPDF} className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-opacity-80 transition shadow-md3-1 font-medium">
                        <AiOutlineCloudDownload className="text-xl" /> PDF
                    </button>
                    <Link to="/items/new" className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-opacity-80 transition shadow-md3-1 font-medium">
                        <AiOutlinePlus className="text-xl" /> Add
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
                {['all', 'tops', 'bottoms', 'dresses', 'shoes', 'accessories'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border border-transparent
                            ${filter === cat
                                ? 'bg-secondary text-white shadow-md3-1'
                                : 'bg-surface text-on-surface-variant hover:bg-surface-variant border-outline/20'}`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map(item => (
                    <Link key={item.id} to={`/items/${item.id}`} className="bg-surface rounded-2xl shadow-md3-1 overflow-hidden hover:shadow-md3-2 transition-all group border border-outline/10">
                        <div className="aspect-[3/4] bg-surface-variant overflow-hidden">
                            <img src={item.image_path} alt={item.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-sans font-medium text-on-surface capitalize text-lg">{item.category}</h3>
                                <div className={`w-3 h-3 rounded-full mt-2`} style={{ backgroundColor: item.color.toLowerCase() }}></div>
                            </div>
                            <div className="flex gap-2 text-xs">
                                <span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded-md capitalize font-medium">{item.color}</span>
                                <span className="bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded-md capitalize font-medium">{item.season}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20 text-on-surface-variant">
                    No items found. Add some clothes!
                </div>
            )}
        </div>
    )
}

export default Wardrobe
