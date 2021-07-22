import React from "react";
import MenuBar from "../../Components/MenuBar";
import { useAuth } from "../../Contexts/AuthContext";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import Seo from "../../Components/Seo";

const Profile = () => {
  const { currentUser } = useAuth();

  return (
    <div>
      <Seo title="Ruangmu Mobile - Profil" />
      <MenuBar />
      <Panel header="Profil" className="p-m-3">
        <div className="p-fluid">
          <div className="p-field p-grid">
            <label htmlFor="uid" className="p-col-12 p-md-2">
              ID
            </label>
            <div className="p-col-12 p-md-10">
              <InputText
                id="uid"
                type="text"
                disabled={true}
                value={currentUser.uid}
              />
            </div>
          </div>
          <div className="p-field p-grid">
            <label htmlFor="surel" className="p-col-12 p-md-2">
              Surel
            </label>
            <div className="p-col-12 p-md-10">
              <InputText
                id="surel"
                type="text"
                value={currentUser.email}
                disabled={true}
              />
            </div>
          </div>
          <div className="p-field p-grid">
            <label htmlFor="password" className="p-col-12 p-md-2">
              Kata Sandi
            </label>
            <div className="p-col-12 p-md-10">
              <InputText
                id="password"
                type="text"
                value="*******"
                disabled={true}
              />
            </div>
          </div>
          <Button label="Simpan" disabled={true} />
        </div>
      </Panel>
    </div>
  );
};

export default Profile;
