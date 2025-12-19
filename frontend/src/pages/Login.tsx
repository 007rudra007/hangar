import { useNavigate } from 'react-router-dom'

const Login = () => {
    const navigate = useNavigate()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        // For Offline APK, we skip real auth
        localStorage.setItem('token', 'offline-token')
        navigate('/dashboard')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="bg-surface p-8 rounded-3xl shadow-md3-2 w-full max-w-md border border-outline/10">
                <h1 className="text-3xl font-bold text-center mb-2 text-on-surface">Welcome Back</h1>
                <p className="text-center text-on-surface-variant mb-8">Offline Personal Wardrobe</p>

                <form onSubmit={handleLogin}>
                    <button className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:opacity-90 transition shadow-md">
                        Enter Wardrobe
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login
