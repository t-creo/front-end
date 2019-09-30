import SimpleSpamFilter from 'simple-spam-filter'
import Filter from 'bad-words'
import Spelling from 'spelling'
import dictionary from 'spelling/dictionaries/en_US'
import { PreventInvalidWeightInputs, CalculateWeightProportion, getProportion } from './controllers/weightCalculationUtils'
import './controllers/scraper'
import '../sass/index.scss'
import { WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL } from './constant.js'
import { getCalculatePlainText, getCalculateTwitterTweets } from './services/requests.js'

window.addEventListener('load', function load (event) {
  document.getElementById('submitButton').onclick = getCredibility
  document.getElementById('VerifyPageButton').onclick = ValidateTwitterTweets
})

chrome.contextMenus.onClicked.addListener(function (clickData) {
  if (clickData.menuItemId === 'verify' && clickData.selectionText) {
    getCredibilityFromSelect(clickData.selectionText)
  }
})

document.addEventListener('DOMContentLoaded', function (event) {
  chrome.tabs.getSelected(null, function (tab) {
    const tabUrl = tab.url
    const elem = document.querySelector('#PageSensitiveButtons')
    if (tabUrl.includes('https://twitter.com')) {
      document.querySelector('#currentPage').innerText = 'You are currently on Twitter'
    } else if (tabUrl.includes('https://www.facebook.com')) {
      document.querySelector('#currentPage').innerText = 'You are currently on Facebook'
      elem.parentNode.removeChild(elem)
    } else {
      document.querySelector('#firstHorBar').parentNode.removeChild(document.querySelector('#firstHorBar'))
      document.querySelector('#secondHorBar').parentNode.removeChild(document.querySelector('#secondHorBar'))
      elem.parentNode.removeChild(elem)
    }
  })
})

function getCredibilityFromSelect (text) {
  // Send Message asking for the scaped values
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { sender: 'www', instruction: 'scrap' }, function (response) {
      chrome.storage.sync.get([WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL], function (filterOptions) {
        let tweet
        if (tweet !== '') {
          const credibility = CalculateCredibility(tweet, filterOptions, true, response)
          // Update credibility number
          document.querySelector('#tweet').value = text
          document.querySelector('#credibility').innerText = credibility.toFixed(2) + '%'
        } else {
          document.querySelector('#tweet').value = text
          document.querySelector('#credibility').innerText = '--'
        }
      })
    })
  })
}

function getCredibility () {
  // Send Message asking for the scaped values
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { sender: 'www', instruction: 'scrap' }, function (response) {
      const tweet = document.querySelector('#tweet').value
      chrome.storage.sync.get([WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING], function (filterOptions) {
        getCalculatePlainText({
          text: tweet,
          weightBadWords: filterOptions.weightBadWords,
          weightMisspelling: filterOptions.weightMisspelling,
          weightSpam: filterOptions.weightSpam
        })
          .then(function (credibility) {
            document.querySelector('#credibility').innerText =
            credibility.credibility.toFixed(2) + '%'
          }).catch(e => console.log(e))
      })
    })
  })
}

function ValidateTwitterTweets () {
  // Send Message asking for the scaped values
  chrome.tabs.executeScript(null, {
    file: 'popup.bundle.js' }, () => {
    connect()
  })
}

function connect () {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const port = chrome.tabs.connect(tabs[0].id)
    port.postMessage({ sender: 'www', instruction: 'scrap' })
    port.onMessage.addListener((response) => {
      chrome.storage.sync.get([WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL], function (filterOptions) {
        Promise.all(response.tweetIds.map(tweetId => getCalculateTwitterTweets({
          tweetId: tweetId,
          weightBadWords: filterOptions.weightBadWords,
          weightMisspelling: filterOptions.weightMisspelling,
          weightSpam: filterOptions.weightSpam,
          weightText: filterOptions.weightText,
          weightUser: filterOptions.weightUser,
          weightSocial: filterOptions.weightSocial
        })))
          .then(values => {
            port.postMessage({
              sender: 'www',
              instruction: 'update',
              credList: values.map(credibility => credibility.credibility)
            })
          })
          .catch(error => {
            window.alert(JSON.stringify(error))
          })
      })
    })
  })
}

function CalculateCredibility (text, filterOptions, hasSocial, response = undefined) {
  let credibility = 0
  let SocialWeight
  let SpamWeight
  let SpellingWeight
  let ProfanityWeight
  if (hasSocial) {
    SocialWeight = 10
    SpamWeight = 40
    SpellingWeight = 20
    ProfanityWeight = 30
    if (filterOptions.SocialWeight != null) {
      SocialWeight = filterOptions.SocialWeight
    }
    if (filterOptions.SocialWeight != null) {
      SpamWeight = filterOptions.SpamWeight
    }
    if (filterOptions.SocialWeight != null) {
      SpellingWeight = filterOptions.SpellingWeight
    }
    if (filterOptions.SocialWeight != null) {
      ProfanityWeight = filterOptions.ProfanityWeight
    }
    credibility += GetSocialFilterValue(SocialWeight, response.data)
    credibility += GetSpamFilterValue(SpamWeight, text)
    credibility += GetSpellingFilterValue(SpellingWeight, text)
    credibility += GetProfanityFilterValue(ProfanityWeight, text)
  } else {
    SocialWeight = 0
    SpamWeight = 44
    SpellingWeight = 23
    ProfanityWeight = 33
    if (filterOptions.SocialWeight != null) {
      SpamWeight = filterOptions.SpamWeight
    }
    if (filterOptions.SocialWeight != null) {
      SpellingWeight = filterOptions.SpellingWeight
    }
    if (filterOptions.SocialWeight != null) {
      ProfanityWeight = filterOptions.ProfanityWeight
    }
    const ListOfNonSocialWeights = CalculateWeightProportion(PreventInvalidWeightInputs([SpamWeight, SpellingWeight, ProfanityWeight]))
    const TotalWeightSum = parseFloat(ListOfNonSocialWeights[0]) + parseFloat(ListOfNonSocialWeights[1]) + parseFloat(ListOfNonSocialWeights[2])
    const DifferenceFromHundred = (100 - TotalWeightSum).toFixed(2)
    ListOfNonSocialWeights[0] = parseFloat(ListOfNonSocialWeights[0]) + parseFloat(DifferenceFromHundred)
    // credibility += GetSpamFilterValue(ListOfNonSocialWeights[0], text)
    // credibility += GetSpellingFilterValue(ListOfNonSocialWeights[1], text)
    // credibility += GetProfanityFilterValue(ListOfNonSocialWeights[2], text)
  }
  return credibility
}

function GetSocialFilterValue (weight, data) {
  // Following vs followers number analysis (50%)

  // The number of followers is rated between 0 to 100.
  // the closer to 5 million followers,the closer to 100 the followersValue is
  // the closer to 0 followers, the closer to 0 the followersValue is
  const followersValue = getSocialFactorSubWeightedValue(100, data.followers.value, 5000000)

  // followingVSFollowersProportion should be a number close to 1 if there is way more followers than followings
  // and should be a number close to 0 on the contrary
  const followingAndFollowersTotal = parseFloat(data.followers.value) + parseFloat(data.following.value)
  const followingVSFollowersProportion = getProportion(data.followers.value, followingAndFollowersTotal)

  // followersValue is multiplied by followingAndFollowersTotal, this way, if the followingVSfollowersProportion is close
  // to 1, there is almost no decuction to the total social Value, if it is closer to 0, then there is a big
  // deduction to the social Value
  const followingVSFollowerAnalysisResult = (followersValue.toFixed(2)) * (Math.ceil(followingVSFollowersProportion))

  // The result is subweighted
  const followingVSFollowerResultSubWeighted = getSocialFactorSubWeightedValue(
    50,
    followingVSFollowerAnalysisResult,
    100
  )

  // Verified account analysis (25%)
  let VerifiedAccountAnalysisResult

  if (data.verified.value) {
    VerifiedAccountAnalysisResult = 100
  } else {
    VerifiedAccountAnalysisResult = 0
  }

  const VerifiedAccountSubWeighted = getSocialFactorSubWeightedValue(
    25.00,
    VerifiedAccountAnalysisResult,
    100
  )

  // Account Age (25%)
  const wordsInJoinedDateString = data.joinedDate.value.split(' ')
  const numberOfWords = wordsInJoinedDateString.length
  let i = 0
  let YearJoined
  while ((i < numberOfWords) && (!Number.isInteger(YearJoined))) {
    YearJoined = parseInt(wordsInJoinedDateString[i])
    i++
  }
  const CurrentYear = parseInt((new Date()).getFullYear())
  const TwitterCreationYear = 2006
  const AccountAge = (CurrentYear - YearJoined)
  const MaxAccountAge = (CurrentYear - TwitterCreationYear)
  const AccountAgeAnalysisResult = getSocialFactorSubWeightedValue(100, AccountAge, MaxAccountAge)
  const AccountAgeSubWeighted = getSocialFactorSubWeightedValue(
    25.00,
    AccountAgeAnalysisResult,
    100
  )

  // Final social filter calculation
  const totalSocialValue = VerifiedAccountSubWeighted + followingVSFollowerResultSubWeighted + AccountAgeSubWeighted
  const totalSocialValueWeighted = weightedFilterValue(totalSocialValue, weight)
  return totalSocialValueWeighted
}

function getSocialFactorSubWeightedValue (subWeight, rawData, maxCredibility) {
  let Value = 0
  if (rawData > maxCredibility) {
    Value = maxCredibility
  } else {
    Value = rawData
  }
  return getProportion(Value, maxCredibility) * subWeight
}

function GetSpamFilterValue (weight, text) {
  // ************************************************** //
  //                   Spam Filter                      //
  // ************************************************** //
  let spamFilterValue = 0

  // These parameters are all optional
  const opts = {
    minWords: 5,
    maxPercentCaps: 30,
    maxNumSwearWords: 2
  }
  const spamFilter = new SimpleSpamFilter(opts)
  const isSpam = spamFilter.isSpam(text)

  // Determine SPAM Filter internal value
  if (!isSpam) {
    spamFilterValue = 100
  } else {
    spamFilterValue = 0
  }

  // Add SPAM Filter Value to credibility
  const spamWeightedValue = weightedFilterValue(spamFilterValue, weight)
  return spamWeightedValue
}

function GetSpellingFilterValue (weight, text) {
  // ************************************************** //
  //               Spelling Filter                      //
  // ************************************************** //
  let spellingFilterValue = 0
  const wordsInText = StringToListOfWords(text)
  const numberOfWordsInText = wordsInText.length

  // Find and count misspellings in cleaned elements
  const spellingCount = countMisspelings(numberOfWordsInText, wordsInText)

  // Get misspelling proportion to text lenght
  const spellingProportion = getProportion(spellingCount, numberOfWordsInText)

  // Determine spelling filter internal value
  spellingFilterValue = propotionToValue(spellingProportion)

  // Add Weighted Spelling Filter Value to credibility
  spellingFilterValue = weightedFilterValue(spellingFilterValue, weight)
  return spellingFilterValue
}

function GetProfanityFilterValue (weight, text) {
  // ************************************************** //
  //               Profanity Filter                     //
  // ************************************************** //
  let profanityFilterValue = 0
  const filterInstance = new Filter()
  const censoredText = filterInstance.clean(text)
  const wordsInText = StringToListOfWords(censoredText)
  const numberOfWordsInText = wordsInText.length

  // Find and count profanities in cleaned elements
  const profanityCount = countProfanities(numberOfWordsInText, wordsInText)

  // Get profanity proportion to text lenght
  const profanityProportion = getProportion(profanityCount, numberOfWordsInText)

  // Determine profanity filter internal value
  profanityFilterValue = propotionToValue(profanityProportion)

  // Add Weighted Profanity Filter Value to credibility
  profanityFilterValue = weightedFilterValue(profanityFilterValue, weight)
  return profanityFilterValue
}

function StringToListOfWords (text) {
  let wordList = text.replace(/[.]|\n|,/g, ' ').split(' ')
  wordList = wordList.filter(function (word) {
    return word !== ''
  })
  return wordList
}

function countMisspelings (numberOfWordsInList, listOfWords) {
  const dict = new Spelling(dictionary)
  let misspelings = 0
  let i = 0
  while (i < numberOfWordsInList) {
    const dictResult = dict.lookup(listOfWords[i])

    if (!dictResult.found) {
      misspelings += 1
    }
    i += 1
  }

  return misspelings
}

function countProfanities (numberOfWordsInList, listOfWords) {
  // Counts the number of censored words in a list of words extracted from a text
  let profanityCount = 0
  let i = 0
  while (i < numberOfWordsInList) {
    if (isCensored(listOfWords[i])) {
      profanityCount += 1
    }
    i += 1
  }
  return profanityCount
}

function isCensored (word) {
  // Checks if the letters of a word are all *
  const wordLength = word.length
  let wordIsCensored = true
  let i = 0
  while ((i < wordLength) && (wordIsCensored)) {
    if (word[i] !== '*') {
      wordIsCensored = false
    }
    i += 1
  }
  return wordIsCensored
}

function propotionToValue (proportion) {
  let textCleanliness = 100
  textCleanliness -= proportion * 100
  return textCleanliness
}

function weightedFilterValue (internalFilterValue, filterWeight) {
  const weightedValue = (internalFilterValue / 100) * filterWeight
  return weightedValue
}
