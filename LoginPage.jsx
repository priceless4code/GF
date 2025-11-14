import React, { useState } from 'react';
function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch("/api/login", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({email, password}) });
    if (!res.ok) setError("Bad credentials");
    else {
      const { token, user } = await res.json();
      localStorage.setItem("authToken", token);
      window.location.href = "/dashboard";
    }
  }
  return (<form onSubmit={handleLogin}>
    <input value={email} onChange={e => setEmail(e.target.value)} type="email"/>
    <input value={password} onChange={e => setPassword(e.target.value)} type="password"/>
    <button>Login</button>{error && <p style={{color:"red"}}>{error}</p>}
  </form>);
}