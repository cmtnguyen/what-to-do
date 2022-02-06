const Task = require('../models/task');
const User = require('../models/user');

const priorities = ['low', 'medium', 'high']; //arr of priorities

//date check
let today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0'); //Jan is 1
const yyyy = today.getFullYear();
const hh = String(today.getHours()).padStart(2, '0');
let min = String(today.getMinutes()).padStart(2, '0');
today = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
console.log(today); //gets today's date

let transformMonth = (month) => {
    switch (month) {
        case 1:
            return 'Jan';
        case 2:
            return 'Feb';
        case 3:
            return 'Mar';
        case 4:
            return 'Apr';
        case 5:
            return 'May';
        case 6:
            return 'Jun';
        case 7:
            return 'Jul';
        case 8:
            return 'Aug';
        case 9:
            return 'Sep';
        case 10:
            return 'Oct';
        case 11:
            return 'Nov';
        default:
            return 'Dec';

    }
}

let twelveHour = (hour, min) => {
    if (min < 10) {
        min = String(min).padStart(2, '0')
    }
    if (hour === 0) {
        return `12:${min} AM`; //12AM
    }
    else if (hour < 12) { // 1-11AM
        if (hour < 10) {
            return `0${hour}:${min} AM`;
        }
        return `${hour}:${min} AM`;
    }
    else if (hour === 12) { //12PM
        return `${hour}:${min} PM`;
    }
    else if (hour < 24) { //1-11 PM
        let changedHour = hour - 12;
        if (changedHour < 10) {
            return `0${changedHour}:${min} PM`;
        }
        return `${changedHour}:${min} PM`;
    }

}

//transforms yyyy-MM-ddThh:mm to month dd, yyyy @ hh:min am/pm
let transformDate = (date) => {
    let month = transformMonth(date.getMonth());
    let time = twelveHour(date.getHours(), date.getMinutes());
    let format = `${month} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()} @ ${time}`;
    return format;
}

module.exports.index = async (req, res) => {
    const user = await User.findById(req.user._id);
    const taskDeadlines = [];
    const { priority, deadline } = req.query;
    if (deadline) {
        const tasks = await Task.find({ _id: { $in: user.tasks } }.sort({ deadline: -1 }));
        for (const task of tasks) {
            if (task.deadline) {
                taskDeadlines.push(transformDate(task.deadline));
            }
        }
        res.render('tasks/index', { tasks, priority: '', taskDeadlines });
    }
    if (priority) {
        const tasks = await Task.find({ _id: { $in: user.tasks }, priority });
        for (const task of tasks) {
            if (task.deadline) {
                taskDeadlines.push(transformDate(task.deadline));
            }
        }
        res.render('tasks/index', { tasks, priority, taskDeadlines });
    } else {
        const tasks = await Task.find({ _id: { $in: user.tasks } });
        for (const task of tasks) {
            if (task.deadline) {
                taskDeadlines.push(transformDate(task.deadline));
            }
        }
        res.render('tasks/index', { tasks, priority: '', taskDeadlines });
    }
}

module.exports.taskChecked = async (req, res) => { //updates the task to include checks
    const { id } = req.params;
    if (req.body.task) { // Runs if the box is not undefined
        await Task.findByIdAndUpdate(id, { checked: true }, { runValidators: true });
    } else {
        await Task.findByIdAndUpdate(id, { checked: false }, { runValidators: true });
    }
    res.redirect('/tasks');
}

module.exports.renderNew = (req, res) => { //creates new task
    res.render('tasks/new', { priorities });
}

module.exports.createNew = async (req, res) => { //adds task to db
    const newTask = new Task(req.body.task);
    console.log(newTask);
    const user = await User.findById(req.user._id);
    user.tasks.push(newTask._id);
    await newTask.save();
    await user.save();
    res.redirect(`/tasks/${newTask._id}`);
}

module.exports.viewTask = async (req, res) => {
    const user = await User.findById(req.user._id);
    const { id } = req.params;
    const found = await Task.findOne({ _id: { $in: user.tasks, $eq: id } });
    if (found.deadline) {
        const taskDeadline = transformDate(found.deadline);
        res.render('tasks/show', { task: found, taskDeadline });
    } else {
        res.render('tasks/show', { task: found });
    }

}

module.exports.renderUpdate = async (req, res) => { //finds the task to edit
    const user = await User.findById(req.user._id);
    const { id } = req.params;
    const found = await Task.findOne({ _id: { $in: user.tasks, $eq: id } });
    res.render('tasks/edit', { task: found, priorities });
}

module.exports.updateTask = async (req, res) => { //updates the task
    const { id } = req.params;
    const task = await Task.findByIdAndUpdate(id, { ...req.body.task }, { runValidators: true });
    req.flash('success', `Successfully updated your task!`);
    res.redirect(`/tasks/${task._id}`);
}

module.exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    await user.updateOne({ $pull: { tasks: id } });
    const deleteTask = await Task.findByIdAndDelete(id);
    res.redirect('/tasks');
}