const crypto = require('crypto');

function getDiscriminator(name) {
    const hash = crypto.createHash('sha256').update(`global:${name}`).digest();
    return hash.slice(0, 8);
}

console.log("acceptDare:", getDiscriminator("accept_dare").toString('hex'));
console.log("approveDare:", getDiscriminator("approve_dare").toString('hex'));
console.log("createDare:", getDiscriminator("create_dare").toString('hex'));
