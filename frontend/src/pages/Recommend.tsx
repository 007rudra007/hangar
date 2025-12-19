import { useState, useEffect } from 'react'

import { dataService } from '../services/dataService'
import { llmService } from '../services/llmService'
import { db } from '../db'
import { Item } from '../types'
import { Toaster, toast } from 'react-hot-toast'

const Recommend = () => {
    const [items, setItems] = useState<Item[]>([])
    const [occasion, setOccasion] = useState('')
    const [preferences, setPreferences] = useState('')
    const [loading, setLoading] = useState(false)
    const [resultText, setResultText] = useState('')
    const [recommendedItems, setRecommendedItems] = useState<Item[]>([])

    useEffect(() => {
        loadItems()
    }, [])

    const loadItems = async () => {
        const data = await dataService.getItems()
        setItems(data)
    }

    const handleRecommend = async () => {
        setLoading(true)
        setResultText('')
        setRecommendedItems([])
        try {
            const settings = await db.settings.get(1)
            if (!settings || (!settings.openai_key && !settings.gemini_key && !settings.anthropic_key)) {
                toast.error("Please configure API Keys in Settings")
                setLoading(false)
                return
            }

            const provider = settings.selected_llm_provider || 'gemini'
            const key = provider === 'openai' ? settings.openai_key : (provider === 'anthropic' ? settings.anthropic_key : settings.gemini_key)

            if (!key) {
                toast.error(`No API Key for ${provider}`)
                setLoading(false)
                return
            }

            const response = await llmService.callLLM(provider, key, items, occasion, preferences)

            // Try to parse JSON
            try {
                // Heuristic to find JSON block
                const jsonMatch = response.match(/\{[\s\S]*\}/)
                const jsonStr = jsonMatch ? jsonMatch[0] : response
                const parsed = JSON.parse(jsonStr)

                if (parsed.notes) setResultText(parsed.notes)
                if (parsed.items && Array.isArray(parsed.items)) {
                    // Filter items by ID
                    const recIds = parsed.items as number[]
                    const recItems = items.filter(i => recIds.includes(i.id))
                    setRecommendedItems(recItems)
                }
            } catch (e) {
                // If parsing fails, just show raw text
                setResultText(response)
            }

        } catch (err: any) {
            console.error(err)
            toast.error(err.message)
            setResultText(`Error: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveOutfit = async () => {
        if (recommendedItems.length === 0) return
        try {
            await dataService.createOutfit({
                name: `${occasion} Outfit`,
                season: recommendedItems[0].season, // heuristic
                occasion: occasion,
                items: recommendedItems.map(i => i.id)
            })
            toast.success("Outfit Saved!")
        } catch (e) {
            toast.error("Failed to save outfit")
        }
    }

    return (
        <div className="pb-24">
            <Toaster />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">AI Stylist</h1>

            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline/10 mb-6">
                <div className="mb-4">
                    <label className="block text-on-surface-variant text-sm font-medium mb-2">Occasion</label>
                    <input
                        type="text"
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        placeholder="e.g. Date Night, Office, Beach Party"
                        className="w-full bg-surface-variant border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-on-surface-variant text-sm font-medium mb-2">Personal Preferences / Notes</label>
                    <textarea
                        value={preferences}
                        onChange={(e) => setPreferences(e.target.value)}
                        placeholder="e.g. I want to look edgy, prefer black, no shorts..."
                        className="w-full bg-surface-variant border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary h-24"
                    />
                </div>

                <button
                    onClick={handleRecommend}
                    disabled={loading || !occasion}
                    className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50"
                >
                    {loading ? 'Thinking...' : 'Get Recommendation'}
                </button>
            </div>

            {(resultText || recommendedItems.length > 0) && (
                <div className="space-y-6">
                    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline/10">
                        <h2 className="text-xl font-bold text-on-surface mb-3">Suggestion</h2>
                        <p className="text-on-surface-variant whitespace-pre-wrap leading-relaxed">{resultText}</p>
                    </div>

                    {recommendedItems.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-on-surface">Recommended Pieces</h2>
                                <button onClick={handleSaveOutfit} className="bg-secondary text-on-secondary px-4 py-2 rounded-lg text-sm font-bold">
                                    Save Outfit
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {recommendedItems.map(item => (
                                    <div key={item.id} className="bg-surface rounded-xl overflow-hidden shadow-sm border border-outline/10">
                                        <div className="aspect-square">
                                            <img src={item.image_path} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-3">
                                            <p className="font-bold text-on-surface text-sm truncate">{item.category}</p>
                                            <p className="text-xs text-on-surface-variant">{item.color}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Recommend
