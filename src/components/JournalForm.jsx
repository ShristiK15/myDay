import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import Button from "./Button";
import Input from "./Input";
import RTE from "./RTE";
import Select from "./Select"
import appwriteService from "../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues: {
            title: post?.title || "",
            content: post?.content || "",
            mood: post?.mood || "neutral",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {

        if (post) {
            const file = data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null;

            if (file) {
                appwriteService.deleteFile(post.featuredImage);
            }

            const dbPost = await appwriteService.updatePost(post.$id, {
                ...data,
                featuredImage: file ? file.$id : undefined,
            });

            if (dbPost) {
                navigate(`/journal/${dbPost.$id}`);
            }
        } else {

            console.log("Sending Post to...", userData)
            const file = await appwriteService.uploadFile(data.image[0]);

            if (file) {
                console.log("File uploaded..", file)
                const fileId = file.$id;
                data.userId = userData.$id;
                data.featuredImage = fileId;
                const dbPost = await appwriteService.createPost({...data });

                if (dbPost) {
                    navigate(`/journal/${dbPost.$id}`);
                }
            }
        }
    };




    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: true })}
                />
                  <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
            </div>
            <div className="w-1/3 px-2">
                <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("image", { required: !post })}
                />
                {post && (
                    <div className="w-full mb-4">
                        <img
                            src={appwriteService.getFilePreview(post.featuredImage)}
                            alt={post.title}
                            className="rounded-lg"
                        />
                    </div>
                )}
              <Select
    options={["neutral", "happy", "sad"]}
    label="Mood"
    className="mb-4"
    {...register("mood", { required: true })}
/>

                <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
                    {post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}