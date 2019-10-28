const fs = require("fs");
const mongoose = require("mongoose");
const bluebird = require("bluebird");

mongoose.connect("mongodb://localhost:27017/txt-data-db");

const Data = require("./models/data");

const filename = "./arxiv-test-data.txt";

function readTxtFile(filePath) {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, "utf8", (err, data) => {
			if (err) {
				return reject(err);
			}
			return resolve(data);
		});
	});
}

function dataToArray(data, err) {
	return new Promise((resolve, reject) => {
		if (err) {
			return reject(err);
		}
		const array = data.toString().split("\n");
		return resolve(array);
	});
}

function saveItems(items) {
	return bluebird.map(items, (item) => saveItem(item));
}

function saveItem(item) {
	const parsedItem = JSON.parse(item);
	return Data.create(parsedItem)
		.catch(() => {});
}

function getItemsFromDB() {
	const start = new Date();
	return Data.find({ keywords: { $in: ["Differential Geometry"] } }).then((items) => {
		console.log("Elapsed", new Date() - start);
		return items;
	});
}

function addSerialNumber(items) {
	let cnt = 0;
	return bluebird.map(items, (item) => {
		cnt += 1;
		item.serialNumber = cnt;
		return saveItemToFile(item);
	});
}

function saveItemToFile(item) {
	return new Promise((resolve, reject) => {
		item = JSON.stringify(item);
		fs.appendFile("./new-file.txt", item, (err) => {
			if (err) {
				return reject(err);
			}
			return resolve("Ok");
		});
	});
}

readTxtFile(filename)
	.then((data) => dataToArray(data))
	.then((items) => saveItems(items))
	.then(() => getItemsFromDB())
	.then((items) => addSerialNumber(items));
