const { Wallet, utils, providers } = require('ethers');
require('dotenv').config();

//dotenv does not work on the browser!! works for node.js
//to run in browser - enter api keys for each provider below - infura & etherscan

// HTML elements
const blockNumber = document.querySelector("#latest");
const timeStamp = document.querySelector("#timestamp");
const txSection = document.querySelector('#tx');
const form = document.querySelector('form');
const input = document.querySelector('input');

//Providers
const provider = new providers.InfuraProvider(
  'goerli',
  // process.env.INFURA_API_KEY
);

const etherscanProvider = new providers.EtherscanProvider(
  'goerli',
  // process.env.ETHERSCAN_API_KEY
);

//Main Function
async function main(){

  //part 1. latest block info
  async function latestBlock () {
    const latest_block = await provider.getBlock();
    const result = {
      number: latest_block.number,
      time: new Date(latest_block.timestamp * 1000)
    }
    return result;
  }

  await latestBlock()
  .then((result) => {
    blockNumber.innerText = result.number;
    timeStamp.innerText = result.time;
  })
  
  //part 2. wallet info
  async function txList (address) {
    const history = await etherscanProvider.getHistory(address);
    return history;
  }

  function clearProject(e){
    while(e.firstChild){e.removeChild(e.firstChild)}
  }
  
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    clearProject(txSection);

    const userInput = input.value.toLowerCase();
    input.value = '';

    const history = await txList(userInput)
    .then((res) => {
      return res[res.length-1];
    })
    .catch(()=>{
      let errorMessage = document.createElement('div');
      errorMessage.classList.add('flex-box');
      errorMessage.innerText = 'Please enter the correct wallet address.';
      txSection.appendChild(errorMessage);
      exit;
    })
    .then((res) =>{
      let title = document.createElement('div');
      title.classList.add('flex-box');
      title.classList.add('wallet-title');
      title.innerText = `Latest Transaction of the Wallet`
      txSection.appendChild(title);

      let attributes = ['hash', 'blockNumber', 'timeStamp', 'from', 'to', 'value'];
      for(let i=0; i<attributes.length; i++){
        let attr = attributes[i];
        let resValue = res[attr];

        if(attr == 'timeStamp'){
          resValue = new Date(res.timestamp * 1000)
        }

        if(attr == 'value'){
          resValue = utils.formatEther(res.value) + ' ether';
        }

        let box = document.createElement('div');
        box.classList.add('flex-box');

        let name = document.createElement('div');
        name.innerText = attr.toUpperCase();

        let value = document.createElement('div');
        value.innerText = resValue;

        box.appendChild(name);
        box.appendChild(value);

        txSection.appendChild(box);
      }
    })
  })
}

main();

