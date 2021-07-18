import React, { useEffect, useContext, useState } from "react";
import MenuBar from "../../Components/MenuBar";
import UserDataContext from "../../Contexts/UserDataContext";
import { firebase } from "../../Firebase/Firebase";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import AppDataContext from "../../Contexts/AppDataContext";
import UserActiveDataContext from "../../Contexts/UserActiveDataContext";

const Dashboard = () => {
  const [userData, setUserData] = useContext(UserDataContext);
  const [userActiveData, setUserActiveData] = useContext(UserActiveDataContext);
  const [setAppData] = useContext(AppDataContext);
  const [isLoaded, setIsLoaded] = useState(false);

  let userArray = [];
  let userActiveArray = [];

  const getAllUser = async () => {
    const userDocRef = await firebase.firestore().collection("users");
    const nowDate = new Date().getMonth();
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
        if (token.notificationToken && token.lastUsed === nowDate) {
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

  useEffect(() => {
    if (!userData) {
      getAllAppData();
      setIsLoaded(false);
    } else {
      setIsLoaded(true);
    }
    // eslint-disable-next-line
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
