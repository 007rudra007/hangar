import { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { AiOutlineCamera, AiOutlineCloudUpload, AiOutlineReload } from 'react-icons/ai'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { dataService } from '../services/dataService'
import { db } from '../db'
import { Item } from '../types'

const RecreateOutfit = () => {
    // navigate is used if we want to redirect, but currently unused in logic. Keeping for structure or removing.
    // const navigate = useNavigate() 
    const [imageBlob, setImageBlob] = useState<string | null>(null)
    const [matchingItems, setMatchingItems] = useState<Item[]>([])
    const [analyzing, setAnalyzing] = useState(false)
    const [settings, setSettings] = useState<any>(null)
    const [allItems, setAllItems] = useState<Item[]>([])

    useEffect(() => {
        db.settings.get(1).then(setSettings)
        dataService.getItems().then(setAllItems)
    }, [])

    const handleTakePhoto = async (source: CameraSource) => {
        try {
            const image = await Camera.getPhoto({
                quality: 80,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: source
            })
            if (image.dataUrl) setImageBlob(image.dataUrl)
        } catch (e) {
            console.error(e)
        }
    }

    const handleRecreate = async () => {
        if (!imageBlob || !settings) {
            toast.error("Need Image + API Key")
            return
        }

        const apiKey = settings.gemini_key || settings.openai_key || ''
        if (!apiKey) {
            toast.error("No API Key found")
            return
        }

        setAnalyzing(true)
        setMatchingItems([])

        try {
            // Create a mini-catalog (ID + Description) for the LLM
            const catalog = allItems.map(item => ({
                id: item.id,
                desc: `${item.color} ${item.category} (${item.season}, ${item.occasion}) - ${item.notes}`
            }))

            const prompt = `
                I have an image of an outfit I want to recreate. 
                Below is my wardrobe catalog:
                ${JSON.stringify(catalog)}

                Analyze the image. Find the items from my wardrobe that BEST match the items in the image to recreate this look.
                Return ONLY valid JSON with a key "matched_item_ids" containing an array of IDs (numbers) of the matching items.
            `

            let resultIds: number[] = []

            // Use the analyzeImage capability but with custom prompt logic 
            // Since existing analyzeImage is fixed to returning metadata, we'll inline a custom call or overload it.
            // For speed, let's reuse the analyzeImage pattern but modify llmService slightly OR just do a direct fetch here 
            // actually, let's add a generic 'chatWithImage' to llmService or just patch it here.

            // To keep it clean, I will assume we can use the same provider logic.
            // I'll quickly patch llmService to support custom Prompt + Image in next step or just implement raw fetch here.
            // Implementing RAW fetch here for simplicity and speed.

            if (settings.selected_llm_provider === 'gemini') {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
                const base64Data = imageBlob.split(',')[1]
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: prompt },
                                { inline_data: { mime_type: "image/jpeg", data: base64Data } }
                            ]
                        }]
                    })
                })
                const data = await response.json()
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
                const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}")
                resultIds = json.matched_item_ids || []
            }
            // Add OpenAI support if needed, similar pattern

            if (resultIds.length > 0) {
                const matches = allItems.filter(i => resultIds.includes(i.id!))
                setMatchingItems(matches)
                toast.success(`Found ${matches.length} matching items!`)
            } else {
                toast.error("No matches found")
            }

        } catch (e) {
            console.error(e)
            toast.error("Analysis Failed")
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <div className="pb-24">
            <Toaster />
            <h1 className="text-3xl font-sans font-bold text-on-surface mb-6">Recreate Outfit</h1>

            <div className="bg-surface p-6 rounded-3xl shadow-md3-1 mb-8">
                {!imageBlob ? (
                    <div className="flex gap-4">
                        <button onClick={() => handleTakePhoto(CameraSource.Camera)} className="flex-1 aspect-video rounded-xl bg-primary-container text-on-primary-container flex flex-col items-center justify-center gap-2 font-bold hover:opacity-80 transition">
                            <AiOutlineCamera className="text-3xl" /> Camera
                        </button>
                        <button onClick={() => handleTakePhoto(CameraSource.Photos)} className="flex-1 aspect-video rounded-xl bg-secondary-container text-on-secondary-container flex flex-col items-center justify-center gap-2 font-bold hover:opacity-80 transition">
                            <AiOutlineCloudUpload className="text-3xl" /> Gallery
                        </button>
                    </div>
                ) : (
                    <div className="relative rounded-2xl overflow-hidden bg-black/10">
                        <img src={imageBlob} className="w-full h-64 object-contain" />
                        <button onClick={() => setImageBlob(null)} className="absolute top-2 right-2 bg-error text-white p-2 rounded-full shadow">✕</button>
                    </div>
                )}

                {imageBlob && (
                    <button onClick={handleRecreate} disabled={analyzing} className="w-full mt-4 bg-primary text-on-primary py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:shadow-lg transition">
                        {analyzing ? <AiOutlineReload className="animate-spin" /> : '✨ Recreate with My Wardrobe'}
                    </button>
                )}
            </div>

            {/* Results */}
            {matchingItems.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-on-surface mb-4">Suggested Items</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {matchingItems.map(item => (
                            <div key={item.id} className="bg-surface rounded-2xl p-2 shadow-md3-1">
                                <img src={item.image_path} className="w-full aspect-square object-cover rounded-xl mb-2" />
                                <p className="font-bold text-on-surface text-center capitalize">{item.category}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default RecreateOutfit
