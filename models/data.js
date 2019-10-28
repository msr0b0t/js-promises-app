const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
	abstract: { type: String },
	doi: { type: String, unique: true },
	title: { type: String },
	createdAt: { type: Date },
	keywords: { type: Array, index: true },
});

module.exports = mongoose.model("Data", dataSchema);
