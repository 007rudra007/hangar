import { useEffect, useState } from 'react'
import api from '../api'

const TryOnHistory = () => {
    const [images, setImages] = useState<any[]>([])

    useEffect(() => {
        api.get('/tryon').then(res => setImages(res.data)).catch(console.error)
    }, [])

    return (
        <div>
            <h1 className="text-2xl font-bold text-on-surface mb-6">Virtual Try-On History</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {images.map(img => (
                    <div key={img.id} className="bg-surface rounded-xl shadow-sm overflow-hidden">
                        <div className="aspect-[3/4]">
                            <img src={api.defaults.baseURL + img.image_path} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2 text-xs text-on-surface-variant">
                            {new Date(img.created_at).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
            {images.length === 0 && (
                <div className="text-center py-20 text-on-surface-variant">
                    No try-ons yet. Go to an Item to try it on!
                </div>
            )}
        </div>
    )
}
export default TryOnHistory
