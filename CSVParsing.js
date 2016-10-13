var fs = require('fs');

//Parsing taken from Stackoverflow - http://stackoverflow.com/questions/7431268/how-to-read-data-from-csv-file-using-javascript
//Modified to suit this project and my own style
function parseCSV(allText) {
  var allTextLines = allText.split(/\r\n|\n/);
  var headers = allTextLines[0].split(',');
  var lines = [];
  //This, and the pop() below it, correct for the extra comma before each newline.
  //Otherwise, you'd be left with an empty field. This allows me to use split to easily create the array.
  headers.pop();

  for (var i = 0; i < allTextLines.length; i++) {
    var data = allTextLines[i].split(',');
    data.pop();
    if (data.length == headers.length) {
      var tempArr = [];
      for (var j = 0; j < headers.length; j++) {
        tempArr.push(data[j]);
      }
    lines.push(tempArr);
    }
  }
  return lines;
}

//Determines the schema given a parsed CSV array of arrays
function determineSchema(parsedCSV) {
  var tempSchemaArr = [];
  var finalSchema = [];
  //Taking the first line, the headers, create a base - one tempSchema to track data for the whole column,
  //and one finalSchema to be modified at the end.
  for (var i = 0; i < parsedCSV[0].length; i++) {
    tempSchemaArr.push({
      "date": 0,
      "textOrMultiChoice": [],
      "number": 0
    })
    finalSchema.push({
      "name": null,
      "type": null,
      "choices": []
    })
  }
  //Loop through all but the header (index 0 of parsedCSV)
  for (var i = 1; i < parsedCSV.length; i++) {
    for (var x = 0; x < parsedCSV[i].length; x++) {
      //If parseable as a Date, add to date count for that index. NOTE: Doesn't fix the two errant dates at the beginning of the csv, but rather ignores them.
      //Would've used MomentJS to solve the above problem, but I figured third-party modules were frowned upon.
      if (Date.parse(parsedCSV[i][x])) {
        tempSchemaArr[x].date++;
      //If it's a number, add to number count for that index. NOTE: Just worth doing in case you decide to test this code with another CSV.
      } else if (!isNaN(parseInt(parsedCSV[i][x]))) {
        tempSchemaArr[x].number++;
        //As long as it isn't empty...
      } else if (parsedCSV[i][x] !== "") {
        //If it doesn't exist in the tempSchemaArr text array (filters out multiple choice answers, except for one)
        if (tempSchemaArr[x].textOrMultiChoice.indexOf(parsedCSV[i][x]) === -1) {
          tempSchemaArr[x].textOrMultiChoice.push(parsedCSV[i][x]);
        }
      }
    }
  }
  //Final compiling of data in to an acceptable schema..
  //NOTE: 0.85 is a percentage that represents my best guess at what a threshold for a column's identification should be. Same story with 8 for multiple choice answers.
  //This could easily be changed.
  for (var i = 0; i < tempSchemaArr.length; i++) {
    if (parsedCSV.length-1 / tempSchemaArr[i].date > 0.85) {
      finalSchema[i].name = parsedCSV[0][i];
      finalSchema[i].type = "date";
    } else if (parsedCSV.length-1 / tempSchemaArr[i].number > 0.85) {
      finalSchema[i].name = parsedCSV[0][i];
      finalSchema[i].type = "number";
    } else if (tempSchemaArr[i].textOrMultiChoice.length < 8) {
      finalSchema[i].name = parsedCSV[0][i];
      finalSchema[i].type = "multipleChoice";
      finalSchema[i].choices = tempSchemaArr[i].textOrMultiChoice;
    } else if (tempSchemaArr[i].textOrMultiChoice.length >= 8) {
      finalSchema[i].name = parsedCSV[0][i];
      finalSchema[i].type = "text";
    } else {
      throw new Error("Could not determine the schema type of one or more columns.")
    }
  }
  return finalSchema;
}

//The magic happens here! Call both functions, and return the schema. Also allows you to input a csv file via the command line.
fs.readFile((process.argv[2] || './test-contacts.csv'), 'utf8', function(err, data) {
  var parsedCSV = parseCSV(data);
  console.log(determineSchema(parsedCSV));
});
