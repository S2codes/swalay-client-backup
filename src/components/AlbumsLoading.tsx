import React from 'react'
import Image from 'next/image'

export default function AlbumsLoading() {
  return (
    <div className='w-full h-screen flex items-center justify-center bg-white'>
      <Image src="https://swalay-music-files.s3.ap-south-1.amazonaws.com/assets/loading.gif" width={100} height={100} alt="Loading" />
    </div>
  )
}
