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
      const times = document.querySelectorAll("div[data-testid='tweet'] time")
      const tweetIds = []

      for (let i = 0; i < times.length; i++) {
        const x = times[i].parentElement.getAttribute('href')
        if (x) {
          tweetIds.push(x.split('/')[3])
        }
      }

      let tweetContainers = Array.from(document.querySelectorAll("div[data-testid='tweet']"))

      const tweetTexts = tweetContainers.map((tweetContainer, index: number) => {
        if (!(tweetContainer.children[1]).classList.contains('Credibility-Ranking')) {
          tweetContainer.children[1].classList.add('Credibility-Ranking')
          const frag = document.createRange().createContextualFragment("<div class='Credibility-Ranking'><p id=TweetNumber" + index + '>...</p></div>')
          tweetContainer.children[1].append(frag)
        }
        const element = <HTMLElement>tweetContainer.children[1] // change variable name
        return element.innerText
      })

      port.postMessage({
        instruction: 'api',
        tweetIds: tweetIds,
        tweetTexts: tweetTexts,
        tweetContainers: tweetContainers
      })
    } else if (request.sender === 'www' && request.instruction === 'scrap') {
      // Get username
      // var usernameProf = (document.querySelector("div[dir='ltr'] > span").textContent).substring(1)
      // const times = document.querySelectorAll("div[data-testid='tweet'] time")
      // init values

      let followingNum = 1
      let followersNum = 1
      let quantity = 1
      let joinedDateString = ''
      let locationString = ''
      let link = ''
      let verifiedBool = false
      let verifiedAcc = false

      let boxes = Array.from(document.querySelectorAll("div[data-testid='tweet']"))
      const boxesArr = []

      for (let i = 0; i < boxes.length; i++) {
        verifiedBool = false
        const current = boxes[i]
        const tweetInfo = current.querySelector("div[aria-label='Share Tweet']")
        const date = <HTMLTimeElement>current.querySelector("div[data-testid='tweet'] time")

        // TEXT
        const tweetText = {
          name: 'tweetText',
          value: tweetInfo.parentElement.parentElement.parentElement.children[1].textContent
        }
        // DATE
        const tweetDate = {
          name: 'tweetDate',
          value: date.dateTime
        }
        // LANGUAGE
        const tweetLang = {
          name: 'tweetLang',
          value: tweetInfo.parentElement.parentElement.parentElement.children[1].getAttribute('lang')
        }
        // VERIFIED
        const verifiedClass = current.querySelector("svg[aria-label='Verified account']") // works only in english
        if (verifiedClass) {
          verifiedBool = true
        }

        const tweetVerified = {
          name: 'tweetVerified',
          value: verifiedBool
        }
        // RETWEETS
        let number = 0
        const typeRt = tweetInfo.parentElement.parentElement.children[1].firstElementChild.getAttribute('data-testid')
        const retweetInfo = <HTMLDivElement>current.querySelector("div[data-testid='retweet'] > div")
        const unretweetInfo = <HTMLDivElement>current.querySelector("div[data-testid='unretweet'] > div")

        if (typeRt === 'retweet') {
          if (current.querySelector("div[data-testid='retweet'] > div").children.length === 2) {
            number = formatNumber((<HTMLElement>retweetInfo.lastElementChild).innerText)
          }
        } else {
          if (current.querySelector("div[data-testid='unretweet'] > div").children.length === 2) {
            number = formatNumber((<HTMLElement>unretweetInfo.lastElementChild).innerText)
          }
        }

        const tweetRts = {
          name: 'tweetRts',
          value: number
        }
        // LIKES
        number = 0
        const typeLike = tweetInfo.parentElement.parentElement.children[2].firstElementChild.getAttribute('data-testid')
        const likeInfo = current.querySelector("div[data-testid='like'] > div")
        const unlikeInfo = current.querySelector("div[data-testid='unlike'] > div")

        if (typeLike === 'like') {
          if (current.querySelector("div[data-testid='like'] > div").children.length === 2) {
            number = formatNumber((<HTMLElement>likeInfo.lastElementChild).innerText)
          }
        } else {
          if (current.querySelector("div[data-testid='unlike'] > div").children.length === 2) {
            number = formatNumber((<HTMLElement>unlikeInfo.lastElementChild).innerText)
          }
        }

        const tweetLikes = {
          name: 'tweetLikes',
          value: number
        }
        // REPLIES
        number = 0
        const replyInfo = current.querySelector("div[data-testid='reply'] > div")

        if (current.querySelector("div[data-testid='reply'] > div").children.length === 2) {
          number = formatNumber((<HTMLElement>replyInfo.lastElementChild).innerText)
        }

        const tweetReply = {
          name: 'tweetReply',
          value: number
        }

        const dataTweet = {
          text: tweetText.value,
          date: tweetDate.value,
          verified: tweetVerified.value,
          lang: tweetLang.value,
          retweets: tweetRts.value,
          likes: tweetLikes.value,
          reply: tweetReply.value
        }

        boxesArr.push(dataTweet)
      }

      if (window.location.href.split('/')[3] !== 'home') {
        verifiedAcc = false
        const followingPath = window.location.pathname + '/following'
        const followersPath = window.location.pathname + '/followers'

        followingNum = formatNumber(document.querySelector(`a[href="${followingPath}"] > span > span`).textContent)

        followersNum = formatNumber(document.querySelector(`a[href="${followersPath}"] > span > span`).textContent)
        // get # of tweets and likes

        quantity = formatNumber(document.querySelectorAll("h2[role='heading']")[1].nextSibling.textContent.split(' ')[0]) // "10K Tweets"

        const info = document.querySelector("div[data-testid='UserProfileHeader_Items']").children

        if (info.length === 2) {
          locationString = info[0].textContent
          joinedDateString = info[1].textContent
        } else {
          locationString = info[0].textContent
          link = (<HTMLAnchorElement>info[1]).href
          joinedDateString = info[2].textContent
        }

        // Get Verified value
        const nav = document.querySelectorAll("h2[role='heading']")[1]
        const verifiedClass = nav.querySelector("svg[aria-label='Verified account']") // works only in english
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

      /* const location = {
        name: 'location',
        value: locationString
      } */

      /* const userLink = {
        name: 'userLink',
        value: link
      } */

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

      console.log(data)
      console.log(boxesArr)

      let tweetContainers = Array.from(document.querySelectorAll("div[data-testid='tweet']"))

      const tweetTexts = tweetContainers.map((tweetContainer, index) => {
        if (!(tweetContainer.children[1]).classList.contains('Credibility-Ranking')) {
          tweetContainer.children[1].classList.add('Credibility-Ranking')
          const frag = document.createRange().createContextualFragment("<div class='Credibility-Ranking'><p id=TweetNumber" + index + '>...</p></div>')
          tweetContainer.children[1].append(frag)
        }

        return (<HTMLElement>tweetContainer.children[1]).innerText
      })

      port.postMessage({
        instruction: 'scrap',
        tweetTexts: tweetTexts,
        tweetContainers: tweetContainers,
        joinedDate: joinedDate.value,
        verified: verified.value,
        tweets: tweets.value,
        following: following.value,
        followers: followers.value
      })
    } else if (request.sender === 'www' && request.instruction === 'update') {
      UpdateTweetCredibility(request.credList)
    }
  })
})

function UpdateTweetCredibility (credibilityList: string[]) {
  credibilityList.map((credibilityItem, index: number) => {
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
      (<HTMLElement>document.querySelector('#TweetNumber' + index)).innerText = 'WWW Credibility: ' + credibilityItem + '%';
      (<HTMLElement>document.querySelector('#TweetNumber' + index)).style.color = FinalColor;
    } else {
      (<HTMLElement>document.querySelector('#TweetNumber' + index)).innerText = 'WWW Credibility: --';
    }
  })
}