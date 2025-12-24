"use client";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { meetingService } from "../../services/meetingService";
import { AlertTriangle } from "lucide-react";

type EndCallButtonProps = {
  hasRecording: boolean;
};

const EndCallButton = ({ hasRecording }: EndCallButtonProps) => {
  const call = useCall();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEndCallModal, setShowEndCallModal] = useState(false);

  if (!localParticipant) return null;

  const isMeetingOwner =
    localParticipant?.userId &&
    call?.state?.createdBy?.id === localParticipant.userId;

  const handleEndCallClick = () => {
    if (isMeetingOwner) {
      setShowEndCallModal(true);
    } else {
      handleLeave();
    }
  };

  const handleConfirmEndCall = async () => {
    if (!call || isProcessing) return;
    setShowEndCallModal(false);

    setIsProcessing(true);
    const callId = call.id;

    try {
      // 1. Stop recording if it's currently in progress
      // if (hasRecording) {
      //   try {
      //     await call.stopRecording();
      //     console.log("✅ Recording stopped successfully");
      //   } catch (error) {
      //     console.error("❌ Error stopping recording:", error);
      //   }
      // }

      // 2. Disable devices
      await call.camera?.disable();
      await call.microphone?.disable();

      // 3. End the call
      console.log("Calling endCall()", { callId });
      await call.endCall();

      // 4. Get end time and send to backend (without recording URL)
      const endTime = new Date();
      try {
        const res = await meetingService.finishMeeting(callId, endTime, null);
        if (res.success) {
          console.log("finishMeeting success:", res.message);
        } else {
          console.warn("finishMeeting failed:", res.error || res.message);
        }
      } catch (e) {
        console.error("Error calling meetingService.finishMeeting", e);
      }
    } catch (err) {
      console.warn("Error ending call", err);
    } finally {
      setIsProcessing(false);
      router.push(`/meeting-detail/${callId}`);
    }
  };

  const handleLeave = async () => {
    if (!call || isProcessing) return;
    setIsProcessing(true);
    try {
      await call.camera?.disable();
      await call.microphone?.disable();
      await call.leave();
    } catch (err) {
      console.warn("Error leaving call", err);
    } finally {
      setIsProcessing(false);
      router.push(`/meeting-detail/${call.id}`);
    }
  };

  return (
    <>
      <Button
        onClick={handleEndCallClick}
        disabled={isProcessing}
        title={isMeetingOwner ? "End Call" : "Leave Call"}
        className={`cursor-pointer flex items-center disabled:opacity-60 disabled:cursor-not-allowed
        bg-red-600 hover:bg-red-700 rounded-full p-4`}
      >
        {isProcessing
          ? isMeetingOwner
            ? "Ending..."
            : "Leaving..."
          : isMeetingOwner
            ? "End Call"
            : "Leave Call"}
      </Button>

      {/* End Call Confirmation Modal */}
      {showEndCallModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            animation: "fadeIn 0.2s ease-in-out",
          }}
          onClick={() => setShowEndCallModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "480px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              overflow: "hidden",
              animation: "slideUp 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "24px 24px 16px",
                textAlign: "center",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ff5e13 0%, #ff8c42 100%)",
                  marginBottom: "16px",
                }}
              >
                <AlertTriangle size={28} color="white" />
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  margin: 0,
                }}
              >
                End Meeting for Everyone?
              </h3>
            </div>

            {/* Content */}
            <div style={{ padding: "24px" }}>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#666",
                  margin: "0 0 12px 0",
                }}
              >
                Are you sure you want to end this meeting? This will disconnect
                all participants and cannot be undone.
              </p>
              {hasRecording && (
                <p
                  style={{
                    background: "#fff3e0",
                    borderLeft: "3px solid #ff9800",
                    padding: "12px",
                    borderRadius: "6px",
                    color: "#e65100",
                    fontSize: "14px",
                    margin: "16px 0 0 0",
                    lineHeight: "1.5",
                  }}
                >
                  The recording will be stopped and saved automatically.
                </p>
              )}
            </div>

            {/* Actions */}
            <div
              style={{
                padding: "16px 24px 24px",
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontWeight: 500,
                  fontSize: "14px",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  border: "none",
                  outline: "none",
                  background: "#f5f5f5",
                  color: "#666",
                  opacity: isProcessing ? 0.6 : 1,
                }}
                onClick={() => setShowEndCallModal(false)}
                disabled={isProcessing}
                onMouseEnter={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.background = "#e0e0e0";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f5f5f5";
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontWeight: 500,
                  fontSize: "14px",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  border: "none",
                  outline: "none",
                  background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                  color: "white",
                  minWidth: "120px",
                  opacity: isProcessing ? 0.6 : 1,
                }}
                onClick={handleConfirmEndCall}
                disabled={isProcessing}
                onMouseEnter={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(220, 38, 38, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {isProcessing ? "Ending..." : "End Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add keyframe animations via style tag */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 640px) {
          .end-call-modal-responsive {
            width: 95% !important;
            margin: 0 16px;
          }
        }
      `}</style>
    </>
  );
};

export default EndCallButton;
