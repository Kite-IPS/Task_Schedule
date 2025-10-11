import React from 'react'
import Header from '../Common/Header'

const BaseLayout = ({ children }) => {
  return (
    <div>
        <Header />
        <div>
            { children }
        </div>
    </div>
  )
}

export default BaseLayout