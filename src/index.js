import React from "react";
import ReactDOM from "react-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import getConfig from "./config.js";
import App from "./App";
import * as nearlib from "near-api-js";

// Initializing contract
async function initContract() {
    console.log(process.env.NODE_ENV)
    window.nearConfig = getConfig(process.env.NODE_ENV || "development");
    console.log("nearConfig", window.nearConfig);

    // Initializing connection to the NEAR DevNet.
    window.near = await nearlib.connect(
        Object.assign(
            {deps: {keyStore: new nearlib.keyStores.BrowserLocalStorageKeyStore()}},
            window.nearConfig
        )
    );

    // Needed to access wallet login
    window.walletAccount = new nearlib.WalletAccount(window.near);

    // Getting the Account ID. If unauthorized yet, it's just empty string.
    window.accountId = window.walletAccount.getAccountId();

    window.contract = await new nearlib.Contract(
        window.walletAccount.account(),
        window.nearConfig.contractName,
        {
            // View methods are read only. They don't modify the state, but usually return some value.
            viewMethods: ["get_all_ideas", "get_idea_by_id", "get_all_withdrawals", "get_withdrawals_by_user", "get_all_user_deposits", "get_all_idea_deposits", "get_deposits_by_idea", "get_deposits_by_owner", "get_num_ideas"],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: ["create_meme", "create_idea", "tip_meme", "upvote_idea", "withdraw", "choose_winner"],
            // Sender is the account ID to initialize transactions.
            sender: window.walletAccount.getAccountId(),
        }
    );
}

window.nearInitPromise = initContract()
    .then(() => {
        ReactDOM.render(
            <App contract={window.contract} wallet={window.walletAccount} />,
            document.getElementById("root")
        );
    })
    .catch(console.error);
