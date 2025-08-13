import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Key, Shield, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Download className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-semibold text-slate-900">Media DL Manager</span>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-login"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Professional Media Download Management
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Comprehensive platform for managing multi-platform media downloads with advanced API management, 
            real-time monitoring, and enterprise-grade security.
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Powerful Features</h2>
          <p className="text-lg text-slate-600">Everything you need to manage media downloads at scale</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Key className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>
                Generate and manage secure API keys with rate limiting and usage tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Multi-Platform Support</CardTitle>
              <CardDescription>
                Download from YouTube, Spotify, Instagram and more with unified API
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-600 mb-4" />
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>
                Track download progress, system logs, and performance metrics in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Enterprise Security</CardTitle>
              <CardDescription>
                Advanced authentication, rate limiting, and comprehensive audit logging
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of developers using our platform for media download management
          </p>
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-transparent border-white text-white hover:bg-white hover:text-slate-900"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-sign-up"
          >
            Sign Up Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t py-8">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p>&copy; 2024 Media DL Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
