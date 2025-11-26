import mongoose from "mongoose";

export const  blogSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true}
}, {timestamps: true});

export const Blog = mongoose.model("Blog", blogSchema)