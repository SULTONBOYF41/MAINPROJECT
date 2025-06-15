import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/style.css';

export default function Profile() {
  const [activeTab, setActiveTab] = useState("orders");
  const [userData, setUserData] = useState({
    username: "foydalanuvchi123",
    phone: "+998901234567",
    password: "123456",
  });
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const saveChanges = () => {
    console.log("Ma’lumotlar saqlandi:", userData);
    setEditMode(false);
    // TODO: Serverga ma'lumot yuborish (fetch/post)
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/register");
    window.location.reload();
  };

  return (
    <div style={{ padding: "2rem" }} className="profile-wrap">
      <h2 className="profile-title"> Profil Sahifasi</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }} className="profile-btn">
        <button onClick={() => setActiveTab("orders")} className="profile-btns">Buyurtmalarim</button>
        <button onClick={() => setActiveTab("settings")} className="profile-btns">Sozlamalar</button>
        <button onClick={handleLogout}  className="profile-btns">
          Log out
        </button>
      </div>

      {activeTab === "orders" && (
        <div>
          <h3>Buyurtmalar</h3>
          <p>Bu yerda foydalanuvchining buyurtmalari chiqadi.</p>
        </div>
      )}

      {activeTab === "settings" && (
        <div>
          <h3>Profil sozlamalari</h3>
          {!editMode ? (
            <>
              <p><strong>Foydalanuvchi nomi:</strong> {userData.username}</p>
              <p><strong>Telefon raqami:</strong> {userData.phone}</p>
              <p><strong>Parol:</strong> {userData.password}</p>
              <button onClick={() => setEditMode(true)}>Tahrirlash</button>
            </>
          ) : (
            <>
              <input
                name="username"
                value={userData.username}
                onChange={handleInputChange}
                placeholder="Foydalanuvchi nomi"
              />
              <input
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                placeholder="Telefon raqam"
              />
              <input
                name="password"
                type="password"
                value={userData.password}
                onChange={handleInputChange}
                placeholder="Yangi parol"
              />
              <br />
              <button onClick={saveChanges}>Saqlash</button>
              <button onClick={() => setEditMode(false)}>Bekor qilish</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
