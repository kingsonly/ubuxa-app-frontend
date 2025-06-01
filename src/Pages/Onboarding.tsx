// import OnboardPaymentGateway from "@/Components/Onboard/OnboardPaymentGateway";
// import OnboardTenantCustomization from "@/Components/Onboard/OnboardTenantCustomization";
// import OnboardTenantRoleCreation from "@/Components/Onboard/OnboardTenantRoleCreation";
// import OnboardTenantUserInvitation from "@/Components/Onboard/OnboardTenantUserInvitation";
// import useTokens from "@/hooks/useTokens";

// const Onboarding = () => {
//   const { tenant } = useTokens();
//   const render = () => {
//     switch (tenant?.status) {
//       case "ONBOARD_PAYMENT_DETAILS":
//         return <OnboardPaymentGateway />
//       case "ONBOARD_CUSTOMIZATION":
//         return <OnboardTenantCustomization />
//       case "ONBOARD_ROLE":
//         return <OnboardTenantRoleCreation />
//       case "ONBOARD_TEAMMATE":
//         return <OnboardTenantUserInvitation />
//     }
//   }

//   return <>{render()}</>;

// };

// export default Onboarding;

"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"
import { Suspense } from "react"
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner"
import OnboardPaymentGateway from "@/Components/Onboard/OnboardPaymentGateway"
import OnboardTenantCustomization from "@/Components/Onboard/OnboardTenantCustomization"
import OnboardTenantRoleCreation from "@/Components/Onboard/OnboardTenantRoleCreation"
import OnboardTenantUserInvitation from "@/Components/Onboard/OnboardTenantUserInvitation"
import useTokens from "@/hooks/useTokens"
import { useTenant } from "@/Context/tenantsContext"
//import { useTenantCustomization } from "@/hooks/useTenantCustomization"

const OnboardingPage = () => {
  const navigate = useNavigate()
  const { tenant } = useTokens()
  const { login: setTenantContext } = useTenant()
  //const [currentStep, setCurrentStep] = useState(1)
  useEffect(() => {
    // Redirect if tenant is already active
    console.log("tenant status", tenant)
    if (tenant?.status === "ACTIVE") {
      navigate("/home")
    } else if (tenant?.status === "DEACTIVATED") {
      navigate("/deactivated")
    }
  }, [tenant?.status, navigate])

  const updateTenantStatus = (newStatus: string) => {
    if (tenant) {
      const updatedTenant = { ...tenant, status: newStatus }
      setTenantContext(updatedTenant)

      // Update cookies
      const userData = JSON.parse(Cookies.get("userData") || "{}")
      userData.tenant.status = newStatus
      Cookies.set("userData", JSON.stringify(userData), {
        expires: 7,
        path: "/",
        sameSite: "Lax",
      })

      // Navigate to home if status becomes ACTIVE
      if (newStatus === "ACTIVE") {
        navigate("/home")
      }
    }
  }

  const getStepNumber = () => {
    switch (tenant?.status) {
      case "ONBOARD_PAYMENT_DETAILS":
        return 1
      case "ONBOARD_CUSTOMIZATION":
        return 2
      case "ONBOARD_ROLE":
        return 3
      case "ONBOARD_TEAMMATE":
        return 4
      default:
        return 1
    }
  }

  const getStepTitle = () => {
    switch (tenant?.status) {
      case "ONBOARD_PAYMENT_DETAILS":
        return "Payment Gateway Setup"
      case "ONBOARD_CUSTOMIZATION":
        return "Customize Your Workspace"
      case "ONBOARD_ROLE":
        return "Create Roles & Permissions"
      case "ONBOARD_TEAMMATE":
        return "Invite Team Members"
      default:
        return "Getting Started"
    }
  }

  const getStepDescription = () => {
    switch (tenant?.status) {
      case "ONBOARD_PAYMENT_DETAILS":
        return "Configure your payment provider to start accepting payments from customers."
      case "ONBOARD_CUSTOMIZATION":
        return "Personalize your workspace with your brand colors, logo, and custom domain."
      case "ONBOARD_ROLE":
        return "Set up user roles and permissions to control access to different features."
      case "ONBOARD_TEAMMATE":
        return "Invite your team members and assign them appropriate roles."
      default:
        return "Let's set up your workspace step by step."
    }
  }

  const renderCurrentStep = () => {
    switch (tenant?.status) {
      case "ONBOARD_PAYMENT_DETAILS":
        return <OnboardPaymentGateway updateTenantStatus={updateTenantStatus} />
      case "ONBOARD_CUSTOMIZATION":
        return <OnboardTenantCustomization updateTenantStatus={updateTenantStatus} />
      case "ONBOARD_ROLE":
        return <OnboardTenantRoleCreation updateTenantStatus={updateTenantStatus} />
      case "ONBOARD_TEAMMATE":
        return <OnboardTenantUserInvitation updateTenantStatus={updateTenantStatus} />
      default:
        return <OnboardPaymentGateway updateTenantStatus={updateTenantStatus} />
    }
  }

  return (
    <Suspense fallback={<LoadingSpinner parentClass="flex items-center justify-center w-full h-full" />}>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Left side - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-customPrimary to-customSecondary relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 z-10">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Welcome to Ubuxa!</h1>
              <p className="text-xl max-w-md text-center mb-8">
                Let's get your workspace set up and ready for your team.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="w-full max-w-md space-y-4">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium">Step {getStepNumber()} of 4</span>
                <span className="text-sm">{Math.round(((getStepNumber() - 1) / 4) * 100)}% Complete</span>
              </div>

              <div className="w-full bg-white/20 rounded-full h-2 mb-8">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((getStepNumber() - 1) / 4) * 100}%` }}
                ></div>
              </div>

              <div className="space-y-4">
                {[
                  { step: 1, title: "Payment Setup", status: "ONBOARD_PAYMENT_DETAILS" },
                  { step: 2, title: "Customization", status: "ONBOARD_CUSTOMIZATION" },
                  { step: 3, title: "Roles & Permissions", status: "ONBOARD_ROLE" },
                  { step: 4, title: "Team Invitation", status: "ONBOARD_TEAMMATE" },
                ].map((item) => {
                  const isActive = tenant?.status === item.status
                  const isCompleted = getStepNumber() > item.step

                  return (
                    <div key={item.step} className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                            ? "bg-white text-customPrimary"
                            : "bg-white/20 text-white"
                          }`}
                      >
                        {isCompleted ? "✓" : item.step}
                      </div>
                      <span className={`text-sm ${isActive ? "font-semibold" : "font-normal"}`}>{item.title}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/10"></div>
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/10"></div>
        </div>

        {/* Right side - Onboarding content */}
        <div className="w-full lg:w-1/2 flex flex-col bg-white overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <img src={tenant?.logoUrl || "/Images/logo.png"} alt="Logo" className="h-10 w-auto" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{getStepTitle()}</h2>
                <p className="text-sm text-gray-600">Step {getStepNumber()} of 4</p>
              </div>
            </div>

            {/* Mobile progress */}
            <div className="lg:hidden">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(getStepNumber() / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h3>
              <p className="text-gray-600">{getStepDescription()}</p>
            </div>

            <div className="flex-1 overflow-auto">{renderCurrentStep()}</div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}

export default OnboardingPage
