import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  password: { type: String, required: [true, 'Password is required'] },

  healthProfile: {
    age: { type: Number },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    heartRate: { type: String },
    pulseRate: { type: String },
    illnessDescription: { type: String },
    medicalReport: {
      fileType: { type: String, enum: ['PDF', 'Image', 'X-ray', 'None'] },
      fileUrl: { type: String } // Cloudinary URL or local path
    }
  }
}, { timestamps: true });

// Pre-save hook: Hash password securely using bcrypt before saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return ;
  this.password = await bcrypt.hash(this.password, 10);
  
});

// Custom method to compare passwords during login
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// userSchema.methods.generateAccessToken = function(){
//     return jwt.sign({
//         _id:this.id,
//         email:this.email,
//         username:this.username,
//         fullname:this.fullname,
//         phone:this.phone
//     },process.env.ACCESS_SECRET_TOKEN,
//     {
//         expiresIn:process.env.ACCESS_TOKEN_EXPIRY
//     }
// )
// }

// userSchema.methods.generateRefreshToken = function(){
//     return jwt.sign({
//         _id:this.id,
        
//     },process.env.REFRESH_SECRET_TOKEN,
//     {
//         expiresIn:process.env.REFRESH_TOKEN_EXPIRY
//     }
// )
// }

export const User = mongoose.model('User', userSchema);