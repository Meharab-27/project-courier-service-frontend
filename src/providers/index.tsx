"use client"
import React, { ReactNode } from 'react'
import QueryProvider from './query.provider'

export default function Providers({children}: {children : ReactNode}) {
  return (
    
   <QueryProvider>
    {children}
   </QueryProvider>
  )
}
