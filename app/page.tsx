"use client"

import { useState } from "react"
import LoginScreen from "@/components/login-screen"
import SurveyScreen from "@/components/survey-screen"
import SuccessScreen from "@/components/success-screen"

export type User = {
  name: string
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleLogin = (userData: User) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    setShowSuccess(false)
  }

  const handleSurveySubmit = () => {
    setShowSuccess(true)
  }

  const handleNewSurvey = () => {
    setShowSuccess(false)
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  if (showSuccess) {
    return <SuccessScreen onNewSurvey={handleNewSurvey} onLogout={handleLogout} />
  }

  return <SurveyScreen user={user} onSubmit={handleSurveySubmit} onLogout={handleLogout} />
}
