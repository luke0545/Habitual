// ----- ADD HABIT ----- //
class Habit
{
    constructor(habit_name, habit_type, difficulty, date_added, habit_id, repetitions_week, repetitions_day)
    {
        this.habit_name = habit_name;
        this.habit_type = habit_type;
        this.difficulty = difficulty;
        this.date_added = date_added;
        this.habit_id = habit_id;
        this.repetitions_day = repetitions_day;
        this.repetitions_week = repetitions_week;
    }
}
// ----- ADD HABIT TO DATABASE ----- //
    async function addHabit(habitNew)
    {
        const sendData = {
            method: 'POST',
            headers: 
            { 
                'Content-Type': 'application/json' 
            },
            body: habitNew
        };
        
        const response = await fetch('/addhabit', sendData);
        const data = await response.json();
        // console.log(data);
    }

// ----- JQUERY ADD HABIT TO FRONTEND ----- //
$(document).ready(function()
{
    // hide initial block
    $(".single-habit-block-good").hide();

    // add habit btn click
    $("#add-to-list").on("click", function(e)
    {
        e.preventDefault();
        // get and set input value to habit name
        const habitName = document.getElementById("habit-title").value;
        // get repetitions
        const repetitions = document.getElementById("habit-repetitions").value;

        // if data is not entered
        if(habitName == "" || repetitions == "")
        {
            $("#habit-repetitions").css({
                "border-color": "rgb(217, 233, 245)"
            }); 
            $("#habit-title").css({
                "border-color": "rgb(217, 233, 245)"
            }); 
            if(repetitions == "")
            {
                $("#habit-repetitions").css({
                    "border-color": "red"
                });                
            }
            if(habitName == "")
            {
                $("#habit-title").css({
                    "border-color": "red"
                }); 
            }
        }
        else
        {
            $("#recorded-habit-text").text(habitName);

            // create new single-habit-block element //
            const newHabit = new Habit();
            newHabit.habit_name = habitName;
            
            if($("#good-habit-radio").prop("checked"))
            {
                newHabit.habit_type = "good-habit";
                $(".habit-container").append(`<div class='single-habit-block-good'>
                                                <label class='completed-button-container'>
                                                    <button type='habit-completed' class="completed-button-good"><span id="completed-button-span">` + 0 + `</span></button>
                                                </label>
                                                <p id='recorded-habit-text'>` + newHabit.habit_name +`</p>
                                                <label class="trash-container">
                                                    
                                                </label>
                                            </div>`);

            }

            if($("#bad-habit-radio").prop("checked"))
            {
                newHabit.habit_type = "bad-habit";
                $(".habit-container").append(`<div class='single-habit-block-bad'>
                                                <label class='completed-button-container'>
                                                    <button type='habit-completed' class="completed-button-bad"><span id="completed-button-span">` + 0 + `</span></button>
                                                </label>
                                                <p id='recorded-habit-text'>` + newHabit.habit_name +`</p>
                                                <label class="trash-container">
                                                    
                                                </label>
                                            </div>`);  
            }
            // Setting difficulty
            if($("#diff-1-radio").prop("checked"))
                newHabit.difficulty = 1;
            if($("#diff-2-radio").prop("checked"))
                newHabit.difficulty = 2;
            if($("#diff-3-radio").prop("checked"))
                newHabit.difficulty = 3;
            if($("#diff-4-radio").prop("checked"))
                newHabit.difficulty = 4;
            if($("#diff-5-radio").prop("checked"))
                newHabit.difficulty = 5;

            // get Date added
            const date = new Date();
            let z = date.getTimezoneOffset() * 60 * 1000;
            let dateLocal = date - z;
            dateLocal = new Date(dateLocal);
            let iso = dateLocal.toISOString();
            iso = iso.slice(0, 19);
            iso = iso.replace('T', ' ');
            newHabit.date_added = iso;
            // console.log(iso);

            // convert repetitions to int
            let repetitionsInt = parseInt(repetitions);
            let repType = $("#per-day-week option:selected").val();
            if(repType == "day")
            {
                newHabit.repetitions_day = repetitionsInt;
                newHabit.repetitions_week = -1;
            }
            if(repType == "week")
            {
                newHabit.repetitions_week = repetitionsInt;
                newHabit.repetitions_day = -1;                
            }

            console.log(JSON.stringify(newHabit));

            // add habit object to server
            addHabit(JSON.stringify(newHabit));
            
            // clear input fields
            $("#habit-title").val("");
            $("habit-repetitions").val("");

            // Close modal on add click
            $(".type-habit-container-modal").fadeOut(200);
            $("#new-habit-form").slideUp(200);

        }

    });

});