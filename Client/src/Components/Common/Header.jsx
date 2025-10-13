import React from 'react'
import { LogOut } from 'lucide-react';

const Header = () => {
    const user = {
        role: "Admin",
        name: "Yogesh"
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
        console.log('Logout clicked');
    }

    return (
        <div className='w-full bg-red-500 text-white flex items-center justify-center px-4 py-4 md:py-5'>
            <div className='w-full max-w-7xl flex items-center justify-between gap-4'>
                <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold whitespace-nowrap'>
                    Task Sedular
                </h1>

                {user && (
                    <div className='flex items-center gap-2 sm:gap-3 md:gap-5 flex-wrap justify-end'>
                        <h2 className='text-xs sm:text-sm font-semibold hidden sm:block'>
                            Role: <span>{user.role}</span>
                        </h2>
                        <h2 className='text-xs sm:text-sm font-bold whitespace-nowrap'>
                            {user.name}
                        </h2>
                        <button 
                            className='px-3 sm:px-4 py-2 bg-red-300 border-2 hover:border-white border-red-500 text-red-500 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-red-500 hover:text-white transition-colors duration-300 text-xs sm:text-sm font-medium flex-shrink-0'
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