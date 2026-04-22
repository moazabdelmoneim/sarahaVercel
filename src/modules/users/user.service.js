
// import jwt from 'jsonwebtoken'
import userModel from '../../DB/models/user.model.js'
import cloudinary from '../../utils/cloudinary.js'	


// export const profile= async(inputs)=>{
// 	const {authorization} = inputs
	
	
	
// 	const user = await authentication(authorization)
// 	return user
// }

export const removeProfilePic = async(req)=>{
	
	const user = await userModel.findById(req.user._id)
	if(!user.profilePic?.public_id){
		throw new Error("no profile pic to remove",{cause:{status:404}})
	}
	await cloudinary.uploader.destroy(user.profilePic.public_id)
	user.profilePic = null
	await user.save()
	return user	

}