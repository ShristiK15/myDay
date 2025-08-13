import React from "react";
import appwriteService from "../appwrite/config";
import {Link} from 'react-router-dom'

//this is the syntax of appwrite that you have to pass the id as $id in the function
function PostCard({$id, title,featuredImage})
{
    return(
        <Link to={`/post/${$id}`}>
            
                    <div className='w-full bg-gray-100 rounded-xl p-4'>
            <div className='w-full justify-center mb-4'>
                {/* featuredImage is the id of individual pictures and $id is the id of the whole post */}
                <img src={appwriteService.getFilePreview(featuredImage)} alt={title}
                className='rounded-xl' />
                 </div>
            <h2
            className='text-xl font-bold'
            >{title}</h2>
        </div>
        </Link>
    )
}

export default PostCard