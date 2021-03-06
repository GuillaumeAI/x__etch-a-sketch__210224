#!/bin/bash


# Prep context

export responseBase=response$callport
#export requestBase=request$callport
#export requestFile="$TMP/$requestBase.json"

export callurl="$callprotocol://$callhost:$callport/$callmethod"
export responseFile="$TMP/$responseBase.json"
export responseImage="$TMP/$responseBase.jpg"
#the output file is the same as the source with an extension
export resultFileTarget=$resultFileTargetBase$callport.$ext_target


## DEBUG STUFF
#echo "Calling the server port: $callport"
echo "Calling the server : $callurl"
#echo "RequestFile: $requestFile"
#echo "CallURL: $callurl"
#echo "Output Responses: $responseFile"

#echo curl --header  \"$callContentType\"  --request POST   --data @$requestFile $callurl --output $responseFile

# Call the modeling service
curl --header  "$callContentType"  --request POST   --data @$requestFile $callurl --output $responseFile --silent

#--suppress-connect-headers


# Post process response
#echo "Calling post scripting: $nodepostscripting"
#echo "  It will convert: $responseFile to $responseImage and generate HTML in : $resulthtml"

#echo "$nodepostscripting  $responseFile $responseImage --html  >> $resulthtml"

echo "<hr><h2>$modelinfo</h2>" >> $resulthtml
$nodepostscripting  $responseFile $responseImage --html  >> $resulthtml

# Moving result in CDIR
echo "Result file created : $resultFileTarget"
mv $responseImage $resultFileTarget

if [ "$showresult" == "1" ]; then 
   echo "Showing result using $viewresultcmd"
   $viewresultcmd $resultFileTarget
fi
rm -f $responseFile $requestFile

# cleanup
#rm $responseFile

echo "."


