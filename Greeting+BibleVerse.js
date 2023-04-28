// Huge creds to bjayers and drewkerr whose code I interpolated. Their codes if you want them:
// drewkerr's Bible verse Widget: https://tinyurl.com/bderjfv7
// bjayers' home screen greeting: https://tinyurl.com/5y7fd3bx
// I'd also reccomend mzeryck's invisible homescreen script if you're into keeping aesthetics: https://tinyurl.com/2p8hhzy9
// To use, add a parameter to the widget with a format of: image.png|top-padding|text-color (in hex)
// Check and mess with line 186 for padding configuration
// The image should be placed in the iCloud Scriptable folder (case-sensitive)
// Thank you for using this widget, and God bless!

async function fetchVerse() {
    let url = "https://www.biblegateway.com/votd/get/?format=json&version=esvuk"
    let req = new Request(url)
    let res = await req.loadJSON()
    let ref = res.votd.reference
    let ver = res.votd.text
    ver = ver.replace(/(&ldquo;)/g, '“')
    ver = ver.replace(/(&rdquo;)/g, '”')
    ver = ver.replace(/(&#8212;)/g, '—')
    ver = ver.replace(/(&#82(?:1[6-7]|2[0-1]);)/g, '')
    ver = ver.replace(/\[.*\]\s*/g, '')
    return await [ver, ref]
}

let Mttw = new ListWidget();
var today = new Date();

var widgetInputRAW = args.widgetParameter;

try {
    widgetInputRAW.toString();
} catch (e) {
    throw new Error("Please long press the widget and add a parameter.");
}

var widgetInput = widgetInputRAW.toString();

var inputArr = widgetInput.split("|");

// iCloud file path
var scriptableFilePath = "/var/mobile/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/";
var removeSpaces1 = inputArr[0].split(" "); // Remove spaces from file name
var removeSpaces2 = removeSpaces1.join('');
var tempPath = removeSpaces2.split(".");
var backgroundImageURLRAW = scriptableFilePath + tempPath[0];

var fm = FileManager.iCloud();
var backgroundImageURL = scriptableFilePath + tempPath[0] + ".";
var backgroundImageURLInput = scriptableFilePath + removeSpaces2;

// For users having trouble with extensions
// Uses user-input file path is the file is found
// Checks for common file format extensions if the file is not found
if (fm.fileExists(backgroundImageURLInput) == false) {
    var fileTypes = ['png', 'jpg', 'jpeg', 'tiff', 'webp', 'gif'];

    fileTypes.forEach(function (item) {
        if (fm.fileExists((backgroundImageURL + item.toLowerCase())) == true) {
            backgroundImageURL = backgroundImageURLRAW + "." + item.toLowerCase();
        } else if (fm.fileExists((backgroundImageURL + item.toUpperCase())) == true) {
            backgroundImageURL = backgroundImageURLRAW + "." + item.toUpperCase();
        }
    });
} else {
    backgroundImageURL = scriptableFilePath + removeSpaces2;
}

var spacing = parseInt(inputArr[1]);

// Long-form days and months
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Greetings arrays per time period. 
var greetingsMorning = [
    'Good morning.'
];
var greetingsAfternoon = [
    'Good afternoon.'
];
var greetingsEvening = [
    'Good evening.'
];
var greetingsNight = [
    'Good night.'
];
var greetingsLateNight = [
    'Go to sleep!'
];

// Holiday customization
var holidaysByKey = {
    // month,week,day: datetext
    "11,4,4": "Happy Thanksgiving!"
}

var holidaysByDate = {
    // month,date: greeting
    "1,1": "Happy " + (today.getFullYear()).toString() + "!",
    "10,31": "Happy Halloween!",
    "12,25": "Merry Christmas!"
}

var holidayKey = (today.getMonth() + 1).toString() + "," + (Math.ceil(today.getDate() / 7)).toString() + "," + (today.getDay()).toString();

var holidayKeyDate = (today.getMonth() + 1).toString() + "," + (today.getDate()).toString();

// Date Calculations
var weekday = days[today.getDay()];
var month = months[today.getMonth()];
var date = today.getDate();
var hour = today.getHours();

// Append ordinal suffix to date
function ordinalSuffix(input) {
    if (input % 10 == 1 && date != 11) {
        return input.toString() + "st";
    } else if (input % 10 == 2 && date != 12) {
        return input.toString() + "nd";
    } else if (input % 10 == 3 && date != 13) {
        return input.toString() + "rd";
    } else {
        return input.toString() + "th";
    }
}

// Generate date string
var datefull = weekday + ", " + month + " " + ordinalSuffix(date);

// Support for multiple greetings per time period
function randomGreeting(greetingArray) {
    return Math.floor(Math.random() * greetingArray.length);
}

var greeting = new String("Howdy.")
if (hour < 5 && hour >= 1) { // 1am - 5am
    greeting = greetingsLateNight[randomGreeting(greetingsLateNight)];
} else if (hour >= 23 || hour < 1) { // 11pm - 1am
    greeting = greetingsNight[randomGreeting(greetingsNight)];
} else if (hour < 12) { // Before noon (5am - 12pm)
    greeting = greetingsMorning[randomGreeting(greetingsMorning)];
} else if (hour >= 12 && hour <= 17) { // 12pm - 5pm
    greeting = greetingsAfternoon[randomGreeting(greetingsAfternoon)];
} else if (hour > 17 && hour < 23) { // 5pm - 11pm
    greeting = greetingsEvening[randomGreeting(greetingsEvening)];
}

// Overwrite greeting if calculated holiday
if (holidaysByKey[holidayKey]) {
    greeting = holidaysByKey[holidayKey];
}

// Overwrite all greetings if specific holiday
if (holidaysByDate[holidayKeyDate]) {
    greeting = holidaysByDate[holidayKeyDate];
}

// Try/catch for color input parameter
try {
    inputArr[2].toString();
} catch (e) {
    throw new Error("Please long press the widget and add a parameter, check in-line comments if confused");
}

let themeColor = new Color(inputArr[2].toString());

/* --------------- */
/* Assemble Widget */
/* --------------- */

//Top spacing
Mttw.addSpacer(parseInt(spacing));

// Greeting label
let hello = Mttw.addText(greeting);
hello.font = Font.boldSystemFont(42);
hello.textColor = themeColor;

// Date label
let datetext = Mttw.addText(datefull);
datetext.font = Font.regularSystemFont(16);
datetext.textColor = themeColor;

// Padding control
// 1st number controls the top padding, 2nd controls the left, 3rd the bottom, and 4th the right
Mttw.addSpacer();
Mttw.setPadding(15, 7, 10, 0)

// Background image
Mttw.backgroundImage = Image.fromFile(backgroundImageURL);

// Set widget
Script.setWidget(Mttw)

//Display verse
function Jon(ver, ref) {

    let verText = Mttw.addText(ver)
    verText.textColor = themeColor
    verText.font = Font.boldSystemFont(13)
    verText.minimumScaleFactor = 0.25
    Mttw.addSpacer(20)
    let refText = Mttw.addText(ref)
    refText.textColor = themeColor
    refText.font = Font.boldSystemFont(11.5)
    refText.textOpacity = 1
    refText.centerAlignText()
    refText.minimumScaleFactor = 0.5
    refText.lineLimit = 1
    return Mttw
}

let [ver, ref] = await fetchVerse()

if (config.runsInWidget) {
    let widget = Jon(ver, ref)
    Script.setWidget(widget)
}