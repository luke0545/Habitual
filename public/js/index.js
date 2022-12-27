let allHabits = [];

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
        allHabits = await getAllHabits();
    }
    catch (err)
    {
        console.log(err);
    }
    // console.log(allHabits);

    $(document).ready(function()
    {
        
        // Update habit record in database
        async function updateHabitRecord(habitToUpdate)
        {
            const sendData = {
                method: 'POST',
                headers: 
                { 
                    'Content-Type': 'application/json' 
                },
                body: habitToUpdate
            };
            
            const response = await fetch('/updatehabitrecord', sendData);
            const data = await response.json();
            // console.log(data);
        }
        // Update "completed" status by clicking button
        $(".habit-container").on("click", ".completed-button-container", function()
        {
            let habitName = $(this).siblings("#recorded-habit-text").text();
            // Find habit object from name
            for (hab of allHabits)
            {
                if(hab.habit_name == habitName)
                {
                    //console.log(JSON.stringify(hab));
                    updateHabitRecord(JSON.stringify(hab));
                }
            }

            // Change front end to update completed button number
            let currentUpdateNum = parseInt($(this).find("#completed-button-span").text());
            if(currentUpdateNum == 0)
            {
                currentUpdateNum = 1;
                $(this).find("#completed-button-span").html(currentUpdateNum);
            }
            else
            {
                currentUpdateNum += 1;
                $(this).find("#completed-button-span").html(currentUpdateNum);
            }
        });

    });

});


// ------ GET ALL RECORDS ------ //
let allRecords = [];

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
        allRecords = await getAllRecords();
    }
    catch (err)
    {
        console.log(err);
    }

    $(document).ready(function()
    {
        let newDate = new Date();
        let thisDay = new Date(newDate.setMinutes(newDate.getMinutes() -300));
        let dayString = thisDay.toISOString();
        let currentDate = dayString.slice(0, 10);
        //console.log(dayString);

        // Load items to page in jQuery
        for (hab of allHabits)
        {
            let highestRecord = 0;
            // Find habit object from id
            for (item of allRecords)
            {
                // if(highestRecord < 1 && hab.habit_id == item.habit_id)
                // {
                //     highestRecord = 0;
                // }
                // if(hab.habit_id == item.habit_id)
                // {
                //     highestRecord++;
                // }

                // get only records from current day
                if(highestRecord < 1 && hab.habit_id == item.habit_id)
                {
                    highestRecord = 0;
                }
                if(hab.habit_id == item.habit_id && item.update_time.includes(currentDate))
                {
                    highestRecord++;
                }

            }

            if(hab.habit_type == "good-habit")
            {
                $(".habit-container").append(`<div class='single-habit-block-good'>
                                                <label class='completed-button-container'>
                                                    <button type='habit-completed' class="completed-button-good"><span id="completed-button-span">` + highestRecord + `</span></button>
                                                </label>
                                                <p id='recorded-habit-text'>` + hab.habit_name +`</p>
                                                <label class="trash-container">
                                                    
                                                </label>
                                            </div>`);

            }

            if(hab.habit_type == "bad-habit")
            {
                $(".habit-container").append(`<div class='single-habit-block-bad'>
                                                <label class='completed-button-container'>
                                                    <button type='habit-completed' class="completed-button-bad"><span id="completed-button-span">` + highestRecord + `</span></button>
                                                </label>
                                                <p id='recorded-habit-text'>` + hab.habit_name +`</p>
                                                <label class="trash-container">
                                                    
                                                </label>
                                            </div>`);  
            }
            
        }


        // ----- CONTEXT MENU FUNCTIONS ----- //

        // Subtract habit record in database
        async function subtractHabitRecord(habitToUpdate)
        {
            const sendData = {
                method: 'POST',
                headers: 
                { 
                    'Content-Type': 'application/json' 
                },
                body: habitToUpdate
            };
            
            const response = await fetch('/subtracthabitrecord', sendData);
            //const data = await response.json();
            // console.log(data);
        }

        async function addCustomRecord(habitToUpdate)
        {
            const sendData = {
                method: 'POST',
                headers: 
                { 
                    'Content-Type': 'application/json' 
                },
                body: habitToUpdate
            };
            
            const response = await fetch('/addcustomrecord', sendData);
            // console.log(data);
        }

        // Remove habit from database
        async function removeHabit(habitRemove)
        {
            const sendData = {
                method: 'POST',
                headers: 
                { 
                    'Content-Type': 'application/json'
                },
                body: habitRemove
            };
            
            const response = await fetch('/removehabit', sendData);
            const data = await response.json();
            console.log(data);
        }
        

        let selectedHabitName = "";
        let currentUpdateNum = 0;

        // ----- ADD CONTEXT MENU TO EACH HABIT BLOCK ----- //
        $( ".single-habit-block-good" ).on("contextmenu", function(e) 
        {
            // close menu if open already
            $(".context-menu").fadeOut(0).css({});

            // set all original colors and change color of clicked block
            $(".single-habit-block-good").css({
                "background-color": "rgb(88, 98, 78)"
            })
            $(".single-habit-block-bad").css({
                "background-color": "rgb(109, 78, 78))"
            })
            $(this).css({
                "background-color": "rgb(70, 87, 62)"
            })

            e.preventDefault();
            var top = e.pageY-79;
            var left = e.pageX-32;
            
            // Show context menu
            $(".context-menu").slideDown(100).css({
                top: top + "px",
                left: left + "px",
                opacity: 0.6
            });
            let menu = $(".context-menu");
            menu.animate({ opacity: '100%'}, 5);

            // get habit to subtract completed from
            selectedHabitName = $(this).children("#recorded-habit-text").text();
            // get current update number
            currentUpdateNum = parseInt($(this).find("#completed-button-span").text());

        });

        $( ".single-habit-block-bad" ).on("contextmenu", function(e) 
        {
            // close menu if open already
            $(".context-menu").fadeOut(0).css({});

            // set all original colors and change color of clicked block
            $(".single-habit-block-good").css({
                "background-color": "rgb(88, 98, 78)"
            })
            $(".single-habit-block-bad").css({
                "background-color": "rgb(109, 78, 78))"
            })
            $(this).css({
                "background-color": "rgb(100, 64, 67)"
            })

            e.preventDefault();
            var top = e.pageY-79;
            var left = e.pageX-32;
            
            // Show context menu
            $(".context-menu").slideDown(100).css({
                top: top + "px",
                left: left + "px",
                opacity: 0.6
            });
            let menu = $(".context-menu");
            menu.animate({ opacity: '100%'}, 5);

            // get habit to subtract completed from
            selectedHabitName = $(this).children("#recorded-habit-text").text();
            // get current update number
            currentUpdateNum = parseInt($(this).find("#completed-button-span").text());

        });

        // on "-1" click
        $(".context-menu").on("click", ".subtract-completed", function(e)
        {
            // update front end
            // console.log(currentUpdateNum);
            if(currentUpdateNum < 1)
            {
                alert("Cannot subtract from zero...");
            }
            else
            {
                $(".single-habit-block-good:contains(" + selectedHabitName + ")").find("#completed-button-span").html(currentUpdateNum - 1);
                $(".single-habit-block-bad:contains(" + selectedHabitName + ")").find("#completed-button-span").html(currentUpdateNum - 1);


                // find habit name in array
                for (hab of allHabits)
                {
                    if(hab.habit_name == selectedHabitName)
                    {
                        // console.log(JSON.stringify(hab));
                        subtractHabitRecord(JSON.stringify(hab));
                    }
                }
            }
        });

        // Delete habit
        // Remove item from list using event delegation
        let habitName = "";
        $(".context-menu").on("click", ".delete-habit", function(e)
        {
            // Show "are you sure" modal
            $(".are-you-sure-delete").slideDown(100).css({
                opacity: 0.6
            });
            let menu = $(".are-you-sure-delete");
            menu.animate({ opacity: '100%'}, 10);

            habitName = selectedHabitName;
            //console.log(habitObjToRemove);
        });

        // on "Yes" click
        $(".are-you-sure-delete").on("click", ".are-you-sure-delete-yes", function(e)
        {
            console.log("confirmed yes on " + habitName);

            // Find habit object from name
            for (hab of allHabits)
            {
                if(hab.habit_name == habitName)
                {
                    //console.log(JSON.stringify(hab));
                    removeHabit(JSON.stringify(hab));
                }
            }
            $(".single-habit-block-good:contains(" + habitName + ")").fadeOut(250);
            $(".single-habit-block-bad:contains(" + habitName + ")").fadeOut(250);
            $(".are-you-sure-delete").fadeOut(200).css({});
        });
        // on "No" click
        $(".are-you-sure-delete").on("click", ".are-you-sure-delete-no", function(e)
        {
            $(".are-you-sure-delete").fadeOut(200).css({});
        });



        // Add previous repetition click
        $(".context-menu").on("click", ".add-completed", function(e)
        {
            // set min date to date added
            let dateAdded = new Date();
            for(habit of allHabits)
            {
                if(selectedHabitName == habit.habit_name)
                {
                    let dateAddedCalendar = new Date(habit.date_added)
                    let currentDate = new Date();

                    let timeDifference = currentDate.getTime() - dateAddedCalendar.getTime();
                    let dayOffset = (timeDifference / (1000 * 3600 * 24)).toFixed(5);
                    dateAdded.setDate(dateAdded.getDate() - dayOffset);
                }
            }
            // format dateAdded
            let day = dateAdded.getDate();
            let month = dateAdded.getMonth() + 1;
            let year = dateAdded.getFullYear();
            if(day < 10)
                day = '0' + day
            if(month < 10)
                month = '0' + month
            let dateFormatted = year + '-' + month + '-' + day;
            $(".date-picker-control").attr("min", dateFormatted);
            //document.getElementById("date-picker-control").setAttribute("min", dateAdded);
            $("#habit-name").text(selectedHabitName);
        });

        $(".add-new-rep-btn").on("click", function(e)
        {
            e.preventDefault();
            let inputDate = $(".date-picker-control").val();
            let inputHrs = parseInt($("#hr-select option:selected").text());
            let inputMin = parseInt($("#min-select option:selected").text());
            let inputAmPm = $("#am-pm option:selected").text();

            if(inputAmPm == "AM")
            {
                if(inputHrs == 12)
                    inputHrs = 0;
            }
            else
            {
                if(inputHrs == 12)
                    inputHrs = 12;

                else
                    inputHrs += 12; 
            }
            let date = new Date(inputDate);
            let adjustedDate = new Date();
            date.setDate(date.getDate() + 1);
            date.setHours(inputHrs);
            date.setMinutes(inputMin - 300);
            let dateDate = date.toISOString().slice(0, 10);
            let dateTime = date.toISOString().slice(11, 19);
            let formattedDate = dateDate + " " + dateTime;

            //console.log(formattedDate);

            // find habit name in array
            for (hab of allHabits)
            {
                if(hab.habit_name == selectedHabitName)
                {
                    let jsonSendObj = hab;
                    jsonSendObj["dateTime"] = formattedDate;
                    //console.log(JSON.stringify(jsonSendObj));
                    addCustomRecord(JSON.stringify(jsonSendObj));
                }
            }

            // adjust front-end
            $(".add-previous-completed-modal").fadeOut(200);
            $("#date-time-select").slideUp(250);

            if(dateDate.includes(currentDate))
            {
                $(".single-habit-block-good:contains(" + selectedHabitName + ")").find("#completed-button-span").html(currentUpdateNum + 1);
                $(".single-habit-block-bad:contains(" + selectedHabitName + ")").find("#completed-button-span").html(currentUpdateNum + 1);
            }
        });

        // hide context menu if user left clicks anywhere
        $( "body" ).click(function()
        {
            $(".context-menu").fadeOut(200).css({});

            $(".single-habit-block-good").css({
                "background-color": "rgb(88, 98, 78)"
            })
            $(".single-habit-block-bad").css({
                "background-color": "rgb(109, 78, 78)"
            })

        });
        $(".plus-btn").click(function(e)
        {
            e.preventDefault();
            $(".type-habit-container-modal").fadeIn(100);
            $("#new-habit-form").slideDown(250);

        });
        $(".close-modal").click(function(e)
        {
            e.preventDefault();
            $(".type-habit-container-modal").fadeOut(200);
            $("#new-habit-form").slideUp(250);
            $(".add-previous-completed-modal").fadeOut(200);
            $("#date-time-select").slideUp(250);
        });

        // ----- DATE TIME MODAL ----- //
        // on "-1" click
        $(".context-menu").on("click", ".add-completed", function(e)
        {
            $(".add-previous-completed-modal").fadeIn(100);
            $("#date-time-select").slideDown(250);
        });
    });
});
