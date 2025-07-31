"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  PhoneCall,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageCircle,
  Settings,
  Maximize,
  Minimize,
  Wifi,
  WifiOff,
  User,
  AlertCircle,
} from "lucide-react";
import { io } from "socket.io-client";

const adminId = "673017dde4526bd79cc61fa6";

const VideoChatUserFixed = ({ userId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const isCallingRef = useRef(false);
  const socketRef = useRef(null);
  const isInitializedRef = useRef(false);
  const cleanupRef = useRef(false);
  const mountedRef = useRef(true);

  const [inCall, setInCall] = useState(false);
  const [calling, setCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [connectionState, setConnectionState] = useState("new");
  const [iceConnectionState, setIceConnectionState] = useState("new");
  const [mediaEnabled, setMediaEnabled] = useState({
    video: false,
    audio: false,
  });
  const [socketConnected, setSocketConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(false);

  // Enhanced ICE servers
  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ];

  // Debug logging function
  const addDebugLog = useCallback((message) => {
    if (!mountedRef.current) return;
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs((prev) => [...prev.slice(-50), logMessage]);
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (inCall && callStartTime && mountedRef.current) {
      interval = setInterval(() => {
        if (mountedRef.current) {
          setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [inCall, callStartTime]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const endCall = useCallback(() => {
    if (cleanupRef.current || !mountedRef.current) return;
    addDebugLog("📞 User: Ending call...");

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        addDebugLog(`🛑 User: Stopped track: ${track.kind}`);
      });
      localStreamRef.current = null;
    }

    if (localVideoRef.current && mountedRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current && mountedRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if ((inCall || calling) && socketRef.current?.connected) {
      socketRef.current.emit("end-call", { to: adminId });
      addDebugLog("📤 User: Sent end-call signal");
    }

    // Cleanup peer connection
    if (peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.oniceconnectionstatechange = null;
      if (peerRef.current.signalingState !== "closed") {
        peerRef.current.close();
      }
      peerRef.current = null;
    }

    isCallingRef.current = false;
    if (mountedRef.current) {
      setInCall(false);
      setCalling(false);
      setIncomingCall(null);
      setMediaEnabled({ video: false, audio: false });
      setConnectionState("new");
      setIceConnectionState("new");
      setCallStartTime(null);
      setCallDuration(0);
      setIsFullscreen(false);
    }
  }, [inCall, calling, addDebugLog]);

  const cleanupPeerConnection = useCallback(() => {
    if (cleanupRef.current || !mountedRef.current) return;
    addDebugLog("🧹 User: Cleaning up peer connection...");

    if (peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.oniceconnectionstatechange = null;
      if (peerRef.current.signalingState !== "closed") {
        peerRef.current.close();
      }
      peerRef.current = null;
    }
    isCallingRef.current = false;
  }, [addDebugLog]);

  // Safe video play function with better timing and error handling
  const safePlayVideo = useCallback(
    async (videoElement, streamType) => {
      if (!videoElement || !mountedRef.current) return false;

      try {
        // Ensure the video element is ready and has a source
        if (!videoElement.srcObject) {
          addDebugLog(`⚠️ User: No srcObject for ${streamType} video`);
          return false;
        }

        // Wait for loadedmetadata event before playing
        await new Promise((resolve, reject) => {
          if (videoElement.readyState >= 1) {
            resolve();
            return;
          }

          const onLoadedMetadata = () => {
            videoElement.removeEventListener(
              "loadedmetadata",
              onLoadedMetadata
            );
            videoElement.removeEventListener("error", onError);
            resolve();
          };

          const onError = (error) => {
            videoElement.removeEventListener(
              "loadedmetadata",
              onLoadedMetadata
            );
            videoElement.removeEventListener("error", onError);
            reject(error);
          };

          videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
          videoElement.addEventListener("error", onError);

          // Timeout after 5 seconds
          setTimeout(() => {
            videoElement.removeEventListener(
              "loadedmetadata",
              onLoadedMetadata
            );
            videoElement.removeEventListener("error", onError);
            resolve();
          }, 5000);
        });

        if (!mountedRef.current || !videoElement.srcObject) return false;

        // Try to play the video
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          await playPromise;
        }

        addDebugLog(`✅ User: ${streamType} video playing successfully`);
        return true;
      } catch (error) {
        if (mountedRef.current && error.name !== "AbortError") {
          addDebugLog(
            `❌ User: Error playing ${streamType} video: ${error.message}`
          );
        }
        return false;
      }
    },
    [addDebugLog]
  );

  // Fixed enableMedia function
  const enableMedia = useCallback(
    async (options = { video: false, audio: false }) => {
      if (!mountedRef.current) return null;

      try {
        const constraints = {};

        if (options.video) {
          constraints.video = {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          };
        }

        if (options.audio) {
          constraints.audio = {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          };
        }

        addDebugLog(
          `🎥 User: Requesting media access: ${JSON.stringify(constraints)}`
        );

        if (Object.keys(constraints).length === 0) {
          addDebugLog("⚠️ User: No media constraints, skipping getUserMedia");
          return localStreamRef.current;
        }

        const newStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );

        if (!mountedRef.current) {
          newStream.getTracks().forEach((track) => track.stop());
          return null;
        }

        // Stop old stream if exists
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
        }

        localStreamRef.current = newStream;

        // Update media enabled state
        setMediaEnabled({
          video: !!constraints.video,
          audio: !!constraints.audio,
        });

        // Set video source and play
        if (localVideoRef.current && mountedRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
          localVideoRef.current.muted = true;

          // Play immediately after setting srcObject
          if (mountedRef.current) {
            safePlayVideo(localVideoRef.current, "local");
          }
        }

        // If in call, update peer connection with new tracks
        if (peerRef.current && (inCall || calling) && mountedRef.current) {
          addDebugLog("🔄 User: Updating peer connection with new tracks");
          await updatePeerConnectionTracks(peerRef.current, newStream);
        }

        addDebugLog("✅ User: Media enabled successfully");
        return localStreamRef.current;
      } catch (err) {
        if (mountedRef.current) {
          addDebugLog(`❌ User: Cannot enable media: ${err.message}`);
          let errorMessage = "Không thể truy cập thiết bị.";
          if (err.name === "NotAllowedError") {
            errorMessage = "Bạn đã từ chối quyền truy cập camera/microphone.";
          } else if (err.name === "NotFoundError") {
            errorMessage = "Không tìm thấy camera hoặc microphone.";
          }
          alert(errorMessage);
        }
        return null;
      }
    },
    [addDebugLog, inCall, calling, safePlayVideo]
  );

  // New function to update peer connection tracks
  const updatePeerConnectionTracks = useCallback(
    async (peer, stream) => {
      if (!peer || peer.signalingState === "closed" || !mountedRef.current) {
        addDebugLog(
          "❌ User: Cannot update tracks: peer connection is closed or component unmounted"
        );
        return false;
      }

      try {
        // Get current senders
        const senders = peer.getSenders();

        // Update or add video track
        const videoTrack = stream.getVideoTracks()[0];
        const videoSender = senders.find(
          (s) => s.track && s.track.kind === "video"
        );

        if (videoTrack) {
          if (videoSender) {
            addDebugLog("🔄 User: Replacing video track");
            await videoSender.replaceTrack(videoTrack);
          } else {
            addDebugLog("➕ User: Adding video track");
            peer.addTrack(videoTrack, stream);
          }
        } else if (videoSender) {
          addDebugLog("🗑️ User: Removing video track");
          peer.removeTrack(videoSender);
        }

        // Update or add audio track
        const audioTrack = stream.getAudioTracks()[0];
        const audioSender = senders.find(
          (s) => s.track && s.track.kind === "audio"
        );

        if (audioTrack) {
          if (audioSender) {
            addDebugLog("🔄 User: Replacing audio track");
            await audioSender.replaceTrack(audioTrack);
          } else {
            addDebugLog("➕ User: Adding audio track");
            peer.addTrack(audioTrack, stream);
          }
        } else if (audioSender) {
          addDebugLog("🗑️ User: Removing audio track");
          peer.removeTrack(audioSender);
        }

        addDebugLog("✅ User: Peer connection tracks updated successfully");
        return true;
      } catch (err) {
        if (mountedRef.current) {
          addDebugLog(`❌ User: Error updating tracks: ${err.message}`);
        }
        return false;
      }
    },
    [addDebugLog]
  );

  const createPeerConnection = useCallback(() => {
    if (!mountedRef.current) return null;

    addDebugLog("🔗 User: Creating new peer connection...");
    cleanupPeerConnection();

    const peer = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10,
      iceTransportPolicy: "all",
    });

    peer.onicecandidate = (event) => {
      if (
        event.candidate &&
        peer.signalingState !== "closed" &&
        socketRef.current?.connected &&
        mountedRef.current
      ) {
        addDebugLog(`🧊 User: Sending ICE candidate: ${event.candidate.type}`);
        socketRef.current.emit("ice-candidate", {
          to: adminId,
          candidate: event.candidate,
        });
      } else if (!event.candidate && mountedRef.current) {
        addDebugLog("🧊 User: ICE gathering completed");
      }
    };

    peer.ontrack = (event) => {
      if (!mountedRef.current) return;

      addDebugLog("📺 User: Received remote stream from admin");
      if (remoteVideoRef.current && event.streams[0]) {
        // Set srcObject immediately
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.volume = 1.0;

        // Don't use setTimeout, play immediately after setting srcObject
        if (mountedRef.current) {
          safePlayVideo(remoteVideoRef.current, "remote");
        }
      }
    };

    peer.onconnectionstatechange = () => {
      if (!mountedRef.current) return;

      const state = peer.connectionState;
      addDebugLog(`🔗 User: Connection state changed to: ${state}`);
      setConnectionState(state);

      if (state === "connected") {
        setCalling(false);
        setInCall(true);
        setCallStartTime(Date.now());
        addDebugLog("✅ User: Call connected successfully!");
      } else if (state === "failed") {
        addDebugLog("❌ User: Connection failed, ending call");
        setTimeout(() => {
          if (mountedRef.current) endCall();
        }, 2000);
      } else if (state === "disconnected") {
        addDebugLog(
          "⚠️ User: Connection disconnected, attempting reconnection..."
        );
        setTimeout(() => {
          if (peer.connectionState === "disconnected" && mountedRef.current) {
            addDebugLog("🔄 User: Restarting ICE...");
            peer.restartIce();
          }
        }, 1000);
      }
    };

    peer.oniceconnectionstatechange = () => {
      if (!mountedRef.current) return;

      const state = peer.iceConnectionState;
      addDebugLog(`🧊 User: ICE connection state changed to: ${state}`);
      setIceConnectionState(state);

      if (state === "failed") {
        addDebugLog("🔄 User: ICE connection failed, attempting restart...");
        peer.restartIce();
      } else if (state === "disconnected") {
        addDebugLog("⚠️ User: ICE disconnected");
      } else if (state === "connected") {
        addDebugLog("✅ User: ICE connected successfully!");
      }
    };

    return peer;
  }, [cleanupPeerConnection, endCall, addDebugLog, safePlayVideo]);

  const addTracksToConnection = useCallback(
    (peer, stream) => {
      if (!peer || peer.signalingState === "closed" || !mountedRef.current) {
        addDebugLog(
          "❌ User: Cannot add tracks: peer connection is closed or component unmounted"
        );
        return false;
      }

      try {
        // Add all tracks from stream
        stream.getTracks().forEach((track) => {
          addDebugLog(
            `➕ User: Adding track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`
          );
          peer.addTrack(track, stream);
        });

        addDebugLog("✅ User: All tracks added successfully");
        return true;
      } catch (err) {
        if (mountedRef.current) {
          addDebugLog(`❌ User: Error adding tracks: ${err.message}`);
        }
        return false;
      }
    },
    [addDebugLog]
  );

  const startCall = useCallback(async () => {
    if (
      isCallingRef.current ||
      !socketRef.current?.connected ||
      !mountedRef.current
    ) {
      addDebugLog(
        "⚠️ User: Already calling, socket not connected, or component unmounted"
      );
      return;
    }

    // Ensure media is enabled
    if (!mediaEnabled.video || !mediaEnabled.audio) {
      addDebugLog("🎥 User: Enabling media before call...");
      const stream = await enableMedia({ video: true, audio: true });
      if (!stream || !mountedRef.current) {
        addDebugLog(
          "❌ User: Failed to enable media or component unmounted, cannot start call"
        );
        if (mountedRef.current) {
          alert("Không thể bắt đầu cuộc gọi do lỗi truy cập media.");
        }
        return;
      }
    }

    isCallingRef.current = true;
    try {
      addDebugLog("📞 User: Starting call to admin...");
      setCalling(true);

      const peer = createPeerConnection();
      if (!peer || !mountedRef.current) {
        throw new Error(
          "Failed to create peer connection or component unmounted"
        );
      }
      peerRef.current = peer;

      // Add tracks BEFORE creating offer
      if (!localStreamRef.current) {
        throw new Error("No local stream available");
      }

      const tracksAdded = addTracksToConnection(peer, localStreamRef.current);
      if (!tracksAdded) {
        throw new Error("Failed to add tracks to connection");
      }

      addDebugLog("📤 User: Creating offer...");
      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      if (!mountedRef.current) {
        throw new Error("Component unmounted during offer creation");
      }

      await peer.setLocalDescription(offer);
      addDebugLog("✅ User: Local description set");

      // Wait for ICE gathering with timeout
      addDebugLog("⏳ User: Waiting for ICE gathering...");
      await new Promise((resolve) => {
        if (peer.iceGatheringState === "complete") {
          resolve();
        } else {
          const checkState = () => {
            if (peer.iceGatheringState === "complete" || !mountedRef.current) {
              peer.removeEventListener("icegatheringstatechange", checkState);
              resolve();
            }
          };
          peer.addEventListener("icegatheringstatechange", checkState);
          setTimeout(resolve, 10000);
        }
      });

      if (!mountedRef.current) {
        throw new Error("Component unmounted during ICE gathering");
      }

      addDebugLog("📤 User: Sending offer to admin...");
      socketRef.current.emit("call-user", {
        to: adminId,
        offer: peer.localDescription,
        from: userId,
        timestamp: Date.now(),
      });

      addDebugLog("✅ User: Call initiated successfully");
    } catch (err) {
      if (mountedRef.current) {
        addDebugLog(`❌ User: Error starting call: ${err.message}`);
        alert(`Không thể bắt đầu cuộc gọi: ${err.message}`);
        setCalling(false);
        cleanupPeerConnection();
      }
    } finally {
      isCallingRef.current = false;
    }
  }, [
    mediaEnabled.video,
    mediaEnabled.audio,
    createPeerConnection,
    addTracksToConnection,
    cleanupPeerConnection,
    enableMedia,
    addDebugLog,
    userId,
  ]);

  const answerCall = useCallback(async () => {
    if (!incomingCall || !peerRef.current || !mountedRef.current) return;

    // Ensure media is enabled
    if (!mediaEnabled.video || !mediaEnabled.audio) {
      addDebugLog("🎥 User: Enabling media before answering...");
      const stream = await enableMedia({ video: true, audio: true });
      if (!stream || !mountedRef.current) {
        addDebugLog(
          "❌ User: Failed to enable media or component unmounted, cannot answer call"
        );
        if (mountedRef.current) {
          alert("Không thể trả lời cuộc gọi do lỗi truy cập media.");
        }
        return;
      }
    }

    try {
      addDebugLog("✅ User: Answering call...");

      // Add tracks to peer connection
      if (localStreamRef.current) {
        addTracksToConnection(peerRef.current, localStreamRef.current);
      }

      // Create answer
      const answer = await peerRef.current.createAnswer();

      if (!mountedRef.current) return;

      await peerRef.current.setLocalDescription(answer);

      // Send answer to caller
      socketRef.current.emit("answer-call", {
        to: incomingCall.from,
        answer: peerRef.current.localDescription,
      });

      setIncomingCall(null);
      setInCall(true);
      setCallStartTime(Date.now());
      addDebugLog("✅ User: Call answered successfully");
    } catch (err) {
      if (mountedRef.current) {
        addDebugLog(`❌ User: Error answering call: ${err.message}`);
        alert(`Không thể trả lời cuộc gọi: ${err.message}`);
      }
    }
  }, [
    mediaEnabled,
    incomingCall,
    addTracksToConnection,
    enableMedia,
    addDebugLog,
  ]);

  const rejectCall = useCallback(() => {
    if (!mountedRef.current) return;

    if (incomingCall && socketRef.current?.connected) {
      socketRef.current.emit("reject-call", { to: incomingCall.from });
      addDebugLog("📞 User: Call rejected");
    }
    setIncomingCall(null);
    cleanupPeerConnection();
  }, [incomingCall, cleanupPeerConnection, addDebugLog]);

  // Fixed toggle functions
  const toggleVideo = useCallback(async () => {
    if (!mountedRef.current) return;

    addDebugLog(
      `📹 User: Toggling video from ${
        mediaEnabled.video
      } to ${!mediaEnabled.video}`
    );

    if (mediaEnabled.video) {
      // Turn off video, keep audio
      await enableMedia({ video: false, audio: mediaEnabled.audio });
    } else {
      // Turn on video, keep audio
      await enableMedia({ video: true, audio: mediaEnabled.audio });
    }
  }, [mediaEnabled.video, mediaEnabled.audio, enableMedia, addDebugLog]);

  const toggleAudio = useCallback(async () => {
    if (!mountedRef.current) return;

    addDebugLog(
      `🎤 User: Toggling audio from ${
        mediaEnabled.audio
      } to ${!mediaEnabled.audio}`
    );

    if (mediaEnabled.audio) {
      // Turn off audio, keep video
      await enableMedia({ video: mediaEnabled.video, audio: false });
    } else {
      // Turn on audio, keep video
      await enableMedia({ video: mediaEnabled.video, audio: true });
    }
  }, [mediaEnabled.audio, mediaEnabled.video, enableMedia, addDebugLog]);

  // Socket event handlers
  const handleIncomingCall = useCallback(
    async ({ from, offer, timestamp }) => {
      if (!mountedRef.current) return;

      addDebugLog(`📞 User: Incoming call from: ${from}`);

      // Create peer connection for incoming call
      const peer = createPeerConnection();
      if (!peer || !mountedRef.current) return;
      peerRef.current = peer;

      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        if (mountedRef.current) {
          setIncomingCall({ from, fromName: "Admin", timestamp });
          addDebugLog("✅ User: Incoming call handled successfully");
        }
      } catch (err) {
        if (mountedRef.current) {
          addDebugLog(`❌ User: Error handling incoming call: ${err.message}`);
          alert("Lỗi khi xử lý cuộc gọi đến.");
        }
      }
    },
    [createPeerConnection, addDebugLog]
  );

  const handleCallAnswered = useCallback(
    async ({ answer }) => {
      if (!mountedRef.current) return;

      addDebugLog("✅ User: Call answered by admin");
      if (peerRef.current && peerRef.current.signalingState !== "closed") {
        try {
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          addDebugLog("✅ User: Remote description set successfully");
        } catch (err) {
          if (mountedRef.current) {
            addDebugLog(
              `❌ User: Error setting remote description: ${err.message}`
            );
            alert("Lỗi khi thiết lập kết nối.");
          }
        }
      }
    },
    [addDebugLog]
  );

  const handleIceCandidate = useCallback(
    async ({ candidate }) => {
      if (!mountedRef.current) return;

      addDebugLog(
        `🧊 User: Received ICE candidate: ${candidate?.type || "unknown"}`
      );
      try {
        if (
          peerRef.current &&
          candidate &&
          peerRef.current.signalingState !== "closed"
        ) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          addDebugLog("✅ User: ICE candidate added successfully");
        }
      } catch (err) {
        if (mountedRef.current) {
          addDebugLog(`❌ User: Failed to add ICE candidate: ${err.message}`);
        }
      }
    },
    [addDebugLog]
  );

  const handleCallEnded = useCallback(() => {
    if (!mountedRef.current) return;

    addDebugLog("📞 User: Call ended by admin");
    endCall();
    alert("Cuộc gọi đã kết thúc bởi Admin.");
  }, [endCall, addDebugLog]);

  const handleCallRejected = useCallback(() => {
    if (!mountedRef.current) return;

    addDebugLog("📞 User: Call was rejected by admin");
    setCalling(false);
    cleanupPeerConnection();
    alert("Admin đã từ chối cuộc gọi.");
  }, [cleanupPeerConnection, addDebugLog]);

  // Main useEffect for Socket.IO connection - Fixed to prevent re-initialization
  useEffect(() => {
    if (!userId) {
      addDebugLog("⚠️ User: No userId provided");
      return;
    }

    // Prevent multiple initializations
    if (isInitializedRef.current) {
      addDebugLog("⚠️ User: Already initialized, skipping...");
      return;
    }

    addDebugLog(`🔌 User: Initializing socket connection with ID: ${userId}`);
    isInitializedRef.current = true;
    cleanupRef.current = false;
    mountedRef.current = true;

    const socket = io("https://fashionstoreshopecommertbe.onrender.com", {
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      if (!mountedRef.current) return;
      addDebugLog(`✅ User: Socket connected: ${socket.id}`);
      setSocketConnected(true);
      socket.emit("register", { userId });
    };

    const handleDisconnect = (reason) => {
      if (!mountedRef.current) return;
      addDebugLog(`❌ User: Socket disconnected: ${reason}`);
      setSocketConnected(false);
      alert("Mất kết nối với server. Đang thử kết nối lại...");
    };

    const handleConnectError = (error) => {
      if (!mountedRef.current) return;
      addDebugLog(`❌ User: Socket connection error: ${error}`);
      setSocketConnected(false);
      alert("Không thể kết nối đến server. Vui lòng thử lại sau.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-answered", handleCallAnswered);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);
    socket.on("call-rejected", handleCallRejected);

    return () => {
      addDebugLog("🧹 User: Component unmounting, cleaning up...");
      mountedRef.current = false;
      cleanupRef.current = true;

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-answered", handleCallAnswered);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
      socket.off("call-rejected", handleCallRejected);

      endCall();
      if (socket.connected) {
        socket.disconnect();
      }
      socketRef.current = null;
      setSocketConnected(false);
      isInitializedRef.current = false;
    };
  }, [userId]); // Only depend on userId

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Lỗi xác thực
            </h2>
            <p className="text-gray-600">
              Không tìm thấy User ID. Vui lòng đăng nhập lại.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // In-call interface
  if (inCall) {
    return (
      <div
        className={`${
          isFullscreen ? "fixed inset-0 z-50" : "relative"
        } bg-gray-900 text-white min-h-screen`}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Đang gọi với Admin</span>
              </div>
              <span className="text-lg font-semibold">
                {formatDuration(callDuration)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {socketConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs">{connectionState}</span>
                <span className="text-xs">ICE: {iceConnectionState}</span>
              </div>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="absolute top-16 right-4 w-96 h-64 bg-black bg-opacity-80 rounded-lg p-4 overflow-y-auto z-20">
            <h3 className="text-white font-bold mb-2">Debug Logs</h3>
            <div className="text-xs text-gray-300 space-y-1">
              {debugLogs.slice(-20).map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Video Container */}
        <div className="relative w-full h-full flex">
          {/* Remote Video (Main) */}
          <div className="flex-1 relative bg-black">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-full">
              <span className="text-sm">Admin</span>
            </div>
          </div>

          {/* Local Video (Picture in Picture) */}
          <div className="absolute top-20 right-4 w-64 h-48 bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-white border-opacity-20">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs">
              Bạn
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-6">
          <div className="flex justify-center items-center space-x-6">
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all ${
                mediaEnabled.video
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {mediaEnabled.video ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-all ${
                mediaEnabled.audio
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {mediaEnabled.audio ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={endCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>

            <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all">
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Hỗ trợ khách hàng
                </h1>
                <p className="text-sm text-gray-500">ID: {userId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                Debug
              </button>
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  socketConnected
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {socketConnected ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {socketConnected ? "Đã kết nối" : "Mất kết nối"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Debug Panel */}
          {showDebug && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Debug Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">
                      Socket
                    </div>
                    <div
                      className={`text-sm ${
                        socketConnected ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {socketConnected ? "Connected" : "Disconnected"}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">
                      Connection
                    </div>
                    <div className="text-sm text-blue-600">
                      {connectionState}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">ICE</div>
                    <div className="text-sm text-purple-600">
                      {iceConnectionState}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto text-xs font-mono">
                  {debugLogs.slice(-30).map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Admin Status */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Trạng thái Admin
              </h2>
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Admin Support
                </h3>
                <div
                  className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                    socketConnected
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      socketConnected ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                  <span>
                    {socketConnected ? "Sẵn sàng hỗ trợ" : "Không trực tuyến"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {!socketConnected && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-800 font-medium">
                      Mất kết nối với server. Đang thử kết nối lại...
                    </p>
                  </div>
                </div>
              )}

              {/* Media Controls */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Chuẩn bị cuộc gọi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() =>
                      enableMedia({ video: true, audio: mediaEnabled.audio })
                    }
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      mediaEnabled.video
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-gray-400 text-gray-700"
                    }`}
                  >
                    <Video className="w-5 h-5" />
                    <span>
                      {mediaEnabled.video ? "Camera đã bật" : "Bật Camera"}
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      enableMedia({ video: mediaEnabled.video, audio: true })
                    }
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      mediaEnabled.audio
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-gray-400 text-gray-700"
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                    <span>
                      {mediaEnabled.audio ? "Mic đã bật" : "Bật Microphone"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Video Preview */}
              <div
                className="bg-gray-900 rounded-lg overflow-hidden relative mb-6"
                style={{ aspectRatio: "16/9" }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!mediaEnabled.video && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <VideoOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Camera chưa được bật</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-full text-white text-sm">
                  Xem trước camera của bạn
                </div>
              </div>

              {/* Call Actions */}
              {!calling && (
                <div className="text-center">
                  <button
                    onClick={startCall}
                    disabled={!socketConnected}
                    className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg transition-all font-medium text-lg"
                  >
                    <PhoneCall className="w-6 h-6" />
                    <span>Gọi Admin</span>
                  </button>
                </div>
              )}

              {calling && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PhoneCall className="w-10 h-10 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Đang gọi Admin...
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Connection: {connectionState}
                  </p>
                  <p className="text-gray-600 mb-6">
                    ICE: {iceConnectionState}
                  </p>
                  <button
                    onClick={endCall}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all font-medium"
                  >
                    Hủy cuộc gọi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneCall className="w-10 h-10 text-blue-600 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                📲 Có cuộc gọi đến
              </h2>
              <p className="text-gray-600 mb-6">
                Người gọi: <strong>{incomingCall?.fromName}</strong>
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={rejectCall}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all font-medium"
                >
                  Từ chối
                </button>
                <button
                  onClick={answerCall}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all font-medium"
                >
                  Trả lời
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChatUserFixed;
