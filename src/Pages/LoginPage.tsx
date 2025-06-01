// "use client"

// import type React from "react"

// import { Suspense, useState } from "react"
// import { useNavigate, useSearchParams } from "react-router-dom"
// import { z } from "zod"
// import Cookies from "js-cookie"
// import { Eye, EyeOff, Lock, Mail, ChevronLeft } from "lucide-react"

// import { Input } from "../Components/InputComponent/Input"
// import ProceedButton from "../Components/ProceedButtonComponent/ProceedButtonComponent";
// import { useApiCall } from "../utils/useApiCall"
// import LoadingSpinner from "../Components/Loaders/LoadingSpinner"
// import { useIsLoggedIn } from "../utils/helpers"
// import { useTenant } from "@/Context/tenantsContext"

// const loginSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   password: z.string().min(1, "Password is required"),
// })

// const forgotPasswordSchema = z.object({
//   email: z.string().email("Invalid email address"),
// })

// type LoginFormData = z.infer<typeof loginSchema>

// const defaultLoginFormData: LoginFormData = {
//   email: "",
//   password: "",
// }

// const LoginPage = () => {
//   const navigate = useNavigate()
//   const [searchParams] = useSearchParams()
//   const { apiCall } = useApiCall()
//   const [formData, setFormData] = useState<LoginFormData>(defaultLoginFormData)
//   const [showPassword, setShowPassword] = useState(false)
//   const [tempToken, setTempToken] = useState<string>()
//   const [isForgotPassword, setIsForgotPassword] = useState(false)
//   const [hasMultipleTenants, setHasMultipleTenants] = useState(false)
//   const [multipleTenants, setMultipleTenants] = useState<any[]>()
//   const [loading, setLoading] = useState<boolean>(false)
//   const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([])
//   const [apiError, setApiError] = useState<string | null>(null)
//   const { login: setTenantContext } = useTenant();
//   useIsLoggedIn("/home")


//   const redirectPath = searchParams.get("redirect")

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//     resetFormErrors(name)
//   }

//   const resetFormErrors = (name: string) => {
//     setFormErrors((prev) => prev.filter((error) => error.path[0] !== name))
//     setApiError(null)
//   }

//   const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     setLoading(true)

//     try {

//       const validatedData = loginSchema.parse(formData)
//       const response = await apiCall({
//         endpoint: "/v1/auth/login",
//         method: "post",
//         data: validatedData,
//         successMessage: "Login Successful!",
//         showToast: false
//       })
//       if (response.data.hasMultipleTenants) {
//         setHasMultipleTenants(true)
//         setMultipleTenants(response.data.tenants)
//         setTempToken(response.data.access_token)
//         console.log("i am temp token", response.data.access_token)
//         return;
//       }

//       const user = response.data.user;
//       const tenantInfo = user.tenants?.[0]; // Assuming tenant is selected or default
//       const tenant = tenantInfo?.tenant;
//       const role = tenantInfo?.role;

//       const userData = {
//         token: response.headers.access_token,
//         id: user.id,
//         firstname: user.firstname,
//         lastname: user.lastname,
//         username: user.username,
//         email: user.email,
//         phone: user.phone,
//         location: user.location,
//         //staffId: user.staffId,
//         status: user.status,
//         isBlocked: user.isBlocked,

//         // createdAt: user.createdAt,
//         // updatedAt: user.updatedAt,
//         // deletedAt: user.deletedAt,
//         roleId: tenantInfo?.roleId,
//         role: {
//           id: role?.id,
//           role: role?.role,
//           active: role?.active,
//           // permissionIds: role?.permissionIds,
//           // permissions: role?.permissions,
//           created_at: role?.created_at,
//           updated_at: role?.updated_at,
//           deleted_at: role?.deleted_at,
//         },
//         tenant: {
//           id: tenant?.id,
//           status: tenant?.status,
//           paymentProvider: tenant?.paymentProvider,
//           providerPublicKey: tenant?.providerPublicKey,
//           logoUrl: tenant?.logoUrl,
//           faviconUrl: tenant?.faviconUrl,
//           theme: tenant?.theme,
//         },
//       };


//       Cookies.set("userData", JSON.stringify(userData), {
//         expires: 7,
//         path: "/",
//         sameSite: "Lax",
//       }) // Token expires in 7 days
//       setTenantContext(tenant)
//       navigate(redirectPath || "/home")
//     } catch (error: any) {
//       if (error instanceof z.ZodError) {
//         setFormErrors(error.issues)
//       } else {
//         const message = error?.response?.data?.message || "Login failed"
//         setApiError(`Login failed: ${message}`)
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const validatedData = forgotPasswordSchema.parse(formData)
//       await apiCall({
//         endpoint: "/v1/auth/forgot-password",
//         method: "post",
//         data: validatedData,
//         successMessage: "Password reset email sent!",
//       })
//     } catch (error: any) {
//       if (error instanceof z.ZodError) {
//         setFormErrors(error.issues)
//       } else {
//         const message = error?.response?.data?.message || "Failed to send reset email"
//         setApiError(`Forgot password failed: ${message}`)
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getFieldError = (fieldName: string) => {
//     return formErrors.find((error) => error.path[0] === fieldName)?.message
//   }
//   const handleSelectTenant = async (tenantId: string) => {
//     try {
//       console.log("i am temp token 2", tempToken)
//       const response = await apiCall({
//         endpoint: `/v1/auth/select-tenant/${tenantId}`,
//         method: "get",
//         successMessage: "Login Successful!",
//         headers: {
//           Authorization: tempToken,
//         },
//         showToast: false
//       })

//       const user = response.data.user;
//       const tenantInfo = user.tenants?.[0]; // Assuming tenant is selected or default
//       const tenant = tenantInfo?.tenant;
//       const role = tenantInfo?.role;

//       const userData = {
//         token: response.headers.access_token,
//         id: user.id,
//         firstname: user.firstname,
//         lastname: user.lastname,
//         username: user.username,
//         email: user.email,
//         phone: user.phone,
//         location: user.location,
//         //staffId: user.staffId,
//         status: user.status,
//         isBlocked: user.isBlocked,

//         // createdAt: user.createdAt,
//         // updatedAt: user.updatedAt,
//         // deletedAt: user.deletedAt,
//         roleId: tenantInfo?.roleId,
//         role: {
//           id: role?.id,
//           role: role?.role,
//           active: role?.active,
//           // permissionIds: role?.permissionIds,
//           // permissions: role?.permissions,
//           created_at: role?.created_at,
//           updated_at: role?.updated_at,
//           deleted_at: role?.deleted_at,
//         },
//         tenant: {
//           id: tenant?.id,
//           status: tenant?.status,
//           paymentProvider: tenant?.paymentProvider,
//           providerPublicKey: tenant?.providerPublicKey,
//           logoUrl: tenant?.logoUrl,
//           faviconUrl: tenant?.faviconUrl,
//           theme: tenant?.theme,
//         },
//       };


//       Cookies.set("userData", JSON.stringify(userData), {
//         expires: 7,
//         path: "/",
//         sameSite: "Lax",
//       }) // Token expires in 7 days
//       setTenantContext(tenant)
//       navigate(redirectPath || "/home")
//     } catch (error: any) {
//       console.log(error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const isFormFilled = isForgotPassword
//     ? forgotPasswordSchema.safeParse(formData).success
//     : loginSchema.safeParse(formData).success

//   return (
//     <Suspense fallback={<LoadingSpinner parentClass="flex items-center justify-center w-full h-full" />}>
//       <div className="flex min-h-screen w-full">
//         {/* Left side - Decorative */}
//         <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
//           <div className="absolute inset-0 bg-black opacity-20"></div>
//           <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 z-10">
//             <h1 className="text-4xl font-bold mb-6">Welcome to Your Workspace</h1>
//             <p className="text-xl max-w-md text-center mb-8">
//               Access your projects, collaborate with your team, and boost your productivity.
//             </p>
//             <div className="grid grid-cols-2 gap-6 w-full max-w-md">
//               <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
//                 <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="20"
//                     height="20"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
//                   </svg>
//                 </div>
//                 <h3 className="font-medium mb-1">Secure Access</h3>
//                 <p className="text-sm text-white/80">Your data is protected with enterprise-grade security</p>
//               </div>
//               <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
//                 <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="20"
//                     height="20"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
//                     <circle cx="9" cy="7" r="4"></circle>
//                     <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
//                     <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
//                   </svg>
//                 </div>
//                 <h3 className="font-medium mb-1">Team Collaboration</h3>
//                 <p className="text-sm text-white/80">Work together seamlessly with your team</p>
//               </div>
//             </div>
//           </div>
//           {/* Decorative circles */}
//           <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/10"></div>
//           <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/10"></div>
//         </div>

//         {/* Right side - Login form */}
//         <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 lg:px-8 bg-white">
//           <div className="sm:mx-auto sm:w-full sm:max-w-md">
//             <img src="/Images/logo.png" alt="Logo" className="mx-auto h-16 w-auto" />

//             <div className="mt-10 text-center">
//               <h2 className="text-3xl font-bold tracking-tight text-gray-900">
//                 {isForgotPassword ? "Reset Your Password" : "Sign in to your account"}
//               </h2>
//               <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
//                 {isForgotPassword
//                   ? "Enter your email address and we'll send you a link to reset your password."
//                   : "Enter your credentials to access your workspace and continue your work."}
//               </p>
//             </div>
//           </div>

//           <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
//             <div className="bg-white px-6 py-12 shadow-sm sm:rounded-lg sm:px-12 border border-gray-100">
//               {hasMultipleTenants ? (
//                 <div>
//                   {multipleTenants ? multipleTenants.map((tenant) => (
//                     <div key={tenant.id}>
//                       <div>{tenant.name}</div>
//                       <button onClick={() => handleSelectTenant(tenant.tenantId)}>Select</button>
//                     </div>
//                   )) : null}
//                 </div>
//               ) :
//                 <form className="space-y-6" onSubmit={isForgotPassword ? handleForgotPassword : handleLogin} noValidate>
//                   <div>
//                     <div className="relative">
//                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         type="email"
//                         name="email"
//                         label="EMAIL"
//                         value={formData.email}
//                         onChange={handleInputChange}
//                         placeholder="you@example.com"
//                         required={true}
//                         style="pl-10"
//                         className="flex flex-col"
//                         errorMessage={getFieldError("email")}
//                       />
//                     </div>
//                   </div>

//                   {!isForgotPassword && (
//                     <div>
//                       <div className="relative">
//                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                         <Input
//                           type={showPassword ? "text" : "password"}
//                           name="password"
//                           label="PASSWORD"
//                           value={formData.password}
//                           onChange={handleInputChange}
//                           placeholder="••••••••"
//                           required={true}
//                           style="pl-10"
//                           className="flex flex-col"
//                           errorMessage={getFieldError("password")}
//                           iconRight={
//                             showPassword ? (
//                               <EyeOff
//                                 className="h-5 w-5 text-gray-400 cursor-pointer"
//                                 onClick={() => setShowPassword(false)}
//                               />
//                             ) : (
//                               <Eye
//                                 className="h-5 w-5 text-gray-400 cursor-pointer"
//                                 onClick={() => setShowPassword(true)}
//                               />
//                             )
//                           }
//                         />
//                       </div>
//                     </div>
//                   )}

//                   {apiError && (
//                     <div className="rounded-md bg-red-50 p-4">
//                       <div className="flex">
//                         <div className="flex-shrink-0">
//                           <svg
//                             className="h-5 w-5 text-red-400"
//                             viewBox="0 0 20 20"
//                             fill="currentColor"
//                             aria-hidden="true"
//                           >
//                             <path
//                               fillRule="evenodd"
//                               d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
//                               clipRule="evenodd"
//                             />
//                           </svg>
//                         </div>
//                         <div className="ml-3">
//                           <h3 className="text-sm font-medium text-red-800">{apiError}</h3>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   <div className="flex items-center justify-center">
//                     <ProceedButton
//                       type="submit"
//                       loading={loading}
//                       variant={isFormFilled ? "gradient" : "gray"}
//                       disabled={!isFormFilled}
//                     />

//                   </div>
//                 </form>
//               }


//               <div className="mt-6">
//                 <div className="relative">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-gray-200"></div>
//                   </div>
//                   <div className="relative flex justify-center text-sm font-medium leading-6">
//                     <span className="bg-white px-6 text-gray-500">
//                       {isForgotPassword ? "Remember your password?" : "Forgot your password?"}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="mt-6 flex justify-center">
//                   <button
//                     type="button"
//                     className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1"
//                     onClick={() => {
//                       setIsForgotPassword(!isForgotPassword)
//                       setFormData(defaultLoginFormData)
//                       setFormErrors([])
//                       setApiError(null)
//                     }}
//                   >
//                     {isForgotPassword ? (
//                       <>
//                         <ChevronLeft className="h-4 w-4" />
//                         Back to login
//                       </>
//                     ) : (
//                       "Reset your password"
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <p className="mt-10 text-center text-sm text-gray-500">
//               Need help?{" "}
//               <a href="#" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
//                 Contact support
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </Suspense>
//   )
// }

// export default LoginPage


"use client"

import type React from "react"
import { Suspense, useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { z } from "zod"
import Cookies from "js-cookie"
import { Eye, EyeOff, ArrowRight, Lock, Mail, ChevronLeft, Building, Loader2, ArrowLeft } from "lucide-react"

import { Input } from "../Components/InputComponent/Input"
import ProceedButton from "../Components/ProceedButtonComponent/ProceedButtonComponent"
import { useApiCall } from "../utils/useApiCall"
import LoadingSpinner from "../Components/Loaders/LoadingSpinner"
import { useIsLoggedIn } from "../utils/helpers"
import { useTenant } from "@/Context/tenantsContext"
import { useTenantCustomization } from "@/hooks/useTenantCustomization"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  tenantId: z.string().optional(),
})

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

type LoginFormData = z.infer<typeof loginSchema>

const defaultLoginFormData: LoginFormData = {
  email: "",
  password: "",
}

const LoginPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { apiCall } = useApiCall()
  const [formData, setFormData] = useState<LoginFormData>(defaultLoginFormData)
  const [showPassword, setShowPassword] = useState(false)
  const [tempToken, setTempToken] = useState<string>()
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [hasMultipleTenants, setHasMultipleTenants] = useState(false)
  const [multipleTenants, setMultipleTenants] = useState<any[]>()
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const { login: setTenantContext } = useTenant()

  const { tenantInfo: activeTenant, loading: tenantLoading } = useTenantCustomization()

  useIsLoggedIn("/home")

  // Fetch tenant branding based on URL
  useEffect(() => {

    const fetchTenantBranding = async () => {
      if (activeTenant) {
        setTenantContext(activeTenant)
      }
    }

    fetchTenantBranding()
  }, [activeTenant, setTenantContext])

  const redirectPath = searchParams.get("redirect")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    resetFormErrors(name)
  }


  const resetFormErrors = (name: string) => {
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name))
    setApiError(null)
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const validatedData = loginSchema.parse(formData)

      if (activeTenant) {
        validatedData.tenantId = activeTenant.id
        console.log("tenants")
      }

      const response = await apiCall({
        endpoint: "/v1/auth/login",
        method: "post",
        data: validatedData,
        successMessage: "Login Successful!",
        showToast: false
      })

      if (response.data.hasMultipleTenants) {
        setHasMultipleTenants(true)
        setMultipleTenants(response.data.tenants)
        setTempToken(response.data.access_token)
        console.log("i am temp token", response.data.access_token)
        return
      }

      const user = response.data.user
      const tenantInfo = user.tenants?.[0]
      const tenant = tenantInfo?.tenant
      const role = tenantInfo?.role

      const userData = {
        token: response.headers.access_token,
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        phone: user.phone,
        location: user.location,
        status: user.status,
        isBlocked: user.isBlocked,
        roleId: tenantInfo?.roleId,
        role: {
          id: role?.id,
          role: role?.role,
          active: role?.active,
          created_at: role?.created_at,
          updated_at: role?.updated_at,
          deleted_at: role?.deleted_at,
        },
        tenant: {
          id: tenant?.id,
          status: tenant?.status,
          paymentProvider: tenant?.paymentProvider,
          providerPublicKey: tenant?.providerPublicKey,
          logoUrl: tenant?.logoUrl,
          faviconUrl: tenant?.faviconUrl,
          theme: tenant?.theme,
        },
      }

      Cookies.set("userData", JSON.stringify(userData), {
        expires: 7,
        path: "/",
        sameSite: "Lax",
      })

      setTenantContext(tenant)
      switch (tenant?.status) {
        case "ACTIVE":
          navigate(redirectPath || "/home")
          break
        case "DEACTIVATED":
          navigate("/deactivated")
          break
        default:
          navigate("/onboarding")
          break
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues)
      } else {
        const message = error?.response?.data?.message || "Login failed"
        setApiError(`Login failed: ${message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const validatedData = forgotPasswordSchema.parse(formData)
      await apiCall({
        endpoint: "/v1/auth/forgot-password",
        method: "post",
        data: validatedData,
        successMessage: "Password reset email sent!",
      })
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues)
      } else {
        const message = error?.response?.data?.message || "Failed to send reset email"
        setApiError(`Forgot password failed: ${message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message
  }

  const handleSelectTenant = async (tenantId: string) => {
    setSelectedTenantId(tenantId)
    try {
      console.log("i am temp token 2", tempToken)
      const response = await apiCall({
        endpoint: `/v1/auth/select-tenant/${tenantId}`,
        method: "get",
        successMessage: "Login Successful!",
        headers: {
          Authorization: tempToken,
        },
        showToast: false,
      })

      const user = response.data.user
      const tenantInfo = user.tenants?.[0]
      const tenant = tenantInfo?.tenant
      const role = tenantInfo?.role

      const userData = {
        token: response.headers.access_token,
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        phone: user.phone,
        location: user.location,
        status: user.status,
        isBlocked: user.isBlocked,
        roleId: tenantInfo?.roleId,
        role: {
          id: role?.id,
          role: role?.role,
          active: role?.active,
          created_at: role?.created_at,
          updated_at: role?.updated_at,
          deleted_at: role?.deleted_at,
        },
        tenant: {
          id: tenant?.id,
          status: tenant?.status,
          paymentProvider: tenant?.paymentProvider,
          providerPublicKey: tenant?.providerPublicKey,
          logoUrl: tenant?.logoUrl,
          faviconUrl: tenant?.faviconUrl,
          theme: tenant?.theme,
        },
      }

      Cookies.set("userData", JSON.stringify(userData), {
        expires: 7,
        path: "/",
        sameSite: "Lax",
      })
      setTenantContext(tenant)
      navigate(redirectPath || "/home")
    } catch (error: any) {
      console.log(error)
    } finally {
      setSelectedTenantId(null)
    }
  }

  const handleBackToLogin = () => {
    setHasMultipleTenants(false)
    setMultipleTenants(undefined)
    setTempToken(undefined)
    setSelectedTenantId(null)
  }

  const isFormFilled = isForgotPassword
    ? forgotPasswordSchema.safeParse(formData).success
    : loginSchema.safeParse(formData).success

  if (tenantLoading) {
    return (<div className="flex flex-col items-center justify-center min-h-screen p-4">
      <img src="/Images/loader.gif" alt="Loader" className="w-['100px'] height-['100px']" />
      <p className="text-lg text-[#333333]">Loading tenant information...</p>
    </div>)
  }

  return (
    <Suspense fallback={<LoadingSpinner parentClass="flex items-center justify-center w-full h-full" />}>
      <div className="flex min-h-screen w-full">
        {/* Left side - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-customPrimary to-customSecondary relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 z-10">
            <h1 className="text-4xl font-bold mb-6">Welcome to Your Workspace</h1>
            <p className="text-xl max-w-md text-center mb-8">
              Access your projects, collaborate with your team, and boost your productivity.
            </p>
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3">
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
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h3 className="font-medium mb-1">Secure Access</h3>
                <p className="text-sm text-white/80">Your data is protected with enterprise-grade security</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3">
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
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="font-medium mb-1">Team Collaboration</h3>
                <p className="text-sm text-white/80">Work together seamlessly with your team</p>
              </div>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/10"></div>
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/10"></div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 lg:px-8 bg-white">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
              src={activeTenant?.logoUrl || "/Images/logo.png"}
              alt="Logo"
              className="mx-auto h-16 w-auto"
            />

            <div className="mt-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                {hasMultipleTenants
                  ? "Select Your Workspace"
                  : isForgotPassword
                    ? "Reset Your Password"
                    : "Sign in to your account"}
              </h2>
              <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                {hasMultipleTenants
                  ? "Choose the workspace you want to access"
                  : isForgotPassword
                    ? "Enter your email address and we'll send you a link to reset your password."
                    : "Enter your credentials to access your workspace and continue your work."}
              </p>
            </div>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
            <div className="bg-white px-6 py-12 shadow-sm sm:rounded-lg sm:px-12 border border-gray-100">
              {hasMultipleTenants ? (
                <div className="space-y-6">
                  {/* Back Button */}
                  <button
                    onClick={handleBackToLogin}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to login
                  </button>

                  {/* Tenant Selection */}
                  <div className="space-y-4">
                    {multipleTenants?.map((tenant) => (
                      <div
                        key={tenant.id}
                        className={`relative group cursor-pointer transition-all duration-200 ${selectedTenantId === tenant.tenantId ? "opacity-75 cursor-not-allowed" : "hover:shadow-md"
                          }`}
                        onClick={() => (selectedTenantId ? null : handleSelectTenant(tenant.tenantId))}
                      >
                        <div className="border border-gray-200 rounded-lg p-6 bg-white hover:border-blue-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Building className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {tenant.name}
                                </h3>
                                <p className="text-sm text-gray-500">Click to access workspace</p>
                              </div>
                            </div>

                            <div className="flex items-center">
                              {selectedTenantId === tenant.tenantId ? (
                                <div className="flex items-center space-x-2">
                                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                  <span className="text-sm text-blue-600 font-medium">Connecting...</span>
                                </div>
                              ) : (
                                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Loading overlay */}
                        {selectedTenantId === tenant.tenantId && (
                          <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
                            <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
                              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">Accessing workspace...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Help text */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Don't see your workspace? Contact your administrator for access.
                    </p>
                  </div>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={isForgotPassword ? handleForgotPassword : handleLogin} noValidate>
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        name="email"
                        label="EMAIL"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        required={true}
                        style="pl-10"
                        className="flex flex-col"
                        errorMessage={getFieldError("email")}
                      />
                    </div>
                  </div>

                  {!isForgotPassword && (
                    <div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          label="PASSWORD"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          required={true}
                          style="pl-10"
                          className="flex flex-col"
                          errorMessage={getFieldError("password")}
                          iconRight={
                            showPassword ? (
                              <EyeOff
                                className="h-5 w-5 text-gray-400 cursor-pointer"
                                onClick={() => setShowPassword(false)}
                              />
                            ) : (
                              <Eye
                                className="h-5 w-5 text-gray-400 cursor-pointer"
                                onClick={() => setShowPassword(true)}
                              />
                            )
                          }
                        />
                      </div>
                    </div>
                  )}

                  {apiError && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">{apiError}</h3>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center">
                    <ProceedButton
                      type="submit"
                      loading={loading}
                      variant={isFormFilled ? "gradient" : "gray"}
                      disabled={!isFormFilled}
                    />
                  </div>
                </form>
              )}

              {!hasMultipleTenants && (
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm font-medium leading-6">
                      <span className="bg-white px-6 text-gray-500">
                        {isForgotPassword ? "Remember your password?" : "Forgot your password?"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1"
                      onClick={() => {
                        setIsForgotPassword(!isForgotPassword)
                        setFormData(defaultLoginFormData)
                        setFormErrors([])
                        setApiError(null)
                      }}
                    >
                      {isForgotPassword ? (
                        <>
                          <ChevronLeft className="h-4 w-4" />
                          Back to login
                        </>
                      ) : (
                        "Reset your password"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-10 text-center text-sm text-gray-500">
              Need help?{" "}
              <a href="#" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </Suspense>
  )
}

export default LoginPage