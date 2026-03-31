'use strict'

let habits = [];
const HABIT_KEY = 'HABIT_KEY';

/* utils */

function loadData() {
    const habitsString = localStorage.getItem(HABIT_KEY);
    const habitArray = JSON.parse(habitsString);
    if (Array.isArray(habitArray)) {
        habits = habitArray;
    }
}

function saveData() {
    localStorage.setItem(HABIT_KEY, JSON.stringify(habits));
}

/* render */

function rerenderMenu (activeHabitId) {
    if (!activeHabitId) {
        return;
    }

    
}

/* init */

(() => {
    loadData();
})();

