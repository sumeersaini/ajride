import db from "../../models";
const { QueryTypes, Op } = require("sequelize");
// const MyQuery = db.sequelize;
import { Request, Response } from 'express';
import { createClient } from "@supabase/supabase-js";


import commonHelper from "../../helpers/commonHelper";
import { where } from "sequelize";
let URL = process.env.SUPABASE_URL;
let ANON = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(`${URL}`, `${ANON}`)
const adminEmail: any = process.env.ADMIN_EMAIL;

class AdminService {

    async getListUsers(payload: any, res: Response) {
        try {
            const { uuid, page = 1, limit = 10, search = "" } = payload;

            console.log("inside getListUsers request", payload);

            const checkUser = await db.User.findOne({ where: { uuid } });

            if (!checkUser) {
                return res.status(200).send({ message: "Admin not found" });
            }

            if (!adminEmail.includes(checkUser.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }

            // Pagination
            let offset: number = (page - 1) * limit;

            // Search conditions
            const whereCondition = {
                [Op.or]: [
                    { email: { [Op.like]: `%${search}%` } },
                    { phone: { [Op.like]: `%${search}%` } },
                ],
            };

            const { rows: users, count: total } = await db.User.findAndCountAll({
                where: search ? whereCondition : {},
                limit: parseInt(limit),
                offset: offset,
                order: [["createdAt", "DESC"]],
            });

            commonHelper.successMessage({
                data: users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            }, "User list get successfully", res);

        } catch (error) {
            console.error("Error fetching users:", error);
            commonHelper.errorMessage("Error:" + error, res)
        }
    }

    async getOnboardingRequests(payload: any, res: Response) {
        try {
            const { uuid, page = 1, limit = 10, search = "" } = payload;

            console.log("inside getOnboardingRequests", payload);

            const checkUser = await db.User.findOne({ where: { uuid } });

            if (!checkUser) {
                return res.status(200).send({ message: "Admin not found" });
            }

            if (!adminEmail.includes(checkUser.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }

            const offset: number = (page - 1) * limit;

            // ✅ Search condition (email or phone)
            const searchCondition = search
                ? {
                    [Op.or]: [
                        { email: { [Op.like]: `%${search}%` } },
                        { phone: { [Op.like]: `%${search}%` } },
                    ],
                }
                : {};

            // ✅ Combined condition: merchant = 1 AND (email LIKE OR phone LIKE)
            const finalWhere = {
                merchant: 1,
                ...searchCondition,
            };

            const { rows: merchantRequests, count: total } = await db.User.findAndCountAll({
                where: finalWhere,
                limit: parseInt(limit),
                offset: offset,
                order: [["createdAt", "DESC"]],
            });


            commonHelper.successMessage({
                data: merchantRequests,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            }, "User list get successfully", res);

        } catch (error: any) {
            console.error("error", error);
            commonHelper.errorMessage("Error: " + error.message, res);
        }
    }

    async getHostOnboardingDetail(payload: any, res: Response) {
        try {
            const { uuid, userUuid } = payload;

            const checkAdmin = await db.User.findOne({ where: { uuid } });

            if (!checkAdmin) {
                return res.status(200).send({ message: "Admin not found" });
            }

            if (!adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }

            const user = await db.User.findOne({
                where: { uuid: userUuid },
            });

            if (!user) {
                commonHelper.errorMessage("User not found!", res);
            }

            const getDetails = await db.HostDetails.findOne({
                where: { uuid: userUuid },
            });

            commonHelper.successMessage(getDetails, "User Personal Details fetched successfully", res);
        } catch (error: any) {
            console.error("Get Personal details Error:", error);
            commonHelper.errorMessage("Error: " + error.message, res);
        }
    }


    async getDriverDetail(payload: any, res: Response) {
        try {
            const { uuid, userUuid } = payload;

            const checkAdmin = await db.User.findOne({ where: { uuid } });

            if (!checkAdmin) {
                return res.status(200).send({ message: "Admin not found" });
            }

            if (!adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }
            if (!userUuid) {
                commonHelper.errorMessage("User not found", res);
            }

            const user = await db.User.findOne({
                where: { uuid: userUuid },
            });

            if (!user) {
                commonHelper.errorMessage("User not found", res);
            }

            const getDetails = await db.DriverDetails.findOne({
                where: { uuid: userUuid },
            });

            commonHelper.successMessage(getDetails, "Driver Details fetched successfully", res);
        } catch (error: any) {
            console.error("Get Driver details Error:", error);
            commonHelper.errorMessage("Error: " + error.message, res);
        }
    }
    async getVehicleDetail(payload: any, res: Response) {
        try {
            const { uuid, userUuid } = payload;

            const checkAdmin = await db.User.findOne({ where: { uuid } });

            if (!checkAdmin) {
                return res.status(200).send({ message: "Admin not found" });
            }

            if (!adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }
            if (!userUuid) {
                commonHelper.errorMessage("User not found", res);
            }

            const user = await db.User.findOne({
                where: { uuid: userUuid },
            });

            if (!user) {
                commonHelper.errorMessage("User not found", res);
            }

            const getDetails = await db.VehicleDetails.findOne({
                where: { uuid: userUuid },
            });

            commonHelper.successMessage(getDetails, "Vehicle Details fetched successfully", res);
        } catch (error: any) {
            console.error("Get Vehicle details Error:", error);
            commonHelper.errorMessage("Error: " + error.message, res);
        }
    }

    async getAdditionalDetail(payload: any, res: Response) {
        try {
            const { uuid, userUuid } = payload;

            const checkAdmin = await db.User.findOne({ where: { uuid } });

            if (!checkAdmin) {
                return res.status(200).send({ message: "Admin not found" });
            }

            if (!adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }
            if (!userUuid) {
                commonHelper.errorMessage("User not found", res);
            }

            const user = await db.User.findOne({
                where: { uuid: userUuid },
            });

            if (!user) {
                commonHelper.errorMessage("User not found", res);
            }

            const getDetails = await db.AdditionalDetails.findOne({
                where: { uuid: userUuid },
            });

            commonHelper.successMessage(getDetails, "Additional Details fetched successfully", res);
        } catch (error: any) {
            console.error("Get Additional details Error:", error);
            commonHelper.errorMessage("Error: " + error.message, res);
        }
    }

    async getUserDetailById(payload: any, res: Response) {
        try {
            const { uuid, id } = payload;

            const checkAdmin = await db.User.findOne({ where: { uuid } });

            if (!checkAdmin) {
                return res.status(200).send({ message: "Admin not found" });
            }

            if (!adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }
            if (!id) {
                commonHelper.errorMessage("User not found", res);
            }

            const user = await db.User.findOne({
                where: { id },
            });

            if (!user) {
                commonHelper.errorMessage("User not found", res);
            }

            commonHelper.successMessage(user, "User Details fetched successfully", res);
        } catch (error: any) {
            console.error("Get User details Error:", error);
            commonHelper.errorMessage("Error: " + error.message, res);
        }
    }

    async updateDriverDocumentStatus(payload: any, res: Response) {
        try {
            const { uuid, userUuid, field, status } = payload;
            const checkAdmin = await db.User.findOne({ where: { uuid } });

            if (!checkAdmin) {
                return res.status(200).send({ message: "Admin not found" });
            }

            if (!adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }
            if (!userUuid) {
                commonHelper.errorMessage("User not found", res);
            }

            const user = await db.User.findOne({
                where: { uuid: userUuid },
            });

            if (!user) {
                commonHelper.errorMessage("User not found", res);
            }

            // Allowed status fields
            const allowedFields = [
                "proof_of_work_eligibility_status",
                "driver_history_status",
                "background_check_status",
                "city_licensing_status",
                "driver_licence_status",
            ];

            if (!allowedFields.includes(field)) {
                return commonHelper.errorMessage("Invalid status field", res);
            }

            // Fetch driver details
            const driverDetails = await db.DriverDetails.findOne({ where: { uuid: userUuid } });

            if (!driverDetails) {
                commonHelper.errorMessage("DriverDetails not found", res);
            }

            // Update the status field dynamically
            (driverDetails as any)[field] = status;
            await driverDetails.save();

            commonHelper.successMessage(
                { field, status },
                `${field} updated successfully`,
                res
            );
        } catch (error: any) {
            console.error("Update Driver Document Status Error:", error);
            commonHelper.errorMessage("Error: " + error.message, res);
        }
    };

    async updateVehicleDocumentStatus(payload: any, res: Response) {
        try {
            const { uuid, userUuid, field, status } = payload;

            // Check admin existence
            const checkAdmin = await db.User.findOne({ where: { uuid } });
            if (!checkAdmin) {
                return res.status(200).send({ message: "Admin not found" });
            }

            // Optional: Verify if email is an allowed admin
            if (!adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }

            if (!userUuid) {
                return commonHelper.errorMessage("User UUID is missing", res);
            }

            const user = await db.User.findOne({ where: { uuid: userUuid } });
            if (!user) {
                return commonHelper.errorMessage("User not found", res);
            }

            // Allowed status fields in VehicleDetails model
            const allowedFields = [
                "vehicle_registration_status",
                "insurance_information_status",
                "safety_inspection_status",
            ];

            if (!allowedFields.includes(field)) {
                return commonHelper.errorMessage("Invalid vehicle document field", res);
            }

            // Fetch vehicle details record
            const vehicleDetails = await db.VehicleDetails.findOne({
                where: { uuid: userUuid },
            });

            if (!vehicleDetails) {
                return commonHelper.errorMessage("VehicleDetails not found", res);
            }

            // Dynamically update the selected field
            (vehicleDetails as any)[field] = status;
            await vehicleDetails.save();

            return commonHelper.successMessage(
                { field, status },
                `${field} updated successfully`,
                res
            );
        } catch (error: any) {
            console.error("Update Vehicle Document Status Error:", error);
            return commonHelper.errorMessage("Error: " + error.message, res);
        }
    }

    async updateAdditionalDetailStatus(payload: any, res: Response) {
        try {
            const { uuid, userUuid, field, status } = payload;

            // Admin check
            const checkAdmin = await db.User.findOne({ where: { uuid } });
            if (!checkAdmin) {
                return res.status(200).send({ message: "Admin not found" });
            }

            if (!adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }

            if (!userUuid) {
                return commonHelper.errorMessage("User UUID is missing", res);
            }

            const user = await db.User.findOne({ where: { uuid: userUuid } });
            if (!user) {
                return commonHelper.errorMessage("User not found", res);
            }

            // Allowed fields in AdditionalDetails model
            const allowedFields = [
                "hst_number_status",
                "direct_deposit_status",
            ];

            if (!allowedFields.includes(field)) {
                return commonHelper.errorMessage("Invalid field name", res);
            }

            // Find the AdditionalDetails row
            const additionalDetails = await db.AdditionalDetails.findOne({
                where: { uuid: userUuid },
            });

            if (!additionalDetails) {
                return commonHelper.errorMessage("AdditionalDetails not found", res);
            }

            // Update the status field dynamically
            (additionalDetails as any)[field] = status;
            await additionalDetails.save();

            return commonHelper.successMessage(
                { field, status },
                `${field} updated successfully`,
                res
            );
        } catch (error: any) {
            console.error("Update Additional Detail Status Error:", error);
            return commonHelper.errorMessage("Error: " + error.message, res);
        }
    }

    async addTax(payload: any, res: Response) {
        try {
            const {
                uuid,
                tax_name,
                tax_type,
                city,
                tax_percentage
            } = payload;

            // Admin check
            const checkAdmin = await db.User.findOne({ where: { uuid } });
            if (!checkAdmin) {
                return res.status(200).send({ message: "Admin not found" });
            }

            if (!adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }


            // Create the tax record
            const newTax = await db.Tax.create({
                uuid,        // you could use uuid from payload or generate a new one
                tax_name,
                tax_type,
                city,
                tax_percentage
            });

            commonHelper.successMessage(newTax, "Tax added successfully", res);

        } catch (error: any) {
            console.error("Add Tax Error:", error);
            commonHelper.errorMessage("Error: " + error.message, res);
        }
    }

    async editTax(payload: any, res: Response) {
        try {
            const { uuid, tax_id, tax_name, tax_type, city, tax_percentage } = payload;

            // Admin check
            const checkAdmin = await db.User.findOne({ where: { uuid } });
            if (!checkAdmin || !adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }

            const taxRecord = await db.Tax.findOne({ where: { id: tax_id } });
            if (!taxRecord) {
                return res.status(404).send({ message: "Tax record not found" });
            }

            await taxRecord.update({
                tax_name,
                tax_type,
                city,
                tax_percentage
            });

            commonHelper.successMessage(taxRecord, "Tax updated successfully", res);
        } catch (error: any) {
            console.error("Edit Tax Error:", error);
            commonHelper.errorMessage("Error: " + error.message, res);
        }
    }

    async listTax(payload: any, res: Response) {
        try {
            const { uuid } = payload;

            // Admin check
            const checkAdmin = await db.User.findOne({ where: { uuid } });
            if (!checkAdmin || !adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }
            const taxes = await db.Tax.findAll({
                order: [['createdAt', 'DESC']]
            });

            commonHelper.successMessage(taxes, "Tax list fetched successfully", res);
        } catch (error: any) {
            console.error("List Tax Error:", error);
            commonHelper.errorMessage("Error: " + error.message, res);
        }
    }

    async deleteTax(payload: any, res: Response) {
        try {
            const { uuid, tax_id } = payload;

            // Admin check
            const checkAdmin = await db.User.findOne({ where: { uuid } });
            if (!checkAdmin || !adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }

            const taxRecord = await db.Tax.findOne({ where: { id: tax_id } });
            if (!taxRecord) {
                return res.status(404).send({ message: "Tax record not found" });
            }

            await taxRecord.destroy();

            commonHelper.successMessage(null, "Tax deleted successfully", res);
        } catch (error: any) {
            console.error("Delete Tax Error:", error);
            commonHelper.errorMessage("Error: " + error.message, res);
        }
    }

    async approvalDriver(payload: any, res: Response) {
        try {
            const { uuid, userUuid } = payload;

            // Admin check
            const checkAdmin = await db.User.findOne({ where: { uuid } });
            if (!checkAdmin) {
                return res.status(200).send({ message: "Admin not found" });
            }

            if (!adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }

            if (!userUuid) {
                return commonHelper.errorMessage("User UUID is missing", res);
            }

            const user = await db.User.findOne({ where: { uuid: userUuid } });
            if (!user) {
                return commonHelper.errorMessage("User not found", res);
            }


            /**get from supabse */

            const { data, error } = await supabase.auth.admin.updateUserById(userUuid, {
                user_metadata: { merchant: 2 }
            });

            if (error) throw error;

            if (user) {
                user.merchant = 2;
                await user.save();
            }
            return commonHelper.successMessage(
                user,
                `User approved merchant successfully`,
                res
            );

        } catch (error: any) {
            console.error("User approved merchant  Status Error:", error);
            return commonHelper.errorMessage("Error: " + error.message, res);
        }
    }

    async addOrUpdatePricing(payload: any, res: Response) {
        try {
            const {
                uuid,
                start_price,
                price_per_km,
                initial_wait_time,
                wait_time_cost,
                cancel_fees,
                platform_fee,
                admin_commission,
                // ✅ New vehicle-specific fields
                sedan_price_per_km,
                suv_price_per_km,
                muv_price_per_km,
                coupe_price_per_km,
                convertible_price_per_km
            } = payload;

            // ✅ Admin check
            const checkAdmin = await db.User.findOne({ where: { uuid } });
            if (!checkAdmin || !adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }

            // ✅ Check if pricing settings already exist
            const existing = await db.PricingSettings.findOne();

            let pricingRecord;
            const updatedFields = {
                start_price,
                price_per_km,
                initial_wait_time,
                wait_time_cost,
                cancel_fees,
                platform_fee,
                admin_commission,
                sedan_price_per_km,
                suv_price_per_km,
                muv_price_per_km,
                coupe_price_per_km,
                convertible_price_per_km
            };

            if (existing) {
                // ✅ Update existing record
                pricingRecord = await existing.update(updatedFields);
            } else {
                // ✅ Create new record
                pricingRecord = await db.PricingSettings.create(updatedFields);
            }

            commonHelper.successMessage(
                pricingRecord,
                existing ? "Pricing updated successfully" : "Pricing added successfully",
                res
            );
        } catch (error: any) {
            console.error("Add/Update Pricing Error:", error);
            commonHelper.errorMessage("Error: " + error.message, res);
        }
    }


    async fetchPricing(payload: any, res: Response) {
        try {

            const {
                uuid
            } = payload;

            //  Admin check
            const checkAdminFound = await db.User.findOne({ where: { uuid } });
            if (!checkAdminFound) {
                return res.status(200).send({ message: "Admin not found" });
            }

            const checkAdmin = await db.User.findOne({ where: { uuid } });
            if (!checkAdmin || !adminEmail.includes(checkAdmin.email)) {
                return res.status(200).send({ message: "Invalid Admin!" });
            }
            const settings = await db.PricingSettings.findOne();



            return commonHelper.successMessage(
                settings,
                "Pricing settings fetched successfully",
                res
            );
        } catch (error: any) {
            console.error("Fetch Pricing Error:", error);
            return commonHelper.errorMessage("Error: " + error.message, res);
        }
    }


    async getDriverslist(payload: any, res: Response) {
    try {
        const { uuid, page = 1, limit = 10, search = "" } = payload;
        const checkUser = await db.User.findOne({ where: { uuid } });

        if (!checkUser) return res.status(200).send({ message: "Admin not found" });
        if (!adminEmail.includes(checkUser.email)) return res.status(200).send({ message: "Invalid Admin!" });

        const offset: number = (page - 1) * limit;

        // ✅ FIX: allow dynamic operators
        const whereCondition: Record<string, any> = { merchant: 2 };

        if (search) {
            whereCondition[Op.and] = [
                {
                    [Op.or]: [
                        { email: { [Op.like]: `%${search}%` } },
                        { phone: { [Op.like]: `%${search}%` } },
                    ],
                },
            ];
        }

        const { rows: users, count: total } = await db.User.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit),
            offset,
            order: [["createdAt", "DESC"]],
        });

        commonHelper.successMessage({
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
            },
        }, "Drivers list get successfully", res);

    } catch (error) {
        console.error("Error fetching Drivers:", error);
        commonHelper.errorMessage("Error:" + error, res);
    }
}



}


export default new AdminService();