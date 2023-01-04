import WB from "kryptokrona-wallet-backend-js";
import * as fs from "fs";
import {CryptoNote} from "kryptokrona-utils";
import {toHex, nonceFromTimestamp, hexToUint} from "./utils.js";
import {config} from "./config.js";

import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

const NODE = 'localhost'
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
            sendHuginMessage(nickname, message, board, fee, attempt + 1);
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
            {fixedFee: 1000, isFixedFee: true}, // fee
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
export async function sendGroupsMessage(message, group, nickname) {

    const my_address = wallet.getPrimaryAddress();
  
    const [privateSpendKey, privateViewKey] = wallet.getPrimaryAddressPrivateKeys();
  
    const signature = await xkrUtils.signMessage(message, privateSpendKey);
  
    const timestamp = parseInt(Date.now());
  
    const nonce = nonceFromTimestamp(timestamp);
  
    let message_json = {
      "m": message,
      "k": my_address,
      "s": signature,
      "g": group,
      "n": nickname
    }
  
    const payload_unencrypted = naclUtil.decodeUTF8(JSON.stringify(message_json));
  
    const secretbox = nacl.secretbox(payload_unencrypted, nonce, hexToUint(group));
  
    const payload_encrypted = {"sb":Buffer.from(secretbox).toString('hex'), "t":timestamp};
  
    const payload_encrypted_hex = toHex(JSON.stringify(payload_encrypted));
  
    let result = await wallet.sendTransactionAdvanced(
        [[my_address, 1]], // destinations,
        3, // mixin
        {fixedFee: 1000, isFixedFee: true}, // fee
        undefined, //paymentID
        undefined, // subWalletsToTakeFrom
        undefined, // changeAddress
        true, // relayToNetwork
        false, // sneedAll
        Buffer.from(payload_encrypted_hex, 'hex')
    );
  
  
    if (!result.success) {
      result = await sendMessageWithHuginAPI(payload_encrypted_hex);
    }
  
    if (result.success == true) {
      console.log('Successfully sent the message')
    }
  
    return result;
  
}
export async function sendMessageWithHuginAPI(payload_hex) {

    const response = await fetch(`https://n1.vxo.nu/api/v1/posts`, {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({payload: payload_hex}),
    });
    return response.json();
  
}
export async function getGroupMessage(tx) {

    let decryptBox = false;
  
    const groups = ['f2b8d1c7ca136639671f0858e8c72466e5add0e875c622ae0a0c35c4bf51950e']
  
    let key;
  
    let i = 0;
  
    while (!decryptBox && i < groups.length) {
  
      let possibleKey = 'f2b8d1c7ca136639671f0858e8c72466e5add0e875c622ae0a0c35c4bf51950e';
  
  
      i += 1;
  
  
      try {
  
       decryptBox = nacl.secretbox.open(
         hexToUint(tx.tx_sb),
         nonceFromTimestamp(tx.tx_timestamp),
         hexToUint(possibleKey)
       );
  
       key = possibleKey;
      } catch (err) {
        console.log(err);
       continue;
      }
  
  
  
    }
  
    if (!decryptBox) {
      return false;
    }
  
  
    const message_dec = naclUtil.encodeUTF8(decryptBox);
  
    const payload_json = JSON.parse(message_dec);
  
    // const from = payload_json.k;
    // const from_myself = (from == wallet.getPrimaryAddress() ? true : false);
    // const received = (from_myself ? 'sent' : 'received');
  
    // const verified = await xkrUtils.verifyMessageSignature(payload_json.m, this_addr.spend.publicKey, payload_json.s);
  
    // console.log(payload_json)
    // const nickname = payload_json.n ? payload_json.n : ('Anonymous');
  
    const group_object = groups.filter(group => {
      return group.key == key;
    })
  
    return payload_json;
  
  
  }
  
