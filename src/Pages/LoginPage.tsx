// import { Suspense, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { z } from "zod";
// import loginbg from "../assets/loginbg.png";

// import logo from '../images/logo.png';
// import eyeclosed from "../assets/eyeclosed.svg";
// import eyeopen from "../assets/eyeopen.svg";
// import { Input } from "../Components/InputComponent/Input";
// import ProceedButton from "../Components/ProceedButtonComponent/ProceedButtonComponent";
// import { useApiCall } from "../utils/useApiCall";
// import Cookies from "js-cookie";
// import LoadingSpinner from "../Components/Loaders/LoadingSpinner";
// import { useIsLoggedIn } from "../utils/helpers";

// const loginSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   password: z.string().min(1, "Password is required"),
// });

// const forgotPasswordSchema = z.object({
//   email: z.string().email("Invalid email address"),
// });

// type LoginFormData = z.infer<typeof loginSchema>;

// const defaultLoginFormData: LoginFormData = {
//   email: "",
//   password: "",
// };

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const { apiCall } = useApiCall();
//   const [formData, setFormData] = useState<LoginFormData>(defaultLoginFormData);
//   const [showPassword, setShowPassword] = useState(false);
//   const [isForgotPassword, setIsForgotPassword] = useState(false);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
//   const [apiError, setApiError] = useState<string | null>(null);

//   useIsLoggedIn("/home");

//   const redirectPath = searchParams.get("redirect");

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     resetFormErrors(name);
//   };

//   const resetFormErrors = (name: string) => {
//     setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
//     setApiError(null);
//   };

//   const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const validatedData = loginSchema.parse(formData);
//       const response = await apiCall({
//         endpoint: "/v1/auth/login",
//         method: "post",
//         data: validatedData,
//         successMessage: "Login Successful!",
//       });

//       const userData = {
//         token: response.headers.access_token,
//         ...response.data,
//       };
//       Cookies.set("userData", JSON.stringify(userData), {
//         expires: 7,
//         path: "/",
//         sameSite: "Lax",
//       }); // Token expires in 7 days
//       navigate(redirectPath || "/home");
//     } catch (error: any) {
//       if (error instanceof z.ZodError) {
//         setFormErrors(error.issues);
//       } else {
//         const message = error?.response?.data?.message || "Login failed";
//         setApiError(`Login failed: ${message}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const validatedData = forgotPasswordSchema.parse(formData);
//       await apiCall({
//         endpoint: "/v1/auth/forgot-password",
//         method: "post",
//         data: validatedData,
//         successMessage: "Password reset email sent!",
//       });
//     } catch (error: any) {
//       if (error instanceof z.ZodError) {
//         setFormErrors(error.issues);
//       } else {
//         const message =
//           error?.response?.data?.message || "Failed to send reset email";
//         setApiError(`Forgot password failed: ${message}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getFieldError = (fieldName: string) => {
//     return formErrors.find((error) => error.path[0] === fieldName)?.message;
//   };

//   const isFormFilled = isForgotPassword
//     ? forgotPasswordSchema.safeParse(formData).success
//     : loginSchema.safeParse(formData).success;

//   return (
//     <Suspense
//       fallback={
//         <LoadingSpinner parentClass="flex items-center justify-center w-full h-full" />
//       }
//     >
//       <main className="relative flex flex-col items-center justify-center gap-[60px] px-4 py-16 w-full min-h-screen">
//         <img src={"/Images/logo.png"} alt="Logo" className="w-[120px] z-10" />
//         <section className="flex w-full flex-col items-center justify-center gap-2 z-10 max-w-[500px]">
//           <div className="flex flex-col items-center justify-center">
//             <h1 className="text-[32px] text-primary font-medium font-secondary">
//               {isForgotPassword ? "See who forgot something" : "Welcome Back"}
//             </h1>
//             <em className="text-xs text-textDarkGrey text-center max-w-[220px]">
//               {isForgotPassword
//                 ? "Input your email below, we will send you a link to help reset your password."
//                 : "Sign In to Access your Workplace"}
//             </em>
//           </div>
//           <form
//             className="flex w-full flex-col items-center justify-center pt-[50px] gap-4 pb-[24px]"
//             onSubmit={isForgotPassword ? handleForgotPassword : handleLogin}
//             noValidate
//           >
//             <Input
//               type="email"
//               name="email"
//               label="EMAIL"
//               value={formData.email}
//               onChange={handleInputChange}
//               placeholder="Email"
//               required={true}
//               style="max-w-[400px]"
//               className="flex flex-col items-center justify-center"
//               errorMessage={getFieldError("email")}
//               errorClass="max-w-[400px]"
//             />
//             {!isForgotPassword && (
//               <Input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 label="PASSWORD"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 placeholder="Password"
//                 required={true}
//                 style="max-w-[400px]"
//                 className="flex flex-col items-center justify-center"
//                 errorMessage={getFieldError("password")}
//                 errorClass="max-w-[400px]"
//                 iconRight={
//                   <img
//                     src={showPassword ? eyeopen : eyeclosed}
//                     className="w-[16px] cursor-pointer"
//                     onClick={() => setShowPassword(!showPassword)}
//                     alt="Toggle password visibility"
//                   />
//                 }
//               />
//             )}
//             {apiError && (
//               <p className="text-errorTwo text-sm mt-2 text-center font-semibold w-max bg-white px-3 py-1 rounded-full">
//                 {apiError}
//               </p>
//             )}
//             <div className="flex flex-col items-center justify-center gap-8 pt-8">
//               <ProceedButton
//                 type="submit"
//                 loading={loading}
//                 variant={isFormFilled ? "gradient" : "gray"}
//                 disabled={!isFormFilled}
//               />
//               {isForgotPassword ? (
//                 <em
//                   className={`${formData.email ? "text-textDarkGrey" : "text-white"
//                     } text-sm font-medium underline cursor-pointer`}
//                   onClick={() => {
//                     setIsForgotPassword(false);
//                     setFormData(defaultLoginFormData);
//                     setFormErrors([]);
//                     setApiError(null);
//                   }}
//                 >
//                   Back to Login
//                 </em>
//               ) : (
//                 <em
//                   className={`${formData.email || formData.password
//                     ? "text-textDarkGrey"
//                     : "text-white"
//                     } text-sm font-medium underline cursor-pointer`}
//                   onClick={() => {
//                     setIsForgotPassword(true);
//                     setFormData(defaultLoginFormData);
//                     setFormErrors([]);
//                     setApiError(null);
//                   }}
//                 >
//                   Forgot password?
//                 </em>
//               )}
//             </div>
//           </form>
//         </section>
//       </main>
//     </Suspense>
//   );
// };

// export default LoginPage;


"use client"

import type React from "react"
import { Suspense, useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { z } from "zod"
import Cookies from "js-cookie"
import { Eye, EyeOff, Lock, Mail, ChevronLeft } from "lucide-react"

import { Input } from "../Components/InputComponent/Input"
import ProceedButton from "../Components/ProceedButtonComponent/ProceedButtonComponent";
import { useApiCall } from "../utils/useApiCall"
import LoadingSpinner from "../Components/Loaders/LoadingSpinner"
import { useIsLoggedIn } from "../utils/helpers"
import { useTenant } from "@/Context/tenantsContext"
import { useTenantCustomization } from "@/hooks/useTenantCustomization"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const { login: setTenantContext} = useTenant();
  const { tenantInfo : activeTenant, loading: tenantLoading } = useTenantCustomization()

  const [tenantBranding, setTenantBranding] = useState({
    logoUrl: "/Images/logo.png", // Default logo
    theme: {
      primary: "#3b82f6", // Default blue
      secondary: "#10b981", // Default green
    }
  });
  
  useIsLoggedIn("/home")

  // Fetch tenant branding based on URL
  useEffect(() => {
    const fetchTenantBranding = async () => {
      
      if(activeTenant){
        console.log("Emeka",activeTenant)
        setTenantContext(activeTenant)
        
      }
    };

    fetchTenantBranding();
  }, [tenantLoading]);

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
      const response = await apiCall({
        endpoint: "/v1/auth/login",
        method: "post",
        data: validatedData,
        successMessage: "Login Successful!",
        showToast: false
      })

      const user = response.data.user;
      
      // If we already have a tenant from URL context, use that
      // Otherwise use the first tenant from user's tenants
      const tenantInfo = user.tenants?.[0];
        
      const tenant = tenantInfo?.tenant;
      const role = tenantInfo?.role;

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
      };

      Cookies.set("userData", JSON.stringify(userData), {
        expires: 7,
        path: "/",
        sameSite: "Lax",
      })
      
      setTenantContext(tenant)
      navigate(redirectPath || "/home")
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

  const isFormFilled = isForgotPassword
    ? forgotPasswordSchema.safeParse(formData).success
    : loginSchema.safeParse(formData).success
   if(tenantLoading){
        return(<div>Loading</div>)
   }
  return (
    <Suspense fallback={<LoadingSpinner parentClass="flex items-center justify-center w-full h-full" />}>
      <div className="flex min-h-screen w-full">
        {/* Left side - Decorative with tenant colors */}
        <div 
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
          style={{
            background: `linear-gradient(to bottom right, ${tenantBranding.theme.primary}, ${tenantBranding.theme.secondary})`
          }}
        >
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
              src={tenantBranding.logoUrl} 
              alt="Logo" 
              className="mx-auto h-16 w-auto" 
              onError={(e) => {
                
                (e.target as HTMLImageElement).src = "/Images/logo.png";
              }}
            />

            <div className="mt-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                {isForgotPassword ? "Reset Your Password" : "Sign in to your account"}
              </h2>
              <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                {isForgotPassword
                  ? "Enter your email address and we'll send you a link to reset your password."
                  : "Enter your credentials to access your workspace and continue your work."}
              </p>
            </div>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
            <div className="bg-white px-6 py-12 shadow-sm sm:rounded-lg sm:px-12 border border-gray-100">
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