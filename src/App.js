import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Notification from "./Pages/Notification/Notification";
import { AuthProvider } from "./Contexts/AuthContext";
import PrivateRoute from "./PrivateRoute";
import Login from "./Pages/Login/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Users from "./Pages/Users/Users";
import "primereact/resources/themes/fluent-light/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import PrimeReact from "primereact/api";
import "primeflex/primeflex.css";
import UserDataContext from "./Contexts/UserDataContext";
import { useState } from "react";
import Profile from "./Pages/Profile/Profile";
import System from "./Pages/System/System";
import AppDataContext from "./Contexts/AppDataContext";
import UserActiveDataContext from "./Contexts/UserActiveDataContext";
import React from "react";
import NotificationContext from "./Contexts/NotificationContext";

PrimeReact.ripple = true;

function App() {
  const [userData, setUserData] = useState(null);
  const [userActiveData, setUserActiveData] = useState(null);
  const [appData, setAppData] = useState(null);
  const [notificationData, setNotificationData] = useState(null);

  return (
    <Router>
      <AppDataContext.Provider value={[appData, setAppData]}>
        <UserDataContext.Provider value={[userData, setUserData]}>
          <NotificationContext.Provider
            value={[notificationData, setNotificationData]}
          >
            <UserActiveDataContext.Provider
              value={[userActiveData, setUserActiveData]}
            >
              <AuthProvider>
                <Switch>
                  <PrivateRoute
                    exact
                    path="/dashboard/notification"
                    component={Notification}
                  />
                  <PrivateRoute exact path="/dashboard" component={Dashboard} />
                  <PrivateRoute
                    exact
                    path="/dashboard/user"
                    component={Users}
                  />
                  <PrivateRoute
                    exact
                    path="/dashboard/profile"
                    component={Profile}
                  />
                  <PrivateRoute
                    exact
                    path="/dashboard/system"
                    component={System}
                  />
                  <Route path="/login" exact component={Login} />
                  <Route path="/" exact>
                    <h1>Hai</h1>
                  </Route>
                </Switch>
              </AuthProvider>
            </UserActiveDataContext.Provider>
          </NotificationContext.Provider>
        </UserDataContext.Provider>
      </AppDataContext.Provider>
    </Router>
  );
}

export default App;
