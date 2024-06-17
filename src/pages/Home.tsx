import Header from '../components/Header'
import { ConnectButton, useConnection } from '@arweave-wallet-kit/react'
import { Separator } from '@/components/ui/separator'
import ViewPosts from '@/components/ViewPosts'

const Home = () => {
  const { connected } = useConnection();

  return (
    <main className='bg-black h-screen text-white'>
        <Header />
        <Separator />
        <div>
            <div>
                {connected ? (
                    <ViewPosts />
                ) : (
                    <div className='gap-10 p-9 my-64 flex flex-col justify-center items-center'>
                        <h2 className='text-5xl font-bold'>Welcome to Socials</h2>
                        <ConnectButton accent="rgb(30,129,176)"  />
                    </div>
                )}
            </div>
        </div>
    </main>
  )
}

export default Home
