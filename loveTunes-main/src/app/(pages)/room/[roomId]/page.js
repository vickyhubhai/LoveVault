"use client";

import ChatRoom from '@/app/_components/chat/page'
import { useParams } from 'next/navigation'
import React from 'react'

const Page = () => {
  const params = useParams();
  const roomId = params?.roomId;

  if (!roomId) {
    return <div>Loading...</div>;
  }
  
  return (
    <ChatRoom roomId={roomId} />
  )
}

export default Page