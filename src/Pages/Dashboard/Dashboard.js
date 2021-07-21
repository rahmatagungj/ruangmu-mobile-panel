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
import { Chart } from "primereact/chart";

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

  const chartData = {
    labels: ["Tidak Aktif", "Aktif"],
    datasets: [
      {
        data: [
          userData ? userData.length : 0,
          userActiveData ? userActiveData.length : 0,
        ],
        backgroundColor: ["#f81f3c", "#66BB6A"],
        hoverBackgroundColor: ["#f81f3c", "#81C784"],
      },
    ],
  };

  const RenderLoading = () => {
    return (
      <i className="pi pi-spin pi-spinner" style={{ fontSize: "1em" }}></i>
    );
  };

  return (
    <div>
      <MenuBar />
      <div className="p-grid">
        <Card
          title={userData ? userData.length : <RenderLoading />}
          subTitle="Pengguna"
          className="p-col p-mx-3 p-mt-5"
        ></Card>
        <Card
          title={userActiveData ? userActiveData.length : <RenderLoading />}
          subTitle="Pengguna Aktif"
          className="p-col p-mx-3 p-mt-5"
        ></Card>
        <Card
          title={notificationData ? notificationData.length : <RenderLoading />}
          subTitle="Notifikasi"
          className="p-col p-mx-3 p-mt-5"
        ></Card>
      </div>
      <div className="p-m-2">
        <div className="p-grid">
          <div className="p-col-3 p-mt-2">
            <Panel header="Statistik Pengguna" className="no-border">
              <Chart
                type="doughnut"
                data={chartData}
                style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: "10px",
                }}
              />
            </Panel>
          </div>
          <div className="p-col p-mt-2">
            <Panel header="Terminal" className="no-border">
              <Terminals />
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
