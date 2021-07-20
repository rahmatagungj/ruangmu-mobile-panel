import React, { useEffect, useContext, useState } from "react";
import MenuBar from "../../Components/MenuBar";
import UserDataContext from "../../Contexts/UserDataContext";
import { firebase } from "../../Firebase/Firebase";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import AppDataContext from "../../Contexts/AppDataContext";
import UserActiveDataContext from "../../Contexts/UserActiveDataContext";
import NotificationContext from "../../Contexts/NotificationContext";
import Terminals from "../../Components/Terminals";
import { Panel } from "primereact/panel";

const Dashboard = () => {
  const [userData, setUserData] = useContext(UserDataContext);
  const [userActiveData, setUserActiveData] = useContext(UserActiveDataContext);
  const [appData, setAppData] = useContext(AppDataContext);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notificationData, setNotificationData] =
    useContext(NotificationContext);

  let userArray = [];
  let userActiveArray = [];

  const getAllUser = async () => {
    const userDocRef = await firebase.firestore().collection("users");
    const nowDate = new Date().getDate();
    userDocRef.get().then((querySnapshot) => {
      const tempDoc = querySnapshot.docs.map((doc) => {
        return { notificationToken: doc.notificationToken, ...doc.data() };
      });
      tempDoc.map((token) => {
        if (token.notificationToken) {
          userArray.push({
            token: token.notificationToken,
            lastUsed: token.lastUsed,
          });
        }
        if (token.notificationToken && nowDate - token.lastUsed < 7) {
          userActiveArray.push({
            token: token.notificationToken,
            lastUsed: token.lastUsed,
          });
        }
        return true;
      });
      // put useArray to state
      setUserActiveData(userActiveArray);
      setUserData(userArray);
      setIsLoaded(true);
    });
  };

  const getAllAppData = async () => {
    const userDocRef = await firebase.firestore().collection("applications");
    userDocRef.get().then((querySnapshot) => {
      const tempDoc = querySnapshot.docs.map((doc) => {
        return { ...doc.data() };
      });
      setAppData(tempDoc);
    });
    getAllUser();
  };

  const getAllNotificationApp = async () => {
    const userDocRef = await firebase.firestore().collection("notifications");
    userDocRef.get().then((querySnapshot) => {
      const tempDoc = querySnapshot.docs.map((doc) => {
        return { ...doc.data() };
      });
      setNotificationData(tempDoc);
    });
  };

  useEffect(() => {
    if (!userData && !notificationData) {
      getAllAppData();
      getAllNotificationApp();
      setIsLoaded(false);
    } else {
      setIsLoaded(true);
    }
    return () => {
      setIsLoaded(true);
    };
  }, [setIsLoaded, userData]);

  return (
    <div>
      <MenuBar />
      <div className="p-m-3">
        <div className="p-grid">
          {!isLoaded && <ProgressSpinner className="p-mx-auto p-mt-4" />}
          {userData && (
            <Card
              title={userData.length}
              subTitle="Pengguna"
              className="p-col p-mx-3 p-mt-5"
            ></Card>
          )}
          {userActiveData && (
            <Card
              title={userActiveData.length}
              subTitle="Pengguna Aktif"
              className="p-col p-mx-3 p-mt-5"
            ></Card>
          )}
          {notificationData && (
            <Card
              title={notificationData.length}
              subTitle="Notifikasi"
              className="p-col p-mx-3 p-mt-5"
            ></Card>
          )}
        </div>
        <div className="p-mt-4">
          <Panel header="Terminal" className="no-border p-m-2">
            <Terminals />
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
