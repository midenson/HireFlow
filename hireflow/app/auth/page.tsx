'use client'
import { ID } from "appwrite";
import { account } from "../lib/appwrite";
import { useEffect, useState } from "react";

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState<any>(null);
    const [toggleUI, setToggleUI] = useState(false);
    const [errorMsg, seterrorMsg] = useState('');

    useEffect(() => {
      account.get().then(setUser).catch(() => setUser(null));
    }, []);

    const handleRegister = async () => {
      if (email === '' || password === '') {
        alert('pls fill iin the required inputs');
        return;
      }
        try {
          await account.create(ID.unique(), email, password);
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
        await account.createEmailPasswordSession(email, password);
        alert('user is now logged in...')
      } catch (error: any) {
        seterrorMsg(error);
        alert(error);
      }
    }

  return (
    <div>
      {/* <button onClick={() => setToggleUI(!toggleUI)}>
        { toggleUI ? 'login instead' : 'sign up' }
      </button> */}
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
      {user && <p className="text-green-500">{user}</p>}
      <input 
        placeholder="Email"
        onChange={(e) => {
          setEmail(e.target.value);
          seterrorMsg('');
        }} 
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => {
          setPassword(e.target.value);
          seterrorMsg('');
        }}
      />
      <button onClick={handleRegister} className="p-3 bg-green-500">Register</button>
      <button onClick={handleLogin} className="p-3 bg-green-500 ml-2">Login</button>
    </div>
  );
} 

export default Auth