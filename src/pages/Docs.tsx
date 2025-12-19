import { useNavigate } from 'react-router-dom'
import { AiOutlineArrowLeft, AiOutlineSkin, AiOutlineCamera, AiOutlineRocket } from 'react-icons/ai'

const Docs = () => {
    const navigate = useNavigate()

    return (
        <div className="pb-24">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="text-2xl text-on-surface">
                    <AiOutlineArrowLeft />
                </button>
                <h1 className="text-3xl font-bold text-on-surface">Documentation</h1>
            </div>

            <div className="space-y-6">
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline/10">
                    <h2 className="text-xl font-bold text-primary mb-2">Welcome to Hangar</h2>
                    <p className="text-on-surface-variant leading-relaxed">
                        Hangar is your smart digital wardrobe assistant. Organize your clothes, get AI styling recommendations, and visually plan your outfits.
                    </p>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary text-xl"><AiOutlineCamera /></div>
                        <h3 className="text-lg font-bold text-on-surface">1. Add Items</h3>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed mb-4">
                        Navigate to the <strong>Add Item</strong> tab. You can take a photo of your clothes or upload one from your gallery.
                        The AI will automatically tag it with color, season, and category.
                    </p>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-secondary/10 p-2 rounded-lg text-secondary text-xl"><AiOutlineRocket /></div>
                        <h3 className="text-lg font-bold text-on-surface">2. AI Stylist</h3>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed mb-4">
                        Go to the <strong>AI Suggestion</strong> tab. Tell the AI where you are going (e.g., "Date Night") and add any personal preferences.
                        Hangar will scan your wardrobe and create a complete outfit for you.
                    </p>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-accent/10 p-2 rounded-lg text-accent text-xl"><AiOutlineSkin /></div>
                        <h3 className="text-lg font-bold text-on-surface">3. Virtual Try-On</h3>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed mb-4">
                        Open any item in your wardrobe. Click the <strong>Virtual Try-On</strong> button and upload a photo of yourself.
                        <strong>Note:</strong> This feature requires an active component API Key (e.g. Nano Banana) and an internet connection.
                    </p>

                    <div className="flex items-center gap-3 mb-3 mt-6">
                        <div className="bg-surface-variant p-2 rounded-lg text-on-surface text-xl">🤖</div>
                        <h3 className="text-lg font-bold text-on-surface">4. AI Models (OpenRouter)</h3>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed mb-4">
                        You can now use any model via <strong>OpenRouter</strong>. Go to Settings, select "OpenRouter", and enter your key and Model ID (e.g. <code>google/gemini-2.0-flash-001</code>).
                    </p>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline/10">
                    <h3 className="text-lg font-bold text-on-surface mb-2">Need Help?</h3>
                    <p className="text-on-surface-variant text-sm">
                        Version: 0.0.1<br />
                        If you encounter issues, please check your Settings to ensure API keys are configured correctly.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Docs
