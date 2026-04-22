// valid middleware ---------- schema 
import Joi from "joi"

export const generalFields = {
	email:Joi.string().email({maxDomainSegments:2,tlds:{allow:['com']}}).required(),
	password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/).required(),
	name:Joi.string().min(2).max(10),

}



export const validation = (schema)=>{
	return (req,res,next)=>{
		const data =req.body
		if(!data){
			throw new Error('there is no input data')
		}
		const validationRes = schema.validate(data)
		if(validationRes.error){
			return res.status(400).json({message:'validation error' , validationRes:validationRes.error.details})
		}
		return next()
	}
}