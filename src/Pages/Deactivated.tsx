
// const Deactivated = () => {

//   return (
//     <>
//       Deactivated
//     </>
//   );
// };

// export default Deactivated;
"use client"
import { Button } from "@/Components/ui/button"
import { AlertTriangle, Mail, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const DeactivatedPage = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate("/")
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-customPrimary to-customSecondary relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 z-10">
          <div className="text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Access Restricted</h1>
            <p className="text-xl max-w-md text-center mb-8">
              Your workspace access has been temporarily suspended. Please contact support for assistance.
            </p>

            {/* Support Features */}
            <div className="space-y-4 w-full max-w-md">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3 mx-auto">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-medium mb-1">Quick Support</h3>
                <p className="text-sm text-white/80">Get help from our support team within 24 hours</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3 mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <h3 className="font-medium mb-1">Account Recovery</h3>
                <p className="text-sm text-white/80">We'll help restore your workspace access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/10"></div>
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/10"></div>
      </div>

      {/* Right side - Content */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 lg:px-8 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          {/* Mobile Alert Icon */}
          <div className="lg:hidden w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>

          <img src="/Images/logo.png" alt="Logo" className="mx-auto h-16 w-auto mb-8" />

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Access Denied</h2>
              <p className="text-lg text-gray-600 mb-6">Sorry, you don't have access to this workspace.</p>
              <p className="text-sm text-gray-500 mb-8">
                Your account may have been deactivated or suspended. Please contact your administrator for assistance.
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Email Support</p>
                    <a href="mailto:support@ubuxa.ng" className="text-sm text-blue-600 hover:text-blue-500">
                      support@ubuxa.ng
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-green-600"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Response Time</p>
                    <p className="text-sm text-gray-500">Usually within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <a
                href="mailto:support@ubuxa.ng?subject=Account Access Issue&body=Hello, I'm having trouble accessing my workspace. Please help me restore access."
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                Contact Support
              </a>

              <Button
                variant="outline"
                onClick={handleGoBack}
                className="w-full flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-xs text-gray-400">
                If you believe this is an error, please include your email address and workspace details when contacting
                support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeactivatedPage
