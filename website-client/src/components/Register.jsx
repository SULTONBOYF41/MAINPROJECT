import '../styles/style.css';
import AOS from "aos";
import "aos/dist/aos.css";

// Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();




  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", form.username);
    localStorage.setItem("phone", form.phone);

    if (response.ok) {
      localStorage.setItem("token", data.token);
      navigate("/profile"); // redirect
      window.location.reload(); // sahifani qayta yuklab, Header yangilansin
    } else {
      setError(data.message || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="register-form" style={{ padding: "2rem" }}>
      <div className="register-form-box" data-aos="fade-up" data-aos-delay="400">
        <h2 className='register-title'>Ro‘yxatdan o‘tish</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="user-register">
            <input
              className='username'
              type="text"
              placeholder="Foydalanuvchi nomi"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <input
              className='user-passwod'
              type="password"
              placeholder="Parol"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <input
              className='user-phonenumber'
              type="tel"
              placeholder="Telefon raqami"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <button type="submit" className='register-submit'>
              Ro‘yxatdan o‘tish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
