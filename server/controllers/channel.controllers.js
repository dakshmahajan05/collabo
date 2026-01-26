import Squad from "../models/squad";
import Channel from '../models/channel.js'
import io from '../server.js'

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

        })
        await newChannel.save()

       await Squadquad.findByIdAndUpdate(squadId,{
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
        const {squadId} = req.body;

        const squad = await Squad.exists({_id:squadId})

        if(!squad){
            return res.status(400).json({message:"no such squad exists",sucess:false})
        }

        const channels  = await Channel.find({squadId}).sort({createdAt:1})
        

        return res.status(200).json({message:"all channels fetched",channels,success:true})
        

    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"failed to fetch channels",success:false})
    }
}



