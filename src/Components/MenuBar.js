import React, { useState } from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import "./MenuBar.css";

const MenuBar = () => {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const history = useHistory();

  const navigateToPage = (path) => {
    history.push(path);
  };

  async function handleLogout() {
    setError("");

    try {
      await logout();
      history.push("/login");
    } catch {
      setError("Failed to log out");
    }
  }

  const items = [
    {
      label: "Data Pengguna",
      icon: "pi pi-fw pi-users",
      command: () => navigateToPage("/dashboard/user"),
    },
    {
      label: "Notifikasi Pengguna",
      icon: "pi pi-fw pi-bell",
      command: () => navigateToPage("/dashboard/notification"),
    },
    {
      label: "Pengaturan Sistem",
      icon: "pi pi-fw pi-cog",
      command: () => navigateToPage("/dashboard/system"),
    },
    {
      label: currentUser.email,
      icon: "pi pi-fw pi-user",
      command: () => navigateToPage("/dashboard/profile"),
    },
  ];

  const Home = (
    <>
      <h2 onClick={() => navigateToPage("/dashboard")} className="p-mr-2">
        BERANDA
      </h2>
    </>
  );
  return (
    <div>
      <Menubar
        className="bg-dark-blue no-border color-white"
        model={items}
        outsideClick={() => {}}
        start={Home}
        end={
          !error && (
            <Button
              className="bg-red no-border"
              label="Keluar"
              icon="pi pi-power-off"
              onClick={handleLogout}
            />
          )
        }
      />
    </div>
  );
};

export default MenuBar;
