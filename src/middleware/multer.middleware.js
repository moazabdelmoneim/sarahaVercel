import multer from "multer"
import fs from "fs"


export const multer_upload =({customPath}={customPath:'dest'})=>{
	const storage = multer.diskStorage({
		destination:function(req,file,cb){
			let path= 'uploads/users/'+customPath
			if(!fs.existsSync(path)){
				fs.mkdirSync(path,{recursive:true})
			}
			cb(null ,path)
		},
		filename:function(req,file,cb){
			cb(null,Date.now()+'-'+file.originalname)
		}
	})
	return multer({storage})
}


export const multer_cloud =({customPath}={customPath:'dest'})=>{
	const storage = multer.diskStorage({

		filename:function(req,file,cb){
			cb(null,Date.now()+'-'+file.originalname)
		}
	})
	return multer({storage})
}