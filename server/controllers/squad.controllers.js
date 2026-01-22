import Squad from "../models/squad.js";
import User from "../models/user.js";
import Channel from "../models/channel.js"; 
import crypto from "crypto"; 
import Post from "../models/post.js";
import { log } from "console";
import { io } from "../server.js";


export const createSquad = async(req,res)=>{
    try {
        const {name,description,userId} = req.body;
        if(!name){
            return res.status(400).json({message:"no name entered",success:false})
        }
        const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        //created a new squad;

        const newSquad = new Squad({
            owner:userId,
            name,
            description,
            members:[{user:userId,role:'admin'}],
            inviteCode
        })

        const savedSquad =await newSquad.save();

        //creaated a general channel;

        const defaultChannel = new Channel({
            name:"general",
            squadId:savedSquad._id,
            type:"text",
            owner:userId
        })  
        const savedChannel = await defaultChannel.save();

        //pushing this default channel in the created squad 
        savedSquad.channels.push(
            savedChannel._id
        )

        await savedSquad.save();

        await User.findByIdAndUpdate(userId,{
            $push:{squads:savedSquad._id}
        })
        return res.status(200).json({message:"new squad created and a general channel created",success:true,squad:savedSquad,channel:savedChannel})


     } catch (error) {
        console.log(error);
        return res.status(400).json({message:"failed to create a new squad",success:false,error})
    }
}


export const joinSquad = async(req,res)=>{
     try {
        const {inviteCode,userId} = req.body;
        const squad = await Squad.findOne({inviteCode:inviteCode})
        if(!squad){
            return res.status(400).json({message:"no such squad exists",success:false});
        }


        const IsAlreadyMember = squad.members.some(m=>m.user.toString()===userId);
        if(IsAlreadyMember){
            return res.status(400).json({message:"user already a member",success:false})
        }

        squad.members.push({user:userId,role:'member'})
        await squad.save();

        await User.findByIdAndUpdate(userId,{
            $push:{squads:squad._id}
        })

        return res.status(200).json({message:"joined a new squad",squadId:squad._id,success:true,})
     } catch (error) {
        console.log(error);
        
            return res.status(400).json({message:"failed to join squad",success:false})
     }
}


export const getSquadData = async(req,res)=>{
    try {
        const {squadId} = req.params

        const SquadData = await Squad.findById(squadId).populate('owner','name profilePic').populate('channels').populate({
            path:'members.user',
            select:'name profilePic skills'
        });

        if(!SquadData){
            return res.status(400).json({message:"squad not found ",success:false})
        }

        return res.status(200).json({message:"squad found successfully",success:true,SquadData})
    } catch (error) {
        return res.status(400).json({message:"squad not found",success:false,error:error.message})
        
    }
}

export const leaveSquad = async(req,res)=>{
    try {
        const {squadId,userId} = req.body

        const squad = await Squad.findById(squadId)

        if(!squad){
            return res.status(400).json({message:"mo such squad exists",success:false});
        }

        if(squad.owner.toString()==userId){
            return res.status(400).json({message:"owner cant leave squad..make any else leader",success:false})
        }

        await User.findByIdAndUpdate(userId,{
            $pull:{squads:squadId}
        })

        await Squad.findByIdAndUpdate(squadId,{
            $pull:{members:{user:userId} }
        })

        return res.status(200).json({message:"squad leaved succesfully",success:true})

    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"unable to delete squad",success:false,error:error.message})
        
    }
}

export const transferOwnership = async(req,res)=>{
    try {
        const {squadId, newOwnerId , ownerId} = req.body;

        const squad = await Squad.findById(squadId);

        if(!squad){
            return res.status(400).json({message:"no such squad exists",sucess:false})
        }

        if(squad.owner.toString()!==ownerId){
            return res.status(400).json({message:"this is not the owner of this squad",success:false});
        }

        if(!squad.members.some(m=>m.user.toString()===newOwnerId)){
            return res.status(400).json({message:"the new leader must be the member of squad",success:false})
        }
       squad.owner=newOwnerId;

       squad.members.forEach(member=>{
        if(member.user.toString()==ownerId){
            member.role='admin'
        }
       })

        await squad.save()
       return res.status(200).json({message:"transfered ownership ",sucess:true,squad})
    } catch (error) {
        return res.status(400).json({message:"failed to transfer ownership ",success:false})
    }
}

export const deleteSquad = async(req,res)=>{
    try {
        const {userId,squadId} = req.body;

        const squad = await Squad.findById(squadId);
        if(!squad){
            return res.status(400).json({message:"no such squad exists",success:false});
        }

        if(squad.owner.toString()!==userId){
            return res.status(400).json({message:"this person is not the owner of squad so he cant delete it",success:false})
        }

        //delete reference from channel
        await Channel.deleteMany({squadId})
        //update use ids 
        await User.updateMany({squads:squadId},{
            $pull:{squads:squadId}
        })
        
        await Squad.deleteOne(squadId)
        
        return res.status(200).json({message:"squad deleted succesfully",success:true})

    } catch (error) {
        return res.status(400).json({message:"failed to delete squad ",success:false})
        
    }
}