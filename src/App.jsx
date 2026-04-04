import { useState } from 'react'
import Navigator from './companents/Navigator'
import Navbar from './companents/Navbar'

const App = () => {

  return (
    <>
    <Navbar />
    <div className="pt-[75px]">
      <Navigator />
    </div>
    </>
  )
}

export default App
 