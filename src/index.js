import bootstrap from "./app.controller.js";
import express from 'express'

const app =express()

bootstrap(app)


// bexause veercel needs to export a function or an app to run the server
export default app

