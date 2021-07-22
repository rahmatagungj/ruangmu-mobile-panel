import React, { useRef, useState } from "react";
import { useHistory, Redirect } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import "./Login.css";
import { Button } from "primereact/button";
import Seo from "../../Components/Seo";

const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { currentUser, login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      history.push("/dashboard");
    } catch {
      setError("Login gagal");
    }

    setLoading(false);
  }

  if (currentUser) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div>
      <Seo title="Ruangmu Mobile - Masuk" />
      <div className="p-d-flex p-jc-center">
        <Card
          title="Masuk"
          subTitle={error ? error : "Harap masuk untuk melanjutkan"}
          className="animation-panel vertical-center shadowed"
        >
          <div className="p-fluid ">
            <form onSubmit={handleSubmit}>
              <div className="p-field">
                <label htmlFor="email">Alamat Surel</label>
                <InputText type="text" name="email" id="email" ref={emailRef} />
              </div>
              <div className="p-field">
                <label htmlFor="password">Kata Sandi</label>
                <InputText
                  type="text"
                  name="password"
                  id="pasword"
                  ref={passwordRef}
                />
              </div>
              <div className="p-field">
                <Button
                  label="Masuk"
                  disabled={loading}
                  className="bg-dark-blue"
                />
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
