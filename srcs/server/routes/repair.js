const express = require('express')
const router = express.Router()
const { Client } = require("@notionhq/client")
const Repair = require("../models/Repair")


const serializeObject = (raw) =>
{
	let	serialized_elem;

	serialized_elem = {};
	serialized_elem["id"] = raw.id;
	serialized_elem["TechnicianName"] = raw.properties["TechnicianName"].title[0]?.text.content;
	serialized_elem["Booking"] = raw.properties["Booking"].rich_text[0]?.text.content;
	serialized_elem["TechnicianContact"] = raw.properties["TechnicianContact"]?.phone_number;
	serialized_elem["Status"] = raw.properties["Status"].select?.name;

	return serialized_elem;
}

const	deserializeObject = (raw) =>
{
	let	deserialized_elem;

	deserialized_elem =
	{
			TechnicianName:
			{
			  title:
			  [
				{
				  text:
				  {
					content: raw["TechnicianName"],
				  },
				},
			  ],
			},
		
			Booking :
			{
				rich_text :
				[
					{
						type : "text",
						text : {content : raw["Booking"]}
					}
				]
			},
	
			TechnicianContact:
			{
				phone_number : raw["TechnicianContact"]
			},
			
			Status:
			{
				select: {
					name : raw["Status"]
				}
			}
	}

	return deserialized_elem
}

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_SECRET,
})

//check if booking exists
const bookingExists  = async (bookingId) =>
{
	let	notion_res;
	let	payload;

	payload = {page_id : bookingId};
	try {
		notion_res = await notion.pages.retrieve(payload);
		if (notion_res && notion_res.parent.database_id.replaceAll('-', '') != process.env.NOTION_BOOKING_DB_ID)
			return false;
	} catch (error) {
		return false;
	}
	return true;
}

router.get("/", async (req, res)=>
{
	let	filter_on;
	let	filter_by;
	let	sort_on;
	let	sort_by;
	let	page_cursor;
	let	page_size;
	let	no_serialize;
	let	payload;
	let	notion_res;
	let	serialized_object;

	filter_on = req.query["filter_on"];
	filter_by = req.query["filter_by"];
	sort_on = req.query["sort_on"];
	sort_by = req.query["sort_by"];
	page_cursor = req.query["page_cursor"];
	page_size = req.query["page_size"];
	no_serialize = req.query["no_serialize"];

	if ((filter_on && !Object.keys(Repair.model).includes(filter_on)) || 
		(sort_on && !Object.keys(Repair.model).includes(sort_on)))
		return res.status(400).json({status : 400, error : "Unknown filter_on or sort_on field"})

	if (sort_by && (sort_by != "ascending" && sort_by != "descending"))
		return res.status(400).json({status : 400, error : "Invalid sort_by field"})

	if ((!filter_on && filter_by) || (!filter_by && filter_on))
		return res.status(400).json({status : 400, error : "Missing filter_on/filter_by but not filter_by/filter_on is present"})

	if ((!sort_on && sort_by) || (!sort_by && sort_on))
		return res.status(400).json({status : 400, error : "Missing sort_on/sort_by but not sort_by/sort_on is present"})

	payload = {};
	payload['database_id'] = process.env.NOTION_REPAIR_DB_ID;
	if (filter_by)
	{
		payload['filter'] = 
		{
			property : filter_on,
			equals : filter_by
		}
	}
	if (sort_by)
	{
		payload['sorts'] = [
			{
				property : sort_on,
				direction : sort_by,
			}
		]
	}
	if (page_cursor)
		payload['start_cursor'] = page_cursor;
	if (page_size)
		payload["page_size"] = parseInt(page_size);
	
	try {
		notion_res = await notion.databases.query(payload);
	} catch (error) {
		return res.status(error.status).send({status : error.status, error : error});
	}
	if (no_serialize && no_serialize == "true")
		return res.status(200).send({status : 200, data : notion_res});
	serialized_object = [];
	notion_res.results.forEach((elem)=>serialized_object.push(serializeObject(elem)))
	
	res.json({status: 200, data : serialized_object});
});

router.get("/:id", async (req, res) =>
{
	let	no_serialize;
	let	payload;
	let	notion_res;
	let	id;

	no_serialize = req.query["no_serialize"];
	id = req.params.id;
	payload = {};
	payload['page_id'] = id;

	try {
		notion_res = await notion.pages.retrieve(payload);
		if (notion_res && notion_res.parent.database_id.replaceAll('-', '') != process.env.NOTION_REPAIR_DB_ID)
			return res.status(404).json({status : 404, error : "Item not found"})
	} catch (error) {
		return res.status(error.status).send({status : error.status, error : error});
	}
	if (no_serialize && no_serialize == "true")
		return res.status(200).send({status : 200, data : notion_res});
	
	res.json({status : 200, data : serializeObject(notion_res)});
})

router.post('/', async (req, res, next)=>
{
	let	body;
	let model;
	let	notion_res;
	let	no_serialize;

	body = req.body;
	no_serialize = req.query["no_serialize"];
	model = Repair;
	if (Object.keys(body).length === 0)
		return res.status(400).json({status:400, error : "No JSON body found"})
	if (body["TechnicianName"])
		model.setTechnicianName = body["TechnicianName"]
	if (body["Booking"])
	{
		if (!await bookingExists(body["Booking"]))
			return res.status(400).json({status : 404, error : "Booking does not exist"})
		model.setBooking = body["Booking"]
	}
	if (body["TechnicianContact"])
		model.setTechnicianContact = body["TechnicianContact"]
	if (body["Status"])
	{
		if (!model.STATUS_ENUM.includes(body["Status"]))
			return res.status(400).json({status : 400, error : "Invalid status"})
		model.setStatus = body["Status"]
	}
	try {
		notion_res = await notion.pages.create({
			parent: {
				database_id: process.env.NOTION_REPAIR_DB_ID,
			  },
			properties : model.model
		})
		if (no_serialize == "true")
			return res.status(200).json({status : 200, data : notion_res});
		else
			return res.status(200).json({status : 200, data : serializeObject(notion_res)});
	} catch (error) {
		return res.status(error.status).json({status : error.status, error : error});
	}
})

router.put('/', async (req, res, next)=>{
	let	body;
	let model;
	let	notion_res;
	let	no_serialize;

	body = req.body;
	no_serialize = req.query["no_serialize"];
	model = Repair;
	if (Object.keys(body).length === 0)
		return res.status(400).json({status:400, error : "No JSON body found"})
	if (body["TechnicianName"])
		model.setTechnicianName = body["TechnicianName"]
	if (body["Booking"])
	{
		if (!await bookingExists(body["Booking"]))
			return res.status(400).json({status : 404, error : "Booking does not exist"})
		model.setBooking = body["Booking"]
	}
	if (body["TechnicianContact"])
		model.setTechnicianContact = body["TechnicianContact"]
	if (body["Status"])
	{
		if (!model.STATUS_ENUM.includes(body["Status"]))
			return res.status(400).json({status : 400, error : "Invalid status"})
		model.setStatus = body["Status"]
	}
	try {
		notion_res = await notion.pages.update({
			parent: {
				database_id: process.env.NOTION_REPAIR_DB_ID,
			  },
			properties : model.model
		})
		if (no_serialize == "true")
			return res.status(200).json({status : 200, data : notion_res});
		else
			return res.status(200).json({status : 200, data : serializeObject(notion_res)});
	} catch (error) {
		return res.status(error.status).json({status : error.status, error : error});
	}
})

module.exports = router;