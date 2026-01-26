import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: { 
        type: String,
        default: ""
    },
    squadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Squad",
        required: true
    },
    type: {
        type: String,
        enum: ["text", "post"], // Text for chat, Post for feed-like feel
        default: "text"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    users: [{
         type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
    // "messages" field yahan se hata di hai (Virtual use karenge)
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// Virtual Populate: Ye bina database load badhaye .populate("messages") ko support karega
ChannelSchema.virtual('messages', {
    ref: 'Post',             // Post model se data aayega
    localField: '_id',       // Channel ki apni ID
    foreignField: 'channelId' // Post model mein jo field channel ko point karti hai
});

const Channel = mongoose.model("Channel", ChannelSchema);

export default Channel;