import React, {useState} from "react";

import {
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavItem,
  MDBNavLink,
  MDBNavbarToggler,
  MDBCollapse,
  MDBFormInline,
  MDBLink,
  MDBBtn
} from "mdbreact";

import {APP_PATH} from "../constants";

export default ({signIn, signOut, wallet}) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log(wallet.isSignedIn());

  const toggleCollapse = () => {

  }

  const handleSignIn = () => {
    signIn();
  }

  const handleSignOut = () => {
    signOut();
  }

  return (

    <MDBNavbar color="indigo" dark expand="md">
      <MDBNavbarBrand>
        <MDBLink to={APP_PATH}>NEAR MEME POOL</MDBLink>
      </MDBNavbarBrand>
      <MDBNavbarToggler onClick={toggleCollapse}/>
      <MDBCollapse id="navbarCollapse3" isOpen={isOpen} navbar>
        <MDBNavbarNav left>
          <MDBNavItem active>
            <MDBNavLink to="/">Home</MDBNavLink>
          </MDBNavItem>
        </MDBNavbarNav>
        <MDBNavbarNav right>
          <MDBNavItem>
            <MDBFormInline waves>
              <div className="md-form my-0">
                {wallet.isSignedIn() ? (
                  <MDBBtn color="primary" onClick={handleSignOut}>Sign Out</MDBBtn>
                ) : (
                  <MDBBtn color="primary" onClick={handleSignIn}>Sign In</MDBBtn>
                )}
              </div>
            </MDBFormInline>
          </MDBNavItem>
        </MDBNavbarNav>
      </MDBCollapse>
    </MDBNavbar>

  );
};
