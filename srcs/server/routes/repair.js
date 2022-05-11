const express = require('express')
const router = express.Router()

router.get("/", (req, res)=>
{
	res.send("get all repairs");
});

router.get("/:id", (req, res) =>
{
	res.send("retreive repair by id");
})

router.post('/', (req, res, next)=>{
	res.send("create new repair")
})

router.put('/', (req, res, next)=>{
	res.send("update existing repair");
})

module.exports = router;