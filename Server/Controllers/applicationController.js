const Application = require("../models/applicationModel");

async function createApplication(req, res, next) {
  try {
    const { name, description, isActive, userID, createdBy, updatedBy } =
      req.body;
    const application = await Application.create({
      name,
      description,
      isActive,
      userID,
      createdBy,
      updatedBy,
    });
    res.status(201).json({
      message: "Application created successfully!",
      application,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createApplication,
};
