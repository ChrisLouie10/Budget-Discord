const mongoose = require("mongoose");
mongoose.set('useCreateIndex', true);

const chatLogSchema = new mongoose.Schema({
    text_channel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TextChannel",
        required: true,
        indexed: true
    },
    chat_log: [{
        content: String,
        author: String,
        index: Number,
        timestamp: Date
    }]
});

module.exports = mongoose.model("ChatLog", chatLogSchema);