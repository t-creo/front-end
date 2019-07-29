import SimpleSpamFilter from 'simple-spam-filter';
import Filter from 'bad-words';
import spelling from 'spelling';
import $ from 'jquery';
import dictionary from 'spelling/dictionaries/en_US';
import { PreventInvalidWeightInputs, CalculateWeightProportion, getProportion } from './controllers/weightCalculationUtils';
import './controllers/scraper';
import '../sass/index.scss';


window.addEventListener('load', function load(event)
{
    document.getElementById('submitButton').onclick = getCredibility;
    document.getElementById('VerifyPageButton').onclick = ValidateTwitterTweets;
});

chrome.contextMenus.onClicked.addListener(function(clickData){
  if (clickData.menuItemId == "verify" && clickData.selectionText) {
    getCredibilityFromSelect(clickData.selectionText);
  }
});

$(document).ready(function () {
    chrome.tabs.getSelected(null, function(tab) {
        var tabId = tab.id;
        var tabUrl = tab.url;
        if (tabUrl.includes("https://twitter.com"))
        {
            $('#currentPage').text("You are currently on Twitter");
        }
        else if (tabUrl.includes("https://www.facebook.com"))
        {
            $('#currentPage').text("You are currently on Facebook");
            $('#PageSensitiveButtons').remove();
        }
        else
        {
            $('#firstHorBar').remove();
            $('#secondHorBar').remove();
            $('#PageSensitiveButtons').remove();
        }
    });
});

function getCredibilityFromSelect(text)
{
  // Send Message asking for the scaped values
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {sender: "www",instruction: "scrap"}, function(response) {
          var credibility = 0;
          chrome.storage.sync.get(['SocialWeight','ProfanityWeight','SpamWeight','SpellingWeight'], function(filterOptions) {
              if (tweet != "")
              {
                  credibility = CalculateCredibility(tweet,filterOptions,true,response);
                  //Update credibility number
                  $('#tweet').val(text);
                  $('#credibility').text(credibility.toFixed(2) + "%");
              }
              else 
              {
                  $('#tweet').val(text);
                  $('#credibility').text("--");
              }
          });
      });
  });
}

function getCredibility()
{
    // Send Message asking for the scaped values
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {sender: "www",instruction: "scrap"}, function(response) {

            var tweet = $('#tweet').val();
            var credibility = 0;
            if (tweet != "")
            {
                if (response)
                {
                    chrome.storage.sync.get(['SocialWeight','ProfanityWeight','SpamWeight','SpellingWeight'], function(filterOptions) 
                    {
                        credibility = CalculateCredibility(tweet,filterOptions,true,response);
                        //console.log("response" + response);
                        //Update credibility number
                        $('#credibility').text(credibility.toFixed(2) + "%");
                    });
                }
                else
                {
                    //console.log("Failed to get response");
                    chrome.storage.sync.get(['SocialWeight','ProfanityWeight','SpamWeight','SpellingWeight'], function(filterOptions) 
                    {
                        credibility = CalculateCredibility(tweet,filterOptions,false);
                        //Update credibility number
                        $('#credibility').text(credibility.toFixed(2) + "%");
                    });
                }
            }
            else
            {
                $('#credibility').text("--");
            }
        });
    });
}
function ValidateTwitterTweets()
{

  console.log("Validating Tweeter Tweets");
  // Send Message asking for the scaped values
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
  {
    chrome.tabs.sendMessage(tabs[0].id, {sender: "www",instruction: "scrap"}, function(response)
    {
      if (response)
      {
          gotResponse = true;
          console.log("Succeded getting a response: ");
          console.log(response.tweetTexts);
          var credibilityList = [];
          var credibility;
          chrome.storage.sync.get(['SocialWeight','ProfanityWeight','SpamWeight','SpellingWeight'], function(filterOptions) 
          {
              for (i = 0; i < response.tweetTexts.length; i++) 
              { 
                  if (response.tweetTexts[i] != "")
                  {
                      credibility = CalculateCredibility(response.tweetTexts[i],filterOptions,true,response).toFixed(2);
                      credibilityList.push(credibility);
                      console.log("credibility: " + credibility);
                  }
                  else
                  {
                      credibility = "--";
                      credibilityList.push(credibility);
                      console.log("credibility: " + credibility);
                  }
              }
              console.log("CredList = " + credibilityList);
              console.log("Asking For Update");
              chrome.tabs.sendMessage(tabs[0].id, {sender: "www",instruction: "update", credList: credibilityList}, function(confirmation)
              {
          
                  if (confirmation)
                  {
                      console.log("Updated");
                  }
                  else
                  {
                      console.log("Failed to Update");
                  }
              });
          });
      }
      else
      {
        console.log("Failed to get response");
      }
    });
  });

}
function CalculateCredibility(text, filterOptions, hasSocial, response = undefined)
{
    var credibility = 0;
    var SocialWeight;
    var SpamWeight;
    var SpellingWeight;
    var ProfanityWeight;
    if (hasSocial)
    {
        SocialWeight = 10;
        SpamWeight = 40;
        SpellingWeight = 20;
        ProfanityWeight = 30;
        if (filterOptions.SocialWeight != null)
        {
            SocialWeight = filterOptions.SocialWeight;
        }
        if (filterOptions.SocialWeight != null)
        {
            SpamWeight = filterOptions.SpamWeight;
        }
        if (filterOptions.SocialWeight != null)
        {
            SpellingWeight = filterOptions.SpellingWeight;
        }
        if (filterOptions.SocialWeight != null)
        {
            ProfanityWeight = filterOptions.ProfanityWeight;
        }
        //console.log("Credibility: "+credibility);
        credibility += GetSocialFilterValue(SocialWeight, response.data);
        //console.log("Credibility: "+credibility);
        credibility += GetSpamFilterValue(SpamWeight, text);
        //console.log("Credibility: "+credibility);
        credibility += GetSpellingFilterValue(SpellingWeight, text);
        //console.log("Credibility: "+credibility);
        credibility += GetProfanityFilterValue(ProfanityWeight, text);
        //console.log("Credibility: "+credibility);
    }
    else
    {
        SocialWeight = 0;
        SpamWeight = 44;
        SpellingWeight = 23;
        ProfanityWeight = 33;
        if (filterOptions.SocialWeight != null)
        {
            SpamWeight = filterOptions.SpamWeight;
        }
        if (filterOptions.SocialWeight != null)
        {
            SpellingWeight = filterOptions.SpellingWeight;
        }
        if (filterOptions.SocialWeight != null)
        {
            ProfanityWeight = filterOptions.ProfanityWeight;
        }
        var ListOfNonSocialWeights = CalculateWeightProportion(PreventInvalidWeightInputs([SpamWeight,SpellingWeight,ProfanityWeight]));
        var TotalWeightSum =  parseFloat(ListOfNonSocialWeights[0]) + parseFloat(ListOfNonSocialWeights[1]) + parseFloat(ListOfNonSocialWeights[2]);
        var DifferenceFromHundred = (100 - TotalWeightSum).toFixed(2);
        ListOfNonSocialWeights[0] = parseFloat(ListOfNonSocialWeights[0]) + parseFloat(DifferenceFromHundred);
        //console.log("Credibility: "+credibility);
        credibility += GetSpamFilterValue(ListOfNonSocialWeights[0], text);
        //console.log("Credibility: "+credibility);
        credibility += GetSpellingFilterValue(ListOfNonSocialWeights[1], text);
        //console.log("Credibility: "+credibility);
        credibility += GetProfanityFilterValue(ListOfNonSocialWeights[2], text);
        //console.log("Credibility: "+credibility);
    }
 
    return credibility
}
function GetSocialFilterValue(weight, data)
{

    //Following vs followers number analysis (50%)

    //The number of followers is rated between 0 to 100. 
    //the closer to 5 million followers,the closer to 100 the followersValue is
    //the closer to 0 followers, the closer to 0 the followersValue is
    var followersValue = getSocialFactorSubWeightedValue(100,data.followers.value, 5000000);

    //followingVSFollowersProportion should be a number close to 1 if there is way more followers than followings
    //and should be a number close to 0 on the contrary
    var followingAndFollowersTotal = parseFloat(data.followers.value) + parseFloat(data.following.value);
    var followingVSFollowersProportion = getProportion(data.followers.value, followingAndFollowersTotal);


    //followersValue is multiplied by followingAndFollowersTotal, this way, if the followingVSfollowersProportion is close
    //to 1, there is almost no decuction to the total social Value, if it is closer to 0, then there is a big 
    //deduction to the social Value
    var followingVSFollowerAnalysisResult = (followersValue.toFixed(2)) * (Math.ceil(followingVSFollowersProportion));


    //The result is subweighted
    var followingVSFollowerResultSubWeighted = getSocialFactorSubWeightedValue(
        50,
        followingVSFollowerAnalysisResult,
        100);


    //Verified account analysis (25%)
    var VerifiedAccountAnalysisResult;

    if (data.verified.value)
    {
        VerifiedAccountAnalysisResult = 100;
    }
    else
    {
        VerifiedAccountAnalysisResult = 0;
    }

    var VerifiedAccountSubWeighted = getSocialFactorSubWeightedValue(
         25.00,
         VerifiedAccountAnalysisResult,
         100
    );


    //Account Age (25%)
    var wordsInJoinedDateString = data.joinedDate.value.split(" ");
    var numberOfWords = wordsInJoinedDateString.length;
    var i = 0;
    var YearJoined;
    while ((i < numberOfWords) && (!Number.isInteger(YearJoined)))
    {
   	 YearJoined = parseInt(wordsInJoinedDateString[i]);
         i++;
    }
    var CurrentYear = parseInt((new Date()).getFullYear());
    var TwitterCreationYear = 2006;
    var AccountAge = (CurrentYear - YearJoined);
    var MaxAccountAge = (CurrentYear - TwitterCreationYear);
    var AccountAgeAnalysisResult = getSocialFactorSubWeightedValue(100,AccountAge, MaxAccountAge);
    var AccountAgeSubWeighted = getSocialFactorSubWeightedValue(
         25.00,
         AccountAgeAnalysisResult,
         100
    );


    //Final social filter calculation
    var totalSocialValue = VerifiedAccountSubWeighted + followingVSFollowerResultSubWeighted + AccountAgeSubWeighted;
    totalSocialValueWeighted = weightedFilterValue(totalSocialValue, weight);
    return  (totalSocialValueWeighted);
    
}
function GetSocialFilterValueOld(weight, data)
{
  sumWeightedValues = 0;
  // Define Weighted likes Value
  var likesWeightedValue = getSocialFactorSubWeightedValue(
    20.00,
    data.likes.value,
    1000
  );
  //console.log(likesWeightedValue);
  sumWeightedValues += likesWeightedValue;

  // Define Weighted followers Value
  var followersWeightedValue = getSocialFactorSubWeightedValue(
    40.00,
    data.followers.value,
    1000
  );
  //console.log(followersWeightedValue);
  sumWeightedValues += followersWeightedValue;

  // Define Weighted following Value
  var followingWeightedValue = getSocialFactorSubWeightedValue(
    20.00,
    data.following.value,
    1000
  );
  //console.log(followingWeightedValue);
  sumWeightedValues += followingWeightedValue;

  // Define Weighted tweets Value
  var tweetsWeightedValue = getSocialFactorSubWeightedValue(
    20.00,
    data.tweets.value,
    1000
  );
  //console.log(tweetsWeightedValue);
  sumWeightedValues += tweetsWeightedValue;

  var totalSocialValue = getProportion(sumWeightedValues, 100);
  return  (totalSocialValue * weight);
}

function getSocialFactorSubWeightedValue(subWeight,rawData, maxCredibility)
{
  var Value = 0;
  if (rawData > maxCredibility)
  {
      Value = maxCredibility;
  }
  else
  {
      Value = rawData
  }
  return WeightedValue = getProportion(Value,maxCredibility)*subWeight;

}
function GetSpamFilterValue(weight, text)
{
    //**************************************************//
    //                   Spam Filter                    //
    //**************************************************//
    //console.log("SPAM FILTER STARTS");
    var spamFilterValue = 0;

    // These parameters are all optional
    var opts =
    {
        minWords: 5,
        maxPercentCaps: 30,
        maxNumSwearWords: 2
    }
    var spamFilter = new SimpleSpamFilter(opts);
    var isSpam = spamFilter.isSpam(text);

    //Determine SPAM Filter internal value
    if (!isSpam)
    {
        //console.log("the text isn't considered spam");
        spamFilterValue = 100;
    }
    else
    {
        //console.log("the text is spam");
        spamFilterValue = 0;
    }

    //Add SPAM Filter Value to credibility
    var spamWeightedValue = weightedFilterValue(spamFilterValue, weight);
    return spamWeightedValue;

}
function GetSpellingFilterValue(weight, text)
{
    //**************************************************//
    //               Spelling Filter                   //
    //**************************************************//
    //console.log("SPELLING FILTER STARTS");
    var spellingFilterValue = 0;
    var wordsInText = StringToListOfWords(text);
    var numberOfWordsInText = wordsInText.length;

    //Find and count misspellings in cleaned elements
    var spellingCount = countMisspelings(numberOfWordsInText, wordsInText);
    //console.log("Filter found "+spellingCount+" misspellings");

    //Get misspelling proportion to text lenght
    var spellingProportion = getProportion(spellingCount, numberOfWordsInText);
    //console.log("The spelling to text proportion is:" + spellingProportion);

    //Determine spelling filter internal value
    spellingFilterValue = propotionToValue(spellingProportion);
    //console.log("The spelling filter result is:" + spellingFilterValue);

    //Add Weighted Spelling Filter Value to credibility
    spellingFilterValue = weightedFilterValue(spellingFilterValue, weight);
    return spellingFilterValue;
}
function GetProfanityFilterValue(weight, text)
{
    //**************************************************//
    //               Profanity Filter                   //
    //**************************************************//
    //console.log("PROFANITY FILTER STARTS");
    var profanityFilterValue = 0;
    var filterInstance = new Filter();
    var censoredText = filterInstance.clean(text);
    var wordsInText = StringToListOfWords(censoredText);
    var numberOfWordsInText = wordsInText.length;
    //console.log("Censored Text:" + censoredText);


    //Find and count profanities in cleaned elements
    var profanityCount = countProfanities(numberOfWordsInText,wordsInText);
    //console.log("Filter found "+profanityCount+" profanities");

    //Get profanity proportion to text lenght
    var profanityProportion = getProportion(profanityCount, numberOfWordsInText);
    //console.log("The profanity to text proportion is:" + profanityProportion);

    //Determine profanity filter internal value
    profanityFilterValue = propotionToValue(profanityProportion);
    //console.log("The profanity filter result is:" + profanityFilterValue);

    //Add Weighted Profanity Filter Value to credibility
    profanityFilterValue = weightedFilterValue(profanityFilterValue, weight);
    return profanityFilterValue;
}

function StringToListOfWords(text)
{
    var wordList = text.replace( /[.]|\n|,/g, " " ).split( " " );
    //console.log(wordList);
    wordList = wordList.filter(function (word) {
        return word != "";
    });
    //console.log(wordList);
    return wordList;
}
function countMisspelings(numberOfWordsInList, listOfWords)
{

    var dict = new spelling(dictionary);
    var misspelings = 0;
    var i = 0;
    while (i < numberOfWordsInList)
    {
        const dictResult = dict.lookup( listOfWords[i] );

        if (!dictResult.found)
        {
            //console.log("-"+listOfWords[i]+"-")
            misspelings += 1;
        }
        i += 1;
    }

    return misspelings;
}
function onDictionary(err, dict)
{
    if (err)
    {
        throw err
    }
}
function countProfanities(numberOfWordsInList, listOfWords)
{
//Ccounts the number of censored words in a list of words extracted from a text
    var profanityCount = 0;
    var i = 0;
    while (i < numberOfWordsInList)
    {
        if (isCensored(listOfWords[i]))
        {
            profanityCount += 1;
        }
        i += 1;
    }
    return profanityCount;
}

function isCensored(word)
{
//Checks if the letters of a word are all *
    //console.log("word to analyze:" + word);
    var wordLength = word.length;
    //console.log("word length:" + wordLength);
    var wordIsCensored = true;
    var i = 0;
    while ((i < wordLength) && (wordIsCensored))
    {
        if (!(word[i] == "*"))
        {
            wordIsCensored = false;
        }
        i += 1;
    }
    return wordIsCensored;
}
function propotionToValue(proportion)
{
    var textCleanliness = 100;
    textCleanliness -= (proportion*100);
    return textCleanliness;
}
function weightedFilterValue(internalFilterValue,filterWeight)
{
    var weightedValue = (internalFilterValue/100)*filterWeight;
    return weightedValue;
}
function weightedSocialValue(internalValue,filterWeight)
{
  var weightedValue = (internalValue/100)%filterWeight;
  return weightedValue;
}
