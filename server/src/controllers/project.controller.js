import Project from "../models/Project.js";

export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ projects });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};