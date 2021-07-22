import React from "react";
import { Helmet } from "react-helmet";

const Seo = ({ title }) => {
  return <Helmet title={title} htmlAttributes={{ lang: "en" }} />;
};

export default Seo;
