import Squad from "../models/squad";
import Channel from '../models/channel.js'
import io from '../server.js'
import Post from '../models/post.js'
import User from "../models/user.js";


export const createChannel = async (req,res)=>{
    try {
        const {name,type,description,squadId,userId} = req.body;
        
        const squad = await Squad.findById(squadId)

        if(!squad){
            return res.status(404).json({message:"no such squad exists",success:false})
        }

        const isAuthorized = squad.owner.toString()==userId || squad.members.some(m=>m.user.toString()==userId && m.role=='admin')

        if(!isAuthorized){
            return res.status(400).json({message:"the user is not authorized to bew and admin",success:false})
        }

        const alreadyChannel = await Channel.findOne({name,squadId})
        if(alreadyChannel){
            return res.status(400).json({message:"this channell already exists",success:false})
        }

        const newChannel = new Channel({
            name,
            type,
            description:description || "",
            squadId,
            owner:userId,
            users:[userId]

        })
        await newChannel.save()

       await Squad.findByIdAndUpdate(squadId,{
        $push:{channels:newChannel._id}
       })
        io.to(squadId).emit("channelCreated",{
            message:"new channel created",
            channel:newChannel
        })

        return res.status(200).json({message:"new channel created",success:true,channel:newChannel})
        
    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"failed to create new channel",success:false})
    }
}

export const getSquadChannels = async(req,res)=>{
    try {
        const {squadId,userId} = req.body;

        const squad = await Squad.exists({_id:squadId})

        if(!squad){
            return res.status(400).json({message:"no such squad exists",success:false})
        }

        const channels  = await Channel.find({squadId,$or:[
            {type:"text"},{users:userId}
        ]}).sort({createdAt:1})
        

        return res.status(200).json({message:"all channels fetched",channels,success:true})
        

    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"failed to fetch channels",success:false})
    }
}

export const deleteChannel = async(req,res)=>{
    try {
        const {squadId,userId,channelId} =req.body;
        
        const squad = await Squad.findById(squadId)
        if(!squad){
            return res.status(400).json({message:"no such squad exists",success:false})
        }
        const channel = await Channel.findById(channelId)
        if(!channel){
            return res.status(400).json({message:"no such channel exists",success:false})
        }

       const isAuthorized = squad.owner.toString()==userId || squad.members.some(m=>m.user.toString()==userId && m.role=='admin') || channel.owner.toString()==userId
        
       if(!isAuthorized){
        return res.status(400).json({message:"user is not authorised to delete channel",success:false})
       }

       await Squad.findByIdAndUpdate(squadId,{
        $pull:{channels:channelId}
       })

       await Channel.findByIdAndDelete(channelId);
       await Post.deleteMany({channelId})

       io.to(squadId).emit("channelDeleted",{
        message:" channel deleted successfully",
        channelId:channelId
       })
       
       return res.status(200).json({message:"channel deleted successfully",success:true})
    } catch (error) {
        return res.status(400).json({message:"failed to delete channel",success:false})
    }
}

export const updateChannel = async(req,res)=>{
    try {
        const {name,type,owner,userId,channelId,squadId}= req.body;

        const squad = await Squad.findById(squadId)
        if(!squad){
            return res.status(404).json({message:"no such squad exists",success:false})
        }



        const channel = await Channel.findById(channelId) 
        if(!channel){
            return res.status(400).json({message:"no such channel exists",success:false})
        }

        const isAuthenticated = channel.owner.toString()===userId || squad.owner.toString()===userId || squad.members.some(m=>m.user.toString()===userId && m.role==='admin') 

        if(!isAuthenticated){
            return res.status(400).json({message:"this user is not allowed to edit channel details",success:false})
        }

        const updateChannel = await Channel.findByIdAndUpdate(channelId,{
            name:name || channel.name,
            type:type || channel.type,
            owner:owner || channel.owner
        },{new:true})

        io.to(squadId).emit("channelUpdated",{
            message:"channel updated successfully",
            channel:updateChannel
        })

        return res.status(200).json({message:"channel updated successfully",success:true,channel:updateChannel})

    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"faiuled to update channel",success:false})
    }
}

export const getChannelDetails = async(req,res)=>{
    try {
        const {channelId} = req.params;
        const channel = await Channel.findById(channelId).populate("messages")

        if(!channel){
            return res.status(400).json({message:"no such channel exists",success:false})
        }

        return res.status(200).json({message:"channel details fetched successfully",success:true,channel:channel})
    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"faild to fetch channel details",success:false})
        
    }
}

export const getChannelMembers = async (req, res) => {
    try {
        const { channelId } = req.params;

        // 1. Channel dhoondo aur seedha uske 'users' array ko populate karo
        const channel = await Channel.findById(channelId).populate({
            path: "users", // Jo tere schema mein field ka naam hai
            select: "username profileImage status" // Password wagera mat mangwana
        });

        if (!channel) {
            return res.status(404).json({ message: "Channel nahi mila bhai!", success: false });
        }

        // 2. Return the populated users array
        return res.status(200).json({ 
            message: "Channel users fetched successfully", 
            success: true, 
            users: channel.users 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Users fetch karne mein error", success: false });
    }
};