let allHabitsChart = []
let allRecordsChart = [];
// Get all habits from database
async function getAllHabits()
{
    const response = await fetch('/getallhabits');
    const data = await response.json();
    // console.log(data);
    return data;   
}

document.addEventListener("DOMContentLoaded", async () =>
{
    try
    {
        allHabitsChart = await getAllHabits();
    }
    catch (err)
    {
        console.log(err);
    }
    // console.log(allHabitsChart);
});

// Get all records from database
async function getAllRecords()
{
    const response = await fetch('/getallrecords');
    const data = await response.json();
    // console.log(data);
    return data;   
}
document.addEventListener("DOMContentLoaded", async () =>
{
    try
    {
        allRecordsChart = await getAllRecords();
    }
    catch (err)
    {
        console.log(err);
    }
    // console.log(allRecordsChart);

    // correct date-time from SQL to local time
    const recordCorrectedDate = new Date();
    for (record of allRecordsChart)
    {
        //console.log(record.update_time); 
        let recordCurrentDate = new Date(record.update_time);
        let localTime = recordCurrentDate.setMinutes(recordCurrentDate.getMinutes() -300);
        recordCorrectedDate.setTime(localTime);
        record.update_time = recordCorrectedDate.toISOString();
        // console.log(recordCorrectedDate.toISOString());
    }
    // initialize habit data storage of selected habit
    let selectedHabitId = 0;
    let selectedHabitName = "";
    let selectedHabitGoalNum = 0;
    let selectedHabitType = "";
    let selectedHabitDiff = 0;
    let previousDaysback = 7;
    let week = false;
    $(document).ready(function()
    {
        // ----- GET HABIT INFO AND DISPLAY HABIT LIST ----- //
  
        for (hab of allHabitsChart)
        {
            if(hab.habit_type == "good-habit")
            {
                $(".habit-select-container").append(`<div class='single-habit-block-select-good'>
                                                        <p id='recorded-habit-text'>` + hab.habit_name + `</p>
                                                    </div>`);

            }

            if(hab.habit_type == "bad-habit")
            {
                $(".habit-select-container").append(`<div class='single-habit-block-select-bad'>
                                                        <p id='recorded-habit-text'>` + hab.habit_name + `</p>
                                                    </div>`);  
            }
            
        }

        // ----- SET CLICK EVENTS FOR EACH HABIT ----- //
        $(".single-habit-block-select-good").on("click", function(e)
        {
            selectedHabitName = $(this).children("#recorded-habit-text").fadeIn(1000).text();
            previousDaysback = 7;
            $(".overview-container-header").text(selectedHabitName);
            $(".overview-container-header").fadeIn(1000);
            for (hab of allHabitsChart)
            {
                if(hab.habit_name == selectedHabitName)
                {
                    selectedHabitId = hab.habit_id;
                    selectedHabitType = hab.habit_type;
                    selectedHabitDiff = hab.difficulty;
                    if(hab.repetitions_day == -1)
                    {
                        selectedHabitGoalNum = hab.repetitions_day;
                        week = false;
                    }
                    if(hab.repetitions_week == -1)
                    {
                        selectedHabitGoalNum = hab.repetitions_day;
                        week = true;
                    }
                }
            }
            renderCalendar(selectedHabitId, selectedHabitGoalNum);
            getSelectedWeekdays(previousDaysback);
            updateChartData(myChart, selectedHabitId);
            renderInfoTab(selectedHabitId, selectedHabitGoalNum);
            getScatterPoints(progressChart, selectedHabitId);
        });
        $(".single-habit-block-select-bad").on("click", function(e)
        {
            selectedHabitName = $(this).children("#recorded-habit-text").text();
            previousDaysback = 7;
            $(".overview-container-header").text(selectedHabitName);
            for (hab of allHabitsChart)
            {
                if(hab.habit_name == selectedHabitName)
                {
                    selectedHabitId = hab.habit_id;
                    selectedHabitType = hab.habit_type;
                    selectedHabitDiff = hab.difficulty;
                    if(hab.repetitions_day == -1)
                    {
                        selectedHabitGoalNum = hab.repetitions_day;
                        week = false;
                    }
                    if(hab.repetitions_week == -1)
                    {
                        selectedHabitGoalNum = hab.repetitions_day;
                        week = true;
                    }
                }
            }
            renderCalendar(selectedHabitId, selectedHabitGoalNum);
            getSelectedWeekdays(previousDaysback);
            updateChartData(myChart, selectedHabitId);
            renderInfoTab(selectedHabitId, selectedHabitGoalNum);
            getScatterPoints(progressChart, selectedHabitId);
        });
        // go to current week
        $("#week-header").on("click", function(e)
        {
            previousDaysback = 7;
            getSelectedWeekdays(previousDaysback);
            updateChartData(myChart, selectedHabitId);
        });

        // ----- INFO TAB ----- //
        function renderInfoTab(habitId, habitGoalNum)
        {
            $("#anticipated-rep-count").text(habitGoalNum);
            let totalRepCounter = 0;
            for (record of allRecordsChart)
            {    
                if(record.habit_id == habitId)
                {
                    totalRepCounter++;
                }
            }
            $("#total-rep-count").text(totalRepCounter);

            for(habit of allHabitsChart)
            {
                if(habit.habit_id == habitId)
                {
                    let dateAddedCalendar = new Date(habit.date_added);
                    $("#date-added").text(dateAddedCalendar.toDateString());
                }
            }

            // calculate daily average repetitions
            for(habit of allHabitsChart)
            {
                if(habit.habit_id == habitId)
                {
                    let dateAddedCalendar = new Date(habit.date_added)
                    let currentDate = new Date();

                    let timeDifference = currentDate.getTime() - dateAddedCalendar.getTime();
                    let daysDifference = (timeDifference / (1000 * 3600 * 24)).toFixed(0);
                    console.log(daysDifference);
                    let averageReps = totalRepCounter / daysDifference;
                    $("#avg-rep-count").text(averageReps.toFixed(2));
                }
            }

        }


        // ----- GET DATE INFO AND RENDER CALENDAR ----- //

        const calendarDate = new Date();
        const getMonthDate = new Date();

        const renderCalendar = (habitId, habitGoalNum) =>
        {
            calendarDate.setDate(1);

            const monthDays = document.querySelector(".days");
            const lastDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
            const prevLastDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 0).getDate();
            const firstDayIndex = calendarDate.getDay();
            const lastDayIndex = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDay();
            const nextDays = 7 - lastDayIndex - 1;
            const months = [
                "January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December",
            ];

            // set current month and day
            document.querySelector('.date h1').innerHTML = months[calendarDate.getMonth()];
            document.querySelector('.date p').innerHTML = new Date().toDateString(); 

            let days = "";

            // get length of month
            let monthDates = [];
            let monthLength = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
            //console.log(monthLength);
            for(let i = 1; i <= monthLength; i++)
            {
                let newDate = new Date(calendarDate);
                let currentDay = new Date(newDate.setDate(i));
                let thisDay = new Date(currentDay.setMinutes(currentDay.getMinutes() -300));
                let dayString = thisDay.toISOString();
                monthDates.push(dayString.slice(0, 10));
            }
            let monthCounter = 0;
            let monthHabitSet = [];
            let highestRecordMonthDaily = 0;
            for (date of monthDates)
            {
                monthCounter = 0;
                for (record of allRecordsChart)
                {    
                    if(record.habit_id == habitId)
                    {
                        let updateDay = record.update_time;
                        updateDay = updateDay.slice(0, 10);

                        if(updateDay == date)
                        {
                            monthCounter++;
                            if(monthCounter > highestRecordMonthDaily)
                                highestRecordMonthDaily = monthCounter;
                        }
                    }
                }
                monthHabitSet.push(monthCounter);
            }

            // ----- DRAW DAYS CORRESPONDING TO HABIT COMPLETION ----- //

            // first days of month greyed out
            for(let i = firstDayIndex; i > 0; i--)
            {
                days += `<div class="prev-date">${prevLastDay - i + 1}</div>`;
            }
            // get date added
            let selectedDateAdded = "";
            for(hab of allHabitsChart)
            {
                if(hab.habit_id == selectedHabitId)
                {
                    selectedDateAdded = hab.date_added;
                }
            }

            for(let i = 1; i <= lastDay; i++)
            {
                // get date of added div
                let day = i;
                let addedDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
                addedDate.setMinutes(addedDate.getMinutes() - 300);
                let addedDateLocal = addedDate.toISOString().slice(0,10);

                if(selectedDateAdded.includes(addedDateLocal))
                {
                    days += `<div class="added-goal-day"><h3>Added</h3><div class="day-rep-count-hover"><h4>3 Reps</h4><i class="fa-solid fa-caret-down"></i></div></div>`;
                }
                else if(monthHabitSet[i - 1] >= habitGoalNum)
                {
                    if(selectedHabitType == "good-habit")
                        days += `<div class="completed-goal-day"><h3>${i}</h3><div class="day-rep-count-hover"><h4>3 Reps</h4><i class="fa-solid fa-caret-down"></i></div></div>`;
                    else
                        days += `<div class="completed-goal-day-bad"><h3>${i}</h3><div class="day-rep-count-hover"><h4>3 Reps</h4><i class="fa-solid fa-caret-down"></i></div></div>`;
                }
                else if(monthHabitSet[i - 1] >= 1 && monthHabitSet[i - 1] < habitGoalNum)
                {
                    days += `<div class="partial-complete-goal-day"><h3>${i}</h3><div class="day-rep-count-hover"><h4>3 Reps</h4><i class="fa-solid fa-caret-down"></i></div></div>`;
                }
                else if(i === new Date().getDate() && calendarDate.getMonth() === new Date().getMonth())
                {
                    days += `<div class="today"><h3>${i}</h3></div>`;
                }
                else
                {
                    days += `<div><h3>${i}</h3></div>`;      
                }

            }

            // last days of month greyed out
            for(let i = 1; i <= nextDays; i++)
            {
                days += `<div class="next-date">${i}</div>`;
            }
            monthDays.innerHTML = days;


            // ----- ADD HOVER TO DAYS WITH REPS > 0 TO SHOW REPS COMPLETED----- //

            $(".partial-complete-goal-day, .completed-goal-day").hover(function()
            {
                // get date of hovered div
                let day = parseInt($(this).find("h3").text());
                let hoverDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
                hoverDate.setMinutes(hoverDate.getMinutes() - 300);
                let hoverDateLocal = hoverDate.toISOString().slice(0,10);
                // get repetitions of that day
                let counter = 0;
                for(record of allRecordsChart)
                {
                    if(record.habit_id == selectedHabitId && record.update_time.includes(hoverDateLocal))
                    {
                        counter++;
                    }
                }
                if(counter > 1)
                {
                    $(this).find("h4").text(counter + " Reps");                    
                }
                else
                {
                    $(this).find("h4").text(counter + " Rep");
                }

                $(this).find(".day-rep-count-hover, i").css({
                    "visibility": "inherit",
                });
            }, function()
                {
                    $(this).find(".day-rep-count-hover, i").css({
                        "visibility": "hidden"
                    });
                });

                
            // ----- ADD CLICK TO DAYS TO SHOW WEEK GRAPH ----- //
            $(".days").find("div").click(function(e)
            {
                let day = parseInt($(this).find("h3").text());
                let clickDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
                clickDate.setMinutes(clickDate.getMinutes() - 300);
                let clickDateLocal = clickDate.toISOString().slice(0,10);
                
                // open week tab and navigate to clicked date
                openHabit(e, "Week");

                let currentDate = new Date();
                let timeDifference = currentDate.getTime() - clickDate.getTime();
                let dayOffset = (timeDifference / (1000 * 3600 * 24)).toFixed(0);
                previousDaysback = 7;
                previousDaysback += parseInt(dayOffset - 4);
                getSelectedWeekdays(previousDaysback);
                updateChartData(myChart, selectedHabitId);
            });
        }


        // ----- ADD CLICK EVENTS FOR NEXT & PREVIOUS MONTHS ----- //
        document.querySelector('.prev').addEventListener('click', () =>
        {
            if(selectedHabitName == "")
                return;
            else
            {
                calendarDate.setMonth(calendarDate.getMonth() - 1);
                renderCalendar(selectedHabitId, selectedHabitGoalNum);
            }
        });
        document.querySelector('.next').addEventListener('click', () =>
        {
            if(selectedHabitName == "")
                return;
            else
            {
                calendarDate.setMonth(calendarDate.getMonth() + 1);
                renderCalendar(selectedHabitId, selectedHabitGoalNum);
            }
        });


        // ----- TAB CLICKS ----- // 
        let tabName = "";
        $(".tablinks").on("click", function(e)
        {
            tabName = $(this).text();
            openHabit(e, tabName);
        })
        // Open "week" tab by default
        document.getElementById("defaultOpen").click();

        // ----- OPEN TAB FUNCTION ------ //
        function openHabit(evt, cityName) 
        {
            let i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
              tabcontent[i].style.display = "none";
            }
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
              tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            document.getElementById(cityName).style.display = "block";
            evt.currentTarget.className += " active";
        }

        // ----- GET DATE AND HABIT RECORD INFO FOR WEEK CHART ------ //

        let weekdays = [];
        let weekDates = [];
        let previousWeekDates = [];

        $("#week-arrow-left").on("click", function(e)
        {
            if(selectedHabitName == "")
            {
                return;
            }
            else
            {
                previousDaysback += 7;
                getSelectedWeekdays(previousDaysback);
                updateChartData(myChart, selectedHabitId);
            }

        });
        
        $("#week-arrow-right").on("click", function(e)
        {
            if(selectedHabitName == "" || previousDaysback == 7)
            {
                return;
            }
            else
            {
                previousDaysback -= 7;
                getSelectedWeekdays(previousDaysback);
                updateChartData(myChart, selectedHabitId);
            }

        });

        function getSelectedWeekdays(previousDaysBack)
        {        

            previousWeekDates.length = 0;
            weekDates.length = 0;
            weekdays.length = 0;
            for(i = 0; i < 7; i++)
            {
                const today = new Date();
                const previousToday = new Date();
                const localDate = new Date();
                const previousLocalDate = new Date();

                let adjustedDate = (previousDaysBack - 7);
                // get list of dates from last week
                let previousEachDay = previousToday.setDate(previousToday.getDate() - previousDaysBack - i);
                let previousThisDay = new Date(previousEachDay);
                let previousLocalTime = previousThisDay.setMinutes(previousThisDay.getMinutes() -300);
                previousLocalDate.setTime(previousLocalTime);
                previousWeekDates.push(previousLocalDate.toISOString().slice(0, 10));
                // get list of dates from this week
                // let eachDay = today.setDate(new Date().getDate() - (previousDaysBack - 7) - i);
                let eachDay = today.setDate(today.getDate() - adjustedDate - i);
                let thisDay = new Date(eachDay);
                let dayString = thisDay.toDateString();
                let localTime = thisDay.setMinutes(thisDay.getMinutes() -300);
                localDate.setTime(localTime);
                weekdays.push(dayString.slice(0, 10));
                weekDates.push(localDate.toISOString().slice(0, 10));
                //console.log(localDate.toISOString());
    
            }
            weekdays.reverse();
            //console.log(weekdays);
            weekDates.reverse();
            //console.log(weekDates);
            previousWeekDates.reverse();
        }


        
        // find number of records per day for a specific habit
        let previousHabitSet = [];
        let previousWeekCounter = 0;
        let currentWeekCounter = 0;
        let currentHabitSet = [];
        let counter = 0;
        let highestRecord = 0;
        // store bar graph colors
        let borderColorStr = [];
        let backgroundColorStr = [];

        function getPercentageIncrease(oldNum, newNum) 
        {
            return ((newNum - oldNum) / oldNum) * 100;
        }
        function updateChartData(chart, habitId)
        {
            backgroundColorStr.length = 0;
            borderColorStr.length = 0;
            highestRecord = 0;
            for (date of weekDates)
            {
                counter = 0;
                for (record of allRecordsChart)
                {    
                    if(record.habit_id == habitId)
                    {
                        let updateDay = record.update_time;
                        updateDay = updateDay.slice(0, 10);

                        if(updateDay == date)
                        {
                            counter++;
                            if(counter > highestRecord)
                                highestRecord = counter;
                        }
                    }
                }
                currentHabitSet.push(counter);
            }

            // get previous week's records to compare with current
            for (date of previousWeekDates)
            {
                counter = 0;
                for (record of allRecordsChart)
                {
                    if(record.habit_id == habitId)
                    {
                        let updateDay = record.update_time;
                        updateDay = updateDay.slice(0, 10);

                        if(updateDay == date)
                            counter++;
                    }
                }
                previousHabitSet.push(counter);
            }
            // get habit type
            let habitType = "";
            for (habit of allHabitsChart)
            {
                if(habit.habit_id == habitId)
                    habitType = habit.habit_type;
            }
            // add previous week's and previous week's completions separately
            previousWeekCounter = 0;
            currentWeekCounter = 0;
            for(i = 0; i < 7; i++)
            {
                previousWeekCounter += parseInt(previousHabitSet[i]);
                currentWeekCounter += parseInt(currentHabitSet[i]);
            }
            // compare previous and current numbers
            let percentIncrease = getPercentageIncrease(previousWeekCounter, currentWeekCounter).toFixed(2);
            // if % increase is >= 0
            if(percentIncrease >= 0 && percentIncrease != "Infinity")
            {
                if(habitType == "good-habit")
                {
                    $(".percent-increase-week").show();
                    $(".percent-increase-week").html(`<i class="fa-solid fa-caret-up"></i>&nbsp;&nbsp;` + Math.abs(percentIncrease) + "% this week");
                    $(".percent-decrease-week").hide();
                }
                else
                {
                    $(".percent-decrease-week").show();
                    $(".percent-decrease-week").html(`<i class="fa-solid fa-caret-up"></i>&nbsp;&nbsp;` + Math.abs(percentIncrease) + "% this week");
                    $(".percent-increase-week").hide();
                }

            }
            else if(percentIncrease == "Infinity")
            {
                if(habitType == "good-habit")
                {
                    $(".percent-increase-week").show();
                    $(".percent-increase-week").html(`<i class="fa-solid fa-caret-up"></i>&nbsp;&nbsp; <i class="fa-solid fa-infinity"></i>` + "&nbsp; this week");
                    $(".percent-decrease-week").hide();
                }
                else
                {
                    $(".percent-decrease-week").show();
                    $(".percent-decrease-week").html(`<i class="fa-solid fa-caret-up"></i>&nbsp;&nbsp; <i class="fa-solid fa-infinity"></i>` + "&nbsp; this week");
                    $(".percent-increase-week").hide();
                }

            }
            // if % increase is < 0
            else
            {
                if(habitType == "good-habit")
                {
                    $(".percent-decrease-week").show();
                    $(".percent-decrease-week").html(`<i class="fa-solid fa-caret-down"></i>&nbsp;&nbsp;` + Math.abs(percentIncrease) + "% this week");
                    $(".percent-increase-week").hide();
                }
                else
                {
                    $(".percent-increase-week").show();
                    $(".percent-increase-week").html(`<i class="fa-solid fa-caret-down"></i>&nbsp;&nbsp;` + Math.abs(percentIncrease) + "% this week");
                    $(".percent-decrease-week").hide();
                }
            }

            // get background and border color strings
            let greenBar = 'rgba(75, 192, 192, 0.2)';
            let redBar = 'rgba(255, 99, 132, 0.2)';
            let greenBorder = 'rgba(75, 192, 192, 1)';
            let redBorder = 'rgba(255, 99, 132, 1)';

            for(let i = 0; i < 7; i++)
            {
                // good habits - return red bar for goal underachievement
                if(currentHabitSet[i] < selectedHabitGoalNum && selectedHabitType == "good-habit")
                {
                    backgroundColorStr.push(redBar);
                    borderColorStr.push(redBorder);
                }
                // bad habits - return green bar for goal underachievement
                else if(currentHabitSet[i] < selectedHabitGoalNum && selectedHabitType == "bad-habit")
                {
                    backgroundColorStr.push(greenBar);
                    borderColorStr.push(greenBorder);
                }
                // bad habits - return red if goal met
                else if (currentHabitSet[i] >= selectedHabitGoalNum && selectedHabitType == "bad-habit")
                {
                    backgroundColorStr.push(redBar);
                    borderColorStr.push(redBorder);
                }
                // good habits - return green bar if goal met
                else if(currentHabitSet[i] >= selectedHabitGoalNum && selectedHabitType == "good-habit")
                {
                    backgroundColorStr.push(greenBar);
                    borderColorStr.push(greenBorder);
                }
            }

            chart.data.datasets.forEach((dataset) => 
            {
                dataset.data.push(currentHabitSet);
            });
            chart.update();
            //console.log(currentHabitSet);
            currentHabitSet.length = 0;
            previousHabitSet.length = 0;
        }


        // ----- DRAW CHART ----- //
        const ctx = document.getElementById('repetitions-chart').getContext('2d');
        Chart.defaults.font.size = 15;
        const myChart = new Chart(ctx, 
        {
            type: 'bar',
            data: 
            {
                labels: weekdays,
                datasets: 
                [{
                    label: 'Repetitions per day',
                    data: currentHabitSet,
                    backgroundColor: backgroundColorStr,
                    borderColor: borderColorStr,
                    borderWidth: 1,
                }]
            },

            options: 
            {
                responsive: true,
                plugins:
                {
                    legend: 
                    {
                        display: false,
                        labels:
                        {
                            fontSize: 35,
                            boxWidth: 50
                        }
                    },
                },

                title: 
                {
                display: true,
                text: "Habit repetitions per day"
                },
                indexAxis: 'y',
                scales:
                {

                    x: 
                    {
                        max: function()
                        {
                            if(selectedHabitGoalNum > highestRecord)
                                return selectedHabitGoalNum;
                            else
                                return highestRecord;
                        },
                        beginAtZero: true,
                        grid: 
                        {
                            color: function(context) 
                            {
                                if (context.tick.value == selectedHabitGoalNum) 
                                    return 'rgb(130, 195, 230)';
                                else 
                                    return 'rgb(67, 67, 77)';
                                return '#000000';
                            },
                        },
                        ticks:
                        {
                            callback: function(val, index) 
                            {
                                // Hide every 2nd tick label
                                return index % 2 === 0 ? this.getLabelForValue(val) : '';
                            },
                        }
                    },
                    y:
                    {
                        ticks: 
                        {
                            fontFace: 'bold'
                        },
                        grid:
                        {
                            display: false
                        }
                    }
                }
            }
        });



        // ---------- PROGRESS TAB ---------- //

        let xLabels = [];
        let scatterLabels = [];
        let lineYLabels = [];
        let dayCounterArr = [];
        let difficulty = 2;
        let habitCompleteLine = 0;

        if(difficulty == 1)
        {
            habitCompleteLine = 40;
        }

        let xPoints = [];
        let yPoints = [];

        // x-labels
        for (hab of allHabitsChart)
        {
            let counter = 0;
            if(hab.habit_id == selectedHabitId)
            {
                difficulty = hab.difficulty;
                for(record of allRecordsChart)
                {
                    if(hab.habit_id == record.habit_id)
                    {
                        counter++;
                    }
                }
            }
        }
        difficulty *= 1.5;
        // get x values
        let xValueCounter = 0;
        for(let i = 0; i < difficulty * 35; i++)
        {
            xValueCounter++;
            xLabels.push(xValueCounter);
        }
        //console.log(xLabels);

        // get prediction line y values
        for(let i = 0; i <= difficulty * 35; i++)
        {
            let eachLogValue = Math.log(i**7);
            lineYLabels.push(eachLogValue);
        }
        //console.log(lineYLabels);


        // ----- GENERATE SCATTER PLOT POINTS ----- //
        function getScatterPoints(chart, habitId)
        {
            xPoints.length = 0;
            yPoints.length = 0;
            scatterLabels.length = 0;
            dayCounterArr.length = 0;
            xLabels.length = 0;
            lineYLabels.length = 0;

            difficulty = selectedHabitDiff;
            // x-labels
            for (hab of allHabitsChart)
            {
                let counter = 0;
                if(hab.habit_id == selectedHabitId)
                {
                    difficulty = hab.difficulty;
                    for(record of allRecordsChart)
                    {
                        if(hab.habit_id == record.habit_id)
                        {
                            counter++;
                        }
                    }
                }
            }
            difficulty *= 1.5;
            // get x values
            let xValueCounter = 0;
            for(let i = 0; i < difficulty * 35; i++)
            {
                xValueCounter++;
                xLabels.push(xValueCounter);
            }
            //console.log(xLabels);

            // get prediction line y values
            for(let i = 0; i <= difficulty * 35; i++)
            {
                let eachLogValue = Math.log(i**7);
                lineYLabels.push(eachLogValue);
            }
            //console.log(lineYLabels);


            // get date added
            let dateAdded = new Date();
            for(hab of allHabitsChart)
            {
                if(hab.habit_id == habitId)
                {
                    let year = hab.date_added.slice(0,4);
                    let month = parseInt(hab.date_added.slice(5,7));
                    let day = hab.date_added.slice(8,10);
                    dateAdded.setFullYear(year, month -1, day);
                }
            }
            // get difference of days since add
            let now = new Date();
            let timeDifference = now.getTime() - dateAdded.getTime();
            let daysDifference = timeDifference / (1000 * 3600 * 24);

            // create array of record dates for habit
            let habitRecordDates = [];
            for (record of allRecordsChart)
            {
                if(record.habit_id == habitId)
                {
                    habitRecordDates.push(record.update_time);
                }
            }

            let repCounter = 0;
            // for the amount of days since habit was added
            for(i = 0; i < daysDifference; i++)
            {
                let currentDate = new Date(dateAdded);
                currentDate.setDate(dateAdded.getDate() + i);
                currentDate.setMinutes(currentDate.getMinutes() - 300);
                currentDate = currentDate.toISOString().slice(0,10);
                let dayCounter = 0;
                // get rep count by day
                for (record of allRecordsChart)
                {
                    if(record.habit_id == habitId && record.update_time.includes(currentDate))
                    {
                        dayCounter++;

                    }
                }
                repCounter = Math.log(i**7);

                xPoints.push(i);

                let x = xPoints[i];
                let y = yPoints[i];
                yPoints.push(repCounter);

                let json = {"x": x, "y": repCounter};
                scatterLabels.push(json);
                dayCounterArr.push(dayCounter);
            }
            // calculate repetition line based on activity
            let dayRepGoalOffset = 0;
            let sqrtNum = 1;
            for(i = 0; i < scatterLabels.length; i++)
            {
                dayRepGoalOffset = 0;

                // subtract amount of missed reps per day
                if(dayCounterArr[i] < 1)
                {
                    dayRepGoalOffset = selectedHabitGoalNum - dayCounterArr[i];

                    if(sqrtNum + 0.04 > 10)
                    {
                        // do nothing
                    }
                    else
                    {
                        sqrtNum += 0.04;
                        scatterLabels[i].y = Math.pow(scatterLabels[i].y, 1/sqrtNum);
                        scatterLabels[i].y -= dayRepGoalOffset;
                    }

                }
                else if(dayCounterArr[i] < selectedHabitGoalNum)
                {
                    dayRepGoalOffset = selectedHabitGoalNum - dayCounterArr[i];

                    if(sqrtNum + 0.02 > 10)
                    {
                        // do nothing
                    }
                    else
                    {
                        sqrtNum += 0.02;
                        scatterLabels[i].y = Math.pow(scatterLabels[i].y, 1/sqrtNum);
                        scatterLabels[i].y -= dayRepGoalOffset;
                    }
                }
                else
                {
                    dayRepGoalOffset = selectedHabitGoalNum - dayCounterArr[i];
                    if(sqrtNum - 0.05 < 1)
                    {
                        // do nothing
                    }
                    else
                    {
                        sqrtNum -= 0.05;
                        scatterLabels[i].y = Math.pow(scatterLabels[i].y, 1/sqrtNum);
                        scatterLabels[i].y -= dayRepGoalOffset;
                    }
                }

                // if y is negative set to zero
                if(scatterLabels[i].y < 0)
                {
                    scatterLabels[i].y = 0;
                }
                //console.log(dayRepGoalOffset);

            }

            chart.data.datasets.forEach((dataset) => 
            {
                dataset.data.push(lineYLabels, scatterLabels);
            });
            chart.update();

        }
        //console.log(scatterLabels);
        //console.log(lineYLabels);
        //console.log(dayCounterArr);



        const progressCtx = document.getElementById('progressChart').getContext('2d');
        const progressChart = new Chart(progressCtx, 
            {

            data: {
                datasets: [
                // LINE CHART
                {
                    label: 'Prediction Line',
                    data: lineYLabels,
                    pointRadius: 0,
                    type: 'line',
                    borderColor: 'rgb(42, 62, 82)',
                    order: 2,
                    tension: 0.4,
                }, 
                // SCATTER CHART
                {
                    label: 'Repetitions',
                    data: scatterLabels,
                    backgroundColor: 'rgb(255, 99, 132)',
                    type: 'scatter',
                    order: 1
                }],
                labels: xLabels
            },
            options: 
            {
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        title: 'Days',
                        display: true,
                        ticks: {
                            callback: function(value, index, ticks)
                            {
                                let habitLine = ticks[ticks.length -3].value;
                                if(ticks[index].value == habitLine)
                                {
                                    return "Habit Line";
                                }
                                //return "Rep " + value.toFixed(0);
                            },
                            stepSize: 2,
                        },
                        grid: 
                        {
                            color: 'rgb(130, 195, 230)',
                            //color: function(context) 
                            // {
                            //     let habitLineIndex = (lineYLabels.length * 0.66).toFixed(0);
                            //     let habitLine = lineYLabels[habitLineIndex];
                            //     if (context.tick.value == 30) 
                            //         return 'rgb(130, 195, 230)';
                            //     else 
                            //         return 'rgb(67, 67, 77)';
                            //     return '#000000';
                            // },
                        },
                    },
                    x: 
                    {
                        beginAtZero: true,
                        min: 0
                    },
                },
                plugins: 
                {
                    legend:
                    {
                        display: false
                    }
                }
            }
        });
    });
});