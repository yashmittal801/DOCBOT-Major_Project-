import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
  // 1. Destructure fields sent from frontend RegisterPage
  const { name, email, phone, gender, password } = req.body;

  // 2. Validate that fields are not empty
  if (!name || !email || !phone || !gender || !password) {
    throw new apiError(400, 'All fields are required');
  }

  // 3. Check if user already exists with this email
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new apiError(409, 'User with this email already exists');
  }

  // 4. Create user in database (Password hashing happens automatically via userSchema.pre('save'))
  const user = await User.create({
    name,
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
  const { name, email, password } = req.body;

  // Validate fields
  if (!email || !password) {
    throw new apiError(400, 'Email and password are required');
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new apiError(404, 'User does not exist with this email');
  }

  // Optional check: Verify name matches if provided
  if (name && user.name.toLowerCase() !== name.toLowerCase()) {
    throw new apiResponsepiError(400, 'Name does not match our records for this email');
  }

  // Check password validity using model method
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, 'Incorrect Password');
  }

  // Fetch logged-in user without password
  const loggedInUser = await User.findById(user._id).select('-password');

  return res.status(200).json(
    new apiResponse(200, loggedInUser, 'User logged in successfully')
  );
});

const updateHealthProfile = asyncHandler(async (req, res) => {
  const { userId, age, bloodGroup, heartRate, pulseRate, illnessDescription, fileType, fileUrl } = req.body;

  if (!userId) {
    throw new apiError(400, 'User ID is required to update health profile');
  }

  // Find user first
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



export { registerUser, loginUser, updateHealthProfile };
