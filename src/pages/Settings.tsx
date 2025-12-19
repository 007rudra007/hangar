import { useEffect, useState } from 'react'
import { db } from '../db'
import { Toaster, toast } from 'react-hot-toast'
import { themeService } from '../services/themeService'
import { useNavigate } from 'react-router-dom'

const Settings = () => {
    const navigate = useNavigate()
    const [openaiKey, setOpenaiKey] = useState('')
    const [geminiKey, setGeminiKey] = useState('')
    const [anthropicKey, setAnthropicKey] = useState('')
    const [openrouterKey, setOpenrouterKey] = useState('')
    const [openrouterModel, setOpenrouterModel] = useState('')
    const [nanoBananaKey, setNanoBananaKey] = useState('')
    const [useOnlineVton, setUseOnlineVton] = useState(false)
    const [selectedProvider, setSelectedProvider] = useState<string>('gemini')
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        const settings = await db.settings.get(1)
        if (settings) {
            setOpenaiKey(settings.openai_key || '')
            setGeminiKey(settings.gemini_key || '')
            setAnthropicKey(settings.anthropic_key || '')
            setNanoBananaKey(settings.nano_banana_key || '')
            setOpenrouterKey(settings.openrouter_key || '')
            setOpenrouterModel(settings.openrouter_model || '')
            setUseOnlineVton(settings.use_online_vton)
            setSelectedProvider(settings.selected_llm_provider)

            // Load persistent theme preference
            const isDark = localStorage.getItem('theme') === 'dark'
            setDarkMode(isDark)
            if (isDark) document.documentElement.classList.add('dark')
            else document.documentElement.classList.remove('dark')
        }
    }

    const toggleDarkMode = () => {
        const newMode = !darkMode
        setDarkMode(newMode)
        localStorage.setItem('theme', newMode ? 'dark' : 'light')
        if (newMode) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
        toast.success(newMode ? "Dark Mode On" : "Light Mode On")
    }

    const handleSave = async () => {
        await db.settings.put({
            id: 1,
            openai_key: openaiKey,
            gemini_key: geminiKey,
            anthropic_key: anthropicKey,
            openrouter_key: openrouterKey,
            openrouter_model: openrouterModel,
            nano_banana_key: nanoBananaKey,
            use_online_vton: useOnlineVton,
            selected_llm_provider: selectedProvider as any
        })
        toast.success("Settings Saved!")
    }

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <Toaster />
            <h1 className="text-3xl font-sans font-bold text-on-surface mb-6">Settings</h1>

            <div className="flex flex-col gap-6">

                {/* Theme Settings */}
                <div className="bg-surface p-6 rounded-3xl shadow-sm border border-outline/10">
                    <h2 className="text-xl font-bold mb-4 text-on-surface">Appearance</h2>

                    {/* Dark Mode */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-on-surface-variant font-medium">Dark Mode</span>
                        <button
                            onClick={toggleDarkMode}
                            className={`w-14 h-8 rounded-full p-1 transition-colors ${darkMode ? 'bg-primary' : 'bg-outline/30'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-6' : ''}`}></div>
                        </button>
                    </div>

                    {/* Dynamic Color Source */}
                    <div>
                        <h3 className="text-sm font-bold text-on-surface-variant mb-3">Theme Source Color (Material You)</h3>
                        <div className="flex gap-3 flex-wrap">
                            {['#A35C4E', '#4E6472', '#4E725C', '#724E64', '#72644E', '#006780'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => {
                                        themeService.applyTheme(color, darkMode)
                                        toast.success("Theme Updated")
                                    }}
                                    className="w-10 h-10 rounded-full border-2 border-outline/20 hover:scale-110 transition shadow-sm"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-outline/20 shadow-sm flex items-center justify-center bg-surface-variant">
                                <input
                                    type="color"
                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                                    onChange={(e) => {
                                        themeService.applyTheme(e.target.value, darkMode)
                                    }}
                                />
                                <span className="pointer-events-none text-xs text-on-surface-variant font-bold">+</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VTON Settings */}
                <div className="bg-surface p-6 rounded-3xl shadow-sm border border-outline/10">
                    <h2 className="text-xl font-bold mb-4 text-primary">Virtual Try-On</h2>
                    <div className="flex items-center gap-3 mb-4">
                        <input
                            type="checkbox"
                            id="vton-toggle"
                            className="w-5 h-5 accent-primary"
                            checked={useOnlineVton}
                            onChange={e => setUseOnlineVton(e.target.checked)}
                        />
                        <label htmlFor="vton-toggle" className="font-medium text-on-surface">Enable Online VTON (Nano Banana)</label>
                    </div>
                    {useOnlineVton && (
                        <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Nano Banana API Key</label>
                            <input
                                type="password"
                                className="w-full bg-surface-variant border-none p-3 rounded-xl text-on-surface-variant"
                                value={nanoBananaKey}
                                onChange={e => setNanoBananaKey(e.target.value)}
                                placeholder="Enter API Key"
                            />
                        </div>
                    )}
                </div>

                {/* AI Settings */}
                <div className="bg-surface p-6 rounded-3xl shadow-sm border border-outline/10">
                    <h2 className="text-xl font-bold mb-4 text-secondary">AI Styling</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Preferred Provider</label>
                        <select
                            className="w-full bg-surface-variant border-none p-3 rounded-xl text-on-surface-variant"
                            value={selectedProvider}
                            onChange={e => setSelectedProvider(e.target.value)}
                        >
                            <option value="gemini">Google Gemini</option>
                            <option value="openai">OpenAI (ChatGPT)</option>
                            <option value="anthropic">Anthropic (Claude)</option>
                            <option value="openrouter">OpenRouter (Any Model)</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        {selectedProvider === 'openrouter' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">OpenRouter API Key</label>
                                    <input type="password" className="w-full bg-surface-variant border-none p-3 rounded-xl text-on-surface-variant" value={openrouterKey} onChange={e => setOpenrouterKey(e.target.value)} placeholder="sk-or-..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Model ID (e.g. google/gemini-2.0-flash-001)</label>
                                    <input type="text" className="w-full bg-surface-variant border-none p-3 rounded-xl text-on-surface-variant" value={openrouterModel} onChange={e => setOpenrouterModel(e.target.value)} placeholder="google/gemini-pro-1.5" />
                                </div>
                            </div>
                        )}
                        {selectedProvider === 'openai' && (
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">OpenAI API Key</label>
                                <input type="password" className="w-full bg-surface-variant border-none p-3 rounded-xl text-on-surface-variant" value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} placeholder="sk-..." />
                            </div>
                        )}
                        {selectedProvider === 'gemini' && (
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Gemini API Key</label>
                                <input type="password" className="w-full bg-surface-variant border-none p-3 rounded-xl text-on-surface-variant" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} placeholder="AIza..." />
                            </div>
                        )}
                        {selectedProvider === 'anthropic' && (
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Anthropic API Key</label>
                                <input type="password" className="w-full bg-surface-variant border-none p-3 rounded-xl text-on-surface-variant" value={anthropicKey} onChange={e => setAnthropicKey(e.target.value)} placeholder="sk-ant..." />
                            </div>
                        )}
                    </div>
                </div>

                {/* Info & Docs */}
                <div className="bg-surface p-6 rounded-3xl shadow-sm border border-outline/10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-on-surface">About Hangar</h2>
                        <span className="text-xs bg-surface-variant px-2 py-1 rounded text-on-surface-variant">v0.0.1</span>
                    </div>
                    <button
                        onClick={() => navigate('/docs')}
                        className="w-full bg-secondary/10 text-secondary font-bold py-3 rounded-xl hover:bg-secondary/20 transition flex items-center justify-center gap-2"
                    >
                        <span>📖</span> Get Started / Documentation
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    className="bg-primary text-on-primary font-bold py-4 rounded-xl hover:shadow-lg transition text-lg w-full"
                >
                    Save Settings
                </button>
            </div>
        </div>
    )
}

export default Settings
