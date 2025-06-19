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
    <div className="p-4">
      {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}

      {!userData ? (
        <>
          <input
            placeholder="Email"
            className="border p-2 mb-2 block"
            onChange={(e) => {
              setEmail(e.target.value);
              seterrorMsg('');
            }}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 mb-2 block"
            onChange={(e) => {
              setPassword(e.target.value);
              seterrorMsg('');
            }}
          />
          <button onClick={handleRegister} className="p-2 bg-green-500 text-white mr-2">
            Register
          </button>
          <button onClick={handleLogin} className="p-2 bg-blue-500 text-white">
            Login
          </button>
        </>
      ) : (
        <div>
          <p className="text-green-700 mb-2">Welcome, {userData.email}</p>
          <button onClick={handleLogout} className="p-2 bg-red-500 text-white">
            Logout
          </button>
        </div>
      )}
    </div>
  );
} 

export default Auth