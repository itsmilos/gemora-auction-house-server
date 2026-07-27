import crypto from "crypto";
import { supabase } from "../lib/supabase.js";

export async function uploadImage(req, res) {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }


        const extension = req.file.originalname.split(".").pop();

        const fileName = `${crypto.randomUUID()}.${extension}`;


        const { error } = await supabase
            .storage
            .from("auction-images")
            .upload(
                fileName,
                req.file.buffer,
                {
                    contentType: req.file.mimetype
                }
            );


        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Image upload failed"
            });
        }


        const { data } = supabase
            .storage
            .from("auction-images")
            .getPublicUrl(fileName);


        return res.json({
            imageUrl: data.publicUrl
        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Upload failed"
        });

    }
}