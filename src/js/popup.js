import SimpleSpamFilter from 'simple-spam-filter'
import Filter from 'bad-words'
import Spelling from 'spelling'
import $ from 'jquery'
import dictionary from 'spelling/dictionaries/en_US'
import { PreventInvalidWeightInputs, CalculateWeightProportion, getProportion } from './controllers/weightCalculationUtils'
import './controllers/scraper'
import '../sass/index.scss'

window.addEventListener('load', function load (event) {
  document.getElementById('submitButton').onclick = getCredibility
  document.getElementById('VerifyPageButton').onclick = ValidateTwitterTweets
})

chrome.contextMenus.onClicked.addListener(function (clickData) {
  if (clickData.menuItemId === 'verify' && clickData.selectionText) {
    getCredibilityFromSelect(clickData.selectionText)
  }
})

$(document).ready(function () {
  chrome.tabs.getSelected(null, function (tab) {
    var tabUrl = tab.url
    if (tabUrl.includes('https://twitter.com')) {
      $('#currentPage').text('You are currently on Twitter')
    } else if (tabUrl.includes('https://www.facebook.com')) {
      $('#currentPage').text('You are currently on Facebook')
      $('#PageSensitiveButtons').remove()
    } else {
      $('#firstHorBar').remove()
      $('#secondHorBar').remove()
      $('#PageSensitiveButtons').remove()
    }
  })
})

function getCredibilityFromSelect (text) {
  // Send Message asking for the scaped values
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { sender: 'www', instruction: 'scrap' }, function (response) {
      var credibility = 0
      chrome.storage.sync.get(['SocialWeight', 'ProfanityWeight', 'SpamWeight', 'SpellingWeight'], function (filterOptions) {
        let tweet
        if (tweet !== '') {
          credibility = CalculateCredibility(tweet, filterOptions, true, response)
          // Update credibility number
          $('#tweet').val(text)
          $('#credibility').text(credibility.toFixed(2) + '%')
        } else {
          $('#tweet').val(text)
          $('#credibility').text('--')
        }
      })
    })
  })
}

function getCredibility () {
  // Send Message asking for the scaped values
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { sender: 'www', instruction: 'scrap' }, function (response) {
      var tweet = $('#tweet').val()
      var credibility = 0
      if (tweet !== '') {
        if (response) {
          chrome.storage.sync.get(['SocialWeight', 'ProfanityWeight', 'SpamWeight', 'SpellingWeight'], function (filterOptions) {
            credibility = CalculateCredibility(tweet, filterOptions, true, response)
            // Update credibility number
            $('#credibility').text(credibility.toFixed(2) + '%')
          })
        } else {
          chrome.storage.sync.get(['SocialWeight', 'ProfanityWeight', 'SpamWeight', 'SpellingWeight'], function (filterOptions) {
            credibility = CalculateCredibility(tweet, filterOptions, false)
            // Update credibility number
            $('#credibility').text(credibility.toFixed(2) + '%')
          })
        }
      } else {
        $('#credibility').text('--')
      }
    })
  })
}

function ValidateTwitterTweets () {
  // Send Message asking for the scaped values
  chrome.tabs.executeScript(null, {
    file: 'popup.bundle.js',  }, () => {
      connect()
  });
  // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //   chrome.tabs.sendMessage(tabs[0].id, { sender: 'www', instruction: 'scrap' }, function (response) {
  //     if (response) {
  //       var credibilityList = []
  //       var credibility
  //       chrome.storage.sync.get(['SocialWeight', 'ProfanityWeight', 'SpamWeight', 'SpellingWeight'], function (filterOptions) {
  //         for (let i = 0; i < response.tweetTexts.length; i++) {
  //           if (response.tweetTexts[i] !== '') {
  //             credibility = CalculateCredibility(response.tweetTexts[i], filterOptions, true, response).toFixed(2)
  //             credibilityList.push(credibility)
  //           } else {
  //             credibility = '--'
  //             credibilityList.push(credibility)
  //           }
  //         }
  //         chrome.tabs.sendMessage(tabs[0].id, { sender: 'www', instruction: 'update', credList: credibilityList }, function (confirmation) {
  //           if (confirmation) {
  //           } else {
  //           }
  //         })
  //       })
  //     } else {
  //     }
  //   })
  // })
}

function connect() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const port = chrome.tabs.connect(tabs[0].id);
    port.postMessage({ sender: 'www', instruction: 'scrap' });
    port.onMessage.addListener((response) => {
      alert(JSON.stringify(response));      
    });
  });
}

function CalculateCredibility (text, filterOptions, hasSocial, response = undefined) {
  var credibility = 0
  var SocialWeight
  var SpamWeight
  var SpellingWeight
  var ProfanityWeight
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
    var ListOfNonSocialWeights = CalculateWeightProportion(PreventInvalidWeightInputs([SpamWeight, SpellingWeight, ProfanityWeight]))
    var TotalWeightSum = parseFloat(ListOfNonSocialWeights[0]) + parseFloat(ListOfNonSocialWeights[1]) + parseFloat(ListOfNonSocialWeights[2])
    var DifferenceFromHundred = (100 - TotalWeightSum).toFixed(2)
    ListOfNonSocialWeights[0] = parseFloat(ListOfNonSocialWeights[0]) + parseFloat(DifferenceFromHundred)
    credibility += GetSpamFilterValue(ListOfNonSocialWeights[0], text)
    credibility += GetSpellingFilterValue(ListOfNonSocialWeights[1], text)
    credibility += GetProfanityFilterValue(ListOfNonSocialWeights[2], text)
  }

  return credibility
}

function GetSocialFilterValue (weight, data) {
  // Following vs followers number analysis (50%)

  // The number of followers is rated between 0 to 100.
  // the closer to 5 million followers,the closer to 100 the followersValue is
  // the closer to 0 followers, the closer to 0 the followersValue is
  var followersValue = getSocialFactorSubWeightedValue(100, data.followers.value, 5000000)

  // followingVSFollowersProportion should be a number close to 1 if there is way more followers than followings
  // and should be a number close to 0 on the contrary
  var followingAndFollowersTotal = parseFloat(data.followers.value) + parseFloat(data.following.value)
  var followingVSFollowersProportion = getProportion(data.followers.value, followingAndFollowersTotal)

  // followersValue is multiplied by followingAndFollowersTotal, this way, if the followingVSfollowersProportion is close
  // to 1, there is almost no decuction to the total social Value, if it is closer to 0, then there is a big
  // deduction to the social Value
  var followingVSFollowerAnalysisResult = (followersValue.toFixed(2)) * (Math.ceil(followingVSFollowersProportion))

  // The result is subweighted
  var followingVSFollowerResultSubWeighted = getSocialFactorSubWeightedValue(
    50,
    followingVSFollowerAnalysisResult,
    100
  )

  // Verified account analysis (25%)
  var VerifiedAccountAnalysisResult

  if (data.verified.value) {
    VerifiedAccountAnalysisResult = 100
  } else {
    VerifiedAccountAnalysisResult = 0
  }

  var VerifiedAccountSubWeighted = getSocialFactorSubWeightedValue(
    25.00,
    VerifiedAccountAnalysisResult,
    100
  )

  // Account Age (25%)
  var wordsInJoinedDateString = data.joinedDate.value.split(' ')
  var numberOfWords = wordsInJoinedDateString.length
  var i = 0
  var YearJoined
  while ((i < numberOfWords) && (!Number.isInteger(YearJoined))) {
    YearJoined = parseInt(wordsInJoinedDateString[i])
    i++
  }
  var CurrentYear = parseInt((new Date()).getFullYear())
  var TwitterCreationYear = 2006
  var AccountAge = (CurrentYear - YearJoined)
  var MaxAccountAge = (CurrentYear - TwitterCreationYear)
  var AccountAgeAnalysisResult = getSocialFactorSubWeightedValue(100, AccountAge, MaxAccountAge)
  var AccountAgeSubWeighted = getSocialFactorSubWeightedValue(
    25.00,
    AccountAgeAnalysisResult,
    100
  )

  // Final social filter calculation
  var totalSocialValue = VerifiedAccountSubWeighted + followingVSFollowerResultSubWeighted + AccountAgeSubWeighted
  const totalSocialValueWeighted = weightedFilterValue(totalSocialValue, weight)
  return totalSocialValueWeighted
}

function getSocialFactorSubWeightedValue (subWeight, rawData, maxCredibility) {
  var Value = 0
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
  var spamFilterValue = 0

  // These parameters are all optional
  var opts = {
    minWords: 5,
    maxPercentCaps: 30,
    maxNumSwearWords: 2
  }
  var spamFilter = new SimpleSpamFilter(opts)
  var isSpam = spamFilter.isSpam(text)

  // Determine SPAM Filter internal value
  if (!isSpam) {
    spamFilterValue = 100
  } else {
    spamFilterValue = 0
  }

  // Add SPAM Filter Value to credibility
  var spamWeightedValue = weightedFilterValue(spamFilterValue, weight)
  return spamWeightedValue
}

function GetSpellingFilterValue (weight, text) {
  // ************************************************** //
  //               Spelling Filter                      //
  // ************************************************** //
  var spellingFilterValue = 0
  var wordsInText = StringToListOfWords(text)
  var numberOfWordsInText = wordsInText.length

  // Find and count misspellings in cleaned elements
  var spellingCount = countMisspelings(numberOfWordsInText, wordsInText)

  // Get misspelling proportion to text lenght
  var spellingProportion = getProportion(spellingCount, numberOfWordsInText)

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
  var profanityFilterValue = 0
  var filterInstance = new Filter()
  var censoredText = filterInstance.clean(text)
  var wordsInText = StringToListOfWords(censoredText)
  var numberOfWordsInText = wordsInText.length

  // Find and count profanities in cleaned elements
  var profanityCount = countProfanities(numberOfWordsInText, wordsInText)

  // Get profanity proportion to text lenght
  var profanityProportion = getProportion(profanityCount, numberOfWordsInText)

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
  var dict = new Spelling(dictionary)
  var misspelings = 0
  var i = 0
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
  var profanityCount = 0
  var i = 0
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
  var wordLength = word.length
  var wordIsCensored = true
  var i = 0
  while ((i < wordLength) && (wordIsCensored)) {
    if (word[i] !== '*') {
      wordIsCensored = false
    }
    i += 1
  }
  return wordIsCensored
}

function propotionToValue (proportion) {
  var textCleanliness = 100
  textCleanliness -= proportion * 100
  return textCleanliness
}

function weightedFilterValue (internalFilterValue, filterWeight) {
  var weightedValue = (internalFilterValue / 100) * filterWeight
  return weightedValue
}
