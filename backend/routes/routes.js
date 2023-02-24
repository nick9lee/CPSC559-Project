const express = require('express');
const Model = require('../model/model');

const router = express.Router()

module.exports = router;

router.get("/getAll", async (req, res) => {
	try {
		const data = await Model.find();
		let transformedArray = [...Array(200)].map((e) => Array(200));
		console.log(transformedArray);
		data.forEach((entry, index) => {
			transformedArray[Math.floor(index / 200)][index % 200] = entry;
		});
		res.json(transformedArray);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});