'use strict'

let habits = [];
const HABIT_KEY = 'HABIT_KEY';
let globalActiveHabitId;

/* page */

const page = {
    menu: document.querySelector('.panel-menu__list'), 
    header: {
        h1: document.querySelector('.h1'),
        progressPercent: document.querySelector('.progress-text__percent'),
        progressCoverBar: document.querySelector(".progress-bar__cover")
    },
    content: {
        daysContainer: document.getElementById('days'),
        nextDay: document.querySelector('.habit-day')
    },
    popup: {
        index: document.getElementById('add-habit-popup'), 
        iconField: document.querySelector('.popup-form input[name="icon"]')
    }
}

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

function togglePopup () {
    if (page.popup.index.classList.contains('cover-hidden')) {
        page.popup.index.classList.remove('cover-hidden');
    } else {
        page.popup.index.classList.add('cover-hidden');
    }
    page.popup.index.classList.toggle('active');

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            togglePopup();
        }
    });
}

function resetForm (form, fields) {
    for (const field of fields) {
        form[field].value = '';
    }
}

function validateAndGetFormData (form, fields) {
    const formData = new FormData(form);
    const res = {};
    for (const field of fields) {
        const fieldValue = formData.get(field);
        form[field].classList.remove('error');
        if (!fieldValue) {
            form[field].classList.add('error');
        }
        res[field] = fieldValue;
    }
    let isValid = true;
    for (const field of fields) {
        if (!res[field]) {
            isValid = false;
        }
    }
    if (!isValid) {
        return;
    }
    return res;
}

/* render */

function rerenderMenu(activeHabitId) {

    for (const habit of habits) {
        const existed = document.querySelector(`[menu-habit-id="${habit.id}"]`);

        if (!existed) {
            const element = document.createElement('button');
            element.setAttribute('menu-habit-id', habit.id);
            element.classList.add('panel-menu__list-item');

            element.addEventListener('click', () => rerender(habit.id));

            element.innerHTML = `<img src="images/icon-${habit.icon}.svg" alt="${habit.name}">`;

            if (activeHabitId === habit.id) {
                element.classList.add('panel-menu__list-item--active');
            }

            page.menu.appendChild(element);
            continue;
        } 
        if (activeHabitId === habit.id) {
            existed.classList.add('panel-menu__list-item--active');
        } else {
            existed.classList.remove('panel-menu__list-item--active');
        }
    }
}

function rerenderHead (activeHabit) {
    page.header.h1.innerText = activeHabit.name;
    const progress = activeHabit.days.length / activeHabit.target > 1
        ? 100
        : activeHabit.days.length / activeHabit.target * 100;
    page.header.progressPercent.innerText = progress.toFixed(0) + '%';
    page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function rerenderContent (activeHabit) {
    page.content.daysContainer.innerHTML = '';
    for (const index in activeHabit.days) {
        const element = document.createElement('div');
        element.classList.add('habit');
        element.innerHTML = `<div class="habit-day">День ${Number(index) + 1}</div>
                        <div class="habit-comment">${activeHabit.days[index].comment}</div>
                        <button class="habit-delete"  onclick="deleteDay(${index})">
                            <img src="images/icon-delete.svg" alt="delete day ${index + 1}">
                        </button>`
        page.content.daysContainer.appendChild(element);
    }
    page.content.nextDay.innerHTML = `День ${activeHabit.days.length + 1}`;
}

function renderEmptyState() {
    page.header.h1.innerText = 'Немає звичок';
    page.header.progressPercent.innerText = '0%';
    page.header.progressCoverBar.style.width = '0%';
    document.querySelector('.habit').innerHTML = '';

    page.content.daysContainer.innerHTML = `
        <div class="empty-state">
            <p>Привіт! Давай створимо твою першу звичку разом 🙌</p>
            <button class="empty-state__button" onclick="togglePopup()">Додати першу</button>
        </div>
    `;

    page.content.nextDay.innerHTML = '';

}

function rerender (activeHabitId) {
    globalActiveHabitId = activeHabitId;
    const activeHabit = habits.find(habit => habit.id === activeHabitId);

    if (!activeHabit) {
        return;
    }

    document.location.replace(document.location.pathname + '#' + activeHabitId);

    rerenderMenu(activeHabitId);
    rerenderHead(activeHabit);
    rerenderContent(activeHabit);
}

/* work with days */

function addDays (event) {
    event.preventDefault();

    const data = validateAndGetFormData(event.target, ['comment']);

    if (!data) {
        return;
    }
    
    habits = habits.map(habit => {
        if(habit.id === globalActiveHabitId) {
            return {
                ...habit,
                days: habit.days.concat([{comment: data.comment}])
            }
        }
        return habit;
    });
    resetForm(event.target, ['comment']);
    rerender(globalActiveHabitId);
    saveData();
}

function deleteDay(index) {
	habits = habits.map(habit => {
		if (habit.id === globalActiveHabitId) {
			habit.days.splice(index, 1);
			return {
				...habit,
				days: habit.days
			};
		}
		return habit;
	});
	rerender(globalActiveHabitId);
	saveData();
}

/* working with habits */

function setIcon (context, icon) {
    page.popup.iconField.value = icon;
    const activeIcon = document.querySelector('.icon.icon-active');
    activeIcon.classList.remove('icon-active');
    context.classList.add('icon-active');
}

function addHabit(event) {
    event.preventDefault();
    const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
    if (!data) {
        return;
    }
    const maxId = habits.reduce((acc, habit) => acc > habit.id ? acc : habit.id, 0);
    habits.push({
        id: maxId + 1,
        name: data.name,
        target: data.target,
        icon: data.icon,
        days: []
    });
    resetForm(event.target, ['name', 'target']);
    togglePopup();
    saveData();
    rerender(maxId + 1);
}

/* init */

(() => {
    loadData();

    if (habits.length === 0) {
        renderEmptyState(); 
        return;
    }

    const hashId = Number(document.location.hash.replace('#', ''));
    const urlHabit = habits.find(habit => habit.id == hashId);
    if (urlHabit) {
        rerender(urlHabit.id);
    } else {
        rerender(habits[0].id);
    }
})();

