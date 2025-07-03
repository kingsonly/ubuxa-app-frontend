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
//   value: string | AddressData // Allow both string and AddressData
//   coordinates?: { lat: string | null; lng: string | null }
//   showManualInputs?: boolean
// }

// // Helper function to safely convert value to string
// const safeStringValue = (value: any): string => {
//   if (typeof value === "string") return value
//   if (typeof value === "object" && value !== null) {
//     // If it's an AddressData object, extract the address
//     if ("address" in value) return value.address || ""
//     // If it's any other object, return empty string
//     return ""
//   }
//   if (value === null || value === undefined) return ""
//   return String(value)
// }

// // Helper function to extract coordinates from value
// const extractCoordinates = (value: any): { lat: string; lng: string } => {
//   if (typeof value === "object" && value !== null && "coordinates" in value) {
//     return {
//       lat: value.coordinates?.lat || "",
//       lng: value.coordinates?.lng || "",
//     }
//   }
//   return { lat: "", lng: "" }
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

//   // Extract initial values safely
//   const initialAddress = safeStringValue(value)
//   const initialCoords = coordinates || extractCoordinates(value)

//   // Simplified state management with safe string conversion
//   const [state, setState] = useState({
//     address: initialAddress,
//     lat: initialCoords.lat || "",
//     lng: initialCoords.lng || "",
//     apiLoaded: false,
//     apiError: false,
//     isLoadingApi: false,
//     showFallback: showManualInputs,
//   })

//   const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

//   // Validate coordinates
//   const isValidLatitude = (lat: string) => {
//     if (!lat || lat.trim() === "") return true // Empty is valid (optional)
//     const num = Number.parseFloat(lat)
//     return !isNaN(num) && num >= -90 && num <= 90
//   }

//   const isValidLongitude = (lng: string) => {
//     if (!lng || lng.trim() === "") return true // Empty is valid (optional)
//     const num = Number.parseFloat(lng)
//     return !isNaN(num) && num >= -180 && num <= 180
//   }

//   // Sync with external props with safe string conversion
//   useEffect(() => {
//     const newAddress = safeStringValue(value)
//     const newCoords = coordinates || extractCoordinates(value)

//     setState((prev) => ({
//       ...prev,
//       address: newAddress,
//       lat: newCoords.lat || "",
//       lng: newCoords.lng || "",
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

//   // Emit changes to parent with proper data structure
//   const emitChange = useCallback(
//     (address: string, lat = "", lng = "", isManual = false) => {
//       // Ensure address is always a string
//       const safeAddress = safeStringValue(address)

//       // Only include coordinates if both are valid
//       const coordinates =
//         lat && lng && isValidLatitude(lat) && isValidLongitude(lng) ? { lat: lat.trim(), lng: lng.trim() } : undefined

//       const data: AddressData = {
//         address: safeAddress,
//         coordinates,
//         isManual,
//       }

//       console.log("Emitting address data:", data) // Debug log
//       onChange(data)
//     },
//     [onChange],
//   )

//   // Handle Google Places input change
//   const handleGoogleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = safeStringValue(e.target.value)
//     setState((prev) => ({ ...prev, address: newValue }))

//     // Only emit if API is not working (treat as manual)
//     if (state.apiError || !state.apiLoaded) {
//       emitChange(newValue, state.lat, state.lng, true)
//     }
//   }

//   // Handle manual address change
//   const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = safeStringValue(e.target.value)
//     setState((prev) => ({ ...prev, address: newValue }))
//     emitChange(newValue, state.lat, state.lng, true)
//   }

//   // Handle latitude change
//   const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = safeStringValue(e.target.value)
//     setState((prev) => ({ ...prev, lat: newValue }))
//     emitChange(state.address, newValue, state.lng, true)
//   }

//   // Handle longitude change
//   const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = safeStringValue(e.target.value)
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
//           // Safely extract address and coordinates
//           const fullAddress = safeStringValue(place.formatted_address || place.name || "")
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
//           const fullAddress = safeStringValue(place.name || "")
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
//         script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=console.debug&libraries=maps,places,marker&v=beta`
//         //script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
//         script.async = true
//         script.defer = true
//         script.onload = () => {
//           setState((prev) => ({ ...prev, isLoadingApi: false }))
//           setTimeout(() => {
//             initializeAutocomplete()
//           }, 100)
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

//   // Debug: Log current state
//   useEffect(() => {
//     console.log("GooglePlacesInput state:", {
//       address: state.address,
//       addressType: typeof state.address,
//       lat: state.lat,
//       lng: state.lng,
//     })
//   }, [state.address, state.lat, state.lng])

//   // Manual mode UI
//   if (state.showFallback) {
//     return (
//       <div className="address-input-container w-full space-y-3">
//         {/* Manual Address Input */}
//         <div>
//           <Input
//             {...props}
//             label={props.label || "Address"}
//             value={state.address} // This should always be a string now
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
//       <Input
//         {...props}
//         ref={inputRef}
//         value={state.address} // This should always be a string now
//         onChange={handleGoogleInputChange}
//       />

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



import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Input, type InputType } from "./Input"

declare global {
  interface Window {
    google: any
    initGoogleMaps?: () => void
  }
}

export type AddressData = {
  address: string
  coordinates?: { lat: string | null; lng: string | null }
  isManual?: boolean
}

type GoogleSearchBoxInputProps = Omit<InputType, "onChange"> & {
  onChange: (data: AddressData) => void
  value: string | AddressData
  coordinates?: { lat: string | null; lng: string | null }
  showManualInputs?: boolean
  countryRestriction?: string
  bounds?: {
    north: number
    south: number
    east: number
    west: number
  }
}

const safeStringValue = (value: any): string => {
  if (typeof value === "string") return value
  if (typeof value === "object" && value !== null) {
    if ("address" in value) return value.address || ""
    return ""
  }
  if (value === null || value === undefined) return ""
  return String(value)
}

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
  countryRestriction,
  bounds,
  ...props
}: GoogleSearchBoxInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const searchBoxRef = useRef<any>(null)

  const initialAddress = safeStringValue(value)
  const initialCoords = coordinates || extractCoordinates(value)

  const [state, setState] = useState({
    address: initialAddress,
    lat: initialCoords.lat || "",
    lng: initialCoords.lng || "",
    apiLoaded: false,
    apiError: false,
    isLoadingApi: false,
    showFallback: showManualInputs,
    searchResults: [] as any[],
    showResults: false,
  })

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

  const isValidLatitude = (lat: string) => {
    if (!lat || lat.trim() === "") return true
    const num = Number.parseFloat(lat)
    return !isNaN(num) && num >= -90 && num <= 90
  }

  const isValidLongitude = (lng: string) => {
    if (!lng || lng.trim() === "") return true
    const num = Number.parseFloat(lng)
    return !isNaN(num) && num >= -180 && num <= 180
  }

  const emitChange = useCallback(
    (address: string, lat = "", lng = "", isManual = false) => {
      const safeAddress = safeStringValue(address)
      const coordinates =
        lat && lng && isValidLatitude(lat) && isValidLongitude(lng) ? { lat: lat.trim(), lng: lng.trim() } : undefined

      const data: AddressData = {
        address: safeAddress,
        coordinates,
        isManual,
      }

      onChange(data)
    },
    [onChange],
  )

  const cleanup = useCallback(() => {
    if (searchBoxRef.current) {
      try {
        window.google?.maps?.event?.clearInstanceListeners(searchBoxRef.current)
      } catch (error) {
        console.warn("Error clearing SearchBox listeners:", error)
      }
      searchBoxRef.current = null
    }
  }, [])

  const initializeSearchBox = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places?.SearchBox) {
      console.error("Google Maps SearchBox not available")
      setState((prev) => ({
        ...prev,
        apiError: true,
        showFallback: true,
      }))
      return
    }

    try {
      cleanup()

      // Create SearchBox instance
      searchBoxRef.current = new window.google.maps.places.SearchBox(inputRef.current)

      // Set bounds if provided
      if (bounds) {
        const googleBounds = new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(bounds.south, bounds.west),
          new window.google.maps.LatLng(bounds.north, bounds.east),
        )
        searchBoxRef.current.setBounds(googleBounds)
      }

      // Listen for places_changed event
      searchBoxRef.current.addListener("places_changed", () => {
        const places = searchBoxRef.current.getPlaces()

        if (places.length === 0) {
          console.log("No places found")
          return
        }

        // Filter places by country if restriction is set
        let filteredPlaces = places
        if (countryRestriction) {
          filteredPlaces = places.filter((place: any) => {
            const addressComponents = place.address_components || []
            return addressComponents.some(
              (component: any) =>
                component.types.includes("country") &&
                component.short_name.toLowerCase() === countryRestriction.toLowerCase(),
            )
          })
        }

        if (filteredPlaces.length === 0 && countryRestriction) {
          console.log(`No places found in country: ${countryRestriction}`)
          setState((prev) => ({
            ...prev,
            searchResults: places,
            showResults: true,
          }))
          return
        }

        const placesToUse = filteredPlaces.length > 0 ? filteredPlaces : places

        if (placesToUse.length === 1) {
          // Single result - use it directly
          const place = placesToUse[0]
          handlePlaceSelection(place)
        } else {
          // Multiple results - show them for selection
          setState((prev) => ({
            ...prev,
            searchResults: placesToUse,
            showResults: true,
          }))
        }
      })

      // Prevent form submission on Enter
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault()
        }
        if (e.key === "Escape") {
          setState((prev) => ({ ...prev, showResults: false }))
        }
      }

      inputRef.current.addEventListener("keydown", handleKeyDown)

      setState((prev) => ({
        ...prev,
        apiLoaded: true,
        apiError: false,
      }))

      console.log("Google Places SearchBox initialized successfully")
    } catch (error) {
      console.error("Error initializing SearchBox:", error)
      setState((prev) => ({
        ...prev,
        apiError: true,
        showFallback: true,
      }))
    }
  }, [cleanup, bounds, countryRestriction])

  const handlePlaceSelection = useCallback(
    (place: any) => {
      if (place.geometry) {
        const fullAddress = safeStringValue(place.formatted_address || place.name || "")
        const lat = place.geometry.location.lat().toString()
        const lng = place.geometry.location.lng().toString()

        setState((prev) => ({
          ...prev,
          address: fullAddress,
          lat,
          lng,
          showResults: false,
          searchResults: [],
        }))

        emitChange(fullAddress, lat, lng, false)
      } else {
        const fullAddress = safeStringValue(place.name || "")
        setState((prev) => ({
          ...prev,
          address: fullAddress,
          showResults: false,
          searchResults: [],
        }))
        emitChange(fullAddress, "", "", true)
      }
    },
    [emitChange],
  )

  // Load Google Maps API
  useEffect(() => {
    if (!apiKey) {
      console.warn("Google API key not provided")
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
      // Check if API is already loaded
      if (window.google?.maps?.places?.SearchBox) {
        console.log("Google Maps API already loaded")
        initializeSearchBox()
        return
      }

      // If script doesn't exist, create it
      if (!existingScript) {
        setState((prev) => ({ ...prev, isLoadingApi: true }))

        const script = document.createElement("script")
        script.id = scriptId
        // Use stable version with places library
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly&callback=initGoogleMaps`
        script.async = true
        script.defer = true

        // Create a global callback
        window.initGoogleMaps = () => {
          console.log("Google Maps API loaded via callback")
          setState((prev) => ({ ...prev, isLoadingApi: false }))

          // Small delay to ensure everything is ready
          setTimeout(() => {
            console.log("Available APIs:", {
              places: !!window.google?.maps?.places,
              SearchBox: !!window.google?.maps?.places?.SearchBox,
            })
            initializeSearchBox()
          }, 100)
        }

        script.onerror = (error) => {
          console.error("Failed to load Google Maps JavaScript API:", error)
          setState((prev) => ({
            ...prev,
            isLoadingApi: false,
            apiError: true,
            showFallback: true,
          }))
        }

        document.body.appendChild(script)
      } else if (window.google?.maps?.places?.SearchBox) {
        // Script exists and API is loaded
        initializeSearchBox()
      } else {
        // Script exists but API not ready, wait a bit
        setTimeout(() => {
          if (window.google?.maps?.places?.SearchBox) {
            initializeSearchBox()
          } else {
            console.error("Google Maps API loaded but SearchBox not available")
            setState((prev) => ({
              ...prev,
              apiError: true,
              showFallback: true,
            }))
          }
        }, 1000)
      }
    }

    loadScript()
    return cleanup
  }, [apiKey, initializeSearchBox, cleanup])

  // Sync with external props
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

  // Handle input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = safeStringValue(e.target.value)
    setState((prev) => ({
      ...prev,
      address: newValue,
      showResults: false, // Hide results when typing
    }))

    // If API is not working, treat as manual input
    if (state.apiError || !state.apiLoaded) {
      emitChange(newValue, state.lat, state.lng, true)
    }
  }

  const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = safeStringValue(e.target.value)
    setState((prev) => ({ ...prev, address: newValue }))
    emitChange(newValue, state.lat, state.lng, true)
  }

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = safeStringValue(e.target.value)
    setState((prev) => ({ ...prev, lat: newValue }))
    emitChange(state.address, newValue, state.lng, true)
  }

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = safeStringValue(e.target.value)
    setState((prev) => ({ ...prev, lng: newValue }))
    emitChange(state.address, state.lat, newValue, true)
  }

  const switchToManualMode = () => {
    setState((prev) => ({ ...prev, showFallback: true }))
  }

  const switchToSearchBoxMode = () => {
    setState((prev) => ({
      ...prev,
      showFallback: false,
      apiError: false,
    }))

    if (window.google?.maps?.places?.SearchBox && inputRef.current) {
      initializeSearchBox()
    }
  }

  // Manual mode UI
  if (state.showFallback) {
    return (
      <div className="address-input-container w-full space-y-3">
        <div>
          <Input
            {...props}
            label={props.label || "Address"}
            value={state.address}
            onChange={handleManualAddressChange}
            placeholder="Enter your full address manually"
          />
        </div>

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

        <div className="space-y-2">
          {state.apiError && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              ⚠️ Google Places SearchBox unavailable. Please enter your address manually.
              {!apiKey && " (No API key provided)"}
            </div>
          )}

          {!state.apiError && apiKey && (
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Using manual address entry</span>
              <button
                type="button"
                onClick={switchToSearchBoxMode}
                className="text-blue-600 hover:text-blue-800 underline focus:outline-none"
              >
                Try Google SearchBox again
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // SearchBox mode UI
  return (
    <div className="google-searchbox-container w-full relative space-y-2">
      <div className="relative">
        <Input
          {...props}
          ref={inputRef}
          value={state.address}
          onChange={handleSearchInputChange}
          placeholder={props.placeholder || "Search for places..."}
        />

        {/* Search Results Dropdown */}
        {state.showResults && state.searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {state.searchResults.map((place, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
                onClick={() => handlePlaceSelection(place)}
              >
                <div className="font-medium text-gray-900">{place.name}</div>
                {place.formatted_address && <div className="text-sm text-gray-600 mt-1">{place.formatted_address}</div>}
                {place.types && <div className="text-xs text-gray-500 mt-1">{place.types.slice(0, 3).join(", ")}</div>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        {state.isLoadingApi && (
          <div className="text-xs text-blue-600 flex items-center gap-1">
            <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
            Loading Google Places SearchBox...
          </div>
        )}

        {!state.apiLoaded && !state.isLoadingApi && !state.apiError && (
          <div className="text-xs text-gray-500">Initializing search services...</div>
        )}

        {state.apiLoaded && !state.apiError && (
          <div className="flex items-center justify-between text-xs text-green-600">
            <span>✓ Google SearchBox active</span>
            <button
              type="button"
              onClick={switchToManualMode}
              className="text-gray-600 hover:text-gray-800 underline focus:outline-none"
            >
              Enter manually instead
            </button>
          </div>
        )}

        {state.apiError && (
          <div className="text-xs text-red-600">
            ❌ Google SearchBox failed to load.
            <button
              type="button"
              onClick={switchToManualMode}
              className="ml-1 text-blue-600 hover:text-blue-800 underline"
            >
              Switch to manual entry
            </button>
          </div>
        )}
      </div>

      {state.lat && state.lng && isValidLatitude(state.lat) && isValidLongitude(state.lng) && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          📍 Coordinates: {state.lat}, {state.lng}
        </div>
      )}
    </div>
  )
}
