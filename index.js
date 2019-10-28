const { readFile, appendFile } = require("fs");
const { promisify } = require("util");
const mongoose = require("mongoose");

const Data = require("./models/data");

mongoose.connect("mongodb://localhost:27017/txt-data-db");

// The promisify function from the (native) util package takes a function with the common (err, callback) signature
// and returns a "promisified" version of it
const readFileAsync = promisify(readFile);
const appendFileAsync = promisify(appendFile);

const filename = "./arxiv-test-data.txt";

// Even though this function returns a promise whether we declare it async or not, it's a good practice to do so
async function readTxtFile(filePath) {
	return readFileAsync(filePath, "utf8");
}

// This function doesn't perform any async operations, but because we declared it async, it will return a promise
// with the results
async function dataToArray(data) {
	return data.toString().split("\n");
}

// For whatever reason, in this function we want to suppress Data.create() failures
async function saveItem(item) {
	try {
		const data = await Data.create(JSON.parse(item));
		return data;
	} catch (error) {
		return undefined;
	}
}

// This function returns a promise that resolves when/if all internal promises resolve
async function saveItems(items) {
	return Promise.all(items.map(saveItem));
}

async function getItemsFromDB() {
	const start = new Date();
	const items = await Data.find({ keywords: { $in: ["Differential Geometry"] } }).exec();
	console.log("Elapsed", new Date() - start);
	return items;
}

async function addSerialNumber(items) {
	let cnt = 0;
	return Promise.all(items.map((item) => {
		cnt += 1;
		item.serialNumber = cnt;
		return saveItemToFile(item);
	}));
}

async function saveItemToFile(item) {
	await appendFileAsync("./new-file.txt", JSON.stringify(item));
	return "Ok";
}

// There is no need to use the pattern then((args) => func(args)), then(func) is equivalent
readTxtFile(filename)
	.then(dataToArray)
	.then(saveItems)
	.then(getItemsFromDB)
	.then(addSerialNumber)
	// Even though this is at the end, it will catch promise rejections from any of the above function calls
	.catch(console.error);
