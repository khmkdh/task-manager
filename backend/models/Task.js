const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {    
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium',
    },
    dueDate: {
        type: Date,
        default: null,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);