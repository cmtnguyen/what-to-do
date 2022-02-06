const mongoose = require('mongoose');
const { Schema } = mongoose;

const taskSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        required: true,
        lowercase: true,
        enum: ['low', 'medium', 'high']
    },
    deadline: {
        type: Date,
        min: Date.now
    },
    checked: {
        type: Boolean
    }
})

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;