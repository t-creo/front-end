import constants from "../constant"
import { Console } from "console"

function formatNumber (string : string) : number {
  let x = string.replace(/ /, '') // 20 K -> 20K

  if (x.match(/^(\d+\.\dK|\d+\.\dM|\d+,\dK|\d+,\dM)$/) != null) {
    x = x.replace(/K/, '00') // 20,2K -> 20,200 | 20.2K -> 20.200
    x = x.replace(/M/, '00000') // 20,2M -> 20,200000 | 20.2M -> 20.200000
  } else {
    x = x.replace(/K/, '000') // 20K -> 20000
    x = x.replace(/M/, '000000') // 20M -> 20000000
  }

  x = x.replace(/[.,]/, '') // quita comas o puntos

  return Number(x)
}

// Listener to scrape the values in real time
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((request) => {
    
    if (request.sender === 'www' && request.instruction === 'api') {
      console.time(constants.DEBUG_SCRAPING_TIME_LABEL)
      const times = document.querySelectorAll('div[data-testid="tweet"] time')
      const tweetIds = []

      for (let i = 0; i < times.length; i++) {
        const x = times[i].parentElement.getAttribute('href')
        if (x) {
          tweetIds.push(x.split('/')[3])
        }
      }

      let tweetContainers = Array.from(document.querySelectorAll('div[data-testid="tweet"]'))

      const tweetTexts = tweetContainers.map((tweetContainer, index: number) => {
        if (!(tweetContainer.children[1]).classList.contains('Credibility-Ranking')) {
          tweetContainer.children[1].classList.add('Credibility-Ranking')
          const frag = document.createRange().createContextualFragment('<div class="Credibility-Ranking"><p id=TweetNumber' + index + '>...</p></div>')
          tweetContainer.children[1].append(frag)
        }
        const element = <HTMLElement>tweetContainer.children[1] // change variable name
        return element.innerText
      })

      console.timeEnd(constants.DEBUG_SCRAPING_TIME_LABEL)

      port.postMessage({
        instruction: 'api',
        tweetIds: tweetIds,
        tweetTexts: tweetTexts,
        tweetContainers: tweetContainers
      })
    } else if (request.sender === 'www' && request.instruction === 'scrapTW'){
      console.time(constants.DEBUG_SCRAPING_USER_TIME_LABEL)
      // init values
      
      let followingNum = ''
      let followersNum = ''
      let quantity = 1
      let joinedDateString = ''
      let locationString = ''
      let link = ''
      //let verifiedBool = false
      let verifiedAcc = false
      let language = ''

      if (window.location.href.split('/')[3] !== 'home') {
        verifiedAcc = false
        const followingPath = window.location.pathname + '/following'
        const followersPath = window.location.pathname + '/followers'

        let aElem = document.querySelector(`a[href="${followingPath}"]`)

        followingNum = aElem.getAttribute('title').replace(/[.,]/g, '')
        followingNum= followingNum.replace(/\s/g, '')
        aElem = document.querySelector(`a[href="${followersPath}"]`)

        followersNum = aElem.getAttribute('title').replace(/[.,]/g, '')
        followersNum = followersNum.replace(/\s/g, '')

        // get # of tweets and likes
        
        
        quantity = formatNumber(document.querySelectorAll('h2[role="heading"]')[1].nextSibling.textContent.split(' ')[0]) // "10K Tweets"
       
        // console.log(quantity)
        const info = document.querySelector('div[data-testid="UserProfileHeader_Items"]').children

        for (let i = 0; i < info.length; i++) {
          let x = info[i]
          if (x.tagName === 'A') { //only possibility its a link
            link = (<HTMLAnchorElement>x).href
          } else {
            if (x.textContent.match(/^(Joined)/) != null) {
              joinedDateString = x.textContent.split(' ')[2] 
            } if (x.textContent.match(/^(Se uni)/) != null) {      
              joinedDateString = x.textContent.split(' ')[5]
            } if (x.textContent.match(/^(A rejoint Twitter)/) != null) {      
              joinedDateString = x.textContent.split(' ')[5]
            } else {
              if (x.textContent.match(/^(Born)/) === null) { // not join not birthday not link = locatio
                locationString = x.textContent
              } else if (x.textContent.match(/^(Fecha de nacimiento)/) === null){
                locationString = x.textContent
              } else if (x.textContent.match(/^(Naissance)/) === null){
                locationString = x.textContent
              }else{
                locationString = ''
              }
            }
          }
        }
        // Get Verified value
        const nav = document.querySelectorAll('h2[role="heading"]')[1]
        var verifiedClass
        if(nav.querySelector('svg[aria-label="Verified account"]')){
          verifiedClass = nav.querySelector('svg[aria-label="Verified account"]') //
        }else if(nav.querySelector('svg[aria-label="Cuenta verificada"]')){
          verifiedClass = nav.querySelector('svg[aria-label="Cuenta verificada"]')          
        }else if(nav.querySelector('svg[aria-label="Compte certifié"]')){
          verifiedClass = nav.querySelector('svg[aria-label="Compte certifié"]')      
        }

        //aria-label="Cuenta verificada"
        if (verifiedClass) {
          verifiedAcc = true
        }
      }
      // Creating Objects for data transfer to popup

      // Create verified object
      const joinedDate = {
        name: 'joinedDate',
        value: joinedDateString
      }

      // const location = {
      //   name: 'location',
      //   value: locationString
      // }

      // const userLink = {
      //   name: 'userLink',
      //   value: link
      // }

      // // Create verified object
      const verified = {
        name: 'verified',
        value: verifiedAcc
      }

      // // Create tweets object
      const tweets = {
        name: 'tweets',
        value: quantity
      }

      // // Create following object
      const following = {
        name: 'following',
        value: followingNum
      }

      // // Create followers object
      const followers = {
        name: 'followers',
        value: followersNum
      }
      const data = {
        joinedDate: joinedDateString,
        location: locationString,
        userLink: link,
        verified: verifiedAcc,
        following: followingNum,
        followers: followersNum,
        tweets: quantity
      }

      // Get username
      var user_name = (document.querySelector('div[dir="ltr"] > span').textContent).substring(1)
      let tweetContainers = Array.from(document.querySelectorAll('div[data-testid="tweet"]'))


      const tweetTexts = tweetContainers.map((tweetContainer, index) => {
        
        if (!(tweetContainer.children[1]).classList.contains('Credibility-Ranking')) {
          tweetContainer.children[1].classList.add('Credibility-Ranking')
          const frag = document.createRange().createContextualFragment('<div class="Credibility-Ranking"><p id=TweetNumber' + index + '>...</p></div>')
          tweetContainer.children[1].append(frag)
        }

        return (<HTMLElement>tweetContainer.children[1]).innerText
      })
      
      console.timeEnd(constants.DEBUG_SCRAPING_USER_TIME_LABEL)

      port.postMessage({
        instruction: 'scrapTW',
        tweetTexts: tweetTexts,
        tweetContainers: tweetContainers,
        joinedDate: joinedDate.value,
        verified: verified.value,
        tweets: tweets.value,
        following: following.value,
        followers: followers.value,
        lang: language,
        name:user_name,
        link: data.userLink,
        location:locationString
      })    


      document.addEventListener('scroll', e => {
        console.log(e)
        tweetContainers = Array.from(document.querySelectorAll('div[data-testid="tweet"]'))


        const tweetTexts = tweetContainers.map((tweetContainer, index) => {
          
          if (!(tweetContainer.children[1]).classList.contains('Credibility-Ranking')) {
            tweetContainer.children[1].classList.add('Credibility-Ranking')
            const frag = document.createRange().createContextualFragment('<div class="Credibility-Ranking"><p id=TweetNumber' + index + '>...</p></div>')
            tweetContainer.children[1].append(frag)
          }

          return (<HTMLElement>tweetContainer.children[1]).innerText
        })
        

        port.postMessage({
          instruction: 'scrapTW',
          tweetTexts: tweetTexts,
          tweetContainers: tweetContainers,
          joinedDate: joinedDate.value,
          verified: verified.value,
          tweets: tweets.value,
          following: following.value,
          followers: followers.value,
          lang: language,
          name:user_name
        })    
            
      })

      port.postMessage({
        instruction: 'scrapTW',
        tweetTexts: tweetTexts,
        tweetContainers: tweetContainers,
        joinedDate: joinedDate.value,
        verified: verified.value,
        tweets: tweets.value,
        following: following.value,
        followers: followers.value,
        lang: language,
        name:user_name
      })

      
     
    } else if (request.sender === 'www' && request.instruction === 'scrapFB'){
      // scrap de Facebook
      
      let followingNum = 1
      let followersNum = 1
      let quantity = 1
      let joinedDateString = ''
      let verifiedAcc = false
      let language = ''
      
      const followingPath = window.location.href.split('?')[0] + '/friends'
      const followersPath = window.location.href.split('?')[0] + '/friends_mutual'
      

      let aElem = document.querySelector(`._2iem a[href="${followingPath}"]`).textContent
      

      followingNum = formatNumber(aElem)
      

      if (document.querySelector(`._2iem a[href="${followersPath}"]`)) {
        aElem = document.querySelector(`._2iem a[href="${followersPath}"]`).textContent.split(' ')[0].split('(')[1]
      } else {
        aElem = '1'
      }
      

      followersNum = formatNumber(aElem)
      
      // Creating Objects for data transfer to popup

      // Create verified object
      const joinedDate = {
        name: 'joinedDate',
        value: joinedDateString
      }

      // // Create verified object
      const verified = {
        name: 'verified',
        value: verifiedAcc
      }

      // // Create tweets object
      const tweets = {
        name: 'tweets',
        value: quantity
      }

      // // Create following object
      const following = {
        name: 'following',
        value: followingNum
      }

      // // Create followers object
      const followers = {
        name: 'followers',
        value: followersNum
      }

      // Get username
      var user_name = window.location.pathname.replace(/[/]/,'')

      let tweetContainers = Array.from(document.querySelectorAll('._5pbx.userContent._3576'))
      // console.log(user_name)
      // console.log(tweetContainers)
      const tweetTexts = tweetContainers.map((tweetContainer, index) => {
        if (!(tweetContainer.firstElementChild).classList.contains('Credibility-Ranking')) {
          tweetContainer.firstElementChild.classList.add('Credibility-Ranking')
          const frag = document.createRange().createContextualFragment('<div class="Credibility-Ranking"><p id=TweetNumber' + index + '>...</p></div>')
          tweetContainer.firstElementChild.append(frag)
        }

        return (<HTMLElement>tweetContainer.firstElementChild).innerText
      })

      port.postMessage({
        instruction: 'scrapFB',
        tweetTexts: tweetTexts,
        tweetContainers: tweetContainers,
        joinedDate: joinedDate.value.split(' ')[2],
        verified: verified.value,
        tweets: tweets.value,
        following: following.value,
        followers: followers.value,
        lang: language,
        name:user_name
      })
    } else if (request.sender === 'www' && request.instruction === 'update'){
      // console.timeLog('update')
      UpdateTweetCredibility(request.credList)
    }
  })
})

function UpdateTweetCredibility (credibilityList: string[]) {
  //console.log(credibilityList)
  console.time(constants.DEBUG_RENDERING_RESULTS_TIME_LABEL)
  console.log('WWW:', 'Number of analyzed tweets:', credibilityList.length)
  credibilityList.map((credibilityItem, index: number) => {
    const tweetContainer = document.querySelector<HTMLElement>('#TweetNumber' + index)
    if (credibilityItem !== '--') {
      const Green = Math.floor(parseInt(credibilityItem) * (2.55))
      const Red = 255 - Math.floor(parseInt(credibilityItem) * (2.55))
      let GreenHex = Green.toString(16)
      if (GreenHex.length < 2) {
        GreenHex = '0' + GreenHex
      }
      let RedHex = Red.toString(16)
      if (RedHex.length < 2) {
        RedHex = '0' + RedHex
      }
      const FinalColor : string = '#' + RedHex + GreenHex + '00';
      if (tweetContainer != null) {
        tweetContainer.innerText = 'WWW Credibility: ' + credibilityItem + '%';
        tweetContainer.style.color = FinalColor
      }
    } else {
      if (tweetContainer != null) {
        tweetContainer.innerText = 'WWW Credibility: --'
      }
    }
  })
  console.timeEnd(constants.DEBUG_RENDERING_RESULTS_TIME_LABEL)
}
