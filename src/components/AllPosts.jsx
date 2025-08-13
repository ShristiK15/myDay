import React,{useEffect, useState} from "react";
import PostCard from "./PostCard";
import appwriteService from "../appwrite/config";

function AllPosts()
{
    const  [posts,setPosts]=useState([])
    useEffect(() => {}, [])
    appwriteService.getPosts([]).then((posts) => {
        if (posts) {
            setPosts(posts.documents)
        }
    })
    

    return(
        <div className="w-full py-8">
          
                <div className="flex flex-wrap">
                    {posts.map((post)=>(
                        <div key={post.$id}>
                    <PostCard  post={post}/>
                    </div>
                ))}
                </div>
       
        </div>
    )
}

export default AllPosts;