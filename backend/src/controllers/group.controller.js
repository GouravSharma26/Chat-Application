import Group from "../models/group.model.js";

export const getGroups = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const groups = await Group.find({ members: loggedInUserId }).populate("members", "-password");
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getGroups: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const adminId = req.user._id;

    if (!name || !members || members.length === 0) {
      return res.status(400).json({ error: "Group name and members are required" });
    }

    // Add admin to members if not already included
    const groupMembers = new Set(members);
    groupMembers.add(adminId.toString());

    const newGroup = new Group({
      name,
      members: Array.from(groupMembers),
      admin: adminId,
    });

    await newGroup.save();

    const populatedGroup = await Group.findById(newGroup._id).populate("members", "-password");

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error in createGroup: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
