# Session Changes Summary

This document contains all the changes made during this session that can be applied to similar projects.

## 1. Fullscreen Icon Components

**File:** `components/Icons.tsx`

Added two new icon components for fullscreen functionality:

```tsx
export function FullscreenIcon({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) {
  return (
    <svg
      fill="none"
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FullscreenExitIcon({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) {
  return (
    <svg
      fill="none"
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
        fill="currentColor"
      />
    </svg>
  );
}
```

## 2. Button Color Updates

**File:** `components/Button.tsx`

Changed button background color to `#CFB87C` with black text:

```tsx
className={`bg-[#CFB87C] text-black text-sm px-6 py-2 rounded-lg disabled:opacity-50 h-fit hover:bg-[#B8A569] transition-colors duration-200 ${className}`}
```

## 3. Toggle Group Button Colors

**File:** `components/AvatarSession/AvatarControls.tsx`

Updated toggle group to use dark background with gold active state:

```tsx
<ToggleGroup
  className={`bg-zinc-800 rounded-lg p-1 ${isVoiceChatLoading ? "opacity-50" : ""}`}
  // ...
>
  <ToggleGroupItem
    className="bg-zinc-700 data-[state=on]:bg-[#CFB87C] data-[state=on]:text-black rounded-lg p-2 text-sm w-[90px] text-center text-white transition-colors duration-200"
    value="voice"
  >
    Voice Chat
  </ToggleGroupItem>
  <ToggleGroupItem
    className="bg-zinc-700 data-[state=on]:bg-[#CFB87C] data-[state=on]:text-black rounded-lg p-2 text-sm w-[90px] text-center text-white transition-colors duration-200"
    value="text"
  >
    Text Chat
  </ToggleGroupItem>
</ToggleGroup>
```

## 4. Microphone Button Styling

**File:** `components/AvatarSession/AudioInput.tsx`

Updated microphone button with color states:
- Normal: Gold (#CFB87C) with black text
- Muted: Red with white text
- User talking: Green with white text

```tsx
<Button
  className={`!p-3 relative !bg-[#CFB87C] hover:!bg-[#B8A569] !text-black ${isMuted ? "!bg-red-600 hover:!bg-red-700 !text-white" : ""} ${isUserTalking ? "!bg-green-600 hover:!bg-green-700 !text-white" : ""}`}
  disabled={isVoiceChatLoading}
  onClick={handleMuteClick}
>
  <div
    className={`absolute left-0 top-0 rounded-lg border-2 ${isMuted || isUserTalking ? "border-white" : "border-black"} w-full h-full ${isUserTalking ? "animate-ping" : ""}`}
  />
  {/* Icons */}
</Button>
```

## 5. Fullscreen Button with Icon

**File:** `components/InteractiveAvatar.tsx`

Key changes:
- Added fullscreen state tracking
- Replaced text button with icon button
- Made button available in fullscreen mode
- Added white icon color for visibility

```tsx
const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

// Track fullscreen state changes
useEffect(() => {
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  return () => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
  };
}, []);

// In JSX:
{(sessionState !== StreamingAvatarSessionState.INACTIVE || isFullscreen) && (
  <Button
    aria-label="Toggle Full Screen"
    onClick={toggleFullscreen}
    className="absolute bottom-4 right-4 !p-2 !bg-zinc-900 !bg-opacity-75 hover:!bg-opacity-90 z-10 !text-white"
  >
    {isFullscreen ? (
      <FullscreenExitIcon size={20} className="text-white" />
    ) : (
      <FullscreenIcon size={20} className="text-white" />
    )}
  </Button>
)}
```

## 6. Background Image Support

**File:** `components/InteractiveAvatar.tsx`

Added background image state and display:

```tsx
const [backgroundImage, setBackgroundImage] = useState<string>("demo.png");

// In container div:
<div 
  ref={containerRef} 
  className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: backgroundImage ? `url(/${backgroundImage})` : undefined
  }}
>
```

**File:** `components/AvatarConfig/index.tsx`

Added background image setting:

```tsx
interface AvatarConfigProps {
  // ... existing props
  backgroundImage?: string;
  onBackgroundImageChange?: (image: string) => void;
}

// In component:
<Field label="Background Image">
  <Input
    placeholder="Enter background image filename (e.g., demo.png)"
    value={backgroundImage || ""}
    onChange={(value) => onBackgroundImageChange?.(value)}
  />
</Field>
```

## 7. Session Duration Timer

**File:** `components/InteractiveAvatar.tsx`

Added session duration timer with countdown:

```tsx
const [sessionDuration, setSessionDuration] = useState<number>(10); // in minutes
const [customDuration, setCustomDuration] = useState<string>("");
const [remainingTime, setRemainingTime] = useState<number | null>(null);

// Session duration timer
useEffect(() => {
  if (sessionState === StreamingAvatarSessionState.CONNECTED && remainingTime === null) {
    const durationInSeconds = sessionDuration * 60;
    setRemainingTime(durationInSeconds);
  } else if (sessionState === StreamingAvatarSessionState.INACTIVE) {
    setRemainingTime(null);
  }
}, [sessionState, sessionDuration, remainingTime]);

useEffect(() => {
  if (remainingTime !== null && remainingTime > 0) {
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  } else if (remainingTime === 0 && sessionState === StreamingAvatarSessionState.CONNECTED) {
    stopAvatar();
  }
}, [remainingTime, sessionState, stopAvatar]);

// Display:
{remainingTime !== null && (
  <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-md text-sm font-medium">
    Time remaining: {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, "0")}
  </div>
)}
```

**File:** `components/AvatarConfig/index.tsx`

Added session duration settings:

```tsx
interface AvatarConfigProps {
  // ... existing props
  sessionDuration?: number;
  onSessionDurationChange?: (duration: number) => void;
  customDuration?: string;
  onCustomDurationChange?: (duration: string) => void;
}

// In component:
<Field label="Session Duration">
  <Select
    isSelected={(option) => {
      if (option === "custom") {
        return sessionDuration !== 5 && sessionDuration !== 10 && sessionDuration !== 15 && sessionDuration !== 20;
      }
      return option === sessionDuration;
    }}
    options={[5, 10, 15, 20, "custom"]}
    renderOption={(option) => {
      if (option === "custom") {
        return "Custom";
      }
      return `${option} minutes`;
    }}
    value={
      sessionDuration === 5 || sessionDuration === 10 || sessionDuration === 15 || sessionDuration === 20
        ? `${sessionDuration} minutes`
        : "Custom"
    }
    onSelect={(option) => {
      if (option === "custom") {
        onSessionDurationChange?.(parseInt(customDuration || "10") || 10);
      } else {
        onSessionDurationChange?.(option as number);
      }
    }}
  />
  {(sessionDuration !== 5 && sessionDuration !== 10 && sessionDuration !== 15 && sessionDuration !== 20) && (
    <div className="mt-2">
      <Input
        placeholder="Enter custom duration in minutes"
        value={customDuration || sessionDuration?.toString() || ""}
        onChange={(value) => {
          onCustomDurationChange?.(value);
          const numValue = parseInt(value);
          if (!isNaN(numValue) && numValue > 0) {
            onSessionDurationChange?.(numValue);
          }
        }}
      />
    </div>
  )}
</Field>
```

## 8. Microphone Button Repositioning

**File:** `components/InteractiveAvatar.tsx`

Moved microphone button to video overlay, next to "Avatar is listening" indicator:

```tsx
import { AudioInput } from "./AvatarSession/AudioInput";
const { startVoiceChat, isVoiceChatActive } = useVoiceChat();

// In video container:
{sessionState === StreamingAvatarSessionState.CONNECTED && (
  <>
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
      <span>{isSpeaking ? 'Avatar is speaking' : 'Avatar is listening'}</span>
      {isVoiceChatActive && <AudioInput />}
    </div>
    {/* Timer display */}
  </>
)}
```

**File:** `components/AvatarSession/AvatarControls.tsx`

Removed AudioInput from controls (only show TextInput when not in voice chat):

```tsx
{!isVoiceChatActive && !isVoiceChatLoading && <TextInput />}
```

## 9. Close Button Styling

**File:** `components/AvatarSession/AvatarVideo.tsx`

Updated close button with white icon:

```tsx
{isLoaded && (
  <Button
    className="absolute top-3 right-3 !p-2 !bg-zinc-900 !bg-opacity-75 hover:!bg-opacity-90 z-10 !text-white"
    onClick={handleClose}
  >
    <CloseIcon size={20} className="text-white" />
  </Button>
)}
```

## 10. NavBar Updates

**File:** `components/NavBar.tsx`

Updated with larger title, centered, and author information:

```tsx
<div className="flex flex-row justify-between items-center w-[1000px] m-auto p-6 relative">
  <div className="flex-1"></div>
  <div className="flex flex-col gap-1 items-center relative w-full">
    <p className="text-3xl font-semibold text-black">
      CU Anschutz School of Dental Medicine
    </p>
    <div className="absolute right-0 top-full mt-1">
      <a
        href="https://www.linkedin.com/in/clintcarlson/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-black hover:underline"
      >
        Author: Clint Carlson | Contact
      </a>
    </div>
  </div>
  <div className="flex-1"></div>
</div>
```

## Summary of Color Changes

- **Primary Button Color:** `#CFB87C` (gold) with black text
- **Button Hover:** `#B8A569` (darker gold)
- **Toggle Active State:** `#CFB87C` with black text
- **Microphone States:**
  - Normal: `#CFB87C` with black text
  - Muted: `red-600` with white text
  - User Talking: `green-600` with white text
- **Icon Colors:** White for visibility on dark backgrounds

## Files Modified

1. `components/Icons.tsx` - Added fullscreen icons
2. `components/Button.tsx` - Updated button colors
3. `components/AvatarSession/AvatarControls.tsx` - Updated toggle colors, removed AudioInput
4. `components/AvatarSession/AudioInput.tsx` - Enhanced microphone button styling
5. `components/AvatarSession/AvatarVideo.tsx` - Updated close button styling
6. `components/InteractiveAvatar.tsx` - Major updates: fullscreen, background image, session timer, microphone positioning
7. `components/AvatarConfig/index.tsx` - Added background image and session duration settings
8. `components/NavBar.tsx` - Updated title and added author information

## Dependencies

No new dependencies were added. All changes use existing React hooks and Tailwind CSS classes.

