import { Request, Response } from 'express';
// const sgMail = require("@sendgrid/mail");

// import axios  from 'axios';


// let senGridAPIKEy:any = process.env.SendGridKey;
 // //sgMail.setApiKey(senGridAPIKEy)
class CommonHelper {

    successMessage(data: any, msg: string, res: Response) {
        try{
        return res.status(200).send({
            message: msg,
            data
        });}catch(e){
            console.log(e);
        }
    }
    errorMessage(msg: string, res: Response) {
       try{
        return res.status(403).send({
            error: {
                message: msg
            }
        });}catch(e){
            console.log(e);
        }
    }
    errorMessage1(data:any, msg: string, res: Response) {
        try{
         return res.status(403).send({
             error: {
                 message: msg
             }
         });}catch(e){
             console.log(e);
         }
     }
    //  sendEmail = async (to:string,subject:string,message:string) => {
    //     const msg = {
    //         to: to,
    //         from: 'test@gmailcom',
    //         subject: subject,
    //         text: message,
    //         html: message,
    //     };
    //     await sgMail.send(msg);
    // }
  
}
export default new CommonHelper();
