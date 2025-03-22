'use client'

import React, { useState } from 'react'
import Link from "next/link"
import toast from 'react-hot-toast'
import { apiPost } from '@/helpers/axiosRequest' // Assuming this is your custom axios request function

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    try {
      const response = await apiPost('/api/user/forgot-password', { email })
      if (response.success) {
        toast.success('Check your email for the reset link')
        setEmail('')
      } else {
        toast.error(response.error || 'An error occurred')
      }
    } catch (error) {
      console.error('Error sending reset email:', error)
      toast.error('Failed to send reset email')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-2">Forgot password</h1>
      <p className="text-gray-600 mb-6">Enter your email address and we will send you a link to reset your password.</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Send reset link
        </button>
      </form>
      <div className="mt-4">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to login
        </Link>
      </div>
    </div>
  )
}