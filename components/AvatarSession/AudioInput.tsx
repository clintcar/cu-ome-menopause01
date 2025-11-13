import React from "react";

import { useVoiceChat } from "../logic/useVoiceChat";
import { Button } from "../Button";
import { LoadingIcon, MicIcon, MicOffIcon } from "../Icons";
import { useConversationState } from "../logic/useConversationState";

export const AudioInput: React.FC = () => {
  const { muteInputAudio, unmuteInputAudio, isMuted, isVoiceChatLoading } =
    useVoiceChat();
  const { isUserTalking } = useConversationState();

  const handleMuteClick = () => {
    if (isMuted) {
      unmuteInputAudio();
    } else {
      muteInputAudio();
    }
  };

  return (
    <div>
      <Button
        className={`!p-3 relative !bg-[#CFB87C] hover:!bg-[#B8A569] !text-black ${isMuted ? "!bg-red-600 hover:!bg-red-700 !text-white" : ""} ${isUserTalking ? "!bg-green-600 hover:!bg-green-700 !text-white" : ""}`}
        disabled={isVoiceChatLoading}
        onClick={handleMuteClick}
      >
        <div
          className={`absolute left-0 top-0 rounded-lg border-2 ${isMuted || isUserTalking ? "border-white" : "border-black"} w-full h-full ${isUserTalking ? "animate-ping" : ""}`}
        />
        {isVoiceChatLoading ? (
          <LoadingIcon className="animate-spin" size={24} />
        ) : isMuted ? (
          <MicOffIcon size={24} />
        ) : (
          <MicIcon size={24} />
        )}
      </Button>
    </div>
  );
};
