import React from 'react'
import img from './download1.jpeg'; // Import the logo image
const Alogo = () => {
  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
      <img
        src={img}
        alt="Amity University Bengaluru"
        style={{ width: '100px', height: 'auto' }} // Adjust the size as needed
      />
    </div>
  )
}

export default Alogo
