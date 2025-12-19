import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import { AiOutlineCloudUpload, AiOutlineCamera, AiOutlineReload } from 'react-icons/ai'
import { dataService } from '../services/dataService'
import { llmService } from '../services/llmService'
import { db } from '../db'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

const ItemForm = () => {
    const navigate = useNavigate()
    const [imageBlob, setImageBlob] = useState<string | null>(null)
    const [category, setCategory] = useState('tops')
    const [color, setColor] = useState('')
    const [season, setSeason] = useState('all')
    const [occasion, setOccasion] = useState('casual')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [settings, setSettings] = useState<any>(null)

    useEffect(() => {
        db.settings.get(1).then(setSettings)
    }, [])

    const handleTakePhoto = async (source: CameraSource) => {
        try {
            const image = await Camera.getPhoto({
                quality: 80,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: source
            })
            if (image.dataUrl) {
                setImageBlob(image.dataUrl)
            }
        } catch (e) {
            console.error("Camera cancelled/failed", e)
        }
    }

    const handleAnalyze = async () => {
        if (!imageBlob || !settings) return

        let apiKey = ''
        if (settings.selected_llm_provider === 'gemini') apiKey = settings.gemini_key
        else if (settings.selected_llm_provider === 'openai') apiKey = settings.openai_key
        // Anthropic Claude 3 Haiku supports vision but check docs if enabled for your key

        if (!apiKey) {
            toast.error("Please set API Key in Settings")
            return
        }

        setAnalyzing(true)
        try {
            const data = await llmService.analyzeImage(imageBlob, settings.selected_llm_provider, apiKey)
            if (data) {
                if (data.category) setCategory(data.category.toLowerCase())
                if (data.color) setColor(data.color)
                if (data.season) setSeason(data.season.toLowerCase())
                if (data.occasion) setOccasion(data.occasion.toLowerCase())
                if (data.notes) setNotes(data.notes)
                toast.success("Auto-filled by AI! ✨")
            }
        } catch (e) {
            console.error(e)
            toast.error("AI Analysis Failed")
        } finally {
            setAnalyzing(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!imageBlob) {
            toast.error("Please take a photo")
            return
        }
        setLoading(true)
        try {
            await dataService.createItem({
                category,
                color,
                season,
                occasion,
                notes,
                image_blob: imageBlob
            })
            toast.success("Item Added to Wardrobe!")
            navigate('/wardrobe')
        } catch (err) {
            console.error(err)
            toast.error("Failed to add item")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <Toaster />
            <h1 className="text-3xl font-sans font-bold text-on-surface mb-6">Add New Item</h1>

            <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-3xl shadow-md3-1 flex flex-col gap-6">
                {/* Image Upload */}
                <div className="flex flex-col gap-4">
                    {imageBlob ? (
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-variant">
                            <img src={imageBlob} className="w-full h-full object-contain" />
                            <button type="button" onClick={() => setImageBlob(null)} className="absolute top-4 right-4 bg-error text-on-error rounded-full p-2 shadow-md3-1">✕</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => handleTakePhoto(CameraSource.Camera)} className="aspect-square rounded-2xl bg-primary-container text-on-primary-container flex flex-col items-center justify-center gap-2 hover:bg-opacity-80 transition cursor-pointer">
                                <AiOutlineCamera className="text-4xl" />
                                <span className="font-medium">Take Photo</span>
                            </button>
                            <button type="button" onClick={() => handleTakePhoto(CameraSource.Photos)} className="aspect-square rounded-2xl bg-secondary-container text-on-secondary-container flex flex-col items-center justify-center gap-2 hover:bg-opacity-80 transition cursor-pointer">
                                <AiOutlineCloudUpload className="text-4xl" />
                                <span className="font-medium">Gallery</span>
                            </button>
                        </div>
                    )}

                    {imageBlob && (
                        <button
                            type="button"
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="w-full bg-tertiary-container text-on-tertiary-container py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-md3-1 transition disabled:opacity-50"
                        >
                            {analyzing ? <AiOutlineReload className="animate-spin" /> : '✨'}
                            {analyzing ? 'Analyzing Image...' : 'Auto-Fill with AI'}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Category</label>
                        <select className="w-full bg-surface-variant border-none p-3 rounded-xl text-on-surface-variant" value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="tops">Tops</option>
                            <option value="bottoms">Bottoms</option>
                            <option value="dresses">Dresses</option>
                            <option value="shoes">Shoes</option>
                            <option value="accessories">Accessories</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Color</label>
                        <input type="text" className="w-full bg-surface-variant border-none p-3 rounded-xl text-on-surface-variant" placeholder="e.g. Red" value={color} onChange={e => setColor(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Season</label>
                        <select className="w-full bg-surface-variant border-none p-3 rounded-xl text-on-surface-variant" value={season} onChange={e => setSeason(e.target.value)}>
                            <option value="all">All Seasons</option>
                            <option value="summer">Summer</option>
                            <option value="winter">Winter</option>
                            <option value="spring">Spring</option>
                            <option value="autumn">Autumn</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Occasion</label>
                        <select className="w-full bg-surface-variant border-none p-3 rounded-xl text-on-surface-variant" value={occasion} onChange={e => setOccasion(e.target.value)}>
                            <option value="casual">Casual</option>
                            <option value="formal">Formal</option>
                            <option value="party">Party</option>
                            <option value="sports">Sports</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Notes</label>
                    <textarea className="w-full bg-surface-variant border-none p-3 rounded-xl text-on-surface-variant" rows={3} value={notes} onChange={e => setNotes(e.target.value)}></textarea>
                </div>

                <button type="submit" disabled={loading} className="bg-primary text-on-primary font-bold py-4 rounded-full hover:shadow-md3-2 transition disabled:opacity-50 text-lg">
                    {loading ? 'Saving...' : 'Add to Wardrobe'}
                </button>
            </form>
        </div>
    )
}

export default ItemForm
