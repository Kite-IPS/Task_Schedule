import React from 'react'
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Header = () => {
    const user = {
        role: "Admin",
        name: "Yogesh"
    }
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login')
    }

    return (
        <div className='w-full text-white flex items-center justify-center px-4 py-4 md:py-5 backdrop-blur-md bg-white/5 border-b border-white/10'>
            <div className='w-full max-w-7xl flex items-center justify-between gap-4'>
                <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold whitespace-nowrap tracking-tight'>
                    Task Schedular
                </h1>

                {user && (
                    <div className='flex items-center gap-2 sm:gap-3 md:gap-5 flex-wrap justify-end'>
                        <h2 className='text-xs sm:text-sm font-semibold hidden sm:block text-white/80'>
                            Role: <span className='text-white'>{user.role}</span>
                        </h2>
                        <h2 className='text-xs sm:text-sm font-bold whitespace-nowrap'>
                            {user.name}
                        </h2>
                        <button 
                            className='px-3 sm:px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg flex items-center gap-1 cursor-pointer hover:bg-red-600 hover:border-red-500 transition-all duration-300 text-xs sm:text-sm font-medium flex-shrink-0 backdrop-blur-sm'
                            onClick={handleLogout}
                        >
                            <span className='hidden sm:inline'>Logout</span>
                            <LogOut size={16} className='sm:size-5' />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Header