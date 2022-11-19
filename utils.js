import nacl from 'tweetnacl';

export function toHex(str,hex){
    try{
        hex = unescape(encodeURIComponent(str))
        .split('').map(function(v){
            return v.charCodeAt(0).toString(16)
        }).join('')
    }
    catch(e){
        hex = str
        //console.log('invalid text input: ' + str)
    }
    return hex
}
export function nonceFromTimestamp(tmstmp) {
    let nonce = hexToUint(String(tmstmp));
    
    while (nonce.length < nacl.box.nonceLength) {
        const tmp_nonce = Array.from(nonce)
        tmp_nonce.push(0);
        nonce = Uint8Array.from(tmp_nonce)
    }
    
    return nonce;
}
export function hexToUint(hexString) {
    return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
}