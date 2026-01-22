
export const sendPost = async(req,res)=>{
    try {
        const {channelId,squadId,content,userId,attachments} = req.body;

        if(!channelId || !squadId || !userId ){
            return res.status(404).json({message:"pls enter all channel ,squad,user id ",success:false})
        }

        const post = new Post({
            channelId,squadId,author:userId,content,
            attachments:attachments || []
        })

        const savedPost = await post.save()
        const populatedPost = await savedPost.populate('author','name profilePic')
        io.to(channelId).emit("new message",populatedPost)

        return res.status(200).json({message:"new post created",success:true,populatedPost})
    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"failed to send msg ",success:false,error:error.message})
    }
}