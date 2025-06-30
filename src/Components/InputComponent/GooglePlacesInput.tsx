// import { useCallback, useEffect, useRef, useState } from "react";
// import { Input, InputType } from "./Input";

// declare global {
//   interface Window {
//     google: any;
//     __googleMapsScriptId?: string;
//   }
// }

// export type PlaceResult = {
//   geometry?: {
//     location: {
//       lat: () => number;
//       lng: () => number;
//     };
//   };
//   formatted_address?: string;
//   name: string;
// };

// type GooglePlacesInputProps = Omit<InputType, "onChange"> & {
//   onChange: (
//     value: string,
//     place?: PlaceResult,
//     coordinates?: { lat: string | null; lng: string | null }
//   ) => void;
//   value: string;
// };

// export const GooglePlacesInput = ({
//   onChange,
//   value,
//   ...props
// }: GooglePlacesInputProps) => {
//   const inputRef = useRef<HTMLInputElement>(null);
//   const autocompleteRef = useRef<any>(null);
//   const [internalValue, setInternalValue] = useState(value || "");
//   const [apiLoaded, setApiLoaded] = useState(false);

//   const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

//   // Sync internal value with external value changes
//   useEffect(() => {
//     setInternalValue(value || "");
//   }, [value]);

//   // Add CSS to fix dropdown positioning
//   useEffect(() => {
//     const style = document.createElement("style");
//     style.innerHTML = `
//       .pac-container {
//         z-index: 10000 !important;
//         margin-top: 5px !important;
//         border-radius: 8px !important;
//         box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
//         max-height: 250px !important;
//         overflow-y: auto !important;
//       }
//       .pac-item {
//         padding: 8px 12px !important;
//         cursor: pointer !important;
//       }
//       .pac-item:hover {
//         background-color: #f5f5f5 !important;
//       }
//       .pac-item-query {
//         font-size: 14px !important;
//       }
//       .pac-matched {
//         font-weight: bold !important;
//       }
//     `;
//     document.head.appendChild(style);

//     return () => {
//       document.head.removeChild(style);
//     };
//   }, []);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value;
//     setInternalValue(newValue);
//     onChange(newValue);
//   };

//   const initializeAutocomplete = useCallback(() => {
//     if (!inputRef.current || !window.google?.maps?.places) {
//       console.error("Google Maps JavaScript API not loaded properly");
//       return;
//     }

//     try {
//       autocompleteRef.current = new window.google.maps.places.Autocomplete(
//         inputRef.current,
//         {
//           types: ["geocode"],
//           componentRestrictions: { country: "ng" },
//           fields: ["geometry", "formatted_address", "name"],
//         }
//       );

//       autocompleteRef.current.addListener("place_changed", () => {
//         const place = autocompleteRef.current.getPlace();

//         if (place.geometry) {
//           const fullAddress = place.formatted_address || place.name || "";
//           const coordinates = {
//             lat: place.geometry.location.lat().toString(),
//             lng: place.geometry.location.lng().toString(),
//           };

//           setInternalValue(fullAddress);
//           onChange(fullAddress, place, coordinates);
//         } else {
//           // If no geometry, just update the text value
//           const fullAddress = place.name || "";
//           setInternalValue(fullAddress);
//           onChange(fullAddress);
//         }
//       });

//       // Prevent form submission when pressing Enter
//       inputRef.current?.addEventListener("keydown", (e) => {
//         if (e.key === "Enter") {
//           e.preventDefault();
//         }
//       });

//       setApiLoaded(true);
//     } catch (error) {
//       console.error("Error initializing Autocomplete:", error);
//     }
//   }, [onChange]);

//   useEffect(() => {
//     const scriptId = "google-maps-script";
//     const existingScript = document.getElementById(scriptId);

//     const loadScript = () => {
//       if (window.google?.maps?.places) {
//         initializeAutocomplete();
//         return;
//       }

//       if (!existingScript) {
//         const script = document.createElement("script");
//         script.id = scriptId;
//         script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
//         script.async = true;
//         script.defer = true;

//         script.onload = () => {
//           setTimeout(() => {
//             initializeAutocomplete();
//           }, 300);
//         };

//         script.onerror = () => {
//           console.error("Failed to load Google Maps JavaScript API");
//         };

//         document.body.appendChild(script);
//         window.__googleMapsScriptId = scriptId;
//       } else if (window.google?.maps?.places) {
//         initializeAutocomplete();
//       }
//     };

//     loadScript();

//     return () => {
//       if (autocompleteRef.current) {
//         window.google?.maps?.event?.clearInstanceListeners(
//           autocompleteRef.current
//         );
//       }
//     };
//   }, [apiKey, initializeAutocomplete]);

//   return (
//     <div className="google-places-container w-full relative">
//       <Input
//         {...props}
//         ref={inputRef}
//         value={internalValue}
//         onChange={handleInputChange}
//       />
//       {!apiLoaded && (
//         <div className="text-xs text-gray-500 mt-1">
//           Loading location services...
//         </div>
//       )}
//     </div>
//   );
// };















// import type React from "react"

// import { useCallback, useEffect, useRef, useState } from "react"
// import { Input, type InputType } from "./Input"

// declare global {
//   interface Window {
//     google: any
//     __googleMapsScriptId?: string
//   }
// }

// export type PlaceResult = {
//   geometry?: {
//     location: {
//       lat: () => number
//       lng: () => number
//     }
//   }
//   formatted_address?: string
//   name: string
// }

// export type AddressData = {
//   address: string
//   coordinates?: { lat: string | null; lng: string | null }
//   isManual?: boolean
// }

// type GooglePlacesInputProps = Omit<InputType, "onChange"> & {
//   onChange: (data: AddressData) => void
//   value: string
//   coordinates?: { lat: string | null; lng: string | null }
//   showManualInputs?: boolean
// }

// export const GooglePlacesInput = ({
//   onChange,
//   value,
//   coordinates,
//   showManualInputs = false,
//   ...props
// }: GooglePlacesInputProps) => {
//   const inputRef = useRef<HTMLInputElement>(null)
//   const autocompleteRef = useRef<any>(null)
//   const [internalValue, setInternalValue] = useState(value || "")
//   const [apiLoaded, setApiLoaded] = useState(false)
//   const [apiError, setApiError] = useState(false)
//   const [showFallback, setShowFallback] = useState(showManualInputs)
//   const [manualAddress, setManualAddress] = useState("")
//   const [manualLat, setManualLat] = useState(coordinates?.lat || "")
//   const [manualLng, setManualLng] = useState(coordinates?.lng || "")
//   const [isLoadingApi, setIsLoadingApi] = useState(false)

//   const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

//   // Sync internal value with external value changes
//   useEffect(() => {
//     setInternalValue(value || "")
//     if (showManualInputs) {
//       setManualAddress(value || "")
//     }
//   }, [value, showManualInputs])

//   // Sync coordinates with external changes
//   useEffect(() => {
//     if (coordinates) {
//       setManualLat(coordinates.lat || "")
//       setManualLng(coordinates.lng || "")
//     }
//   }, [coordinates])

//   // Add CSS to fix dropdown positioning
//   useEffect(() => {
//     const style = document.createElement("style")
//     style.innerHTML = `
//       .pac-container {
//         z-index: 10000 !important;
//         margin-top: 5px !important;
//         border-radius: 8px !important;
//         box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
//         max-height: 250px !important;
//         overflow-y: auto !important;
//       }
//       .pac-item {
//         padding: 8px 12px !important;
//         cursor: pointer !important;
//       }
//       .pac-item:hover {
//         background-color: #f5f5f5 !important;
//       }
//       .pac-item-query {
//         font-size: 14px !important;
//       }
//       .pac-matched {
//         font-weight: bold !important;
//       }
//     `
//     document.head.appendChild(style)
//     return () => {
//       document.head.removeChild(style)
//     }
//   }, [])

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value
//     setInternalValue(newValue)

//     // If Google Places is not working, treat as manual input
//     if (apiError || !apiLoaded) {
//       onChange({
//         address: newValue,
//         coordinates: manualLat && manualLng ? { lat: manualLat, lng: manualLng } : undefined,
//         isManual: true,
//       })
//     } else {
//       onChange({
//         address: newValue,
//         isManual: false,
//       })
//     }
//   }

//   const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value
//     setManualAddress(newValue)
//     onChange({
//       address: newValue,
//       coordinates: manualLat && manualLng ? { lat: manualLat, lng: manualLng } : undefined,
//       isManual: true,
//     })
//   }

//   const handleManualLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value
//     setManualLat(newValue)
//     onChange({
//       address: manualAddress,
//       coordinates: { lat: newValue, lng: manualLng },
//       isManual: true,
//     })
//   }

//   const handleManualLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value
//     setManualLng(newValue)
//     onChange({
//       address: manualAddress,
//       coordinates: { lat: manualLat, lng: newValue },
//       isManual: true,
//     })
//   }

//   const switchToManualMode = () => {
//     setShowFallback(true)
//     setManualAddress(internalValue)
//   }

//   const switchToGoogleMode = () => {
//     setShowFallback(false)
//     setApiError(false)
//     // Try to reinitialize if API is loaded
//     if (window.google?.maps?.places) {
//       initializeAutocomplete()
//     }
//   }

//   const initializeAutocomplete = useCallback(() => {
//     if (!inputRef.current || !window.google?.maps?.places) {
//       console.error("Google Maps JavaScript API not loaded properly")
//       setApiError(true)
//       setShowFallback(true)
//       return
//     }

//     try {
//       autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
//         types: ["geocode"],
//         componentRestrictions: { country: "ng" },
//         fields: ["geometry", "formatted_address", "name"],
//       })

//       autocompleteRef.current.addListener("place_changed", () => {
//         const place = autocompleteRef.current.getPlace()

//         if (place.geometry) {
//           const fullAddress = place.formatted_address || place.name || ""
//           const coordinates = {
//             lat: place.geometry.location.lat().toString(),
//             lng: place.geometry.location.lng().toString(),
//           }

//           setInternalValue(fullAddress)
//           setManualLat(coordinates.lat)
//           setManualLng(coordinates.lng)

//           onChange({
//             address: fullAddress,
//             coordinates,
//             isManual: false,
//           })
//         } else {
//           // If no geometry, treat as manual input
//           const fullAddress = place.name || ""
//           setInternalValue(fullAddress)
//           onChange({
//             address: fullAddress,
//             isManual: true,
//           })
//         }
//       })

//       // Prevent form submission when pressing Enter
//       inputRef.current?.addEventListener("keydown", (e) => {
//         if (e.key === "Enter") {
//           e.preventDefault()
//         }
//       })

//       setApiLoaded(true)
//       setApiError(false)
//     } catch (error) {
//       console.error("Error initializing Autocomplete:", error)
//       setApiError(true)
//       setShowFallback(true)
//     }
//   }, [onChange])

//   useEffect(() => {
//     // Check if API key is provided
//     if (!apiKey) {
//       console.warn("Google API key not provided, switching to manual mode")
//       setApiError(true)
//       setShowFallback(true)
//       return
//     }

//     const scriptId = "google-maps-script"
//     const existingScript = document.getElementById(scriptId)

//     const loadScript = () => {
//       if (window.google?.maps?.places) {
//         initializeAutocomplete()
//         return
//       }

//       if (!existingScript) {
//         setIsLoadingApi(true)
//         const script = document.createElement("script")
//         script.id = scriptId
//         script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
//         script.async = true
//         script.defer = true

//         script.onload = () => {
//           setIsLoadingApi(false)
//           setTimeout(() => {
//             initializeAutocomplete()
//           }, 300)
//         }

//         script.onerror = () => {
//           console.error("Failed to load Google Maps JavaScript API - Invalid API key or network error")
//           setIsLoadingApi(false)
//           setApiError(true)
//           setShowFallback(true)
//         }

//         document.body.appendChild(script)
//         window.__googleMapsScriptId = scriptId
//       } else if (window.google?.maps?.places) {
//         initializeAutocomplete()
//       }
//     }

//     loadScript()

//     return () => {
//       if (autocompleteRef.current) {
//         window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
//       }
//     }
//   }, [apiKey, initializeAutocomplete])

//   if (showFallback) {
//     return (
//       <div className="address-input-container w-full space-y-3">
//         {/* Manual Address Input */}
//         <div>
//           <Input
//             {...props}
//             label={props.label || "Address"}
//             value={manualAddress}
//             onChange={handleManualAddressChange}
//             placeholder="Enter your full address manually"
//           />
//         </div>

//         {/* Coordinate Inputs */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           <Input
//             name="latitude"
//             label="Latitude (Optional)"
//             type="text"
//             value={manualLat}
//             onChange={handleManualLatChange}
//             placeholder="e.g., 6.5244"
//             required={false}
//           />

//           <Input
//             name="longitude"
//             label="Longitude (Optional)"
//             type="text"

//             value={manualLng}
//             onChange={handleManualLngChange}
//             placeholder="e.g., 3.3792"
//             required={false}
//           />
//         </div>

//         {/* Status Messages */}
//         <div className="space-y-2">
//           {apiError && (
//             <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
//               ⚠️ Google Places service unavailable. Please enter your address manually.
//             </div>
//           )}

//           {!apiError && apiKey && (
//             <div className="flex items-center justify-between text-xs text-gray-600">
//               <span>Using manual address entry</span>
//               <button
//                 type="button"
//                 onClick={switchToGoogleMode}
//                 className="text-blue-600 hover:text-blue-800 underline"
//               >
//                 Try Google Places again
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="google-places-container w-full relative space-y-2">
//       <Input {...props} ref={inputRef} value={internalValue} onChange={handleInputChange} />

//       {/* Status Messages */}
//       <div className="space-y-1">
//         {isLoadingApi && (
//           <div className="text-xs text-blue-600 flex items-center gap-1">
//             <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
//             Loading Google Places...
//           </div>
//         )}

//         {!apiLoaded && !isLoadingApi && !apiError && (
//           <div className="text-xs text-gray-500">Initializing location services...</div>
//         )}

//         {apiLoaded && !apiError && (
//           <div className="flex items-center justify-between text-xs text-green-600">
//             <span>✓ Google Places active</span>
//             <button type="button" onClick={switchToManualMode} className="text-gray-600 hover:text-gray-800 underline">
//               Enter manually instead
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Show coordinates if available */}
//       {manualLat && manualLng && (
//         <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
//           📍 Coordinates: {manualLat}, {manualLng}
//         </div>
//       )}
//     </div>
//   )
// }

// "use client"

// import type React from "react"
// import { useCallback, useEffect, useRef, useState } from "react"
// import { Input, type InputType } from "./Input"

// declare global {
//   interface Window {
//     google: any
//     __googleMapsScriptId?: string
//   }
// }

// export type PlaceResult = {
//   geometry?: {
//     location: {
//       lat: () => number
//       lng: () => number
//     }
//   }
//   formatted_address?: string
//   name: string
// }

// export type AddressData = {
//   address: string
//   coordinates?: { lat: string | null; lng: string | null }
//   isManual?: boolean
// }

// type GooglePlacesInputProps = Omit<InputType, "onChange"> & {
//   onChange: (data: AddressData) => void
//   value: string
//   coordinates?: { lat: string | null; lng: string | null }
//   showManualInputs?: boolean
// }

// export const GooglePlacesInput = ({
//   onChange,
//   value,
//   coordinates,
//   showManualInputs = false,
//   ...props
// }: GooglePlacesInputProps) => {
//   const inputRef = useRef<HTMLInputElement>(null)
//   const autocompleteRef = useRef<any>(null)
//   const keydownListenerRef = useRef<((e: KeyboardEvent) => void) | null>(null)

//   // Simplified state management
//   const [state, setState] = useState({
//     address: value || "",
//     lat: coordinates?.lat || "",
//     lng: coordinates?.lng || "",
//     apiLoaded: false,
//     apiError: false,
//     isLoadingApi: false,
//     showFallback: showManualInputs,
//   })

//   const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

//   // Validate coordinates
//   const isValidLatitude = (lat: string) => {
//     const num = Number.parseFloat(lat)
//     return !isNaN(num) && num >= -90 && num <= 90
//   }

//   const isValidLongitude = (lng: string) => {
//     const num = Number.parseFloat(lng)
//     return !isNaN(num) && num >= -180 && num <= 180
//   }

//   // Sync with external props
//   useEffect(() => {
//     setState((prev) => ({
//       ...prev,
//       address: value || "",
//       lat: coordinates?.lat || "",
//       lng: coordinates?.lng || "",
//       showFallback: showManualInputs || prev.apiError || !apiKey,
//     }))
//   }, [value, coordinates, showManualInputs, apiKey])

//   // Add CSS styles once
//   useEffect(() => {
//     const styleId = "google-places-styles"
//     if (document.getElementById(styleId)) return

//     const style = document.createElement("style")
//     style.id = styleId
//     style.innerHTML = `
//       .pac-container {
//         z-index: 10000 !important;
//         margin-top: 5px !important;
//         border-radius: 8px !important;
//         box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
//         max-height: 250px !important;
//         overflow-y: auto !important;
//       }
//       .pac-item {
//         padding: 8px 12px !important;
//         cursor: pointer !important;
//       }
//       .pac-item:hover {
//         background-color: #f5f5f5 !important;
//       }
//       .pac-item-query {
//         font-size: 14px !important;
//       }
//       .pac-matched {
//         font-weight: bold !important;
//       }
//     `
//     document.head.appendChild(style)

//     return () => {
//       const existingStyle = document.getElementById(styleId)
//       if (existingStyle) {
//         document.head.removeChild(existingStyle)
//       }
//     }
//   }, [])

//   // Emit changes to parent
//   const emitChange = useCallback(
//     (address: string, lat = "", lng = "", isManual = false) => {
//       const coordinates = lat && lng && isValidLatitude(lat) && isValidLongitude(lng) ? { lat, lng } : undefined

//       onChange({
//         address,
//         coordinates,
//         isManual,
//       })
//     },
//     [onChange],
//   )

//   // Handle Google Places input change
//   const handleGoogleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value
//     setState((prev) => ({ ...prev, address: newValue }))

//     // Only emit if API is not working (treat as manual)
//     if (state.apiError || !state.apiLoaded) {
//       emitChange(newValue, state.lat, state.lng, true)
//     }
//   }

//   // Handle manual address change
//   const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value
//     setState((prev) => ({ ...prev, address: newValue }))
//     emitChange(newValue, state.lat, state.lng, true)
//   }

//   // Handle latitude change
//   const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value
//     setState((prev) => ({ ...prev, lat: newValue }))
//     emitChange(state.address, newValue, state.lng, true)
//   }

//   // Handle longitude change
//   const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value
//     setState((prev) => ({ ...prev, lng: newValue }))
//     emitChange(state.address, state.lat, newValue, true)
//   }

//   // Switch to manual mode
//   const switchToManualMode = () => {
//     setState((prev) => ({
//       ...prev,
//       showFallback: true,
//     }))
//   }

//   // Switch to Google mode
//   const switchToGoogleMode = () => {
//     setState((prev) => ({
//       ...prev,
//       showFallback: false,
//       apiError: false,
//     }))

//     // Try to reinitialize
//     if (window.google?.maps?.places && inputRef.current) {
//       initializeAutocomplete()
//     }
//   }

//   // Cleanup function
//   const cleanup = useCallback(() => {
//     if (autocompleteRef.current) {
//       try {
//         window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
//       } catch (error) {
//         console.warn("Error clearing autocomplete listeners:", error)
//       }
//       autocompleteRef.current = null
//     }

//     if (keydownListenerRef.current && inputRef.current) {
//       inputRef.current.removeEventListener("keydown", keydownListenerRef.current)
//       keydownListenerRef.current = null
//     }
//   }, [])

//   // Initialize Google Places Autocomplete
//   const initializeAutocomplete = useCallback(() => {
//     if (!inputRef.current || !window.google?.maps?.places) {
//       console.error("Google Maps JavaScript API not loaded properly")
//       setState((prev) => ({ ...prev, apiError: true, showFallback: true }))
//       return
//     }

//     try {
//       // Cleanup previous instance
//       cleanup()

//       autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
//         types: ["geocode"],
//         componentRestrictions: { country: "ng" },
//         fields: ["geometry", "formatted_address", "name"],
//       })

//       autocompleteRef.current.addListener("place_changed", () => {
//         const place = autocompleteRef.current.getPlace()

//         if (place.geometry) {
//           const fullAddress = place.formatted_address || place.name || ""
//           const lat = place.geometry.location.lat().toString()
//           const lng = place.geometry.location.lng().toString()

//           setState((prev) => ({
//             ...prev,
//             address: fullAddress,
//             lat,
//             lng,
//           }))

//           emitChange(fullAddress, lat, lng, false)
//         } else {
//           // No geometry, treat as manual input
//           const fullAddress = place.name || ""
//           setState((prev) => ({ ...prev, address: fullAddress }))
//           emitChange(fullAddress, "", "", true)
//         }
//       })

//       // Add keydown listener to prevent form submission
//       keydownListenerRef.current = (e: KeyboardEvent) => {
//         if (e.key === "Enter") {
//           e.preventDefault()
//         }
//       }

//       if (inputRef.current) {
//         inputRef.current.addEventListener("keydown", keydownListenerRef.current)
//       }

//       setState((prev) => ({
//         ...prev,
//         apiLoaded: true,
//         apiError: false,
//       }))
//     } catch (error) {
//       console.error("Error initializing Autocomplete:", error)
//       setState((prev) => ({
//         ...prev,
//         apiError: true,
//         showFallback: true,
//       }))
//     }
//   }, [cleanup, emitChange])

//   // Load Google Maps API
//   useEffect(() => {
//     // Check if API key is provided
//     if (!apiKey) {
//       console.warn("Google API key not provided, switching to manual mode")
//       setState((prev) => ({
//         ...prev,
//         apiError: true,
//         showFallback: true,
//       }))
//       return
//     }

//     const scriptId = "google-maps-script"
//     const existingScript = document.getElementById(scriptId)

//     const loadScript = () => {
//       // If Google Maps is already loaded
//       if (window.google?.maps?.places) {
//         initializeAutocomplete()
//         return
//       }

//       // If script doesn't exist, create it
//       if (!existingScript) {
//         setState((prev) => ({ ...prev, isLoadingApi: true }))

//         const script = document.createElement("script")
//         script.id = scriptId
//         script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
//         script.async = true
//         script.defer = true

//         script.onload = () => {
//           setState((prev) => ({ ...prev, isLoadingApi: false }))
//           setTimeout(() => {
//             initializeAutocomplete()
//           }, 100) // Reduced timeout
//         }

//         script.onerror = () => {
//           console.error("Failed to load Google Maps JavaScript API")
//           setState((prev) => ({
//             ...prev,
//             isLoadingApi: false,
//             apiError: true,
//             showFallback: true,
//           }))
//         }

//         document.body.appendChild(script)
//       } else if (window.google?.maps?.places) {
//         // Script exists and API is loaded
//         initializeAutocomplete()
//       }
//     }

//     loadScript()

//     // Cleanup on unmount
//     return cleanup
//   }, [apiKey, initializeAutocomplete, cleanup])

//   // Manual mode UI
//   if (state.showFallback) {
//     return (
//       <div className="address-input-container w-full space-y-3">
//         {/* Manual Address Input */}
//         <div>
//           <Input
//             {...props}
//             label={props.label || "Address"}
//             value={state.address}
//             onChange={handleManualAddressChange}
//             placeholder="Enter your full address manually"
//           />
//         </div>

//         {/* Coordinate Inputs */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           <div>
//             <Input
//               name="latitude"
//               label="Latitude (Optional)"
//               type="text"
//               value={state.lat}
//               onChange={handleLatChange}
//               placeholder="e.g., 6.5244"
//               required={false}
//             />
//             {state.lat && !isValidLatitude(state.lat) && (
//               <span className="text-xs text-red-500 mt-1">Invalid latitude (must be between -90 and 90)</span>
//             )}
//           </div>
//           <div>
//             <Input
//               name="longitude"
//               label="Longitude (Optional)"
//               type="text"
//               value={state.lng}
//               onChange={handleLngChange}
//               placeholder="e.g., 3.3792"
//               required={false}
//             />
//             {state.lng && !isValidLongitude(state.lng) && (
//               <span className="text-xs text-red-500 mt-1">Invalid longitude (must be between -180 and 180)</span>
//             )}
//           </div>
//         </div>

//         {/* Status Messages */}
//         <div className="space-y-2">
//           {state.apiError && (
//             <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
//               ⚠️ Google Places service unavailable. Please enter your address manually.
//             </div>
//           )}

//           {!state.apiError && apiKey && (
//             <div className="flex items-center justify-between text-xs text-gray-600">
//               <span>Using manual address entry</span>
//               <button
//                 type="button"
//                 onClick={switchToGoogleMode}
//                 className="text-blue-600 hover:text-blue-800 underline focus:outline-none"
//               >
//                 Try Google Places again
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     )
//   }

//   // Google Places mode UI
//   return (
//     <div className="google-places-container w-full relative space-y-2">
//       <Input {...props} ref={inputRef} value={state.address} onChange={handleGoogleInputChange} />

//       {/* Status Messages */}
//       <div className="space-y-1">
//         {state.isLoadingApi && (
//           <div className="text-xs text-blue-600 flex items-center gap-1">
//             <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
//             Loading Google Places...
//           </div>
//         )}

//         {!state.apiLoaded && !state.isLoadingApi && !state.apiError && (
//           <div className="text-xs text-gray-500">Initializing location services...</div>
//         )}

//         {state.apiLoaded && !state.apiError && (
//           <div className="flex items-center justify-between text-xs text-green-600">
//             <span>✓ Google Places active</span>
//             <button
//               type="button"
//               onClick={switchToManualMode}
//               className="text-gray-600 hover:text-gray-800 underline focus:outline-none"
//             >
//               Enter manually instead
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Show coordinates if available */}
//       {state.lat && state.lng && isValidLatitude(state.lat) && isValidLongitude(state.lng) && (
//         <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
//           📍 Coordinates: {state.lat}, {state.lng}
//         </div>
//       )}
//     </div>
//   )
// }

"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Input, type InputType } from "./Input"

declare global {
  interface Window {
    google: any
    __googleMapsScriptId?: string
  }
}

export type PlaceResult = {
  geometry?: {
    location: {
      lat: () => number
      lng: () => number
    }
  }
  formatted_address?: string
  name: string
}

export type AddressData = {
  address: string
  coordinates?: { lat: string | null; lng: string | null }
  isManual?: boolean
}

type GooglePlacesInputProps = Omit<InputType, "onChange"> & {
  onChange: (data: AddressData) => void
  value: string | AddressData // Allow both string and AddressData
  coordinates?: { lat: string | null; lng: string | null }
  showManualInputs?: boolean
}

// Helper function to safely convert value to string
const safeStringValue = (value: any): string => {
  if (typeof value === "string") return value
  if (typeof value === "object" && value !== null) {
    // If it's an AddressData object, extract the address
    if ("address" in value) return value.address || ""
    // If it's any other object, return empty string
    return ""
  }
  if (value === null || value === undefined) return ""
  return String(value)
}

// Helper function to extract coordinates from value
const extractCoordinates = (value: any): { lat: string; lng: string } => {
  if (typeof value === "object" && value !== null && "coordinates" in value) {
    return {
      lat: value.coordinates?.lat || "",
      lng: value.coordinates?.lng || "",
    }
  }
  return { lat: "", lng: "" }
}

export const GooglePlacesInput = ({
  onChange,
  value,
  coordinates,
  showManualInputs = false,
  ...props
}: GooglePlacesInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const keydownListenerRef = useRef<((e: KeyboardEvent) => void) | null>(null)

  // Extract initial values safely
  const initialAddress = safeStringValue(value)
  const initialCoords = coordinates || extractCoordinates(value)

  // Simplified state management with safe string conversion
  const [state, setState] = useState({
    address: initialAddress,
    lat: initialCoords.lat || "",
    lng: initialCoords.lng || "",
    apiLoaded: false,
    apiError: false,
    isLoadingApi: false,
    showFallback: showManualInputs,
  })

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

  // Validate coordinates
  const isValidLatitude = (lat: string) => {
    if (!lat || lat.trim() === "") return true // Empty is valid (optional)
    const num = Number.parseFloat(lat)
    return !isNaN(num) && num >= -90 && num <= 90
  }

  const isValidLongitude = (lng: string) => {
    if (!lng || lng.trim() === "") return true // Empty is valid (optional)
    const num = Number.parseFloat(lng)
    return !isNaN(num) && num >= -180 && num <= 180
  }

  // Sync with external props with safe string conversion
  useEffect(() => {
    const newAddress = safeStringValue(value)
    const newCoords = coordinates || extractCoordinates(value)

    setState((prev) => ({
      ...prev,
      address: newAddress,
      lat: newCoords.lat || "",
      lng: newCoords.lng || "",
      showFallback: showManualInputs || prev.apiError || !apiKey,
    }))
  }, [value, coordinates, showManualInputs, apiKey])

  // Add CSS styles once
  useEffect(() => {
    const styleId = "google-places-styles"
    if (document.getElementById(styleId)) return

    const style = document.createElement("style")
    style.id = styleId
    style.innerHTML = `
      .pac-container {
        z-index: 10000 !important;
        margin-top: 5px !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
        max-height: 250px !important;
        overflow-y: auto !important;
      }
      .pac-item {
        padding: 8px 12px !important;
        cursor: pointer !important;
      }
      .pac-item:hover {
        background-color: #f5f5f5 !important;
      }
      .pac-item-query {
        font-size: 14px !important;
      }
      .pac-matched {
        font-weight: bold !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        document.head.removeChild(existingStyle)
      }
    }
  }, [])

  // Emit changes to parent with proper data structure
  const emitChange = useCallback(
    (address: string, lat = "", lng = "", isManual = false) => {
      // Ensure address is always a string
      const safeAddress = safeStringValue(address)

      // Only include coordinates if both are valid
      const coordinates =
        lat && lng && isValidLatitude(lat) && isValidLongitude(lng) ? { lat: lat.trim(), lng: lng.trim() } : undefined

      const data: AddressData = {
        address: safeAddress,
        coordinates,
        isManual,
      }

      console.log("Emitting address data:", data) // Debug log
      onChange(data)
    },
    [onChange],
  )

  // Handle Google Places input change
  const handleGoogleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = safeStringValue(e.target.value)
    setState((prev) => ({ ...prev, address: newValue }))

    // Only emit if API is not working (treat as manual)
    if (state.apiError || !state.apiLoaded) {
      emitChange(newValue, state.lat, state.lng, true)
    }
  }

  // Handle manual address change
  const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = safeStringValue(e.target.value)
    setState((prev) => ({ ...prev, address: newValue }))
    emitChange(newValue, state.lat, state.lng, true)
  }

  // Handle latitude change
  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = safeStringValue(e.target.value)
    setState((prev) => ({ ...prev, lat: newValue }))
    emitChange(state.address, newValue, state.lng, true)
  }

  // Handle longitude change
  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = safeStringValue(e.target.value)
    setState((prev) => ({ ...prev, lng: newValue }))
    emitChange(state.address, state.lat, newValue, true)
  }

  // Switch to manual mode
  const switchToManualMode = () => {
    setState((prev) => ({
      ...prev,
      showFallback: true,
    }))
  }

  // Switch to Google mode
  const switchToGoogleMode = () => {
    setState((prev) => ({
      ...prev,
      showFallback: false,
      apiError: false,
    }))

    // Try to reinitialize
    if (window.google?.maps?.places && inputRef.current) {
      initializeAutocomplete()
    }
  }

  // Cleanup function
  const cleanup = useCallback(() => {
    if (autocompleteRef.current) {
      try {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      } catch (error) {
        console.warn("Error clearing autocomplete listeners:", error)
      }
      autocompleteRef.current = null
    }

    if (keydownListenerRef.current && inputRef.current) {
      inputRef.current.removeEventListener("keydown", keydownListenerRef.current)
      keydownListenerRef.current = null
    }
  }, [])

  // Initialize Google Places Autocomplete
  const initializeAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) {
      console.error("Google Maps JavaScript API not loaded properly")
      setState((prev) => ({ ...prev, apiError: true, showFallback: true }))
      return
    }

    try {
      // Cleanup previous instance
      cleanup()

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["geocode"],
        componentRestrictions: { country: "ng" },
        fields: ["geometry", "formatted_address", "name"],
      })

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace()

        if (place.geometry) {
          // Safely extract address and coordinates
          const fullAddress = safeStringValue(place.formatted_address || place.name || "")
          const lat = place.geometry.location.lat().toString()
          const lng = place.geometry.location.lng().toString()

          setState((prev) => ({
            ...prev,
            address: fullAddress,
            lat,
            lng,
          }))

          emitChange(fullAddress, lat, lng, false)
        } else {
          // No geometry, treat as manual input
          const fullAddress = safeStringValue(place.name || "")
          setState((prev) => ({ ...prev, address: fullAddress }))
          emitChange(fullAddress, "", "", true)
        }
      })

      // Add keydown listener to prevent form submission
      keydownListenerRef.current = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault()
        }
      }

      if (inputRef.current) {
        inputRef.current.addEventListener("keydown", keydownListenerRef.current)
      }

      setState((prev) => ({
        ...prev,
        apiLoaded: true,
        apiError: false,
      }))
    } catch (error) {
      console.error("Error initializing Autocomplete:", error)
      setState((prev) => ({
        ...prev,
        apiError: true,
        showFallback: true,
      }))
    }
  }, [cleanup, emitChange])

  // Load Google Maps API
  useEffect(() => {
    // Check if API key is provided
    if (!apiKey) {
      console.warn("Google API key not provided, switching to manual mode")
      setState((prev) => ({
        ...prev,
        apiError: true,
        showFallback: true,
      }))
      return
    }

    const scriptId = "google-maps-script"
    const existingScript = document.getElementById(scriptId)

    const loadScript = () => {
      // If Google Maps is already loaded
      if (window.google?.maps?.places) {
        initializeAutocomplete()
        return
      }

      // If script doesn't exist, create it
      if (!existingScript) {
        setState((prev) => ({ ...prev, isLoadingApi: true }))

        const script = document.createElement("script")
        script.id = scriptId
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.defer = true

        script.onload = () => {
          setState((prev) => ({ ...prev, isLoadingApi: false }))
          setTimeout(() => {
            initializeAutocomplete()
          }, 100)
        }

        script.onerror = () => {
          console.error("Failed to load Google Maps JavaScript API")
          setState((prev) => ({
            ...prev,
            isLoadingApi: false,
            apiError: true,
            showFallback: true,
          }))
        }

        document.body.appendChild(script)
      } else if (window.google?.maps?.places) {
        // Script exists and API is loaded
        initializeAutocomplete()
      }
    }

    loadScript()

    // Cleanup on unmount
    return cleanup
  }, [apiKey, initializeAutocomplete, cleanup])

  // Debug: Log current state
  useEffect(() => {
    console.log("GooglePlacesInput state:", {
      address: state.address,
      addressType: typeof state.address,
      lat: state.lat,
      lng: state.lng,
    })
  }, [state.address, state.lat, state.lng])

  // Manual mode UI
  if (state.showFallback) {
    return (
      <div className="address-input-container w-full space-y-3">
        {/* Manual Address Input */}
        <div>
          <Input
            {...props}
            label={props.label || "Address"}
            value={state.address} // This should always be a string now
            onChange={handleManualAddressChange}
            placeholder="Enter your full address manually"
          />
        </div>

        {/* Coordinate Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Input
              name="latitude"
              label="Latitude (Optional)"
              type="text"
              value={state.lat}
              onChange={handleLatChange}
              placeholder="e.g., 6.5244"
              required={false}
            />
            {state.lat && !isValidLatitude(state.lat) && (
              <span className="text-xs text-red-500 mt-1">Invalid latitude (must be between -90 and 90)</span>
            )}
          </div>
          <div>
            <Input
              name="longitude"
              label="Longitude (Optional)"
              type="text"
              value={state.lng}
              onChange={handleLngChange}
              placeholder="e.g., 3.3792"
              required={false}
            />
            {state.lng && !isValidLongitude(state.lng) && (
              <span className="text-xs text-red-500 mt-1">Invalid longitude (must be between -180 and 180)</span>
            )}
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-2">
          {state.apiError && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              ⚠️ Google Places service unavailable. Please enter your address manually.
            </div>
          )}

          {!state.apiError && apiKey && (
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Using manual address entry</span>
              <button
                type="button"
                onClick={switchToGoogleMode}
                className="text-blue-600 hover:text-blue-800 underline focus:outline-none"
              >
                Try Google Places again
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Google Places mode UI
  return (
    <div className="google-places-container w-full relative space-y-2">
      <Input
        {...props}
        ref={inputRef}
        value={state.address} // This should always be a string now
        onChange={handleGoogleInputChange}
      />

      {/* Status Messages */}
      <div className="space-y-1">
        {state.isLoadingApi && (
          <div className="text-xs text-blue-600 flex items-center gap-1">
            <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
            Loading Google Places...
          </div>
        )}

        {!state.apiLoaded && !state.isLoadingApi && !state.apiError && (
          <div className="text-xs text-gray-500">Initializing location services...</div>
        )}

        {state.apiLoaded && !state.apiError && (
          <div className="flex items-center justify-between text-xs text-green-600">
            <span>✓ Google Places active</span>
            <button
              type="button"
              onClick={switchToManualMode}
              className="text-gray-600 hover:text-gray-800 underline focus:outline-none"
            >
              Enter manually instead
            </button>
          </div>
        )}
      </div>

      {/* Show coordinates if available */}
      {state.lat && state.lng && isValidLatitude(state.lat) && isValidLongitude(state.lng) && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          📍 Coordinates: {state.lat}, {state.lng}
        </div>
      )}
    </div>
  )
}
