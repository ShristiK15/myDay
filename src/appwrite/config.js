import conf from "../conf/conf.js";
import {Client,ID,Databases,Storage,Query} from "appwrite";

export class Service{
    client=new Client();
    databases;
    bucket;
    
    constructor()
    {
        this.client
        .setEndpoint(conf.appWriteURL)
        .setProject(conf.appWriteProjectId)

        this.databases=new Databases(this.client);
        this.bucket=new Storage(this.client);
        this.Query=new Query(this.client);
    }

    async createPost({content,mood,featuredImage,title, userId})
    {
        try
        {
            console.log("Data to save: ", content, mood, featuredImage, title, userId);
            return await this.databases.createDocument(
                conf.appWriteDatabaseId,
                conf.appWriteCollectionId,
                ID.unique(),
                {
                   content,mood,featuredImage,title,userId
                },
            )
        }
        catch(error){
            console.log("Appwrite service::CreatePost::error",error);
        }
    }

 



    async getPost(userId)
    {
        try{
            return await this.databases.getDocument(
                conf.appWriteDatabaseId,
                conf.appWriteCollectionId,
                userId
            )
        }
        catch(error)
        {
            console.log("Appwrite service::deletePost::error",error);
            return false;
        }
    }
    async getPosts()
    {
        try{
            return await this.databases.listDocuments(
                conf.appWriteDatabaseId,
                conf.appWriteCollectionId,
                
            )
        }
        catch(error)
        {
           console.log("Appwrite service::getPost::error",error);
            return false; 
        }
    }

    async uploadFile(file)
    {
        try{
            console.log("Test", file)

            return await this.bucket.createFile(
                conf.appWriteBucketId,
                ID.unique(),
                file
            )
        }
        catch(error){
            console.log("Appwrite service::uploadFile::error",error)
            return false;
        }
    }

    async deleteFile(fileId)
    {
        try{
            await this.bucket.deleteFile(
                conf.appWriteBucketId,
                fileId
            )
            return true;
        }
        catch(error){
            console.log("Appwrite service::deleteFile::error",error)
            return false;
        }
    }

    getFilePreview(fileId)
    {
        try{
            const imgPost=this.bucket.getFilePreview(
            conf.appWriteBucketId,
            fileId
        )
        console.log(imgPost);
        return imgPost;
        }
        catch(error){
            console.log("Appwrite service::getFilePreview::error",error)
            return false;
        }
    }
}

const service=new Service()

export default service