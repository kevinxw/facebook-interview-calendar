/**
 * Created by Kevin on 2/8/14.
 */


// define a calendar class here
var Calendar = (function () {
    var uniqID = 0; // global unique id, used for events

    /*
     $timeSlotObj : timeslots ol list object
     */
    var $$Calendar = function ($timeSlotClazz, $para) {
        var timeSlotObj = $($timeSlotClazz),
            id = ++uniqID;

        $para = $para || {};
        var timeSlotHeight = $para["timeSlotHeight"] || 29.5,
            colPerPage = Math.min($para["colPerPage"] || 6),
            curPage = 1,
            prevPageBtn = $(".page-selector .left-arrow", timeSlotObj),
            nextPageBtn = $(".page-selector .right-arrow", timeSlotObj),
            eventGrp = $para["eventGroup"] || new EventGroup();

        // hide all events belongs to current group
        // display again based on page
        function refreshPage($page) {
            !isNaN($page) && (curPage = $page);
            eventGrp.hide();
            updateCalendar();
            if (curPage == 1 ) {
                prevPageBtn.hide();
                if (eventGrp.get().length > colPerPage)
                nextPageBtn.show();
            }
        }

        function nextPage() {
            if (curPage < (eventGrp.get().length / colPerPage))
                curPage++;
            if ((eventGrp.get().length - colPerPage * curPage) <= 0) {
                nextPageBtn.hide();
            }
            if (curPage > 1) {
                prevPageBtn.show();
            }
            refreshPage();
        }

        function prevPage() {
            if (curPage > 1)
                curPage--;
            if (curPage == 1) {
                prevPageBtn.hide();
            }
            if ((eventGrp.get().length - colPerPage * curPage) > 0) {
                nextPageBtn.show();
            }
            refreshPage();
        }

        // do page button event binding here
        prevPageBtn.bind('click', prevPage);
        nextPageBtn.bind('click', nextPage);

        // update calendar, insert HTML
        function updateCalendar() {
            // for every event put into calendar, we add an additional attribute
            for (var i = (curPage - 1) * colPerPage;
                 i < curPage * colPerPage && i < eventGrp.get().length;
                 i++) {
                for (var j = 0; j < eventGrp.get(i).length; j++) {
                    var e = eventGrp.get(i, j);
                    var start = e.startTime() / 30, startInt = Math.floor(start),
                    // when we say end at 12:00pm actually means end at 11:59:59pm
                        end = (e.endTime() - 1) / 30, endInt = Math.floor(end);
                    // create events element
                    var eventElem = $("<li>")
                        .addClass("event")
                        .addClass(eventGrp.id())
                        .addClass(e.id())
                        .data("event", e)
                        //.attr("col", i % colPerPage)
                        .data("column", i % colPerPage);
                    // insert some dummy data here
                    var title = $("<div>")
                        .addClass("title")
                        //.text(e.id());
                        .text("Sample Item");
                    var location = $("<div>")
                        .addClass("location")
                        .text("Sample Location");
                    var intervalElem = $("<div>")
                        .addClass("interval")
                        .text(e.timeToString());
                    // now set the position
                    eventElem.css({
                        marginTop: ((start - startInt) * timeSlotHeight) + "px",
                        height: ((end - start) * timeSlotHeight) + "px"
                    });
                    eventElem
                        .append(intervalElem)
                        .append(title)
                        .append(location)
                        .attr("title", e.timeToString());
                    // here we are going to make clone and append them to respecting elements
                    for (var eventListElem, eCopy; startInt <= endInt; endInt--) {
                        eventListElem = $(".timeslot[event-start='" + endInt + "'] .events", timeSlotObj);
                        if (!eventListElem.length)
                            break;   // unexpected error
                        // notice hide the following copies
                        eCopy = startInt < endInt ?
                            eventElem.clone(true)   // copy with data
                                .addClass("event-following")
                            : eventElem;
                        eventListElem.append(eCopy);
                    }
                }
            }
            updateCalendarLayout();
        }

        // we are going to arrange the calendar events
        function updateCalendarLayout() {
            /*
             The algorithm is simple, on the calendar, the events arrangement is affected in two-way
             That is, the adjacent rows affect each other.  Their column numbers are decided by the row
             which has more columns.  If the rows are only decided in one-way (from upper to lower), we
             may face the following situation, http://imgur.com/erabwUE
             */
            var eventsElem = $(".events", timeSlotObj);  // notice it's in document order
            // insert bubbles to hold the position
            eventsElem.each(function () {
                var curE = $(this);  //reset cols
                var eventE = $(".event", this);
                if (!eventE.length)
                    return;
                // first sort, then insert bubble
                eventE.sort(function ($a, $b) {
                    var a = $($a), b = $($b);
                    var val = a.data("column") - b.data("column");
                    if (!val)   // if equal, check event-following
                        val = a.hasClass("event-following") ?
                            (b.hasClass("event-following") ? 0 : 1)
                            : -1;
                    return val;
                });
                // sort event elements physically
                curE.prepend(eventE[0]);
                for (var i = 1; i < eventE.length; i++) {
                    $(eventE[i - 1]).after(eventE[i]);
                }
                var lastCol = 0, maxCols = 0;
                eventE.each(function () {
                    var e = $(this), curCol = e.data("column");
                    if (lastCol <= curCol) {
                        for (; lastCol++ < curCol;) {
                            e.before(
                                $("<li>")
                                    .addClass("event")
                                    .addClass("event-bubble")
                                    .addClass(eventGrp.id())
                                    .data("column", lastCol - 1)
                                    //.attr("col", lastCol - 1)
                            );
                        }
                    }
                    else if (e.hasClass("event-following")) {
                        // hide duplicate events (events with the same col)
                        e.hide();
                    }
                    // re-calculate the column number here, based on how many conflicts they have
                    maxCols = Math.max(maxCols, eventGrp.getMaxConflictCol(e.data("event")));
                });
                if (curPage*colPerPage > maxCols)
                    maxCols %= colPerPage;
                curE.attr("cols", Math.min(colPerPage-1, maxCols));
            });
        }

        // set up instance members here
        extend(this, {
            "eventGroup": function () {
                return eventGrp;
            },
            "refresh": refreshPage
        });
    };

    // set up static members here
    return extend($$Calendar, {
    });
})();

