import { useState, useEffect } from "react";
import { useConnection, useActiveAddress } from "@arweave-wallet-kit/react";
import { dryrun, result, message, createDataItemSigner } from "@permaweb/aoconnect";
import { Outlet } from "react-router-dom";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import SideBar from "@/components/ui/sidebar";
import { CircleUserRound, Trash2 } from 'lucide-react';
import RegisterModal from "@/components/ui/register-modal";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
  } from "@/components/ui/dialog";  

declare global {
    interface Window {
        arweaveWallet: any;
    }
}

const ViewPosts = () => {
    const { connected } = useConnection();
    const [isloading, setIsLoading] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [authorId, setAuthorId] = useState(""); 
    const activeAddress = useActiveAddress();
    const [postDescription, setPostDescription] = useState("");
    const [profile, setProfile] = useState<any[]>([]);
    const { toast } = useToast();

    const processId = "OeQOvq-6j2b7wW0WE_kWkhyXGMuZKA1z71mz8ZPmKyc";

    useEffect(() => {
        const storedAuthorId = localStorage.getItem("authorId");
        if (storedAuthorId) {
            setAuthorId(storedAuthorId);
        }
    }, []);

    const fetchPosts = async () => {
        if (!connected) return;
        setIsLoading(true);
        try {
            const response = await dryrun({
                process: processId,
                data: "",
                tags: [{ name: "Action", value: "List"}],
                anchor: "latest"
            });
            const parsedPosts = response.Messages.map((msg) => {
                const parsedData = JSON.parse(msg.Data);
                return parsedData;
            });
            setPosts(parsedPosts[0]);
        } catch (error) {
            console.log(error);  
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserPosts = async () => {
        if (!connected) return;
        setIsLoading(true);
        try {
            const response = await dryrun({
                process: processId,
                data: "",
                tags: [{ name: "Action", value: "PostsByAuthor" },
                       { name: "Author-Id", value: authorId }],
                anchor: "latest"
            });
            const parsedPosts = response.Messages.map((msg) => {
                const parsedData = JSON.parse(msg.Data);
                return parsedData;
            });
            console.log("fetched user posts: ",parsedPosts[0]);       
            setUserPosts(parsedPosts[0]);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const registerAuthor = async () => {
        const res = await message({
          process: processId,
          tags: [{ name: "Action", value: "Register" },
                { name: "Name", value: name }],
          data: "",
          signer: createDataItemSigner(window.arweaveWallet),
        });
    
        console.log("Register Author result", result);
    
        const registerResult = await result({
          process: processId,
          message: res,
        });
    
        console.log("Registered successfully", registerResult);
        console.log(registerResult.Messages[0].Data);
    
        if (registerResult.Messages[0].Data === activeAddress) {
          fetchUserPosts();
          localStorage.setItem("authorId", registerResult.Messages[0].Data);
          toast({
            description: "Registered Successfully!!"
          })
          setAuthorId(registerResult.Messages[0].Data);        
        }
    };

    const createPosts = async (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await message({
                process: processId,
                tags: [{ name: "Action", value: "Create-Post" },
                      { name: "Body", value: postDescription },
                      { name: "Name", value: name}],
                data: "",
                signer: createDataItemSigner(window.arweaveWallet),
              });
          
              console.log("Create Post result", result);
          
              const createResult = await result({
                process: processId,
                message: res,
              });
          
              console.log("Created successfully", createResult);
              console.log(createResult.Messages[0].Data);
              toast({
                description: "Post createad Successfully!!",
              });          
        } catch (error) {
            console.log(error);           
        }
       
    }

    const Profile = async () => {
        setIsLoading(true);
        try {
            const response = await dryrun({
                process: processId,
                tags: [{ name: "Action", value: "Profile-user" },
                      {name: "Author-Id", value: authorId}
                ],
                anchor: "latest"
              });
              console.log("the response from profile: ", response);
              
              const parsedProfile = response.Messages.map((msg) => {
                  const parsedData = JSON.parse(msg.Data);
                  return parsedData;
              });
              console.log(parsedProfile[0]);
              
              setProfile(parsedProfile[0]);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    const DeletePosts = async (postId: string) => {
        try {
            const res = await message({
                process: processId,
                tags: [{ name: "Action", value: "Delete-Post" },
                      { name: "Post-Id", value: postId }],
                data: "",
                signer: createDataItemSigner(window.arweaveWallet),
              });
          
              console.log("Delete Post result", result);
          
              const deleteResult = await result({
                process: processId,
                message: res,
              });
          
              console.log("Deleted successfully", deleteResult);
              console.log(deleteResult.Messages[0].Data);
              toast({
                description: "Post Deleted Successfully!!",
              });
              fetchUserPosts();         
        } catch (error) {
            console.log(error);           
        }

    }

    useEffect(() => {
        if (connected) {
            fetchPosts();
            fetchUserPosts();
            Profile();
            console.log("This is the active address: ", activeAddress);
        }
    }, [connected]);

    return (
        <main className="px-4 p-4">
            <div className="flex gap-4">

                <div className="flex flex-col w-1/3 bg-[#222831] rounded-lg p-2 h-[500px]">
                    <div className="p-3 grid gap-4">
                        <div>
                            <Dialog>
                                <DialogTrigger className="w-full">
                                    <SideBar title="Create Posts" />
                                </DialogTrigger>
                                {localStorage.getItem("authorId") ? (
                                    <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create Posts</DialogTitle>
                                        <DialogDescription>
                                            Create a new post!
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="post" className="text-right">
                                            Post
                                        </Label>
                                        <Textarea id="post" placeholder="How's your day!" className="col-span-3" onChange={(e) => setPostDescription(e.target.value)} />
                                    </div>
                                    </div>
                                    <DialogFooter>
                                    <Button type="submit" onClick={(e) => {createPosts(e)}}>Save changes</Button>
                                    </DialogFooter>
                                </DialogContent>
                                ) : (
                                    <DialogContent>
                                        <RegisterModal title="Create Posts"/>
                                    </DialogContent>
                                )}
                            </Dialog>
                        </div>
                        <div>
                            <Dialog>
                                <DialogTrigger className="w-full">
                                    <SideBar title="Profile" />
                                </DialogTrigger>
                                {localStorage.getItem("authorId") ? (
                                    <DialogContent>
                                        <div className="grid gap-4 py-4">
                                        {profile.map(user => (
                                            <div key={user.ID} className='grid mb-3'>
                                                <div className="rounded-lg px-2 grid gap-y-4 py-1">
                                                    <p className="text-black text-3xl font-semibold"> {user.NAME}</p>
                                                    <Label id="id" className="text-md font-medium">ID: </Label>
                                                    <h3 className="border text-lg p-3" id="id">{user.PID}</h3>
                                                </div>                                   
                                            </div>
                                        ))} 
                                        </div>
                                    </DialogContent>
                                ) : (
                                    <DialogContent>
                                        <RegisterModal title="see your Profile"/>
                                    </DialogContent>
                                )}
                            </Dialog>
                        </div>
                    </div>
                </div>


                <div className="2/3">
                    <Tabs defaultValue="all-posts" className="w-[900px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="all-posts">All Posts</TabsTrigger>
                            <TabsTrigger value="your-posts">Your Posts</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all-posts">
                            <ScrollArea className="h-[550px] rounded-md border p-4 text-white">
                                <div>
                                {isloading ? (
                                    <div className="flex items-center space-x-4 text-3xl text-white">
                                    Loading...
                                    </div>
                                ) : (
                                    <div>
                                    {posts.map(post => (
                                        <div key={post.ID} className='grid mb-3'>
                                            <div className="border rounded-lg px-2 grid gap-y-2 py-3">
                                                <div className="flex gap-2 items-center">
                                                    <CircleUserRound size={20}/>
                                                    <p className="font-semibold">{post.Authors}</p>
                                                </div>
                                                <h3 className="text-xl">{post.BODY}</h3>
                                            </div>                                   
                                        </div>
                                    ))}                       
                                    </div>
                                )}
                                </div>           
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="your-posts">
                            {authorId !== activeAddress ? (
                                <div className="flex flex-col justify-center p-3 gap-4">
                                    <h1 className="flex justify-center text-3xl font-semibold">First Register to continue:))</h1>
                                    <Input type="text" onChange={(e) => setName(e.target.value)} className="text-white" placeholder="Enter your name/username anything you would like to be called as!"/>
                                    <Button onClick={registerAuthor} className="bg-[rgb(30,129,176)] hover:bg-blue-600">Register</Button>
                                </div>
                            ) : (
                                <div>
                                    <ScrollArea className="h-[500px] rounded-md border p-4 text-white">
                                        <div>
                                            {isloading ? (
                                                <div className="flex items-center space-x-4 text-3xl text-white">
                                                    Loading...
                                                </div>
                                            ) : (
                                                <div>
                                                    {userPosts.map(post => (
                                                        <div key={post.ID} className='grid mb-3'>
                                                            <div className="border rounded-lg px-2 grid gap-y-2 py-3">
                                                                <div className="flex gap-2 items-center">
                                                                    <CircleUserRound size={20}/>
                                                                    <p className="font-semibold">{post.Authors}</p>
                                                                </div>
                                                                <h3 className="text-xl">{post.BODY}</h3>
                                                                <Dialog>
                                                                <DialogTrigger>
                                                                    <Trash2 size={20} />
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                                                                    <DialogDescription>
                                                                        This action cannot be undone. This will permanently delete your post from ao computer!
                                                                    </DialogDescription>
                                                                    </DialogHeader>
                                                                    <DialogFooter>
                                                                    <Button
                                                                        onClick={() => DeletePosts(post.ID)}
                                                                        variant={"destructive"}>
                                                                        Delete Account
                                                                    </Button>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                                </Dialog>
                                                            </div>                                    
                                                        </div>
                                                    ))}                       
                                                </div>
                                            )}
                                        </div>           
                                    </ScrollArea>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <Toaster />
            <Outlet />
        </main>
    );
}

export default ViewPosts;