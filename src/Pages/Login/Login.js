import React, { useRef, useState } from "react";
import { useHistory, Redirect } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import "./Login.css";
import { Button } from "primereact/button";
import Seo from "../../Components/Seo";
import { Password } from "primereact/password";
import { Captcha } from "primereact/captcha";

const Login = () => {
  const emailRef = useRef();
  const [password, setPassword] = useState("");
  const { currentUser, login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [disableLogin, setDisableLogin] = useState(true);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, password);
      history.push("/dashboard");
    } catch (e) {
      setError("Login gagal");
    }

    setLoading(false);
  }

  if (currentUser) {
    return <Redirect to="/dashboard" />;
  }

  const showResponseCaptcha = (response) => {
    setDisableLogin(false);
  };

  const RenderLoading = () => {
    return (
      <i className="pi pi-spin pi-spinner" style={{ fontSize: "1em" }}></i>
    );
  };

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
                <Password
                  type="text"
                  name="password"
                  id="pasword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  feedback={false}
                  toggleMask
                />
              </div>
              <div className="p-field">
                <Captcha
                  siteKey="6LcuirEbAAAAABy0oKaVFq0O5C4ZY020VY5cqf7Q"
                  onResponse={showResponseCaptcha}
                ></Captcha>
              </div>
              <div className="p-field">
                <Button
                  label={loading ? <RenderLoading /> : "Masuk"}
                  disabled={disableLogin ? disableLogin : loading}
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
