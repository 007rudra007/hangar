import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

const Register = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await api.post('/auth/register', { email, password, name })
            // Auto login or redirect to login? Let's redirect to login for simplicity
            navigate('/login')
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md bg-surface rounded-3xl shadow-md3-2 p-8 border border-outline/10">
                <h2 className="text-2xl font-bold text-center text-on-surface mb-6">Create Account</h2>

                {error && (
                    <div className="bg-error/10 text-error p-3 rounded-lg mb-4 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Name (Optional)</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-outline/30 rounded-xl bg-surface-variant text-on-surface-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-outline/30 rounded-xl bg-surface-variant text-on-surface-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-outline/30 rounded-xl bg-surface-variant text-on-surface-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-on-primary font-semibold py-3 px-4 rounded-xl hover:opacity-90 transition shadow-md disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-on-surface-variant">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register
