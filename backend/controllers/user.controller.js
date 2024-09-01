import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import {v2 as cloudinary} from "cloudinary";


export const getUserProfile = async(req, res) => {
    const {username} = req.params;

    try{
        const user = await User.findOne({username}).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json(user);
    }
    catch(error){
        console.log("Error in getUserprofile:", error.message)
        res.status(500),json({error : error.message});
    }
}


export const followUnfollowUser = async(req, res) => {
    try{
        const {id} = req.params;
        const userTomodify = await User.findById(id);

        const currentUser = await User.findById(req.user._id);

        if(id == req.user._id.toString()) {
            return res.status(400).json({error : "You can't follow/unfollow yourself"});
        }

        if(!userTomodify || !currentUser) return res.status(400).json({error: "User not found"});

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){
            //unfollow the user
            await User.findByIdAndUpdate(id, {$pull : {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$pull : {following: id}});

            res.status(200).json({message : "User unfollowed successfully"})
        }
        else{
            //follow the user
            await User.findByIdAndUpdate(id, {$push : {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$push : {following: id}});

            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userTomodify._id,
            });

            await newNotification.save();
            res.status(200).json({message : "User followed successfully"})
        }
    }

    
    catch(error){
        console.log("Error in followorunfllow:", error.message)
        res.status(500).json({error : error.message});
    }
}



export const getSuggestedUsers = async (req, res) => {
    try {
      const { _id: userId } = req.user;
      const userFollowedByMe = await User.findById(userId).select('following');
  
      if (!userFollowedByMe) {
        throw new Error('User not found');
      }
  
      const users = await User.aggregate([
        {
          $match: {
            _id: { $ne: userId },
          },
        },
        { $sample: { size: 10 } },
      ]);
  
      const filteredUsers = users.filter((user) => !userFollowedByMe.following.includes(user._id));
      const suggestedUsers = filteredUsers.slice(0, 4);
  
      // Remove sensitive information (password) from the response
      suggestedUsers.forEach((user) => delete user.password);
  
      res.status(200).json(suggestedUsers);
    } catch (error) {
      console.error('Error in getsuggested:', error.message);
      res.status(500).json({ error: error.message });
    }
  };


export const updateUserProfile = async (req, res) => {
    const { fullName, username, email, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;
    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check for password requirements
        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please provide both current and new Password" });
        }

        // Handle password update
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Handle image uploads
        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }

        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        // Update user fields
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        // Save the updated user
        user = await user.save();

        // Remove password from the response
        user.password = null;

        return res.status(200).json(user);

    } catch (error) {
        console.log("Error in updateUser:", error.message);
        return res.status(500).json({ error: error.message });
    }
};



