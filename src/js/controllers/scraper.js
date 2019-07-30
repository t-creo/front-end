import $ from 'jquery'

function getDataCount (span) {
  return span.getAttribute('data-count')
}

// Listener to scrape the values in real time
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.sender === 'www' && request.instruction === 'scrap') {
      // Get Navbar values
      var spans = document.querySelectorAll('span.ProfileNav-value[data-is-compact]')

      // Get joined Date
      var joinedDateString = document.getElementsByClassName('ProfileHeaderCard-joinDate')[0].getElementsByClassName('ProfileHeaderCard-joinDateText')[0].textContent

      // Get Verified value
      var verifiedClass = document.getElementsByClassName('ProfileHeaderCard-name')[0].getElementsByClassName('Icon Icon--verified')
      var verifiedBool
      if (verifiedClass.length > 0) {
        verifiedBool = true
      } else {
        verifiedBool = false
      }

      // Creating Objects for data transfer to popup

      // Create verified object
      var joinedDate = {
        name: 'joinedDate',
        value: joinedDateString
      }

      // Create verified object
      var verified = {
        name: 'verified',
        value: verifiedBool
      }

      // Create tweets object
      var tweets = {
        name: 'tweets',
        value: getDataCount(spans[0])
      }

      // Create following object
      var following = {
        name: 'following',
        value: getDataCount(spans[1])
      }

      // Create followers object
      var followers = {
        name: 'followers',
        value: getDataCount(spans[2])
      }

      // Create likes object
      var likes = {
        name: 'likes',
        value: getDataCount(spans[3])
      }

      // Create data structure to send to main context
      var data = {
        joinedDate: joinedDate,
        verified: verified,
        tweets: tweets,
        following: following,
        followers: followers,
        likes: likes
      }

      // Show in console to be sure about values
      var tweetContainers = $(document).find('div.js-tweet-text-container')
      var tweetTexts = tweetContainers.slice()
      for (let i = 0; i < tweetContainers.length; i++) {
        tweetTexts[i] = tweetContainers[i].children[0].innerText
        if (!$(tweetContainers[i].children[1]).hasClass('Credibility-Ranking')) {
          $(tweetContainers[i]).append(`<div class="Credibility-Ranking">
            <p id=TweetNumber${i}></p>
          </div>`)
        }
      }

      // Send response to the popup.js
      sendResponse({
        data: data,
        tweetTexts: tweetTexts,
        tweetContainers: tweetContainers
      })
    } else if (request.sender === 'www' && request.instruction === 'update') {
      UpdateTweetCredibility(request.credList)
    }
  })

function UpdateTweetCredibility (credibilityList) {
  for (let i = 0; i < credibilityList.length; i++) {
    if (credibilityList[i] !== '--') {
      var Green = Math.floor(parseInt(credibilityList[i]) * (2.55))
      var Red = 255 - Math.floor(parseInt(credibilityList[i]) * (2.55))
      var GreenHex = Green.toString(16)
      if (GreenHex.length < 2) {
        GreenHex = '0' + GreenHex
      }
      var RedHex = Red.toString(16)
      if (RedHex.length < 2) {
        RedHex = '0' + RedHex
      }

      const FinalColor = '#' + (RedHex.toString(16)) + (GreenHex.toString(16)) + '00'
      $('#TweetNumber' + i).text('WWW Credibility: ' + credibilityList[i] + '%')
      $('#TweetNumber' + i).css('color', FinalColor)
    } else {
      $('#TweetNumber' + i).text('WWW Credibility: --')
    }
  }
}
