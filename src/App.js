import firebase from "./Firebase/Firebase";
import { useState } from "react";

function App() {
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  let tokenArray = [];

  const isActive = (month) => {
    const currentMonth = new Date().getMonth();
    const userMonth = month;
    if (currentMonth === userMonth) {
      return true;
    } else {
      return false;
    }
  };

  const initNotification = async () => {
    const userDocRef = await firebase.firestore().collection("users");
    userDocRef.get().then((querySnapshot) => {
      const tempDoc = querySnapshot.docs.map((doc) => {
        return { notificationToken: doc.notificationToken, ...doc.data() };
      });
      tempDoc.map((token) => {
        if (token.notificationToken && isActive(token.lastUsed)) {
          tokenArray.push({
            to: token.notificationToken,
            title: notificationTitle,
            body: notificationMessage,
          });
        }
        return true;
      });
      sendNotification();
    });
    return true;
  };

  const makeNotification = async () => {
    const getUser = await initNotification();
  };

  const sendNotification = async () => {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tokenArray),
    })
      .then((e) => e.ok && console.log("selesai"))
      .catch((e) => console.log(e));
  };

  return (
    <div className="App">
      <input
        type="text"
        name="judul"
        id="judul"
        onChange={(e) => setNotificationTitle(e.target.value)}
      />{" "}
      <br />
      <input
        type="text"
        name="pesan"
        id="pesan"
        onChange={(e) => setNotificationMessage(e.target.value)}
      />{" "}
      <br />
      <button onClick={makeNotification}>add data notif</button>
      <button onClick={sendNotification}>kirim notif</button>
    </div>
  );
}

export default App;
