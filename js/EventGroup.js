/**
 * Created by Kevin on 2/8/14.
 */

var EventGroup = (function () {
    var uniqueID = 0;

    // we sort events based on time
    function eventSorting($e1, $e2) {
        return (($e1.startTime() || 0) - ($e2.startTime() || 0))
            || (($e1.endTime() || 0) - ($e2.endTime() || 0));
    }

    var $$EventGroup = function () {
        var $this = this,
            id = ++uniqueID,
        // eventList is a two-dimension array
        // first dimension is the column where we are going to
        // put into calendar
        // second is the array of events
            eventList = [
                []
            ],
            eventData = [],
            maxConflictColMap = {}; // max conflict column cache

        // we need to be smart about organizing events here
        // since any event with time conflict will be
        // placed into different column.  we really want to keep
        // the calendar as compact as possible
        // NOTICE after this operation, no two events are conflict in the same column
        function organizeEvent() {
            // re-initialize event list
            // notice here we do not want to do eventList=[] so that we always hold the same reference
            eventList.length = 0;
            eventList.push([]);

            for (var i = 0, j = 0, e = eventData[j]; j < eventData.length; e = eventData[++j], i = 0) {
                for (var k = 0, el = eventList[i][k]; k < eventList[i].length; el = eventList[i][++k]) {
                    if (e.isConflictTo(el)) {  // we have a conflict here
                        if (++i == eventList.length) {
                            eventList.push([]);   // insert new column if there is none
                        }
                        k = -1;    // reset k, NOTICE we are doing ++k after this round
                    }
                }
                e.column(i); // the minimal conflict column
                // place event in current column
                eventList[i].push(e);
            }
        }

        // calculate the max conflict column number related to this event
        function getMaxConflictCol($e) {
            return maxConflictColMap[$e.id()];
        }

        // calculate the conflict
        function calculateConflict() {
            $.each(eventData, function ($i) {
                this.conflicts().length = 0;
            });
            $.each(eventData, function ($i) {
                for (var j = $i + 1; j < eventData.length; j++) {
                    if (this.isConflictTo(eventData[j])) {
                        this.conflicts().push(eventData[j]);
                        eventData[j].conflicts().push(this);
                    }
                }
            });
            //reset conflict map
            $.each(maxConflictColMap, function(key) {
                delete maxConflictColMap[key];
            });

            $.each(eventData, function() {
                if (maxConflictColMap[this.rawId])
                    return true;
                var hashSet = {};
                var joinSet = function () {
                    if (!hashSet[this.id()]) {
                        hashSet[this.id()] = this;
                        $.each(this.conflicts(), joinSet);
                    }
                }
                joinSet.call(this);
                var maxCol = this.column();
                $.each(hashSet, function() {
                    maxCol = Math.max(this.column(), maxCol);
                });
                $.each(hashSet, function() {
                    maxConflictColMap[this.id()] = maxCol;
                });
            });
        }

        extend(this, {

            "get": function ($i, $j) {
                if (!isNaN($i)) {
                    if (!isNaN($j)) {
                        return eventList[$i][$j];
                    }
                    else
                        return eventList[$i];
                }
                else
                    return eventList;
            },

            "getMaxConflictCol": getMaxConflictCol,

            // hide from html display, which is actually remove
            "hide": function () {
                $(".event-group-" + id).remove();
                return $this;
            },

            "id": function () {
                return "event-group-" + id;
            },

            "push": function ($e) {
                var _e = [];
                if (!$e)
                    return;
                else if ($e instanceof Array) {
                    // filter out invalid events
                    $.each($e, function () {
                        var e = new Event(this);
                        e.isValid() && _e.push(e);
                    });
                }
                else {
                    var e = new Event($e);
                    e.isValid() && _e.push(e);
                }

                if (_e.length > 0) {
                    eventData.push.apply(eventData, _e);
                    // do not use eventData = eventData.concat(xx), so that we have same reference. important
                    // it is good to sort all data first, so we always get the same result
                    // with the same set of data.  However, sorting may change the whole
                    // page style even if we only want to append new data
                    eventData.sort(eventSorting);
                    organizeEvent();
                    calculateConflict();
                }
                return $this;
            },

            // clear current event list
            "clear": function clearEvents() {
                eventData.length = 0;
                return $this;
            }

        });
    };

    return extend($$EventGroup, {
    });
})();