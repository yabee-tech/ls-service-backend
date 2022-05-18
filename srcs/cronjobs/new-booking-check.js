const fs = require("fs")

//request payload
const options = {
	method: 'POST',
	headers: {
	  'Accept': 'application/json',
	  'Notion-Version': '2022-02-22',
	  'Content-Type': 'application/json',
	  'Authorization': `Bearer ${process.env.NOTION_SECRET}` 
	},
	body: JSON.stringify({page_size: 10, sorts: [{property: 'CreatedTime',direction: 'descending'}]})
  };
  
fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_BOOKING_DB_ID}/query`, options)
.then(response => response.json())
.then(response => 
	{
		let	ids;
		let	old_ids;
		let	differences;

		ids = [];

		//get id array from response 
		response.results?.map(result => ids.push(result.id))

		//check if temp file exists
		fs.stat('/tmp/new_bookings.tmp', function(err, stat) {

			//file exists, extract and deserialize data from temp file and compare with response id
			if(err == null) {
				fs.readFile('/tmp/new_bookings.tmp', 'utf8', function(err, data){
					if (err)
						return console.error("Read file : ", err);
					old_ids = data.split("\n");
					differences = ids.filter(x=> !old_ids.includes(x))
					differences.forEach(element => {
						console.log("new booking ", element)
					});
					fs.writeFile("/tmp/new_bookings.tmp", ids.join("\n"), (err)=>err ? console.error("overwrite file : ", err) : null)
				});
			}
			//doest exist, create temp file and write serialized idarray to temp file 
			else if(err.code === 'ENOENT') {
				fs.writeFile("/tmp/new_bookings.tmp", ids.join("\n"), (err)=>err ? console.error("Write new file : ", err) : null)
			}
			else {
				console.error('fs stat ', err.code);
			}
		});
	})
.catch(err => console.error(err));