"use client"

import { useState } from "react"
import { WalletConnect } from "@/components/wallet-connect"
import { ElectionSelector } from "@/components/election-selector"
import { VoterRegistrationForm } from "@/components/voter-registration-form"
import { ElectionList } from "@/components/election-list"
import { VotingInterface } from "@/components/voting-interface"
import { ResultsDashboard } from "@/components/results-dashboard"
import { AdminPanel } from "@/components/admin-panel"
import { NetworkStatus } from "@/components/network-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Vote, Users, BarChart3, ArrowLeft, Settings } from "lucide-react"
import { useWallet } from "@/lib/hooks/useWallet"
import { useBlockchain } from "@/components/blockchain-provider"
import type { Election } from "@/lib/types"

type PageView = "home" | "register" | "vote" | "results" | "admin"

export default function HomePage() {
  const { isConnected } = useWallet()
  const { isAdmin } = useBlockchain()
  const [currentView, setCurrentView] = useState<PageView>("home")
  const [selectedElection, setSelectedElection] = useState<Election | null>(null)

  const handleElectionSelect = (election: Election) => {
    setSelectedElection(election)
    // Auto-navigate based on context
    if (currentView === "results") {
      // Stay on results view
    } else {
      setCurrentView("vote")
    }
  }

  const handleResultsElectionSelect = (election: Election) => {
    setSelectedElection(election)
    setCurrentView("results")
  }

  const renderNavigation = () => (
    <nav className="hidden md:flex items-center gap-6">
      <Button variant={currentView === "home" ? "default" : "ghost"} onClick={() => setCurrentView("home")}>
        Home
      </Button>
      <Button variant={currentView === "register" ? "default" : "ghost"} onClick={() => setCurrentView("register")}>
        Register
      </Button>
      <Button variant={currentView === "vote" ? "default" : "ghost"} onClick={() => setCurrentView("vote")}>
        Vote
      </Button>
      <Button variant={currentView === "results" ? "default" : "ghost"} onClick={() => setCurrentView("results")}>
        Results
      </Button>
      {isConnected && (
        <Button variant={currentView === "admin" ? "default" : "ghost"} onClick={() => setCurrentView("admin")}>
          <Settings className="h-4 w-4 mr-2" />
          Admin
        </Button>
      )}
    </nav>
  )

  const renderBackButton = () => {
    if (currentView === "home") return null

    return (
      <Button
        variant="ghost"
        onClick={() => {
          if ((currentView === "vote" || currentView === "results") && selectedElection) {
            setSelectedElection(null)
          } else {
            setCurrentView("home")
          }
        }}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Vote className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">UNIZIK Voting System</h1>
                <p className="text-sm text-muted-foreground">Blockchain-Based Elections</p>
              </div>
            </div>
            {renderNavigation()}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderBackButton()}

        {currentView === "home" && (
          // Landing Page
          <div className="space-y-12">
            {/* Network Status */}
            <section className="flex justify-center">
              <div className="w-full max-w-md">
                <NetworkStatus />
              </div>
            </section>

            {/* Hero Section */}
            <section className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tight">Secure, Transparent, Democratic</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Experience the future of university elections with our blockchain-based voting system. Every vote is
                  secure, verifiable, and immutable.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => setCurrentView("register")}>
                  Register to Vote
                </Button>
                <Button size="lg" variant="outline" onClick={() => setCurrentView("vote")}>
                  Vote Now
                </Button>
                <Button size="lg" variant="outline" onClick={() => setCurrentView("results")}>
                  View Results
                </Button>
              </div>
            </section>

            {/* Features */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Secure & Immutable</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Every vote is cryptographically secured and permanently recorded on the blockchain, making fraud
                    virtually impossible.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Transparent Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    All votes are publicly verifiable while maintaining voter anonymity. Anyone can audit the election
                    results independently.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Real-time Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Watch election results update in real-time as votes are cast. No more waiting for manual counting or
                    result collation.
                  </CardDescription>
                </CardContent>
              </Card>
            </section>

            {/* Wallet Connection */}
            <section className="flex justify-center">
              <WalletConnect />
            </section>
          </div>
        )}

        {currentView === "admin" && (
          // Admin Panel
          <div className="space-y-8">
            {!isConnected ? (
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Admin Panel</h2>
                <p className="text-lg text-muted-foreground">Please connect your wallet to access admin features.</p>
                <WalletConnect />
              </div>
            ) : (
              <AdminPanel />
            )}
          </div>
        )}

        {/* Registration Page */}
        {currentView === "register" && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Voter Registration</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Register to participate in university elections. Connect your wallet and provide your student ID to get
                started.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
              {/* Step 1: Wallet Connection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                    1
                  </div>
                  Connect Wallet
                </div>
                <WalletConnect />
              </div>

              {/* Step 2: Election Selection */}
              {isConnected && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                      2
                    </div>
                    Select Election
                  </div>
                  <ElectionSelector onElectionSelect={setSelectedElection} selectedElection={selectedElection} />
                </div>
              )}

              {/* Step 3: Registration Form */}
              {isConnected && selectedElection && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                      3
                    </div>
                    Register
                  </div>
                  <VoterRegistrationForm electionId={selectedElection.id} electionTitle={selectedElection.title} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Election Selection for Voting */}
        {currentView === "vote" && !selectedElection && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Cast Your Vote</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Select an election to participate in. Make sure you're registered before voting.
              </p>
            </div>
            <ElectionList onElectionSelect={handleElectionSelect} />
          </div>
        )}

        {/* Voting Interface */}
        {currentView === "vote" && selectedElection && (
          <div className="space-y-8">
            <VotingInterface election={selectedElection} />
          </div>
        )}

        {/* Election Selection for Results */}
        {currentView === "results" && !selectedElection && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Election Results</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                View real-time results from completed and ongoing elections. Select an election to see detailed results.
              </p>
            </div>
            <ElectionList onElectionSelect={handleResultsElectionSelect} />
          </div>
        )}

        {/* Results Dashboard Display */}
        {currentView === "results" && selectedElection && (
          <div className="space-y-8">
            <ResultsDashboard election={selectedElection} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Vote className="h-5 w-5 text-primary" />
              <span className="font-semibold">UNIZIK Blockchain Voting System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Secure, transparent, and democratic elections powered by blockchain technology
            </p>
            <p className="text-xs text-muted-foreground">© 2024 Nnamdi Azikiwe University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
