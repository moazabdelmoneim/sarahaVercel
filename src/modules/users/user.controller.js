import { Router } from "express";
import { removeProfilePic } from "./user.service.js";
import { authentication } from "../../middleware/auth.middleware.js";
const router = Router()

// router.get('/',async(req,res,next)=>{
	
// 	const results = await profile(req.headers)
// 	return res.json({
// 		message :"done",
// 		results
// 	})
// })

router.patch('/removeProfilePic',authentication,async(req,res,next)=>{
	const results = await removeProfilePic(req)
	return res.json({
		message :"done",
		results
	})
})








export default router