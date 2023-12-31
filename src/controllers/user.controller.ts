import userModel, { NewUsers } from "../models/user.model";
import { Request, Response } from "express";
import Text from '../text'
import mail, { templates } from "../services/mail";
import jwt from "../services/jwt";
import bcrypt from 'bcrypt'


export default {
    register: async function (req: Request, res: Response) {
        try {
            /* Hash Password */
            req.body.password = await bcrypt.hash(req.body.password, 10);
            let newUser: NewUsers = {
                ...req.body,
                createAt: new Date(Date.now()),
                updateAt: new Date(Date.now()),
            }
            let modelRes = await userModel.register(newUser);
            modelRes.message = (Text(String(req.headers.language)) as any)[modelRes.message];
            /* Mail */
            if (modelRes.status) {
                mail.sendMail({
                    to: `${modelRes.data?.email}`,
                    subject: "Xác thực email",
                    html: templates.emailConfirm({
                        confirmLink: `${process.env.SERVER_URL}auth/email-confirm/${jwt.createToken(modelRes.data, "300000")}`,
                        language: String(req.headers.language),
                        productName: "Huong Store",
                        productWebUrl: "abc.com",
                        receiverName: modelRes.data?.userName || ''
                    })
                })

            }

            return res.status(modelRes.status ? 200 : 213).json(modelRes);
        } catch (err) {
            return res.status(500).json({
                messsage: Text(String(req.headers.language)).controllerErr
            })
        }
    },
    login: async function (req: Request, res: Response) {
        try {
            let modelRes = await userModel.inforByUserName(req.body.userName);
            if (modelRes.status) {
                if (!modelRes.data?.isActive) {
                    return res.status(213).json({
                        message: Text(String(req.headers.language)).notexist
                    });
                }
                let checkPassword = await bcrypt.compare(req.body.password, modelRes.data.password);
                if (!checkPassword) {
                    return res.status(213).json({
                        message: Text(String(req.headers.language)).password
                    });
                }
                return res.status(200).json({
                    message: Text(String(req.headers.language)).Logged,
                    token: jwt.createToken(modelRes.data, "1d")
                });
            }
            return res.status(213).json({
                message: Text(String(req.headers.language)).notexist
            });
        } catch (err) {
            return res.status(500).json({
                messsage: Text(String(req.headers.language)).controllerErr
            })
        }
    },
}