'use client'
import { ID } from "appwrite";
import { account } from "../lib/appwrite";
import { useEffect, useState } from "react";
import { useUser } from "../lib/stores/hooks/useUser";
import { useAuthStore } from "../lib/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, seterrorMsg] = useState('');
    const router = useRouter()
    
    const queryClient = useQueryClient();
    const { data: userData, isLoading, refetch } = useUser();
    const setUser = useAuthStore((state) => state.setUser);
    const clearUser = useAuthStore((state) => state.clearUser);

    const handleRegister = async () => {
      if (email === '' || password === '') {
        alert('pls fill in the required inputs');
        return;
      }
        try {
          // creating, logging in and setting user to global state
          await account.create(ID.unique(), email, password);
          await account.createEmailPasswordSession(email, password);
          if (await account.get()) {
            Cookies.set('user', 'true', { path: '/'}); // setting a cookie for the user 
          }
          const { data: freshUser } = await refetch();
          setUser(freshUser);
          router.push('/dashboard');

          // error messages
          seterrorMsg('');
          alert('user successfully created...')
        } catch (error: any) {
          alert(error.message);
          seterrorMsg(error.message)
          console.log(error);
        }
    }

    const handleLogin = async () => {
      try {
        // logging the user in and setting it to global state
        await account.createEmailPasswordSession(email, password);
        const { data: freshUser } = await refetch();
        if (await account.get()) {
          Cookies.set('user', 'true', { path: '/'}); // setting a cookie for the user 
        }
        setUser(freshUser);
        router.push('/dashboard'); // directing the authenticated user to the dashboard

        alert('user is now logged in...')
      } catch (error: any) {
        seterrorMsg(error);
        alert(error);
      }
    }

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      clearUser(); // Clear Zustand user state
      
      queryClient.removeQueries({ queryKey: ['user']});
      queryClient.invalidateQueries({queryKey: ['user']});
      queryClient.clear();
      Cookies.remove('user');
      
      await refetch();
      alert('Logged out successfully.');
    } catch (error: any) {
      console.log('Logout failed:', error.message);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-center text-gray-800">Welcome to Hireflow</h1>

      {errorMsg && (
        <div className="text-red-600 bg-red-100 p-2 rounded text-sm text-center">
          {errorMsg}
        </div>
      )}

      {!userData ? (
        <>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                setEmail(e.target.value);
                seterrorMsg('');
              }}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                setPassword(e.target.value);
                seterrorMsg('');
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-4">
            <button
              onClick={handleRegister}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
            >
              Register
            </button>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Login
            </button>
          </div>
        </>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-green-700 font-medium">Welcome, {userData.email}</p>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      )}

      {/* CTA Banner */}
      <div className="mt-6 border-t pt-4 text-center text-sm text-gray-600">
        Ready to build your professional profile?
        <a
          href="/resume"
          className="block mt-2 text-blue-600 font-semibold hover:underline"
        >
          Go to Resume & Cover Letter Generator →
        </a>
      </div>
    </div>
  </div>
);
} 

export default Auth