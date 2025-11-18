import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { AvatarConfig } from "./AvatarConfig";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { AudioInput } from "./AvatarSession/AudioInput";
import { useVoiceChat } from "./logic/useVoiceChat";
import { useTextChat } from "./logic/useTextChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon, FullscreenIcon, FullscreenExitIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";

import { AVATARS } from "@/app/lib/constants";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: "Marianne_Chair_Sitting_public",
  knowledgeId: "154e1d22f5b14a459112c893fb14bea2",
  voice: {
    rate: 1.0,
    emotion: "friendly" as VoiceEmotion,
    model: ElevenLabsModel.eleven_flash_v2_5,
    voiceId: "e7f265ef0dc7426e8ed217c58da7e371",
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat, isVoiceChatActive } = useVoiceChat();
  const { sendMessage } = useTextChat();

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
  const [backgroundImage, setBackgroundImage] = useState<string>("demo.png");
  const [sessionDuration, setSessionDuration] = useState<number>(10); // in minutes
  const [customDuration, setCustomDuration] = useState<string>("");
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const mediaStream = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useMemoizedFn(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen toggle failed", err);
    }
  });

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
      // Stop session when timer reaches 0
      stopAvatar();
    }
  }, [remainingTime, sessionState, stopAvatar]);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
        setIsSpeaking(true);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
        setIsSpeaking(false);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Stream ready:", event.detail);
      });
      avatar.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
      });
      avatar.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        console.log(">>>>> User end message:", event);
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log(">>>>> User talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        console.log(">>>>> Avatar talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
        console.log(">>>>> Avatar end message:", event);
      });

      await startAvatar(config);

      if (isVoiceChat) {
        await startVoiceChat();
      }

      // Auto-greet to ensure avatar starts speaking on session start
      setTimeout(() => {
        sendMessage(
          "Hello! I'm your assistant. How can I help you today?"
        );
      }, 300);
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
        {sessionState === StreamingAvatarSessionState.INACTIVE && (
          <div className="flex flex-row justify-center items-center gap-4 p-4 border-b border-zinc-700">
            <Button onClick={() => startSessionV2(true)}>Start Voice Chat</Button>
            <Button onClick={() => startSessionV2(false)}>Start Text Chat</Button>
          </div>
        )}
        <div 
          ref={containerRef} 
          className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: backgroundImage ? `url(/${backgroundImage})` : undefined
          }}
        >
          {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
            <AvatarVideo ref={mediaStream} />
          ) : (
            <></>
          )}
          {/* <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-6 py-2 rounded-md text-lg font-medium">
            María Teresa Fuster
          </div> */}
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
          {sessionState === StreamingAvatarSessionState.CONNECTED && (
            <>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span>{isSpeaking ? 'Avatar is speaking' : 'Avatar is listening'}</span>
                {isVoiceChatActive && <AudioInput />}
              </div>
              {remainingTime !== null && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-md text-sm font-medium">
                  Time remaining: {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, "0")}
                </div>
              )}
            </>
          )}
        </div>
        {sessionState === StreamingAvatarSessionState.INACTIVE && (
          <div className="border-t border-zinc-700">
            <div
              className="w-full cursor-pointer select-none p-4 text-sm font-medium bg-zinc-800 text-white"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              {isSettingsOpen ? "▲ Settings" : "▼ Settings"}
            </div>
            {isSettingsOpen && (
              <div className="p-4">
                <AvatarConfig 
                  config={config} 
                  onConfigChange={setConfig}
                  backgroundImage={backgroundImage}
                  onBackgroundImageChange={setBackgroundImage}
                  sessionDuration={sessionDuration}
                  onSessionDurationChange={setSessionDuration}
                  customDuration={customDuration}
                  onCustomDurationChange={setCustomDuration}
                />
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-6 items-center justify-center p-8 border-t border-zinc-700 w-full">
          {sessionState === StreamingAvatarSessionState.CONNECTED ? (
            <AvatarControls />
          ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
            <></>
          ) : (
            <LoadingIcon />
          )}
        </div>
      </div>
      {sessionState === StreamingAvatarSessionState.CONNECTED && (
        <MessageHistory />
      )}
    </div>
  );
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
