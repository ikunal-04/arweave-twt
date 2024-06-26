import { ConnectButton } from "@arweave-wallet-kit/react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


const Header = () => {
  return (
    <header className="flex justify-between p-2 px-4">
      <div className="flex items-center text-2xl">
        <Link to="/" >
          <h1 className="cursor-pointer font-semibold">Socials</h1>
        </Link>
      </div> 
      <div className="flex gap-3 items-center">
        <div>
        <Dialog>
          <DialogTrigger>
            <Button className="rounded-2xl p-6 bg-[rgb(30,129,176)] hover:bg-blue-500">Buy domain</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Oops! 😢</DialogTitle>
              <DialogDescription>
                Have to wait little while longer for this feature to be available!
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        </div>
        <ConnectButton
          accent="rgb(30,129,176)"
          profileModal={true}
          showBalance={false}
          showProfilePicture={true}
          className="hover:bg-blue-500 cursor-pointer"
        />
      </div>
    </header>
  );
};

export default Header;
