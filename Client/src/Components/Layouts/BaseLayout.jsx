import React from 'react'
import Header from '../Common/Header'

const BaseLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-x-hidden">
      {/* Background Gradient Overlay */}
      <div className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(135deg, #1a0000 0%, #000000 25%, #1a0000 50%, #0a0a0a 75%, #000000 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
        }}
      />
      
      {/* Animated CSS Keyframes */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="relative z-10">
        <Header />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}

export default BaseLayout