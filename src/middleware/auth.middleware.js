import jwt from "jsonwebtoken";
import userModel from "../DB/models/user.model.js";

export const authentication= async(req,res,next)=>{
	
	const payload = jwt.verify(req.headers.authorization,"djfals")
	
	const {id} = payload
	const user = await userModel.findById(id)
	if(!user){
		throw new Error("invalid caredintial",{cause:{status:404}})
	}
	
	req.user = user
	console.log(req.user);
	
	return next()
}