
const fs = require("fs");

async function saveContractAddress(name, address) {
    contractAddressesFile = "./ContractAddresses.json";

    if (!fs.existsSync(contractAddressesFile)) {
        fs.writeFileSync(
            "./ContractAddresses.json",
            JSON.stringify({ [name]: address }, undefined, 2)
        );
    } else {
        const addresses = JSON.parse(fs.readFileSync(contractAddressesFile));
        addresses[name] = address;
        fs.writeFileSync(
            "./ContractAddresses.json",
            JSON.stringify(addresses, undefined, 2)
        );
    }
}

async function clearContractAddress() {

    contractAddressesFile = "./ContractAddresses.json";

    if (fs.existsSync(contractAddressesFile)) {

        fs.writeFileSync(
            "./ContractAddresses.json",
            "{}"
        );
    }
}

module.exports = {
    saveContractAddress,
    clearContractAddress
}
