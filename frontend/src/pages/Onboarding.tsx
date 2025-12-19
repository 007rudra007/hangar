import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db'
import { AiOutlineArrowRight, AiOutlineSkin, AiOutlineRocket, AiOutlineCheck } from 'react-icons/ai'

const Onboarding = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(0)

    // Profile State
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('')
    const [style, setStyle] = useState('')

    const handleFinish = async () => {
        // Save profile and mark onboarding complete
        await db.settings.update(1, {
            onboarding_complete: true,
            user_age: age,
            user_gender: gender,
            user_style: style
        })
        navigate('/dashboard', { replace: true })
    }

    const steps = [
        {
            title: "Welcome to Hangar",
            content: "Your digital wardrobe assistant. Organize, style, and visualize your best outfits.",
            icon: <AiOutlineSkin className="text-6xl text-primary" />
        },
        {
            title: "AI Powered Styling",
            content: "Get personalized outfit recommendations based on your actual clothes and the occasion.",
            icon: <AiOutlineRocket className="text-6xl text-secondary" />
        },
        {
            title: "Create Your Profile",
            content: "Tell us a bit about yourself to get better recommendations.",
            isProfile: true
        }
    ]

    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-md bg-surface border border-outline/10 rounded-3xl p-8 shadow-md3-1 text-center">

                <div className="mb-8 flex justify-center">
                    {steps[step].icon || <div className="text-6xl text-accent">👤</div>}
                </div>

                <h1 className="text-3xl font-bold text-on-surface mb-4">{steps[step].title}</h1>

                {!steps[step].isProfile ? (
                    <p className="text-on-surface-variant mb-8 text-lg leading-relaxed">
                        {steps[step].content}
                    </p>
                ) : (
                    <div className="text-left space-y-4 mb-8">
                        <p className="text-center text-on-surface-variant mb-6">{steps[step].content}</p>

                        <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Age</label>
                            <input type="number" className="w-full bg-surface-variant p-3 rounded-xl" placeholder="e.g. 25" value={age} onChange={e => setAge(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Gender</label>
                            <select className="w-full bg-surface-variant p-3 rounded-xl" value={gender} onChange={e => setGender(e.target.value)}>
                                <option value="">Select...</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="non-binary">Non-Binary</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Style Preference</label>
                            <input type="text" className="w-full bg-surface-variant p-3 rounded-xl" placeholder="e.g. Minimalist, Streetwear" value={style} onChange={e => setStyle(e.target.value)} />
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-2">
                        {steps.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-primary w-6' : 'bg-outline/30'}`} />
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            if (step < steps.length - 1) setStep(step + 1)
                            else handleFinish()
                        }}
                        className="bg-primary text-on-primary font-bold py-3 px-6 rounded-xl flex items-center gap-2"
                    >
                        {step === steps.length - 1 ? 'Get Started' : 'Next'}
                        {step === steps.length - 1 ? <AiOutlineCheck /> : <AiOutlineArrowRight />}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Onboarding
