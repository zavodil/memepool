const nearApi = require("near-api-js");

const keyStore = new nearApi.keyStores.UnencryptedFileSystemKeyStore(
    "/root/.near-credentials/"
);

async function connect(nearConfig) {
    // Initializing connection to the NEAR node.
    const near = await nearApi.connect({
        deps: {
            keyStore,
        },
        nodeUrl: "https://rpc.testnet.near.org",
        networkId: "default"
    });

    const account = await near.account("dev-1598986925538-9650440");

    const functionCallResponse = await account.functionCall(
        'dev-1598986925538-9650440',
        "get_all_withdrawals",
        {account_id: "zavodil.testnet"}
    );
    const result = nearApi.providers.getTransactionLastResult(
        functionCallResponse
    );
    console.log(result);
}

connect();