import { Input } from "./input"
import { Button } from "./button"
import { useState } from "react"
import { message, result, createDataItemSigner } from "@permaweb/aoconnect"
import { useActiveAddress } from "@arweave-wallet-kit/react"
import { useToast } from "./use-toast"
import { Toaster } from "./toaster"

const RegisterModal = ({title}: {title: string}) => {
    const [name, setName] = useState<string>("");
    const activeAddress = useActiveAddress();
    const { toast } = useToast();

    const processId = "OeQOvq-6j2b7wW0WE_kWkhyXGMuZKA1z71mz8ZPmKyc";

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
        console.log(activeAddress);
        
    
        if (registerResult.Messages[0].Data === activeAddress) {
          localStorage.setItem("authorId", registerResult.Messages[0].Data);
          toast({
            description: "Registered successfully!"
          }); 
        }
    };
  return (
    <div className="grid gap-4">
        <div>
            Register to {title}!
        </div>
        <div>
            <Input placeholder="Enter your name/username anything you would like to be called as!" onChange={(e) => setName(e.target.value)}/>
        </div>
        <div>
            <Button onClick={registerAuthor}>Register</Button>
        </div>
        <Toaster />
    </div>
  )
}

export default RegisterModal
