import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";


export const signup = async(req, res) => {
    try{
        const {fullName, username, email, password} = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailRegex.test(email)){
           return res.status(400).json({ error: "Invalid email format"});
        }

        const existingUser = await User.findOne({ username });
        if(existingUser){
           return res.status(400).json({ error: "Username is alreay Taken"});
           
        }

        const existingEmail = await User.findOne({ email });
        if(existingEmail){
           return res.status(400).json({ error: "Emial is alreay taken "});

        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword

        })
        
        if(newUser){
            
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
            })
        }

        else{
            console.log("Error in signup Controller", error.message);
            res.status(400).json({error : "Invalid user data"});
        }


    }
    catch(error){
        console.error("Error in signup Controller:", error.message); // Log the error for debugging
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const login = async(req, res) => {
    try{
        const {username , password} = req.body;
        const user = await User.findOne({username});

        const isPasswordcorrect = await bcrypt.compare(password, user?.password || " ");

        if(!user || !isPasswordcorrect ){
           return res.status(400).json({error : "Invalid username or password"})
        }

        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        })
    }
    catch(error){
        console.error("Error in login Controller:", error.message); // Log the error for debugging
        res.status(500).json({ error: "Internal Server Error" });
    }
}


export const logout = async(req, res) => {
    try{
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({message : "Loggged out successfully"});
    }
    catch(error){
        console.error("Error in logout Controller:", error.message); // Log the error for debugging
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getMe = async(req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);

    }
    catch(error){
        console.error("Error in logout controller :" , error.message);
        return res.status(500).json({error : "Internal server error"})
    }
}

// vmoU5UYwNP3Bpfqr