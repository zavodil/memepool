import React from "react";
import {Navbar, Row, Col, Button} from "react-bootstrap";
import {APP_PATH} from "../constants";
import {Link} from "react-router-dom";

export default ({signIn, signOut, wallet}) => {
    return (
        <Navbar className='flex px-4 header-banner'>
            <div className='flex w-full p-2 font-bold title'>
                <Link to={APP_PATH}>NEAR&nbsp;MEME&nbsp;POOL</Link>
            </div>
            <div className='flex p-2 justify-end'>
                {wallet.isSignedIn() ? (
                    <Button onClick={signOut}>Sign&nbsp;Out</Button>
                ) : (
                    <Button onClick={signIn}>Sign&nbsp;In</Button>
                )}
            </div>
        </Navbar>
    );
};
