import React from 'react'
import { LogOut } from 'lucide-react';
const Header = () => {
    const user  = {
        role : "Admin",
        name : "Yogesh"
    }
  return (
    <div className='w-full h-[60px] md:h-[80px] bg-blue-500 text-white flex items-center justify-center'>
        <div className='w-[90%] md:w-[80%] flex items-center justify-between'>
            <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold'>Task Sedular</h1>
        {
            user && (
                <div className='flex items-center gap-5'>
                    <h2 className='text-xs md:text-sm lg:text-sm font-semibold'>
                        Role : <span>{user.role}</span>
                    </h2>
                    <h2 className='text-xs md:text-sm font-bold'>
                        {user.name}
                    </h2>
                    <button className='px-4 py-2 bg-red-300 border-2 border-red-500 text-red-500 rounded-[8px] flex items-center gap-1 cursor-pointer hover:bg-red-500 hover:text-white duration-300'>
                        Logout <LogOut />
                    </button>
                </div>
            )
        }
        </div>
    </div>
  )
}

export default Header