import WB from "kryptokrona-wallet-backend-js";
import * as fs from "fs";
import {CryptoNote} from "kryptokrona-utils";
import {toHex} from "./utils.js";
import {config} from "./config.js";

const NODE = 'blocksum.org'
const PORT = 11898
const daemon = new WB.Daemon(NODE, PORT)

let wallet

const xkrUtils = new CryptoNote()

const logIntoWallet = async () => {
    const [wallet, error] = await WB.WalletBackend.openWalletFromFile(daemon, './bridge.wallet', 'hugin123');
    if (error) {
        console.log('Failed to open wallet: ' + error.toString());
    }
    return wallet
}

const startWallet = async () => {
    //Start sync process

    wallet = await logIntoWallet()

    await wallet.start();

    wallet.enableAutoOptimization(false)

    const [walletBlockCount, localDaemonBlockCount, networkBlockCount] = wallet.getSyncStatus();

    if (walletBlockCount === 0) {
        await wallet.reset(networkBlockCount - 100)
    }

    console.log('BOT ADDRESS:', wallet.getPrimaryAddress())

    wallet.on('heightchange', async (walletBlockCount, localDaemonBlockCount, networkBlockCount) => {
        console.log('SYNC: ' + walletBlockCount, 'local: ' + localDaemonBlockCount, 'network: '+ networkBlockCount)
        console.log('BALANCE: ' + await wallet.getBalance())

        console.log('SAVING WALLET')
        const saved = wallet.saveWalletToFile('./bridge.wallet', 'hugin123')

        if (!saved) {
            console.log('Failed to save wallet!');
        }
    })
}

export const startHugin = async () => {
    try {
        //Creates a wallet if we don't have one
        if (!(fs.existsSync('./bridge.wallet'))) {
            console.log('Creating wallet')
            const wallet = await WB.WalletBackend.createWallet(daemon);

            console.log('Saving wallet')
            const saved = wallet.saveWalletToFile('./bridge.wallet', 'hugin123')

            if (!saved) {
                console.log('Failed to save wallet!');
            }
        }

        //Start wallet
        await startWallet()

    } catch (err) {
        console.error(err)
    }
}

export const sendHuginMessage = async (nickname, message, board, fee=10000, attempt=1) => {

    if (attempt > 10) {
      return false;
    }

    let payload_hex;

    try {

        let  timestamp = parseInt(Date.now()/1000);
        let [privateSpendKey, privateViewKey] = wallet.getPrimaryAddressPrivateKeys();
        let signature = await xkrUtils.signMessage(message, privateSpendKey);

        let payload_json = {
            "m": message,
            "k": config.BOT_ADDRESS,
            "s": signature,
            "brd": board,
            "t": timestamp,
            "n": `Discord - ${nickname} `
        };

        await optimizeMessages()
        payload_hex = toHex(JSON.stringify(payload_json))

        let result = await wallet.sendTransactionAdvanced(
            [[config.BOT_ADDRESS, 1]], // destinations,
            3, // mixin
            {fixedFee: fee, isFixedFee: true}, // fee
            undefined,
            undefined,
            undefined,
            true,
            false,
            Buffer.from(payload_hex, 'hex')
        );

        if (result.success) {
            console.log(`Sent Hugin message`)
            console.log(`${nickname}: ${message}`)
            console.log(`Sent transaction, hash ${result.transactionHash}, fee ${WB.prettyPrintAmount(result.fee)}`);
        } else {
            console.log(`Failed to send transaction: ${result.error.toString()}`);
            const new_fee = fee + 500;
            if (new_fee > 20000) {
              console.log(`Fee already too high, ignoring subsequent attempts`);
            }
            console.log(`Trying again with fee ${new_fee}.`);
            sendHuginMessage(nickname, message, fee, attempt + 1);
        }

    } catch(err) {
        console.log('Error', err);
    }
}

const optimizeMessages = async nbrOfTxs => {
    console.log('optimize');
    try {

        const [walletHeight, localHeight, networkHeight] = wallet.getSyncStatus();
        let inputs = await wallet.subWallets.getSpendableTransactionInputs(wallet.subWallets.getAddresses(), networkHeight);
        if (inputs.length > 8) {
            console.log('enough inputs');
            return;
        }
        let subWallets = wallet.subWallets.subWallets

        subWallets.forEach((value, name) => {
            let txs = value.unconfirmedIncomingAmounts.length;

            if (txs > 0) {
                console.log('Already have incoming inputs, aborting..');
            }
        })

        let payments = [];
        let i = 0;
        /* User payment */
        while (i < nbrOfTxs - 1 && i < 10) {
            payments.push([
                wallet.subWallets.getAddresses()[0],
                10000
            ]);

            i += 1;

        }

        let result = await wallet.sendTransactionAdvanced(
            payments, // destinations,
            3, // mixin
            {fixedFee: 10000, isFixedFee: true}, // fee
            undefined, //paymentID
            undefined, // subWalletsToTakeFrom
            undefined, // changeAddress
            true, // relayToNetwork
            false, // sendAll
            undefined
        );

        console.log('optimize completed');
        return result;


    } catch (err) {
        console.log('error optimizer', err);
    }

}
