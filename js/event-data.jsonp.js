/**
 * Created by Kevin on 1/28/14.
 */

// simulate another JSONP callback which supplies event data to the client
// default data provided by document
layOutDay({
    "events": [
        {
            "start": 30,
            "end": 150
        },
        {
            "start": 540,
            "end": 600
        },
        {
            "start": 560,
            "end": 620
        },
        {
            "start": 610,
            "end": 670
        }
    ]
});
//
//// the following are more test data
//// test 5 column
//layOutDay({
//    "events": [
//        {   // test consistent event
//            "start": 150,
//            "end": 180
//        },
//        {   // test small event
//            "start": 601,
//            "end": 603
//        },
//        {   // test small event 2
//            "start": 602,
//            "end": 604
//        },
//        {
//            "start" : 605,
//            "end": 607
//        },
//        {   // test earlier event
//            "start": -100,
//            "end": 20
//        },
//        {   // test later event
//            "start": 700,
//            "end": 770
//        },
//        {   // test 0-start event
//            "start": 0,
//            "end": 30
//        }
//    ]
//});

// generate random events
function randomTest($num, $clear) {
    $num = $num || 30;  // how many events to generate
    var testData = {
        "events": []
    };
    for (var i = 0; i < $num; i++) {
        var start = Math.random() * 720;
        testData.events.push({
            "start": Math.floor(start),
            "end": Math.floor(start + Math.random() * 720)
        })
    }
    //console.debug(testData);
    layOutDay(testData, $clear);
}

//randomTest(15);