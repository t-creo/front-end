require('dotenv').config()
const axios = require('axios');    

module.exports = {
  get_health : function (){
    return new Promise((resolve,reject)=>{
      axios.get(process.env.API_URL . process.env.HEALTH_API)
      .then(response => {
        resolve((response));
      })
      .catch(error => {
          reject(error);
      });
    });
  },

  get_calculate_plain_text : function (queryParameters){
    return new Promise((resolve,reject)=>{
      axios.get(process.env.API_URL . process.env.CALCULATE_PLAIN_TEXT)
      .then(async (response)=> {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
    });
  },

  get_calculate_twitter_user : function (userId){
    return new Promise((resolve,reject)=>{
      axios.get(process.env.API_URL . process.env.CALCULATE_TW_USER)
      .then(async (response)=> {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
    });
  },

  get_calculate_twitter_social: function (userId){
    return new Promise((resolve,reject)=>{
      axios.get(process.env.API_URL . process.env.CALCULATE_TW_SOCIAL)
      .then(async (response)=> {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
    });
  },

  get_calculate_twitter_tweets: function (queryParameters){
    return new Promise((resolve,reject)=>{
      axios.get(process.env.API_URL . process.env.CALCULATE_TW_TWEETS)
      .then(async (response)=> {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
    })
  }

}
