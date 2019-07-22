function PreventInvalidWeightInputs(ListOfWeights)
{

    var CleanedWeightInput = ListOfWeights.slice();
    //Eliminate strings and NaNs
    for (i = 0; i < ListOfWeights.length; i++) 
    { 
        if (typeof (ListOfWeights[i]) == "string")
        {
            CleanedWeightInput[i] = parseFloat(ListOfWeights[i]);
        }
        if (isNaN(ListOfWeights[i]))
        {
            CleanedWeightInput[i] = 0;
        }
    }

    //Eliminate negative numbers
    for (i = 0; i < CleanedWeightInput.length; i++) 
    { 
        if(CleanedWeightInput[i] < 0)
        { 
            CleanedWeightInput[i] = 0;
        }
    }
    //Check number of zeroes
    var AllAreZero = true;
    var OnlyOneWeight = false;
    var OnlyWeightOnListIndex = 0;
    var MoreThanOneWeight = false;
    for (i = 0; i < CleanedWeightInput.length; i++) 
    { 
        if (CleanedWeightInput[i] != 0)
        {
            AllAreZero = false;
            if (!MoreThanOneWeight)
            {
                if (!OnlyOneWeight)
                {
                    OnlyOneWeight = true;
                    OnlyWeightOnListIndex = i;
                }
                else {
                    OnlyOneWeight = false;
                    MoreThanOneWeight = true;
                }
            }
        }
    }
    if (AllAreZero)
    {
        for (i = 0; i < CleanedWeightInput.length; i++) 
        { 
            //console.log("Cleaned Weight Input length:" + CleanedWeightInput.length);
            CleanedWeightInput[i] = parseFloat((100/CleanedWeightInput.length).toFixed(2));
            //console.log("Cleaned Weight Input: " + CleanedWeightInput[i]);
        }
    }
    else if (OnlyOneWeight)  
    {
        for (i = 0; i < CleanedWeightInput.length; i++) 
        { 
            if(i != OnlyWeightOnListIndex)
            { 
                CleanedWeightInput[i] = 0;
            }
            else
            {
                CleanedWeightInput[i] = 100;
            }
        }
    }
    return CleanedWeightInput;
}
function CalculateWeightProportion(ListOfWeights) 
{
//    var IndexAndWeightPair = FindAndScaleFirstNonZeroWeightValue();
    var TotalSum = 0;
    var NumberOfWeights = 0;

    for (i = 0; i < ListOfWeights.length; i++) 
    { 
        TotalSum += ListOfWeights[i];
        if(ListOfWeights[i] != 0)
        { 
            NumberOfWeights += 1;
        }
    }

    //console.log("Total Sum:" + TotalSum);
    var ScaledWeightProportionsList = ListOfWeights.slice();
    for (i = 0; i < ListOfWeights.length; i++) 
    { 
        ScaledWeightProportionsList[i] = (getProportion(ListOfWeights[i],TotalSum)*100).toFixed(2);
    }
    return ScaledWeightProportionsList;
}
function getProportion(partialQuantity, TotalQuantity)
{
    var proportion = (partialQuantity/TotalQuantity);
    return proportion;
}


