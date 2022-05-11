const express = require('express')
const router = express.Router()

router.get("/", (req, res)=>
{
	res.send("get all feedbacks");
});

router.get("/:id", (req, res) =>
{
	res.send("retreive feedback by id");
})

router.post('/', (req, res, next)=>{
	res.send("create new feedback")
})

router.put('/', (req, res, next)=>{
	res.send("update existing feedback");
})

module.exports = router;