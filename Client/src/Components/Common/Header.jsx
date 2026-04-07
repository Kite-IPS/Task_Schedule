import React from 'react'
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../Context/userContext';

const Header = () => {
    const { user, clearUser } = useContext(UserContext);
    const navigate = useNavigate();
    const handleLogout = () => {
        clearUser();
        navigate('/login')
    }

    return (
        <div className='w-full text-white flex items-center justify-center px-4 py-3 md:py-5 backdrop-blur-md bg-white/5 border-b border-white/10'>
            <div className='w-full max-w-7xl flex items-center justify-between gap-2 md:gap-4'>
                <h1 className='text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold whitespace-nowrap tracking-tight'>
                    Task Scheduler
                </h1>

                {user && (
                    <div className='flex items-center gap-2 sm:gap-3 md:gap-5 flex-wrap justify-end'>
                        <div className='flex flex-col sm:flex-row items-end sm:items-center gap-0 sm:gap-4'>
                            <h2 className='text-[11px] sm:text-[14px] md:text-[16px] font-semibold text-white/80'>
                                Role: <span className='text-white uppercase'>{user.role || ''}</span>
                            </h2>
                            <h2 className='text-[11px] sm:text-[14px] md:text-[16px] font-semibold text-white/80'>
                                Name: <span className='text-white'>{user.name || ''}</span>
                            </h2>
                        </div>
                        <button 
                            className='px-2 sm:px-4 py-1.5 md:py-2 bg-white/10 border border-white/20 text-white rounded-lg flex items-center gap-1 cursor-pointer hover:bg-red-600 hover:border-red-500 transition-all duration-300 text-xs sm:text-sm font-medium flex-shrink-0 backdrop-blur-sm'
                            onClick={handleLogout}
                        >
                            <span className='hidden xs:inline'>Logout</span>
                            <LogOut size={14} className='md:size-5' />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Header