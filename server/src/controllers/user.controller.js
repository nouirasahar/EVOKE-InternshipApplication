import User from "../models/User.js";

export const updateMe = async (req, res) => {
  try {
    const { fullName } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ message: "Full name must contain at least 2 characters." });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName: fullName.trim() },
      { new: true }
    ).select("-password");

    return res.status(200).json({ message: "Profile updated successfully.", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteMe = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    return res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};