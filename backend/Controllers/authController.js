const User = require('../config/userModel');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


let register = async(req, res) => {
  try {
    const {name, email, password,role} = req.body;
    const existingUser = await User.findOne({email});
    if(existingUser) {
      return res.status(400).json({message: "User already exist with this email!"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      email: email,
      password: hashedPassword,
      role: role
    })
    await newUser.save();
    res.status(201).json({message: "User registered successfully!"});
  }
  catch(error) {
    console.log("Error while Registering: ", error);
    res.status(500).json({message: "internal server error"})
  }
}

let login = async(req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
      return res.status(400).json({
        message: "User not exits!"
      })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid password!"
      })
    }
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1d"});
    res.status(200).json({message: "User logged in successfully!", token, role: user.role});

  } catch(error) {
    console.log("Error while login: ", error);
    res.status(500).json({message: "internal server error"})
  }
}

let logout = async(req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({message: "User logged out successfully!"});
  } catch(error) {
    console.log("Error while logout: ", error);
    res.status(500).json({message: "internal server error"})
  }
}

let getAllAgents = async(req, res) => {
  try {
    const agents = await User.find({ role: 'Agent' }).select('-password');
    res.status(200).json({ agents });
  } catch(error) {
    console.log("Error fetching agents: ", error);
    res.status(500).json({ message: "internal server error" });
  }
}

module.exports = {register, login, logout, getAllAgents};