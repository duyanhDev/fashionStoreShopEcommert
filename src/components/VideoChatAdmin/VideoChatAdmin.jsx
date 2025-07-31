import { useEffect, useRef, useState, useCallback } from "react";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Settings,
  Wifi,
  WifiOff,
  Users,
} from "lucide-react";
import { io } from "socket.io-client";

const adminId = "673017dde4526bd79cc61fa6";

const VideoChatAdmin = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const isAnsweringRef = useRef(false);
  const isCallingRef = useRef(false);
  const socketRef = useRef(null);
  const isInitializedRef = useRef(false);
  const cleanupRef = useRef(false);
  const mountedRef = useRef(true);

  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [connectionState, setConnectionState] = useState("new");
  const [iceConnectionState, setIceConnectionState] = useState("new");
  const [mediaEnabled, setMediaEnabled] = useState({
    video: false,
    audio: false,
  });
  const [socketConnected, setSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
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
    addDebugLog("📞 Admin: Ending call...");

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        addDebugLog(`🛑 Admin: Stopped track: ${track.kind}`);
      });
      localStreamRef.current = null;
    }

    if (localVideoRef.current && mountedRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current && mountedRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if ((inCall || outgoingCall) && socketRef.current?.connected) {
      const targetUserId = incomingCall?.from || outgoingCall?.to;
      if (targetUserId) {
        socketRef.current.emit("end-call", { to: targetUserId });
        addDebugLog(`📤 Admin: Sent end-call signal to ${targetUserId}`);
      }
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
    isAnsweringRef.current = false;
    if (mountedRef.current) {
      setInCall(false);
      setIncomingCall(null);
      setOutgoingCall(null);
      setMediaEnabled({ video: false, audio: false });
      setConnectionState("new");
      setIceConnectionState("new");
      setCallStartTime(null);
      setCallDuration(0);
      setIsFullscreen(false);
    }
  }, [inCall, outgoingCall, incomingCall, addDebugLog]);

  const cleanupPeerConnection = useCallback(() => {
    if (cleanupRef.current || !mountedRef.current) return;
    addDebugLog("🧹 Admin: Cleaning up peer connection...");

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
    isAnsweringRef.current = false;
  }, [addDebugLog]);

  // Safe video play function with better timing and error handling
  const safePlayVideo = useCallback(
    async (videoElement, streamType) => {
      if (!videoElement || !mountedRef.current) return false;

      try {
        // Ensure the video element is ready and has a source
        if (!videoElement.srcObject) {
          addDebugLog(`⚠️ Admin: No srcObject for ${streamType} video`);
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

        addDebugLog(`✅ Admin: ${streamType} video playing successfully`);
        return true;
      } catch (error) {
        if (mountedRef.current && error.name !== "AbortError") {
          addDebugLog(
            `❌ Admin: Error playing ${streamType} video: ${error.message}`
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
          `🎥 Admin: Requesting media access: ${JSON.stringify(constraints)}`
        );

        if (Object.keys(constraints).length === 0) {
          addDebugLog("⚠️ Admin: No media constraints, skipping getUserMedia");
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
        if (peerRef.current && (inCall || outgoingCall) && mountedRef.current) {
          addDebugLog("🔄 Admin: Updating peer connection with new tracks");
          await updatePeerConnectionTracks(peerRef.current, newStream);
        }

        addDebugLog("✅ Admin: Media enabled successfully");
        return localStreamRef.current;
      } catch (err) {
        if (mountedRef.current) {
          addDebugLog(`❌ Admin: Cannot enable media: ${err.message}`);
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
    [addDebugLog, inCall, outgoingCall, safePlayVideo]
  );

  // New function to update peer connection tracks
  const updatePeerConnectionTracks = useCallback(
    async (peer, stream) => {
      if (!peer || peer.signalingState === "closed" || !mountedRef.current) {
        addDebugLog(
          "❌ Admin: Cannot update tracks: peer connection is closed or component unmounted"
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
            addDebugLog("🔄 Admin: Replacing video track");
            await videoSender.replaceTrack(videoTrack);
          } else {
            addDebugLog("➕ Admin: Adding video track");
            peer.addTrack(videoTrack, stream);
          }
        } else if (videoSender) {
          addDebugLog("🗑️ Admin: Removing video track");
          peer.removeTrack(videoSender);
        }

        // Update or add audio track
        const audioTrack = stream.getAudioTracks()[0];
        const audioSender = senders.find(
          (s) => s.track && s.track.kind === "audio"
        );

        if (audioTrack) {
          if (audioSender) {
            addDebugLog("🔄 Admin: Replacing audio track");
            await audioSender.replaceTrack(audioTrack);
          } else {
            addDebugLog("➕ Admin: Adding audio track");
            peer.addTrack(audioTrack, stream);
          }
        } else if (audioSender) {
          addDebugLog("🗑️ Admin: Removing audio track");
          peer.removeTrack(audioSender);
        }

        addDebugLog("✅ Admin: Peer connection tracks updated successfully");
        return true;
      } catch (err) {
        if (mountedRef.current) {
          addDebugLog(`❌ Admin: Error updating tracks: ${err.message}`);
        }
        return false;
      }
    },
    [addDebugLog]
  );

  const createPeerConnection = useCallback(() => {
    if (!mountedRef.current) return null;

    addDebugLog("🔗 Admin: Creating new peer connection...");
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
        addDebugLog(`🧊 Admin: Sending ICE candidate: ${event.candidate.type}`);
        const targetUserId = incomingCall?.from || outgoingCall?.to;
        if (targetUserId) {
          socketRef.current.emit("ice-candidate", {
            to: targetUserId,
            candidate: event.candidate,
          });
        }
      } else if (!event.candidate && mountedRef.current) {
        addDebugLog("🧊 Admin: ICE gathering completed");
      }
    };

    peer.ontrack = (event) => {
      if (!mountedRef.current) return;

      addDebugLog("📺 Admin: Received remote stream");
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
      addDebugLog(`🔗 Admin: Connection state changed to: ${state}`);
      setConnectionState(state);

      if (state === "connected") {
        setOutgoingCall(null);
        setInCall(true);
        if (!callStartTime) {
          setCallStartTime(Date.now());
        }
        addDebugLog("✅ Admin: Call connected successfully!");
      } else if (state === "failed") {
        addDebugLog("❌ Admin: Connection failed, ending call");
        setTimeout(() => {
          if (mountedRef.current) endCall();
        }, 2000);
      } else if (state === "disconnected") {
        addDebugLog(
          "⚠️ Admin: Connection disconnected, attempting reconnection..."
        );
        setTimeout(() => {
          if (peer.connectionState === "disconnected" && mountedRef.current) {
            addDebugLog("🔄 Admin: Restarting ICE...");
            peer.restartIce();
          }
        }, 1000);
      }
    };

    peer.oniceconnectionstatechange = () => {
      if (!mountedRef.current) return;

      const state = peer.iceConnectionState;
      addDebugLog(`🧊 Admin: ICE connection state changed to: ${state}`);
      setIceConnectionState(state);

      if (state === "failed") {
        addDebugLog("🔄 Admin: ICE connection failed, attempting restart...");
        peer.restartIce();
      } else if (state === "disconnected") {
        addDebugLog("⚠️ Admin: ICE disconnected");
      } else if (state === "connected") {
        addDebugLog("✅ Admin: ICE connected successfully!");
      }
    };

    return peer;
  }, [
    cleanupPeerConnection,
    endCall,
    incomingCall,
    outgoingCall,
    callStartTime,
    addDebugLog,
    safePlayVideo,
  ]);

  const addTracksToConnection = useCallback(
    (peer, stream) => {
      if (!peer || peer.signalingState === "closed" || !mountedRef.current) {
        addDebugLog(
          "❌ Admin: Cannot add tracks: peer connection is closed or component unmounted"
        );
        return false;
      }

      try {
        // Add all tracks from stream
        stream.getTracks().forEach((track) => {
          addDebugLog(
            `➕ Admin: Adding track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`
          );
          peer.addTrack(track, stream);
        });

        addDebugLog("✅ Admin: All tracks added successfully");
        return true;
      } catch (err) {
        if (mountedRef.current) {
          addDebugLog(`❌ Admin: Error adding tracks: ${err.message}`);
        }
        return false;
      }
    },
    [addDebugLog]
  );

  const startCall = useCallback(
    async (userId) => {
      if (
        isCallingRef.current ||
        !socketRef.current?.connected ||
        !mountedRef.current
      ) {
        addDebugLog(
          "⚠️ Admin: Already calling, socket not connected, or component unmounted"
        );
        return;
      }

      // Ensure media is enabled
      if (!mediaEnabled.video || !mediaEnabled.audio) {
        addDebugLog("🎥 Admin: Enabling media before call...");
        const stream = await enableMedia({ video: true, audio: true });
        if (!stream || !mountedRef.current) {
          addDebugLog(
            "❌ Admin: Failed to enable media or component unmounted, cannot start call"
          );
          if (mountedRef.current) {
            alert("Không thể bắt đầu cuộc gọi do lỗi truy cập media.");
          }
          return;
        }
      }

      isCallingRef.current = true;
      try {
        addDebugLog(`📞 Admin: Starting call to user: ${userId}`);
        setOutgoingCall({ to: userId, status: "calling" });

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

        addDebugLog("📤 Admin: Creating offer...");
        const offer = await peer.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

        if (!mountedRef.current) {
          throw new Error("Component unmounted during offer creation");
        }

        await peer.setLocalDescription(offer);
        addDebugLog("✅ Admin: Local description set");

        // Wait for ICE gathering with timeout
        addDebugLog("⏳ Admin: Waiting for ICE gathering...");
        await new Promise((resolve) => {
          if (peer.iceGatheringState === "complete") {
            resolve();
          } else {
            const checkState = () => {
              if (
                peer.iceGatheringState === "complete" ||
                !mountedRef.current
              ) {
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

        addDebugLog("📤 Admin: Sending offer to user...");
        socketRef.current.emit("call-user", {
          to: userId,
          offer: peer.localDescription,
          from: adminId,
          timestamp: Date.now(),
        });

        addDebugLog("✅ Admin: Call initiated successfully");
      } catch (err) {
        if (mountedRef.current) {
          addDebugLog(`❌ Admin: Error starting call: ${err.message}`);
          alert(`Không thể bắt đầu cuộc gọi: ${err.message}`);
          setOutgoingCall(null);
          cleanupPeerConnection();
        }
      } finally {
        isCallingRef.current = false;
      }
    },
    [
      mediaEnabled.video,
      mediaEnabled.audio,
      createPeerConnection,
      addTracksToConnection,
      cleanupPeerConnection,
      enableMedia,
      addDebugLog,
    ]
  );

  const answerCall = useCallback(async () => {
    if (
      !incomingCall ||
      !peerRef.current ||
      isAnsweringRef.current ||
      !mountedRef.current
    )
      return;

    // Ensure media is enabled
    if (!mediaEnabled.video || !mediaEnabled.audio) {
      addDebugLog("🎥 Admin: Enabling media before answering...");
      const stream = await enableMedia({ video: true, audio: true });
      if (!stream || !mountedRef.current) {
        addDebugLog(
          "❌ Admin: Failed to enable media or component unmounted, cannot answer call"
        );
        if (mountedRef.current) {
          alert("Không thể trả lời cuộc gọi do lỗi truy cập media.");
        }
        return;
      }
    }

    isAnsweringRef.current = true;
    try {
      addDebugLog(`✅ Admin: Answering call from: ${incomingCall.from}`);

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
        from: adminId,
        timestamp: Date.now(),
      });

      setIncomingCall(null);
      setInCall(true);
      setCallStartTime(Date.now());
      addDebugLog("✅ Admin: Call answered successfully");
    } catch (err) {
      if (mountedRef.current) {
        addDebugLog(`❌ Admin: Error answering call: ${err.message}`);
        alert(`Không thể trả lời cuộc gọi: ${err.message}`);
      }
    } finally {
      isAnsweringRef.current = false;
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
      addDebugLog("📞 Admin: Call rejected");
    }
    setIncomingCall(null);
    cleanupPeerConnection();
  }, [incomingCall, cleanupPeerConnection, addDebugLog]);

  // Fixed toggle functions
  const toggleVideo = useCallback(async () => {
    if (!mountedRef.current) return;

    addDebugLog(
      `📹 Admin: Toggling video from ${
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
      `🎤 Admin: Toggling audio from ${
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

  // Mock users for display
  const mockUsers = [
    {
      id: "user123",
      name: "Test User",
      avatar: "👤",
      status: "online",
      lastSeen: new Date(),
    },
    {
      id: "user2",
      name: "Trần Thị B",
      avatar: "👩",
      status: "online",
      lastSeen: new Date(),
    },
    {
      id: "user3",
      name: "Lê Văn C",
      avatar: "👨",
      status: "offline",
      lastSeen: new Date(Date.now() - 300000),
    },
  ];

  // Initialize mock users
  useEffect(() => {
    setOnlineUsers(mockUsers);
  }, []);

  // Socket event handlers
  const handleIncomingCall = useCallback(
    async ({ from, offer, timestamp }) => {
      if (!mountedRef.current) return;

      addDebugLog(`📞 Admin: Incoming call from: ${from}`);

      // Create peer connection for incoming call
      const peer = createPeerConnection();
      if (!peer || !mountedRef.current) return;
      peerRef.current = peer;

      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        if (mountedRef.current) {
          setIncomingCall({ from, fromName: `User ${from}`, timestamp });
          addDebugLog("✅ Admin: Incoming call handled successfully");
        }
      } catch (err) {
        if (mountedRef.current) {
          addDebugLog(`❌ Admin: Error handling incoming call: ${err.message}`);
          alert("Lỗi khi xử lý cuộc gọi đến.");
        }
      }
    },
    [createPeerConnection, addDebugLog]
  );

  const handleCallAnswered = useCallback(
    async ({ answer }) => {
      if (!mountedRef.current) return;

      addDebugLog("✅ Admin: Call answered by user");
      if (peerRef.current && peerRef.current.signalingState !== "closed") {
        try {
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          addDebugLog("✅ Admin: Remote description set successfully");
          setOutgoingCall(null);
          setInCall(true);
        } catch (err) {
          if (mountedRef.current) {
            addDebugLog(
              `❌ Admin: Error setting remote description: ${err.message}`
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
        `🧊 Admin: Received ICE candidate: ${candidate?.type || "unknown"}`
      );
      try {
        if (
          peerRef.current &&
          candidate &&
          peerRef.current.signalingState !== "closed"
        ) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          addDebugLog("✅ Admin: ICE candidate added successfully");
        }
      } catch (err) {
        if (mountedRef.current) {
          addDebugLog(`❌ Admin: Failed to add ICE candidate: ${err.message}`);
        }
      }
    },
    [addDebugLog]
  );

  const handleCallEnded = useCallback(() => {
    if (!mountedRef.current) return;

    addDebugLog("📞 Admin: Call ended by user");
    endCall();
    alert("Cuộc gọi đã kết thúc bởi người dùng.");
  }, [endCall, addDebugLog]);

  const handleCallRejected = useCallback(() => {
    if (!mountedRef.current) return;

    addDebugLog("📞 Admin: Call was rejected by user");
    setOutgoingCall(null);
    cleanupPeerConnection();
    alert("Người dùng đã từ chối cuộc gọi.");
  }, [cleanupPeerConnection, addDebugLog]);

  // Main useEffect for Socket.IO connection - Fixed to prevent re-initialization
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current) {
      addDebugLog("⚠️ Admin: Already initialized, skipping...");
      return;
    }

    addDebugLog(`🔌 Admin: Initializing socket connection with ID: ${adminId}`);
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
      addDebugLog(`✅ Admin: Socket connected: ${socket.id}`);
      setSocketConnected(true);
      socket.emit("register", { userId: adminId });
    };

    const handleDisconnect = (reason) => {
      if (!mountedRef.current) return;
      addDebugLog(`❌ Admin: Socket disconnected: ${reason}`);
      setSocketConnected(false);
      alert("Mất kết nối với server. Đang thử kết nối lại...");
    };

    const handleConnectError = (error) => {
      if (!mountedRef.current) return;
      addDebugLog(`❌ Admin: Socket connection error: ${error}`);
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
      addDebugLog("🧹 Admin: Component unmounting, cleaning up...");
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
  }, []); // No dependencies to prevent re-initialization

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-red-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "online":
        return "Trực tuyến";
      case "busy":
        return "Bận";
      case "offline":
        return "Offline";
      default:
        return "Không xác định";
    }
  };

  // In-call interface
  if (inCall) {
    return (
      <div className="flex h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Đang gọi với User</span>
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
              <span className="text-sm">User</span>
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
              Admin (You)
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Danh sách người dùng
          </h2>
        </div>
        <div className="p-4">
          <ul className="space-y-2">
            {onlineUsers.map((user) => (
              <li
                key={user.id}
                className={`flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedUser?.id === user.id
                    ? "bg-blue-50 border border-blue-200"
                    : ""
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-2xl">{user.avatar}</span>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.id}</div>
                  </div>
                </div>
                <span
                  className={`inline-block w-3 h-3 rounded-full ${getStatusColor(
                    user.status
                  )}`}
                  title={getStatusText(user.status)}
                ></span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Quản lý cuộc gọi video - Admin
            </h1>
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

        {/* Debug Panel */}
        {showDebug && (
          <div className="bg-white border-b p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Debug Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Socket</div>
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
                <div className="text-sm text-blue-600">{connectionState}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-700">ICE</div>
                <div className="text-sm text-purple-600">
                  {iceConnectionState}
                </div>
              </div>
            </div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-32 overflow-y-auto text-xs font-mono">
              {debugLogs.slice(-15).map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Video Area */}
        <div className="flex-1 flex p-6 space-x-6">
          {/* Remote Video */}
          <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden shadow-lg relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!inCall && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <VideoOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Chưa có cuộc gọi</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
              <span className="text-sm">Connection: {connectionState}</span>
              {inCall && (
                <span className="ml-4">
                  Time: {formatDuration(callDuration)}
                </span>
              )}
            </div>
          </div>

          {/* Local Video & Controls */}
          <div className="w-80 flex flex-col space-y-4">
            {/* Local Video Preview */}
            <div
              className="bg-gray-900 rounded-lg overflow-hidden shadow-lg relative"
              style={{ aspectRatio: "4/3" }}
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!mediaEnabled.video && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center text-white">
                    <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Camera tắt</p>
                  </div>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded flex space-x-1">
                {mediaEnabled.video ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <VideoOff className="w-4 h-4" />
                )}
                {mediaEnabled.audio ? (
                  <Mic className="w-4 h-4" />
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
              </div>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-xs">
                Admin (You)
              </div>
            </div>

            {/* Media Controls */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Media Controls
              </h3>
              <div className="grid grid-cols-2 gap-3">
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
                  <span className="text-sm">
                    {mediaEnabled.video ? "Camera On" : "Enable Camera"}
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
                  <span className="text-sm">
                    {mediaEnabled.audio ? "Mic On" : "Enable Mic"}
                  </span>
                </button>
              </div>
            </div>

            {/* Call Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Call Actions
              </h3>

              {/* Selected User Call */}
              {selectedUser && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Selected User:</span>
                    <span className="text-sm text-gray-600">
                      {selectedUser.name}
                    </span>
                  </div>
                  <button
                    onClick={() => startCall(selectedUser.id)}
                    disabled={
                      !socketConnected ||
                      (!mediaEnabled.video && !mediaEnabled.audio)
                    }
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-all font-medium flex items-center justify-center space-x-2"
                  >
                    <PhoneCall className="w-5 h-5" />
                    <span>Call {selectedUser.name}</span>
                  </button>
                </div>
              )}

              {/* Manual User ID Input */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manual User ID:
                  </label>
                  <input
                    type="text"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    placeholder="Enter User ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => selectedUserId && startCall(selectedUserId)}
                  disabled={
                    !selectedUserId ||
                    !socketConnected ||
                    (!mediaEnabled.video && !mediaEnabled.audio)
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-all font-medium flex items-center justify-center space-x-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call User</span>
                </button>
              </div>

              {/* End Call Button */}
              {inCall && (
                <button
                  onClick={endCall}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all font-medium flex items-center justify-center space-x-2"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>End Call</span>
                </button>
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

      {/* Outgoing Call Modal */}
      {outgoingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneCall className="w-10 h-10 text-blue-600 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                📞 Đang gọi...
              </h2>
              <p className="text-gray-600 mb-2">
                Đang gọi đến: <strong>{outgoingCall?.to}</strong>
              </p>
              <p className="text-gray-600 mb-2">
                Connection: {connectionState}
              </p>
              <p className="text-gray-600 mb-6">ICE: {iceConnectionState}</p>
              <button
                onClick={() => setOutgoingCall(null)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all font-medium"
              >
                Hủy cuộc gọi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChatAdmin;
