import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AiOutlinePlus, AiOutlineSkin } from 'react-icons/ai'
import { GiClothes } from 'react-icons/gi'
import { dataService } from '../services/dataService'

const Dashboard = () => {
    const [stats, setStats] = useState({ items: 0, outfits: 0 })

    useEffect(() => {
        const loadStats = async () => {
            const items = await dataService.getItems()
            const outfits = await dataService.getOutfits()
            setStats({ items: items.length, outfits: outfits.length })
        }
        loadStats()
    }, [])

    return (
        <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">Start your day</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Stats Cards */}
                <div className="bg-surface p-6 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-on-surface-variant text-sm">Total Items</p>
                        <p className="text-3xl font-bold text-on-surface">{stats.items}</p>
                    </div>
                    <div className="bg-primary-container p-4 rounded-full text-on-primary-container">
                        <GiClothes className="text-2xl" />
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-on-surface-variant text-sm">Saved Outfits</p>
                        <p className="text-3xl font-bold text-on-surface">{stats.outfits}</p>
                    </div>
                    <div className="bg-secondary-container p-4 rounded-full text-on-secondary-container">
                        <AiOutlineSkin className="text-2xl" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/items/new" className="bg-surface p-6 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4 group">
                    <div className="bg-surface-variant p-3 rounded-lg group-hover:bg-primary group-hover:text-on-primary text-on-surface-variant transition">
                        <AiOutlinePlus className="text-xl" />
                    </div>
                    <span className="font-semibold text-on-surface">Add New Item</span>
                </Link>

                <Link to="/recommend" className="bg-primary p-6 rounded-xl shadow-md text-on-primary flex items-center justify-between hover:opacity-90 transition">
                    <span className="font-bold text-lg">Get Outfit Suggestion</span>
                    <span className="text-2xl">✨</span>
                </Link>
            </div>
        </div>
    )
}

export default Dashboard
