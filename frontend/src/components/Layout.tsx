import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { MdDashboard, MdCheckroom, MdStyle, MdCameraAlt, MdSettings, MdLogout, MdAutoFixHigh } from 'react-icons/md'

const Layout = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <MdDashboard /> },
        { name: 'Wardrobe', path: '/wardrobe', icon: <MdCheckroom /> },
        { name: 'Outfits', path: '/outfits', icon: <MdStyle /> },
        { name: 'Try On', path: '/tryon-history', icon: <MdCameraAlt /> },
        { name: 'Recreate', path: '/recreate', icon: <MdAutoFixHigh /> },
        { name: 'Settings', path: '/settings', icon: <MdSettings /> },
    ]

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row transition-colors duration-300">
            {/* Sidebar / Bottom Bar */}
            <aside className="bg-surface shadow-md md:w-64 md:h-screen md:fixed z-10 flex md:flex-col justify-between p-2 md:p-4 fixed bottom-0 w-full md:relative border-r border-outline/10">
                <div>
                    <div className="hidden md:flex items-center gap-2 mb-8 px-2">
                        <MdCheckroom className="text-3xl text-primary" />
                        <h1 className="font-bold text-xl text-on-surface">OpenWardrobe</h1>
                    </div>

                    <nav className="flex md:flex-col justify-around md:justify-start gap-1 md:gap-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path)
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex flex-col md:flex-row items-center md:gap-3 p-2 rounded-lg text-sm transition-colors
                    ${isActive ? 'bg-secondary-container text-on-secondary-container font-medium' : 'text-on-surface-variant hover:bg-surface-variant'}
                  `}
                                >
                                    <span className="text-xl md:text-lg">{item.icon}</span>
                                    <span className="text-[10px] md:text-base">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="hidden md:block">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-2 rounded-lg text-sm text-error hover:bg-error-container w-full transition-colors font-medium"
                    >
                        <MdLogout className="text-lg" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 pb-24 md:p-8 overflow-y-auto h-screen bg-background">
                <div className="max-w-5xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default Layout
