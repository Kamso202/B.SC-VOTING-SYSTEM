"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { blockchainService } from "@/lib/blockchain"
import { useWallet } from "@/lib/hooks/useWallet"

interface BlockchainContextType {
  isInitialized: boolean
  isAdmin: boolean
  networkId: number | null
  error: string | null
  initializeBlockchain: () => Promise<void>
  checkAdminStatus: () => Promise<void>
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined)

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [networkId, setNetworkId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { isConnected, address } = useWallet()

  const initializeBlockchain = async () => {
    try {
      setError(null)

      if (typeof window !== "undefined" && window.ethereum) {
        // Check network
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        setNetworkId(Number.parseInt(chainId, 16))

        // Initialize blockchain service
        const connected = await blockchainService.connectWallet()
        if (connected) {
          setIsInitialized(true)
          await checkAdminStatus()
        } else {
          throw new Error("Failed to connect to blockchain")
        }
      } else {
        throw new Error("MetaMask not found")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize blockchain")
      setIsInitialized(false)
    }
  }

  const checkAdminStatus = async () => {
    try {
      if (!address) return

      // In development mode, make it easier to access admin features
      const isDevelopmentMode = process.env.NODE_ENV === "development"

      if (isDevelopmentMode) {
        // For demo purposes, any connected wallet can access admin features
        setIsAdmin(true)
        console.log("[v0] Development mode - granting admin access to connected wallet")
      } else {
        // For demo purposes, we'll consider the first account as admin
        // In production, this would check against the smart contract's admin address
        const accounts = await window.ethereum?.request({ method: "eth_accounts" })
        if (accounts && accounts.length > 0) {
          setIsAdmin(accounts[0].toLowerCase() === address.toLowerCase())
        }
      }
    } catch (err) {
      console.error("Failed to check admin status:", err)
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      initializeBlockchain()
    }
  }, [isConnected, address])

  const value = {
    isInitialized,
    isAdmin,
    networkId,
    error,
    initializeBlockchain,
    checkAdminStatus,
  }

  return <BlockchainContext.Provider value={value}>{children}</BlockchainContext.Provider>
}

export function useBlockchain() {
  const context = useContext(BlockchainContext)
  if (context === undefined) {
    throw new Error("useBlockchain must be used within a BlockchainProvider")
  }
  return context
}
