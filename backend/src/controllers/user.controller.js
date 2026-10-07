import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }


  } catch (error) {
    throw new apiError(500, "Something went wrong while generating referesh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // 1. Destructure fields sent from frontend RegisterPage
  const { username, name, email, phone, gender, password } = req.body;

  // 2. Validate that fields are not empty
  if (!name || !username || !email || !phone || !gender || !password) {
    throw new apiError(400, 'All fields are required');
  }

  // 3. Check if user already exists with this email
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new apiError(409, 'User with this email or username already exists');
  }

  // 4. Create user in database (Password hashing happens automatically via userSchema.pre('save'))
  const user = await User.create({
    name,
    username,
    email,
    phone,
    gender,
    password
  });

  // 5. Fetch created user while omitting the password field for security
  const createdUser = await User.findById(user._id).select('-password');

  if (!createdUser) {
    throw new apiError(500, 'Something went wrong while registering the user');
  }

  // 6. Return standardized success response to frontend
  return res.status(201).json(
    new apiResponse(201, createdUser, 'User registered successfully')
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Validate fields
  if ((!email && !username) || !password) {
    throw new apiError(400, 'Email and password are required');
  }

  // Find user by email
  const user = await User.findOne({
    $or: [
      ...(email ? [{ email }] : []),
      ...(username ? [{ username }] : [])
    ]
  });

  if (!user) {
    throw new apiError(404, 'User does not exist with this email or username');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, 'Incorrect Password');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1 // this removes the field from document
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new apiError(401, "unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_SECRET_TOKEN
    )

    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new apiError(401, "Invalid refresh token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Refresh token is expired or used")

    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      )
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid refresh token")
  }

})


const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body



  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new apiError(400, "Invalid old password")
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Password changed successfully"))
})


const updateHealthProfile = asyncHandler(async (req, res) => {
  const { userId, age, bloodGroup, heartRate, pulseRate, illnessDescription, fileType, fileUrl } = req.body;

  if (!userId) {
    throw new apiError(400, 'User ID is required to update health profile');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new apiError(404, 'User not found');
  }

  // Build update object dynamically (only update fields that are actually provided)
  const healthUpdate = {
    ...user.healthProfile, // Keep existing data as fallback
  };

  if (age) healthUpdate.age = age;
  if (bloodGroup) healthUpdate.bloodGroup = bloodGroup;
  if (heartRate) healthUpdate.heartRate = heartRate;
  if (pulseRate) healthUpdate.pulseRate = pulseRate;
  if (illnessDescription) healthUpdate.illnessDescription = illnessDescription;

  if (fileType && fileType !== 'None') {
    healthUpdate.medicalReport = {
      fileType,
      fileUrl: fileUrl || user.healthProfile?.medicalReport?.fileUrl || ''
    };
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { healthProfile: healthUpdate } },
    { new: true }
  ).select('-password');

  return res.status(200).json(
    new apiResponse(200, updatedUser, 'Health profile updated successfully!')
  );
});



export { registerUser, loginUser, updateHealthProfile, logoutUser, refreshAccessToken, changeCurrentPassword };
