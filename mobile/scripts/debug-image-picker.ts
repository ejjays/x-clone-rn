import * as ImagePicker from "expo-image-picker"

console.log("=== ImagePicker Debug Info ===")
console.log("ImagePicker object:", ImagePicker)
console.log("MediaType:", ImagePicker.MediaType)
console.log("MediaTypeOptions:", ImagePicker.MediaTypeOptions)

// Check what properties are available
const keys = Object.keys(ImagePicker)
console.log("Available ImagePicker properties:", keys)

// Try to find media type constants
keys.forEach((key) => {
  const value = (ImagePicker as any)[key]
  if (typeof value === "object" && value !== null) {
    console.log(`${key}:`, value)
  }
})
