import React, { useState, useRef, useContext, useEffect } from "react";
import MenuBar from "../../Components/MenuBar";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Panel } from "primereact/panel";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import UserDataContext from "../../Contexts/UserDataContext";
import { confirmDialog } from "primereact/confirmdialog";
import NotificationContext from "../../Contexts/NotificationContext";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import { firebase } from "../../Firebase/Firebase";

const Notification = () => {
  const [notificationTitle, setNotificationTitle] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [notificationShortMessage, setNotificationShortMessage] =
    useState(null);
  const [notificationTime, setNotificationTime] = useState(null);
  const [notificationImage, setNotificationImage] = useState(null);
  const [notificationKey, setNotificationKey] = useState(null);
  const [newNodesData, setNewNodesData] = useState(null);
  const [isSend, setIsSend] = useState(false);
  const [userData] = useContext(UserDataContext);
  const [canSend, setCanSend] = useState(true);
  const toast = useRef(null);
  const [notificationData, setNotificationData] =
    useContext(NotificationContext);
  const [nodes, setNodes] = useState(notificationData);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const handleAddNotif = async (id) => {
    const userDocRef = await firebase
      .firestore()
      .collection("notifications")
      .doc(id.toString());
    const doc = await userDocRef.get();
    if (!doc.exists) {
      userDocRef.set({
        content: notificationMessage,
        image: notificationImage,
        name: notificationTitle,
        time: notificationTime,
        key: notificationKey,
      });
      nodes.push({
        key: nodes.length,
        data: {
          key: notificationKey,
          name: notificationTitle,
          time: notificationTime,
          image: notificationImage,
          content: notificationMessage,
        },
      });
      setNewNodesData(nodes);
    }
  };

  const updateNode = (id) => {
    const filteredNodes = nodes.filter((node) => node.key !== id);
    const newFilteredNodes = [...filteredNodes];
    setNodes(newFilteredNodes);
    console.log(newFilteredNodes);
  };

  const handleDeleteNotif = async (id) => {
    const docRef = firebase.firestore().collection("notifications");
    const doc = await docRef.doc(id.toString()).get();
    if (doc.exists) {
      console.log("dihapus", id.toString());
      docRef.doc(id.toString()).delete();
      updateNode(id - 1);
    }
  };

  useEffect(() => {
    setNodes(nodes, newNodesData);
    return () => {
      setNodes(null);
      setNewNodesData(null);
    };
  }, [newNodesData]);

  const accept = () => {
    if (userData) {
      userData.map((token) => {
        if (token.token && isActive(token.lastUsed)) {
          tokenArray.push({
            to: token.token,
            title: notificationTitle,
            body: notificationShortMessage,
          });
        }
        setIsSend(true);
        return tokenArray;
      });
      handleAddNotif(notificationData.length + 1);
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
      console.log(response);
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

  useEffect(() => {
    if (notificationData) {
      const dataNotificationMap = notificationData.map((user, idx) => {
        return {
          key: idx,
          data: {
            key: user.key,
            name: user.name,
            time: user.time,
            image: user.image,
            ...user,
          },
        };
      });
      setNodes(dataNotificationMap);
      setIsLoaded(true);
    }
    return () => {
      setIsLoaded(false);
    };
  }, [notificationData]);

  const actionTemplate = (node, column) => {
    return (
      <div>
        <Button
          type="button"
          icon="pi pi-trash"
          className="p-button-warning"
          style={{ marginRight: ".5em" }}
          onClick={() => handleDeleteNotif(column.node.key + 1)}
        />
      </div>
    );
  };

  return (
    <div>
      <Toast ref={toast} position="bottom-right" />
      <MenuBar />
      <Panel header="Notifikasi App" className="p-m-3">
        {isLoaded ? (
          <TreeTable value={nodes} paginator scrollable rows={100}>
            <Column field="key" header="Key" sortable></Column>
            <Column field="name" header="Nama"></Column>
            <Column field="content" header="Pesan" expander></Column>
            <Column field="time" header="Waktu"></Column>
            <Column field="image" header="Gambar"></Column>
            <Column
              body={actionTemplate}
              header="Aksi"
              style={{ textAlign: "center", width: "8em" }}
            />
          </TreeTable>
        ) : (
          <h3>Data tidak ada.</h3>
        )}
      </Panel>
      <Panel header="Notifikasi Pengguna" className="p-m-3">
        {isLoaded ? (
          <div className="p-fluid p-formgrid p-grid">
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="title">Pengirim</label>
              <InputText
                id="title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                disabled={isSend}
              />
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="time">Waktu</label>
              <InputText
                id="time"
                type="text"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
              />
            </div>
            <div className="p-field p-col-12">
              <label htmlFor="shortmessage">Pesan Singkat</label>
              <InputTextarea
                rows="2"
                id="shortmessage"
                value={notificationShortMessage}
                onChange={(e) => setNotificationShortMessage(e.target.value)}
                disabled={isSend}
              />
            </div>
            <div className="p-field p-col-12">
              <label htmlFor="message">Pesan Lengkap</label>
              <InputTextarea
                rows="4"
                id="message"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                disabled={isSend}
              />
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="image">Gambar</label>
              <InputText
                id="image"
                type="text"
                value={notificationImage}
                onChange={(e) => setNotificationImage(e.target.value)}
              />
            </div>
            <div className="p-field p-col-12 p-md-3">
              <label htmlFor="key">Key</label>
              <InputText
                id="key"
                type="text"
                value={notificationKey}
                onChange={(e) => setNotificationKey(e.target.value)}
              />
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
        ) : (
          <h3>Data tidak ada.</h3>
        )}
      </Panel>
      <Panel header="Daftar Logo dan Avatar" className="p-m-3">
        <img
          src="https://raw.githubusercontent.com/rahmatagungj/ruangmu-mobile-api/master/assets/alertNotification.png"
          alt="alert"
          style={{ width: "100px", borderRadius: "100PX" }}
          className="p-m-3"
        />
        <img
          src="https://raw.githubusercontent.com/rahmatagungj/ruangmu-mobile-api/master/assets/stkip-circle.jpg"
          alt="stkip"
          style={{ width: "100px", borderRadius: "100PX" }}
          className="p-m-3"
        />
        <img
          src="https://raw.githubusercontent.com/rahmatagungj/ruangmu-mobile-api/master/assets/user.png"
          alt="Rahmat Agung Julians "
          style={{ width: "100px", borderRadius: "100PX" }}
          className="p-m-3"
        />
      </Panel>
    </div>
  );
};

export default Notification;
