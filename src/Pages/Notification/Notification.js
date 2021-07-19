import React, { useState, useRef, useContext, useEffect } from "react";
import MenuBar from "../../Components/MenuBar";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Panel } from "primereact/panel";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import UserDataContext from "../../Contexts/UserDataContext";
import { confirmDialog } from "primereact/confirmdialog";

const Notification = () => {
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isSend, setIsSend] = useState(false);
  const [userData] = useContext(UserDataContext);
  const [canSend, setCanSend] = useState(true);
  const toast = useRef(null);

  let tokenArray = [];

  const showSuccess = (user) => {
    toast.current.show({
      severity: "success",
      summary: `Berhasil`,
      detail: `Notifikasi berhasil dikirim kepada ${user} pengguna.`,
      life: 3000,
    });
  };

  const showFailed = (user) => {
    toast.current.show({
      severity: "error",
      summary: `Gagal`,
      detail: `Notifikasi gagal dikirim kepada ${user} pengguna.`,
      life: 3000,
    });
  };

  const isActive = (month) => {
    const currentMonth = new Date().getMonth();
    const userMonth = month;
    if (currentMonth === userMonth) {
      return true;
    } else {
      return false;
    }
  };

  const chunkArray = (arr, size) =>
    arr.length > size
      ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
      : [arr];

  const accept = () => {
    if (userData) {
      userData.map((token) => {
        if (token.token && isActive(token.lastUsed)) {
          tokenArray.push({
            to: token.token,
            title: notificationTitle,
            body: notificationMessage,
          });
        }
        setIsSend(true);
        return tokenArray;
      });
      sendNotification();
    }
  };

  const reject = () => {
    tokenArray = [];
  };

  const sendNotification = async () => {
    const splitedData = chunkArray(tokenArray, 100);
    for (let i = 0; i < splitedData.length; i++) {
      const response = await fetch(
        "https://cors-anywhere.herokuapp.com/https://exp.host/--/api/v2/push/send",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(splitedData[i]),
        }
      );
      if (response.status === 200) {
        showSuccess(splitedData[i].length);
      } else {
        showFailed(splitedData[i].length);
        console.log("gagal", response);
      }
    }
    tokenArray = [];
    setIsSend(false);
  };

  useEffect(() => {
    if (userData && notificationMessage && notificationTitle) {
      setCanSend(false);
    }
  }, [userData, isSend, notificationMessage, notificationTitle]);

  const confirmSendNotification = () => {
    confirmDialog({
      message: "Apakah anda yakin akan akan mengirim notifikasi ini?",
      header: "Konfirmasi Pengiriman",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-info",
      rejectClassName: "p-button-danger",
      acceptLabel: "Ya",
      rejectLabel: "Tidak",
      accept,
      reject,
    });
  };

  return (
    <div>
      <Toast ref={toast} position="bottom-right" />
      <MenuBar />
      <Panel header="Notifikasi Pengguna" className="p-m-3">
        <div className="p-fluid p-formgrid p-grid">
          <div className="p-field p-col-12 p-md-6">
            <label htmlFor="title">Judul / Pengirim</label>
            <InputText
              id="title"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              disabled={isSend}
            />
          </div>
          <div className="p-field p-col-12 p-md-6">
            <label htmlFor="channel">Prioritas</label>
            <Dropdown
              inputId="channel"
              placeholder="default"
              optionLabel="name"
              disabled={true}
            />
          </div>
          <div className="p-field p-col-12">
            <label htmlFor="message">Pesan</label>
            <InputTextarea
              rows="4"
              id="message"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              disabled={isSend}
            />
          </div>
          <div className="p-field p-col-12 p-md-6">
            <label htmlFor="data">Data</label>
            <InputText id="data" type="text" />
          </div>
          <div className="p-field p-col-12 p-md-3">
            <label htmlFor="TTLS">Waktu Pengiriman</label>
            <InputText id="TTLS" type="text" disabled={true} value="default" />
          </div>
          <div className="p-field p-col-12 p-md-3">
            <label htmlFor="Kirim">Kirim Notifikasi</label>
            {!canSend ? (
              <Button
                onClick={confirmSendNotification}
                label="Kirim"
                disabled={isSend}
              />
            ) : (
              <Button
                onClick={confirmSendNotification}
                label="Kirim"
                disabled={true}
              />
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default Notification;
