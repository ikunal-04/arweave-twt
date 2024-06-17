import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ArConnectStrategy from '@arweave-wallet-kit/arconnect-strategy'
import { ArweaveWalletKit } from '@arweave-wallet-kit/react'
import Home from './pages/Home'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ArweaveWalletKit config={{
      permissions: ["ACCESS_ADDRESS", "ACCESS_PUBLIC_KEY", "SIGN_TRANSACTION", "DISPATCH"],
      ensurePermissions: true,
      strategies: [new ArConnectStrategy()]
    }}>
      <RouterProvider router={router}/>
    </ArweaveWalletKit>
  </React.StrictMode>,
)
