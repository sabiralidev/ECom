import React from "react";
import Header from "../Common/Header";
import Footer from "../Common/Footer";
import { Outlet, useLocation } from "react-router-dom";

const UserLayout = () => {
  const location = useLocation();

  return (
    <div className="storefront-shell">
      <Header />
      <main className="pb-16 pt-[5.7rem] md:pb-0 md:pt-[7.1rem]">
        <Outlet />
      </main>
      <div className="pb-16 md:pb-0">
        <Footer showNewsletter={location.pathname !== "/"} />
      </div>
    </div>
  );
};

export default UserLayout;
