import React from "react";
import {Row, Col, Form, Button, Alert} from "react-bootstrap";
import {APP_PATH} from "../constants";
import {BN} from 'bn.js'
import {Link, Redirect} from "react-router-dom";

class Profile extends React.Component {
    constructor(props) {
        super(props);
        console.log("props")
        console.log(props);
        this.state = {
            toHome: false,
        };
    }

    render() {
        if (this.state.toHome) {
            return <Redirect to={APP_PATH}/>;
        }

        let content = "";
        if (!this.props.wallet.isSignedIn()) {
            content = "You need to sign in to submit memes!"
        }
        else
        {
            content = "Current account: " + this.props.wallet.getAccountId();
        }
        return (
            <div className='form-container flex flex-col'>
                <div className='flex py-2 px-2 my-6'>
                    <div className='w-1/6 flex mb-auto align-top'>
                        <div className='near-btn'>
                            <Link to={APP_PATH}>Back</Link>
                        </div>
                    </div>

                    <div className='w-4/6 px-10 bg-gray-200 py-3 text-2xl'>
                        {content}
                    </div>
                    <div className='w-1/6 flex'></div>

                </div>
            </div>
        );
    }
}

export default Profile;
