import Header from '../components/Header'
import { ConnectButton, useConnection } from '@arweave-wallet-kit/react'
import { Separator } from '@/components/ui/separator'
import ViewPosts from '@/components/ViewPosts'
import { Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { connected } = useConnection();

  return (
    <div className='flex flex-col min-h-screen'>
      <main className='flex-grow bg-black text-white'>
        <Header />
        <Separator />
        <div className='flex-grow'>
          <div className='flex-grow'>
            {connected ? (
              <ViewPosts />
            ) : (
              <div className='gap-10 p-9 my-64 flex flex-col justify-center items-center'>
                <h2 className='text-5xl font-bold'>Welcome to Socials</h2>
                <ConnectButton accent="rgb(30,129,176)" />
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className='bottom-0'>
        <Separator />
        <div className='text-center p-2 bg-[#14181d] px-8'>
          <div className='flex justify-between text-white text-sm'>
            <div className='flex items-center'>
              <p>© 2024 Socials</p>
            </div>
            <div>
              <p>
                <Link to={"https://x.com/ArweaveEco"}>
                  <Twitter size={16}/>
                </Link>                     
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
