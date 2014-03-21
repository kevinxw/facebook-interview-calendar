/**
 * Created by Kevin on 2/8/14.
 */


var Event = (function () {
    // constant value
    var STARTTIME_MAX = 30 * 24, ENDTIME_MIN = 0;

    var uniqueID = 0;

    var $$Event = function ($initData) {
        var $this = this,
            startTime = 30 * 24 + 1,
            endTime = -1,
            oriStart = startTime,
            oriEnd = endTime,
            interval = oriEnd - oriStart,
            id = -1,
            column = 0,
            conflictItems = [];

        function load($data) {
            if ($data) {
                // limit the interval to 9am ~ 9pm
                if (!isNaN($data["start"]))
                    startTime = Math.max(ENDTIME_MIN, oriStart = $data["start"]);
                if (!isNaN($data["end"]))
                    endTime = Math.min(STARTTIME_MAX, oriEnd = $data["end"]);
                if (startTime < endTime && endTime > ENDTIME_MIN && startTime < STARTTIME_MAX) {    // drop invalid event
                    id = ++uniqueID;
                }
                interval = oriEnd - oriStart;
            }
        }

        extend(this, {
            // read-write members starts here =======================
            "startTime": function () {
                return startTime;
            },

            "endTime": function () {
                return endTime;
            },

            "oriStartTime": function () {
                return oriStart;
            },

            "oriEndTime": function () {
                return oriEnd;
            },

            "column": function ($col) {
                if (!isNaN($col)) {
                    column = $col;
                    return $this;
                }
                else {
                    return column;
                }
            },
            // read-write members end here ========================

            // read-only members starts here =======================
            "isValid": function () {
                return id > 0;
            },

            "interval": function () {
                return interval;
            },

            "id": function () {
                return "event-id-" + id;
            },
            // read-only members end here =======================

            "hide": function () {
                $(".event-id-" + id).remove();
            },

            "conflicts": function () {
                return conflictItems;
            },

            "isConflictTo": function ($e) {
                return Event.isConflictTo($this, $e);
            },

            "timeToString": function ($hourBase) {
                return "Time: " +
                    Event.timeToString(oriStart, $hourBase) + " - " +
                    Event.timeToString(oriEnd, $hourBase) + " (" +
                    (interval >= 60 * 24 ? Math.floor(interval / 60 / 24) + "d" : "") +
                    (interval >= 60 ? Math.floor(interval / 60) + "hr" : "") +
                    (interval % 60 ? interval % 60 + "min" : "" ) + ")";
            }
        });

        load($initData);
    };

    // what to print
    $$Event.prototype.toString = function () {
        var str = "Event@Column[" + this.column() + "] (" + this.timeToString() + ")";
        return str;
    }

    // set up static members here
    return extend($$Event, {

        // translate a number into time display text
        "timeToString": function ($num, $hourBase) {
            $num = $num || 0;
            $hourBase = $hourBase || 9; // default hour base is 9am
            var hour = (Math.floor($num / 60) + $hourBase) % 24,
                min = $num % 60;
            if (min < 0)   // when we are doing modular to a negative
                min += 60;
            return (hour <= 12 ? hour : hour - 12) + ":"
                + (min > 9 ? min : "0" + min)
                + (hour < 12 ? " AM" : " PM");
        },

        // NOTICE we are not counting the last minute (00:59) here
        // means event ends at 2:00pm is not conflict with event starts at 2:00pm
        // also, for events start time interval less than 30 min, we put them into different column
        // for display purpose
        "isConflictTo": function ($e1, $e2) {
            return ($e1.oriStartTime() > $e2.oriStartTime() && $e1.oriStartTime() < $e2.oriEndTime())
                || ($e1.oriEndTime() < $e2.oriEndTime() && $e1.oriEndTime() > $e2.oriStartTime())
                || ($e1.oriStartTime() <= $e2.oriStartTime() && $e1.oriEndTime() >= $e2.oriEndTime())
                // for display purpose
                || Math.abs($e1.startTime() - $e2.startTime()) < 30 || Math.abs($e1.endTime() - $e2.endTime()) < 30;
        }
    });
})();
