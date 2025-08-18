"use client"

import { useState, useEffect } from "react"
import { blockchainService } from "@/lib/blockchain"

export interface WalletState {
  isConnected: boolean
  address: string | null
  isConnecting: boolean
  error: string | null
}

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isConnecting: false,
    error: null,
  })

  const connectWallet = async () => {
    if (state.isConnecting) {
      console.log("[v0] Connection already in progress")
      return
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }))

    try {
      const success = await blockchainService.connectWallet()
      if (success) {
        const address = await blockchainService.getCurrentAccount()
        setState({
          isConnected: true,
          address,
          isConnecting: false,
          error: null,
        })
      } else {
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "Failed to connect wallet",
        }))
      }
    } catch (error) {
      let errorMessage = "Unknown error"
      if (error instanceof Error) {
        if (error.message.includes("already pending")) {
          errorMessage = "Please check your wallet and complete the pending request"
        } else {
          errorMessage = error.message
        }
      }

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }))
    }
  }

  const disconnectWallet = () => {
    setState({
      isConnected: false,
      address: null,
      isConnecting: false,
      error: null,
    })
  }

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await blockchainService.isConnected()
        if (isConnected) {
          const address = await blockchainService.getCurrentAccount()
          setState((prev) => ({
            ...prev,
            isConnected: true,
            address,
          }))
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }

    checkConnection()
  }, [])

  return {
    ...state,
    connectWallet,
    disconnectWallet,
  }
}
