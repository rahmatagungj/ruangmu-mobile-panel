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
import { Dropdown } from "primereact/dropdown";
import Seo from "../../Components/Seo";

const Notification = () => {
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationShortMessage, setNotificationShortMessage] = useState("");
  const [notificationLink, setNotificationLink] = useState("");
  const [notificationImage, setNotificationImage] = useState("");
  const [notificationKey, setNotificationKey] = useState("");
  const [newNodesData, setNewNodesData] = useState(null);
  const [isSend, setIsSend] = useState(false);
  const [userData] = useContext(UserDataContext);
  const [canSend, setCanSend] = useState(true);
  const toast = useRef(null);
  const [notificationData, setNotificationData] =
    useContext(NotificationContext);
  const [nodes, setNodes] = useState(notificationData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [limitDate, setLimitDate] = useState(7);

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

  const limitedDate = [
    { name: "7 Hari", code: 7 },
    { name: "10 Hari", code: 10 },
    { name: "15 Hari", code: 15 },
    { name: "20 Hari", code: 20 },
    { name: "25 Hari", code: 25 },
    { name: "30 Hari", code: 30 },
  ];

  const onChangeLimitedDate = (e) => {
    setLimitDate(e.target.value.code);
  };

  const isActive = (userDate) => {
    const currentDate = new Date().getDate();
    if (currentDate - userDate < limitDate) {
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
        link: notificationLink,
        key: notificationKey,
      });
      nodes.push({
        key: nodes.length,
        data: {
          key: notificationKey,
          name: notificationTitle,
          link: notificationLink,
          image: notificationImage,
          content: notificationMessage,
        },
      });
      setNewNodesData(nodes);
      sendNotification();
    }
  };

  const updateNode = (key) => {
    const filteredNodes = nodes.filter((node) => node.data.key !== key);
    const newFilteredNodes = [...filteredNodes];
    setNodes(newFilteredNodes);
  };

  const handleDeleteNotif = async (key) => {
    const docRef = firebase.firestore().collection("notifications");
    const doc = await docRef.doc(key.toString()).get();
    if (doc.exists) {
      docRef.doc(key.toString()).delete();
      updateNode(key);
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
      handleAddNotif(notificationKey);
    }
  };

  const reject = () => {
    tokenArray = [];
  };

  const sendNotification = async () => {
    const splitedData = chunkArray(tokenArray, 100);
    for (let i = 0; i < splitedData.length; i++) {
      const response = await fetch(
        "https://ruangmu-mobile-proxy.herokuapp.com/https://exp.host/--/api/v2/push/send",
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
      }
    }
    tokenArray = [];
    setIsSend(false);
  };

  useEffect(() => {
    if (
      userData &&
      notificationMessage.replace(/\s/g, "").length > 0 &&
      notificationTitle.replace(/\s/g, "").length > 0 &&
      notificationImage.replace(/\s/g, "").length > 0 &&
      notificationKey.replace(/\s/g, "").length > 0 &&
      notificationLink.replace(/\s/g, "").length > 0 &&
      notificationShortMessage.replace(/\s/g, "").length > 0
    ) {
      setCanSend(false);
    } else {
      setCanSend(true);
    }
  }, [
    userData,
    isSend,
    notificationMessage,
    notificationTitle,
    notificationImage,
    notificationKey,
    notificationLink,
    notificationShortMessage,
  ]);

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
          key: idx || user.key,
          data: {
            key: user.key,
            name: user.name,
            link: user.link,
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
          onClick={() => handleDeleteNotif(node.data.key)}
        />
      </div>
    );
  };

  const imageTemplate = (node) => {
    return (
      <div>
        <img
          className="p-mx-auto"
          src={node.data.image}
          alt="notification image"
          style={{ maxWidth: "80px", borderRadius: "100px" }}
        />
      </div>
    );
  };

  const linkTemplate = (node) => {
    return (
      <div>
        <a href={node.data.link} target="_blank" rel="noopener noreferrer">
          {node.data.link}
        </a>
      </div>
    );
  };

  return (
    <div>
      <Seo title="Ruangmu Mobile - Notifikasi" />
      <Toast ref={toast} position="bottom-right" />
      <MenuBar />
      <Panel header="Daftar Notifikasi" className="p-m-3">
        {isLoaded ? (
          <TreeTable value={nodes} paginator scrollable rows={100}>
            <Column field="key" header="Key" sortable></Column>
            <Column field="name" header="Nama"></Column>
            <Column field="content" header="Pesan" expander></Column>
            <Column header="Link" body={linkTemplate}></Column>
            <Column field="image" header="Gambar" body={imageTemplate}></Column>
            <Column
              field=""
              body={actionTemplate}
              header="Aksi"
              style={{ textAlign: "center", width: "8em" }}
            />
          </TreeTable>
        ) : (
          <h3>Data tidak ada.</h3>
        )}
      </Panel>
      <Panel header="Buat Notifikasi" className="p-m-3">
        {isLoaded ? (
          <div className="p-fluid p-formgrid p-grid">
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="title">Pengirim</label>
              <InputText
                id="title"
                value={notificationTitle || ""}
                onChange={(e) => setNotificationTitle(e.target.value)}
                disabled={isSend}
              />
            </div>
            <div className="p-field p-col-12 p-md-6">
              <label htmlFor="link">Link</label>
              <InputText
                id="link"
                type="text"
                value={notificationLink || ""}
                onChange={(e) => setNotificationLink(e.target.value)}
              />
            </div>
            <div className="p-field p-col-12">
              <label htmlFor="shortmessage">Pesan Singkat</label>
              <InputTextarea
                rows="2"
                id="shortmessage"
                value={notificationShortMessage || ""}
                onChange={(e) => setNotificationShortMessage(e.target.value)}
                disabled={isSend}
              />
            </div>
            <div className="p-field p-col-12">
              <label htmlFor="message">Pesan Lengkap</label>
              <InputTextarea
                rows="4"
                id="message"
                value={notificationMessage || ""}
                onChange={(e) => setNotificationMessage(e.target.value)}
                disabled={isSend}
              />
            </div>
            <div className="p-field p-col-12 p-md-3">
              <label htmlFor="image">Gambar</label>
              <InputText
                id="image"
                type="text"
                value={notificationImage || ""}
                onChange={(e) => setNotificationImage(e.target.value)}
              />
            </div>
            <div className="p-field p-col-12 p-md-3">
              <label htmlFor="key">Key</label>
              <InputText
                id="key"
                type="text"
                value={notificationKey || ""}
                onChange={(e) => setNotificationKey(e.target.value)}
              />
            </div>
            <div className="p-field p-col-12 p-md-3">
              <label htmlFor="limitdate">Tenggat Aktif Pengguna</label>
              <Dropdown
                value={limitDate}
                options={limitedDate}
                onChange={onChangeLimitedDate}
                optionLabel="name"
                placeholder={limitDate + " Hari"}
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
