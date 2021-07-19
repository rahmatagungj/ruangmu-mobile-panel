import React, { useContext, useState, useEffect, useRef } from "react";
import MenuBar from "../../Components/MenuBar";
import AppDataContext from "../../Contexts/AppDataContext";
import { Panel } from "primereact/panel";
import { InputTextarea } from "primereact/inputtextarea";
import { firebase } from "../../Firebase/Firebase";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ToggleButton } from "primereact/togglebutton";
import { Card } from "primereact/card";

const System = () => {
  const [appData] = useContext(AppDataContext);
  const [maintenance, setMaintenance] = useState(true);
  const [banners, setBanners] = useState([]);
  const [devmode, setDevmode] = useState(false);
  const bannerRef = useRef();
  const toast = useRef(null);
  const [isSend, setIsSend] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (appData) {
      setBanners(appData[0]["banner"]);
      setMaintenance(appData[2]["maintenance"]);
      setDevmode(appData[1]["devmode"]);
    }
  }, [appData]);

  const RenderListBanner = () => {
    return banners.map((banner, idx) => (
      <img
        key={idx}
        src={banner}
        style={{ maxWidth: "300px", marginRight: "10px" }}
        alt={banner}
      />
    ));
  };

  const showSuccess = () => {
    toast.current.show({
      severity: "success",
      summary: `Berhasil`,
      detail: `Banner berhasil diperbarui.`,
      life: 3000,
    });
  };

  const showSuccessUpdate = () => {
    toast.current.show({
      severity: "success",
      summary: `Berhasil`,
      detail: `Data berhasil diperbarui.`,
      life: 3000,
    });
  };

  const updateBanner = async () => {
    if (appData && bannerRef.current.value.length > 0) {
      setIsSend(true);
      await firebase
        .firestore()
        .collection("applications")
        .doc("banners")
        .set({ banner: bannerRef.current.value.split(",") }, { merge: true })
        .then((e) => {
          setIsSend(false);
          showSuccess();
        });
    }
  };

  const updateMaintenance = async (value) => {
    if (appData) {
      setMaintenance(value);
      setIsSend(true);
      await firebase
        .firestore()
        .collection("applications")
        .doc("maintenances")
        .set({ maintenance: value }, { merge: true })
        .then((e) => {
          setIsSend(false);
          showSuccessUpdate();
        });
    }
  };

  const updateDevmode = async (value) => {
    if (appData) {
      setDevmode(value);
      setIsSend(true);
      await firebase
        .firestore()
        .collection("applications")
        .doc("devmodes")
        .set({ devmode: value }, { merge: true })
        .then((e) => {
          setIsSend(false);
          showSuccessUpdate();
        });
    }
  };

  const RenderEditListBanner = () => {
    return (
      <div className="p-fluid p-formgrid p-grid">
        <Toast ref={toast} position="bottom-right" />
        <div className="p-field p-col-12">
          <div className="p-field p-fluid p-mt-3">
            <label htmlFor="bannerOld">Data Banner Lama</label>
            <InputTextarea
              rows="4"
              id="bannerOld"
              value={banners}
              disabled={true}
            />
          </div>
          <div className="p-field p-fluid p-mt-3">
            <label htmlFor="banner">Data Banner Baru</label>
            <InputTextarea rows="4" id="banner" ref={bannerRef} />
            <small id="banner-help">Pisahkan dengan koma.</small>
          </div>
        </div>
      </div>
    );
  };

  const RenderGeneral = () => {
    return (
      <div className="p-formgroup-inline p-mt-3">
        <div className="p-field">
          <Card title="Maintenance">
            <label htmlFor="Maintenance" className="p-sr-only">
              Maintenance
            </label>
            <ToggleButton
              id="Maintenance"
              checked={maintenance}
              onChange={(e) => updateMaintenance(e.value)}
              onIcon="pi pi-check"
              offIcon="pi pi-times"
              onLabel="Aktif"
              offLabel="Tidak Aktif"
              disabled={isSend}
            />
          </Card>
        </div>
        <div className="p-field">
          <Card title="Developer Mode">
            <label htmlFor="Devmode" className="p-sr-only">
              Developer Mode
            </label>
            <ToggleButton
              id="Devmode"
              checked={devmode}
              onChange={(e) => updateDevmode(e.value)}
              onIcon="pi pi-check"
              offIcon="pi pi-times"
              onLabel="Aktif"
              offLabel="Tidak Aktif"
              disabled={isSend}
            />
          </Card>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (appData && banners) {
      setIsLoaded(true);
    }
    return () => {
      setIsLoaded(false);
    };
  }, [appData, banners]);

  return (
    <div>
      <MenuBar />
      <Panel header="Banner" className="p-m-3">
        {isLoaded ? (
          <>
            <RenderListBanner /> <br />
            <RenderEditListBanner />
            <Button onClick={updateBanner} label="Perbarui" disabled={isSend} />
          </>
        ) : (
          <h3>Data tidak ada.</h3>
        )}
      </Panel>
      <Panel header="Lainnya" className="p-m-3">
        {isLoaded ? <RenderGeneral /> : <h3>Data tidak ada.</h3>}
      </Panel>
    </div>
  );
};

export default System;
