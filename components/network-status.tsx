"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wifi, WifiOff, AlertTriangle } from "lucide-react"
import { useBlockchain } from "@/components/blockchain-provider"

export function NetworkStatus() {
  const { isInitialized, networkId, error } = useBlockchain()

  const getNetworkName = (id: number | null) => {
    switch (id) {
      case 1:
        return "Ethereum Mainnet"
      case 11155111:
        return "Sepolia Testnet"
      case 31337:
        return "Hardhat Local"
      default:
        return `Network ${id}`
    }
  }

  const getNetworkStatus = () => {
    if (error) return "error"
    if (!isInitialized) return "disconnected"
    return "connected"
  }

  const status = getNetworkStatus()

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status === "connected" && <Wifi className="h-5 w-5 text-green-500" />}
            {status === "disconnected" && <WifiOff className="h-5 w-5 text-muted-foreground" />}
            {status === "error" && <AlertTriangle className="h-5 w-5 text-destructive" />}

            <div>
              <p className="font-medium">
                {status === "connected" && "Blockchain Connected"}
                {status === "disconnected" && "Blockchain Disconnected"}
                {status === "error" && "Connection Error"}
              </p>
              {networkId && <p className="text-sm text-muted-foreground">{getNetworkName(networkId)}</p>}
            </div>
          </div>

          <Badge variant={status === "connected" ? "default" : status === "error" ? "destructive" : "secondary"}>
            {status === "connected" && "Online"}
            {status === "disconnected" && "Offline"}
            {status === "error" && "Error"}
          </Badge>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {networkId === 31337 && (
          <Alert className="mt-4">
            <AlertDescription>
              You're connected to a local development network. Make sure your Hardhat node is running.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
