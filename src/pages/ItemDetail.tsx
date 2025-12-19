import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AiOutlineDelete, AiOutlineSkin, AiOutlinePlus } from 'react-icons/ai'
import { db } from '../db'
import { dataService, fileToBase64 } from '../services/dataService'
import { vtonService } from '../services/vtonService'
import { Item } from '../types'
import { toast } from 'react-hot-toast'

const ItemDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [item, setItem] = useState<Item | null>(null)

    // TryOn State
    const [showTryOn, setShowTryOn] = useState(false)
    const [selectedBaseBlob, setSelectedBaseBlob] = useState<string | null>(null) // DataURL
    const [generating, setGenerating] = useState(false)
    const [tryOnResult, setTryOnResult] = useState<string | null>(null)

    useEffect(() => {
        if (id) fetchItem(parseInt(id))
    }, [id])

    const fetchItem = async (itemId: number) => {
        const data = await dataService.getItem(itemId)
        setItem(data || null)
    }

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this item?')) {
            if (id) await dataService.deleteItem(parseInt(id))
            navigate('/wardrobe')
        }
    }

    const handleUploadBasePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0])
            setSelectedBaseBlob(base64)
        }
    }

    const handleGenerateTryOn = async () => {
        if (!selectedBaseBlob || !item) return
        setGenerating(true)

        try {
            const settings = await db.settings.get(1)
            const useOnline = settings?.use_online_vton && navigator.onLine

            if (useOnline) {
                if (!navigator.onLine) {
                    toast.error("You are offline. Cannot use Online VTON.")
                    setGenerating(false)
                    return
                }
                if (!settings?.nano_banana_key && !settings?.openrouter_key && !settings?.gemini_key) {
                    if (!settings?.nano_banana_key) {
                        toast.error("Online VTON requires Nano Banana API Key in Settings.")
                        setGenerating(false)
                        return
                    }
                }

                if (settings?.nano_banana_key) {
                    const baseBlob = await (await fetch(selectedBaseBlob)).blob()
                    const itemBlob = await (await fetch(item.image_path)).blob()

                    const result = await vtonService.onlineTryOn(settings.nano_banana_key, baseBlob, itemBlob)
                    setTryOnResult(result)
                }
            } else {
                // Offline checks
                if (!useOnline && settings?.use_online_vton) {
                    toast.error("You are offline. Cannot use Online VTON.")
                    setGenerating(false)
                    return
                }

                // If user doesn't want offline fallback without key (implied by request):
                // We'll enforce that "Try-On" requires valid configuration if they think it's AI.
                // But for utility, let's allow offline canvas but warn or label it.
                // Actually, user request: "virtual try on shouldnt work offline or without api key"
                // So if !useOnline/!key, we block it.

                if (!settings?.use_online_vton) {
                    toast.error("Virtual Try-On requires 'Online VTON' to be enabled in Settings with a valid API Key.");
                    setGenerating(false);
                    return;
                }

                // If we got here, it might be a weird state where use_online_vton is true but navigator.onLine is false, which is handled above.
                // So basically, remove offline fallback entirely as per strict interpretation.
            }
        } catch (err) {
            console.error(err)
            toast.error("Try-On Failed")
        } finally {
            setGenerating(false)
        }
    }

    if (!item) return <div>Loading...</div>

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
                <div className="rounded-xl overflow-hidden shadow-sm bg-surface">
                    <img src={item.image_path} alt={item.category} className="w-full h-auto object-cover" />
                </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col gap-6">
                <div className="bg-surface p-6 rounded-xl shadow-sm border border-outline/10">
                    <h1 className="text-3xl font-bold text-on-surface capitalize mb-4">{item.category}</h1>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div><p className="text-on-surface-variant text-sm">Color</p><p className="font-medium text-on-surface">{item.color}</p></div>
                        <div><p className="text-on-surface-variant text-sm">Season</p><p className="font-medium capitalize text-on-surface">{item.season}</p></div>
                        <div><p className="text-on-surface-variant text-sm">Occasion</p><p className="font-medium capitalize text-on-surface">{item.occasion}</p></div>
                    </div>
                    {item.notes && <div className="mb-6"><p className="text-on-surface-variant text-sm">Notes</p><p className="text-on-surface">{item.notes}</p></div>}

                    <div className="flex gap-3 pt-4">
                        <button onClick={() => setShowTryOn(true)} className="flex-1 bg-primary text-on-primary font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2">
                            <AiOutlineSkin className="text-xl" /> Virtual Try-On
                        </button>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={async () => {
                                await dataService.toggleFavorite(item.id!)
                                const updated = await dataService.getItem(item.id!)
                                setItem(updated || null)
                                toast.success(updated?.isFavorite ? "Added to Favorites" : "Removed from Favorites")
                            }}
                            className={`flex-1 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${item.isFavorite ? 'bg-error text-white' : 'bg-surface-variant text-on-surface hover:bg-opacity-80'}`}
                        >
                            {item.isFavorite ? '♥ Favorited' : '♡ Add to Favorites'}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 bg-surface-variant text-error font-bold py-3 rounded-xl hover:bg-error/10 transition flex items-center justify-center gap-2"
                        >
                            <AiOutlineDelete className="text-xl" /> Delete Item
                        </button>
                    </div>
                </div>
            </div>

            {/* Try On Modal */}
            {showTryOn && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
                        <button onClick={() => setShowTryOn(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">✕</button>
                        <h2 className="text-xl font-bold mb-4 text-on-surface">Virtual Try-On</h2>

                        {!tryOnResult ? (
                            <>
                                <p className="text-on-surface-variant mb-4">Select or Upload a base photo of yourself:</p>
                                <div className="flex flex-col gap-4 mb-6">
                                    {selectedBaseBlob ? (
                                        <div className="aspect-[3/4] w-1/2 mx-auto rounded-lg overflow-hidden border-2 border-primary relative">
                                            <img src={selectedBaseBlob} className="w-full h-full object-cover" />
                                            <button onClick={() => setSelectedBaseBlob(null)} className="absolute top-2 right-2 bg-error text-white p-1 rounded-full text-xs">Change</button>
                                        </div>
                                    ) : (
                                        <label className="aspect-[3/4] w-1/2 mx-auto rounded-lg border-2 border-dashed border-outline flex flex-col items-center justify-center text-on-surface-variant cursor-pointer hover:bg-surface-variant">
                                            <AiOutlinePlus className="text-2xl mb-1" />
                                            <span className="text-xs">Upload Photo</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleUploadBasePhoto} />
                                        </label>
                                    )}
                                </div>

                                <button
                                    disabled={!selectedBaseBlob || generating}
                                    onClick={handleGenerateTryOn}
                                    className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold disabled:opacity-50"
                                >
                                    {generating ? 'Processing with AI...' : 'Generate Preview'}
                                </button>
                            </>
                        ) : (
                            <div className="text-center">
                                <div className="border rounded-xl overflow-hidden mb-4 bg-gray-100">
                                    <img src={tryOnResult} alt="Result" className="w-full h-auto" />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setTryOnResult(null)} className="flex-1 border border-gray-300 py-2 rounded-lg">Try Another</button>
                                    <button onClick={() => setShowTryOn(false)} className="flex-1 bg-primary text-white py-2 rounded-lg">Done</button>
                                    <a href={tryOnResult} download="tryon.png" className="flex-1 bg-gray-900 text-white py-2 rounded-lg flex items-center justify-center">Save</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ItemDetail
