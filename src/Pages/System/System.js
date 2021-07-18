import React, { useContext, useState, useEffect, useRef } from "react";
import MenuBar from "../../Components/MenuBar";
import AppDataContext from "../../Contexts/AppDataContext";
import { Panel } from "primereact/panel";
import { InputTextarea } from "primereact/inputtextarea";
import { firebase } from "../../Firebase/Firebase";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const System = () => {
  const [appData] = useContext(AppDataContext);
  const [maintenance, setMaintenance] = useState(true);
  const [banners, setBanners] = useState([]);
  const [devmode, setDevmode] = useState(false);
  const bannerRef = useRef();
  const toast = useRef(null);
  const [isSend, setIsSend] = useState(false);

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
      <>
        <h4>Maintenance : {maintenance ? "Ya" : "Tidak"}</h4>
        <h4>Developer Mode : {devmode ? "Ya" : "Tidak"}</h4>
      </>
    );
  };
  return (
    <div>
      <MenuBar />
      <Panel header="Banner" className="p-m-3">
        <RenderListBanner /> <br />
        <RenderEditListBanner />
        <Button onClick={updateBanner} label="Perbarui" disabled={isSend} />
      </Panel>
      <Panel header="Lainnya" className="p-m-3">
        <RenderGeneral />
      </Panel>
    </div>
  );
};

export default System;
