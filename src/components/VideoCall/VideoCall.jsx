import React, { useEffect, useRef, useState } from "react";
import { Button, message, Space } from "antd";
import { io } from "socket.io-client";

// Kết nối socket
const socket = io("https://fashionstoreshopecommertbe.onrender.com");

const adminId = "673017dde4526bd79cc61fa6";

const VideoChatUser = ({ userId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const [inCall, setInCall] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [camEnabled, setCamEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);

  useEffect(() => {
    socket.emit("register", { userId });

    socket.on("call-answered", async ({ answer }) => {
      if (!peerRef.current) return;
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        if (peerRef.current && candidate) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("❌ Failed to add ICE candidate:", err);
      }
    });

    return () => {
      socket.off("call-answered");
      socket.off("ice-candidate");
    };
  }, [userId]);

  const enableMedia = async (options = { video: false, audio: false }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(options);

      // Gộp track mới vào stream cũ (nếu có)
      const newTracks = stream.getTracks();
      if (localStream) {
        newTracks.forEach((track) => localStream.addTrack(track));
      } else {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }

      if (options.video) setCamEnabled(true);
      if (options.audio) setMicEnabled(true);

      message.success(
        "🎤🎥 Đã bật " +
          (options.video ? "camera " : "") +
          (options.audio ? "microphone" : "")
      );
    } catch (err) {
      console.error("❌ Không thể bật media:", err);
      message.error(
        "Không thể truy cập " +
          (options.video ? "camera " : "") +
          (options.audio ? "microphone" : "")
      );
    }
  };

  const startCall = async () => {
    if (!localStream || (!camEnabled && !micEnabled)) {
      return message.warning("⚠️ Bạn cần bật camera hoặc microphone trước.");
    }

    try {
      const peer = new RTCPeerConnection();
      peerRef.current = peer;

      // Gửi local track
      localStream
        .getTracks()
        .forEach((track) => peer.addTrack(track, localStream));

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            to: adminId,
            candidate: e.candidate,
          });
        }
      };

      peer.ontrack = (e) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("call-user", {
        to: adminId,
        offer,
      });

      setInCall(true);
      message.success("📞 Đang gọi đến admin...");
    } catch (err) {
      console.error("❌ Lỗi khi bắt đầu cuộc gọi:", err);
      message.error("Không thể bắt đầu cuộc gọi.");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>User Gọi Video</h2>

      {!inCall && (
        <Space>
          <Button onClick={() => enableMedia({ video: true })}>
            Bật Camera
          </Button>
          <Button onClick={() => enableMedia({ audio: true })}>
            Bật Micro
          </Button>
          <Button
            type="primary"
            onClick={startCall}
            disabled={!camEnabled && !micEnabled}
          >
            Gọi Admin
          </Button>
        </Space>
      )}

      <div style={{ display: "flex", marginTop: 24 }}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "300px", border: "1px solid #ccc" }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: "300px", marginLeft: 20, border: "1px solid #ccc" }}
        />
      </div>
    </div>
  );
};

export default VideoChatUser;
