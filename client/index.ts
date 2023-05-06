import axios from 'axios';

import './index.scss';


const messageNode = document.querySelector('#message');

axios.get('/api/message')
  .then(({ data }) => {
    if (messageNode) {
      messageNode.innerHTML = data.message;
    }
  })
  .catch(console.error);
