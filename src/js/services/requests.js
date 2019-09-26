require('dotenv').config()
const axios = require('axios');    

module.exports = {
  get_health : function (){
    axios.get('http://localhost:8080/health',{
      "Access-Control-Allow-Origin":"*",
      'Access-Control-Allow-Methods' : 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"})
    .then(response => {
      alert(response);
  })
  .catch(error => {
      reject(error);
  });
    
  },
  
  get_calculate_plain_text : function (queryParameters){
    axios.get(process.env.API_URL . process.env.CALCULATE_PLAIN_TEXT)
    .then(async (response)=> {
      resolve(response);
    })
    .catch(function (error) {
      reject(error);
    });
  },
  
  get_calculate_twitter_user : function (userId){
    axios.get(process.env.API_URL . process.env.CALCULATE_TW_USER)
    .then(async (response)=> {
      resolve(response);
    })
    .catch(function (error) {
      reject(error);
    });
  },
  
  get_calculate_twitter_social: function (userId){
    axios.get(process.env.API_URL . process.env.CALCULATE_TW_SOCIAL)
    .then(async (response)=> {
      resolve(response);
    })
    .catch(function (error) {
      reject(error);
    });
  },
  
  get_calculate_twitter_tweets: function (queryParameters){
    axios.get(process.env.API_URL . process.env.CALCULATE_TW_TWEETS)
    .then(async (response)=> {
      resolve(response);
    })
    .catch(function (error) {
      reject(error);
    });
  }
  
}
