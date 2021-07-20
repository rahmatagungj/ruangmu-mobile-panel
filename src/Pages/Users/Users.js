import React, { useEffect, useState, useContext } from "react";
import MenuBar from "../../Components/MenuBar";
import { firebase } from "../../Firebase/Firebase";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import UserDataContext from "../../Contexts/UserDataContext";

const Users = () => {
  const [userData, setUserData] = useContext(UserDataContext);
  const [isLoaded, setIsLoaded] = useState(false);
  const [nodes, setNodes] = useState(userData);

  useEffect(() => {
    if (userData) {
      const dataUserMap = userData.map((user, idx) => {
        return {
          key: idx,
          data: {
            token: user.token,
            lastUsed: user.lastUsed,
            ...user,
          },
        };
      });
      setNodes(dataUserMap);
      setIsLoaded(true);
    }
    return () => {
      setIsLoaded(false);
    };
  }, [userData]);

  const updateNode = (token) => {
    const filteredNodes = nodes.filter((node) => node.data.token !== token);
    const newFilteredNodes = [...filteredNodes];
    setNodes(newFilteredNodes);
  };

  const handleDeleteToken = async (token) => {
    const docRef = firebase.firestore().collection("users");
    const doc = await docRef.doc(token).get();
    if (doc.exists) {
      docRef.doc(token).delete();
      updateNode(token);
    }
  };

  const actionTemplate = (node, column) => {
    return (
      <div>
        <Button
          type="button"
          icon="pi pi-trash"
          className="p-button-warning"
          style={{ marginRight: ".5em" }}
          onClick={() => handleDeleteToken(node.data.token)}
        />
      </div>
    );
  };

  const lastUsedTemplate = (node) => {
    const lastUsed = node.data.lastUsed;
    const nowDate = new Date();
    const fontWeight = nowDate.getDate() - lastUsed < 7 ? "bold" : "normal";
    const fontColor = nowDate.getDate() - lastUsed < 7 ? "green" : "red";

    return (
      <span style={{ fontWeight: fontWeight, color: fontColor }}>
        {nowDate.getDate() - lastUsed < 7
          ? "Aktif"
          : nowDate.getDate() - lastUsed + " Hari yang lalu"}
      </span>
    );
  };

  return (
    <div>
      <MenuBar />
      <Panel header="Data Pengguna" className="p-m-3">
        {isLoaded ? (
          <TreeTable value={nodes} paginator scrollable rows={100}>
            <Column field="token" header="Token" expander></Column>
            <Column
              field="lastUsed"
              header="Status"
              body={lastUsedTemplate}
              sortable
              style={{ textAlign: "center", width: "8em" }}
            ></Column>
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
    </div>
  );
};

export default Users;
