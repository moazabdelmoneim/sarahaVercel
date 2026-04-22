import Joi from "joi"
import { generalFields } from "../../middleware/valid.middleware.js"

export const signUpSchema =  Joi.object().keys({
	email: generalFields.email,
	password: generalFields.password,
	name:generalFields.name.required()
}).required()


export const loginSchema =  Joi.object().keys({
	email: generalFields.email,
	password: generalFields.password
}).required()