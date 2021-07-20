import React, { useEffect, useContext } from "react";
import { Terminal } from "primereact/terminal";
import { TerminalService } from "primereact/terminalservice";
import "./Terminals.css";
import AppDataContext from "../Contexts/AppDataContext";
import UserActiveDataContext from "../Contexts/UserActiveDataContext";
import NotificationContext from "../Contexts/NotificationContext";
import UserDataContext from "../Contexts/UserDataContext";

const Terminals = () => {
  const [userData, setUserData] = useContext(UserDataContext);
  const [userActiveData, setUserActiveData] = useContext(UserActiveDataContext);
  const [appData, setAppData] = useContext(AppDataContext);
  const [notificationData, setNotificationData] =
    useContext(NotificationContext);

  const commandHandler = (text) => {
    let response;
    let argsIndex = text.indexOf(" ");
    let command = argsIndex !== -1 ? text.substring(0, argsIndex) : text;

    switch (command) {
      case "date":
        response = "Hari ini " + new Date().toDateString();
        break;

      case "notification":
        if (notificationData) {
          response = `${notificationData
            .map((d, idx) => idx + 1 + ". " + d.name + " - " + d.content)
            .join("\n")}`;
        } else {
          response = "Tidak ada notifikasi yang aktif";
        }
        break;

      case "halo":
        response = "hai " + text.substring(argsIndex + 1) + "!";
        break;

      case "random":
        response = Math.floor(Math.random() * 100);
        break;

      case "clear":
        response = null;
        break;

      default:
        response = "Perintah salah: " + command;
        break;
    }

    if (response) {
      TerminalService.emit("response", response);
    } else {
      TerminalService.emit("clear");
    }
  };

  useEffect(() => {
    TerminalService.on("command", commandHandler);

    return () => {
      TerminalService.off("command", commandHandler);
    };
  }, []);

  return (
    <div className="card terminal">
      <Terminal
        welcomeMessage="Selamat Datang di Ruangmu Mobile Panel"
        prompt="ruangmu-mobile $"
      />
    </div>
  );
};

export default Terminals;
