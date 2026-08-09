import React, { useEffect, Suspense, lazy } from 'react'
import Navbar from './components/Navbar.jsx'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore.js'
import { Loader } from "lucide-react"
import {Toaster} from "react-hot-toast"
import { useThemeStore } from './store/useThemeStore.js'

const HomePage = lazy(() => import("./Pages/HomePage.jsx"));
const SignUpPage = lazy(() => import("./Pages/SignUpPage.jsx"));
const LoginPage = lazy(() => import("./Pages/LoginPage.jsx"));
const SettingsPage = lazy(() => import("./Pages/SettingsPage.jsx"));
const ProfilePage = lazy(() => import("./Pages/ProfilePage.jsx"));

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const {theme} = useThemeStore();

  console.log({onlineUsers});

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser) return (

    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin"></Loader>
    </div>
  )
  return (
    <>
      <div data-theme={theme}>
        <Navbar />

        <Suspense fallback={
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <Loader className="size-10 animate-spin text-primary"></Loader>
          </div>
        }>
          <Routes>
            <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
            <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
            <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
            <Route path='/settings' element={<SettingsPage />} />
            <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          </Routes>
        </Suspense>

        <Toaster />
      </div>
    </>
  )
}

export default App
