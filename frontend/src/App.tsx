import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { themeService } from './services/themeService'
import { App as CapacitorApp } from '@capacitor/app'
import { toast } from 'react-hot-toast'
import { db } from './db'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Wardrobe from './pages/Wardrobe'
import ItemForm from './pages/ItemForm'
import ItemDetail from './pages/ItemDetail'
import Outfits from './pages/Outfits'
import OutfitForm from './pages/OutfitForm'
import OutfitDetail from './pages/OutfitDetail'
import Recommend from './pages/Recommend'
import RecreateOutfit from './pages/RecreateOutfit'
import TryOnHistory from './pages/TryOnHistory'
import Settings from './pages/Settings'
import Docs from './pages/Docs'
import Onboarding from './pages/Onboarding'
import Layout from './components/Layout'

// Placeholder Auth Guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('token')
    if (!token) return <Navigate to="/login" replace />
    return <>{children}</>
}

// Global Theme Init
const useThemeInit = () => {
    useEffect(() => {
        const savedSeed = themeService.getSavedSeed();
        const isDark = localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
        themeService.applyTheme(savedSeed, isDark);

        // Observer for class changes (dark mode toggle)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const newIsDark = document.documentElement.classList.contains('dark');
                    themeService.applyTheme(themeService.getSavedSeed(), newIsDark);
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);
}

const BackButtonHandler = () => {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        let lastPress = 0;
        CapacitorApp.addListener('backButton', ({ canGoBack }) => {
            const now = Date.now();
            if (location.pathname === '/dashboard' || location.pathname === '/login') {
                if (now - lastPress < 2000) {
                    CapacitorApp.exitApp();
                } else {
                    toast('Tap again to exit', { duration: 2000 });
                    lastPress = now;
                }
            } else {
                if (canGoBack) {
                    navigate(-1);
                } else {
                    // Fallback if history stack is empty but we aren't at root
                    navigate('/dashboard')
                }
            }
        });

        return () => {
            CapacitorApp.removeAllListeners();
        }
    }, [location, navigate]);

    return null;
}

const InitCheck = ({ children }: { children: JSX.Element }) => {
    const navigate = useNavigate()
    useEffect(() => {
        db.settings.get(1).then(s => {
            if (!s) {
                // First run, create default settings
                db.settings.add({ id: 1, use_online_vton: false, selected_llm_provider: 'gemini' })
                navigate('/onboarding')
            } else if (!s.onboarding_complete) {
                navigate('/onboarding')
            }
        })
    }, [])
    return children
}

function App() {
    useThemeInit();
    return (
        <BrowserRouter>
            <BackButtonHandler />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/onboarding" element={<Onboarding />} />

                <Route path="/" element={<ProtectedRoute><InitCheck><Layout /></InitCheck></ProtectedRoute>}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />

                    <Route path="wardrobe" element={<Wardrobe />} />
                    <Route path="items/new" element={<ItemForm />} />
                    <Route path="items/:id" element={<ItemDetail />} />

                    <Route path="outfits" element={<Outfits />} />
                    <Route path="outfits/new" element={<OutfitForm />} />
                    <Route path="outfits/:id" element={<OutfitDetail />} />

                    <Route path="recommend" element={<Recommend />} />
                    <Route path="recreate" element={<RecreateOutfit />} />
                    <Route path="tryon-history" element={<TryOnHistory />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="docs" element={<Docs />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
