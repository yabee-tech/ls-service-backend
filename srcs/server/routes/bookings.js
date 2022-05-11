const express = require('express')
const router = express.Router()
const { Client } = require("@notionhq/client")
const Booking = require("../models/Booking")

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_SECRET,
})

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

	filter_on = req.query["filter_on"]
	filter_by = req.query["filter_by"]
	sort_on = req.query["sort_on"]
	sort_by = req.query["sort_by"]
	page_cursor = req.query["page_cursor"]
	page_size = req.query["page_size"]
	no_serialize = req.query["no_serialize"]

	if ((filter_on && !Object.keys(Booking.model).includes(filter_on)) || 
		(sort_on && !Object.keys(Booking.model).includes(sort_on)))
		return res.status(400).json({status : 400, error : "Unknown filter_on or sort_on field"})

	if (sort_by && (sort_by != "ascending" && sort_by != "descending"))
		return res.status(400).json({status : 400, error : "Invalid sort_by field"})

	if ((!filter_on && filter_by) || (!filter_by && filter_on))
		return res.status(400).json({status : 400, error : "Missing filter_on/filter_by but not filter_by/filter_on is present"})

	if ((!sort_on && sort_by) || (!sort_by && sort_on))
		return res.status(400).json({status : 400, error : "Missing sort_on/sort_by but not sort_by/sort_on is present"})

	payload = {};
	payload['database_id'] = process.env.NOTION_DATABASE_ID;
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
		payload['start_cursor'] = page_cursor 
	if (page_size)
		payload["page_size"] = parseInt(page_size)
	
	try {
		notion_res = await notion.databases.query(payload);
	} catch (error) {
		return res.status(500).send({status : 500, error : error})
	}
	if (no_serialize)
		return res.status(200).send({status : 200, data : notion_res})
	//TODO serialize
	res.send("get all bookings");
});

router.get("/:id", (req, res) =>
{
	res.send("retreive booking by id");
})

router.post('/', (req, res, next)=>{
	// let model = Booking;

	// // Booking.setName = "new from backedn"
	// const result = await notion.pages.create({
	// 	parent : 
	// 	{
	// 		database_id : process.env.NOTION_DATABASE_ID
	// 	},
	// 	properties : {
	// 		Reason:
	// 		{
	// 		  title:
	// 		  [
	// 			{
	// 			  text:
	// 			  {
	// 				content: 'test',
	// 			  },
	// 			},
	// 		  ],
	// 		},
		
	// 		Attachment:
	// 		{
	// 		  url : "test.com"
	// 		},
		
	// 		Name :
	// 		{
	// 			rich_text :
	// 			[
	// 				{
	// 					type : "text",
	// 					text : {content : "name"}
	// 				}
	// 			]
	// 		},
		
	// 		Email : 
	// 		{
	// 			email : "email.com"
	// 		},
		
	// 		Contact:
	// 		{
	// 			phone_number : "+601182719203"
	// 		},
			
	// 		Status:
	// 		{
	// 			select: {
	// 				name : "PENDING"
	// 			}
	// 		},
		
			
	// 	}
	// })
	// console.log(result);
	res.send("create new booking")
})

router.put('/', (req, res, next)=>{
	res.send("update existing booking");
})

module.exports = router;