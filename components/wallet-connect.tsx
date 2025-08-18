"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Shield, CheckCircle } from "lucide-react"
import { useWallet } from "@/lib/hooks/useWallet"

export function WalletConnect() {
  const { isConnected, address, isConnecting, error, connectWallet } = useWallet()

  if (isConnected && address) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold">Wallet Connected</CardTitle>
          <CardDescription>Your wallet is successfully connected</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium text-muted-foreground">Connected Address:</p>
            <p className="text-sm font-mono break-all">{address}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Wallet className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl font-semibold">Connect Your Wallet</CardTitle>
        <CardDescription>Connect your MetaMask wallet to participate in university elections</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>Secure blockchain-based voting</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span>Transparent and verifiable results</span>
          </div>
        </div>

        <Button onClick={connectWallet} disabled={isConnecting} className="w-full" size="lg">
          {isConnecting ? "Connecting..." : "Connect MetaMask Wallet"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Don't have MetaMask?{" "}
          <a
            href="https://metamask.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Download here
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
