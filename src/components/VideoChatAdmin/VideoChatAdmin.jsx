import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, message } from "antd";
import { io } from "socket.io-client";

const socket = io("https://fashionstoreshopecommertbe.onrender.com");
const adminId = "673017dde4526bd79cc61fa6";

const VideoChatAdmin = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const iceBufferRef = useRef([]);

  useEffect(() => {
    socket.emit("register", { userId: adminId });

    socket.on("incoming-call", ({ from, offer }) => {
      console.log("📞 Cuộc gọi đến từ:", from);
      setIncomingCall({ from, offer });
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        if (peerRef.current) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.warn("📥 Buffer ICE vì chưa tạo peerRef");
          iceBufferRef.current.push(candidate);
        }
      } catch (err) {
        console.error("❌ Failed to add ICE candidate:", err);
      }
    });

    return () => {
      socket.off("incoming-call");
      socket.off("ice-candidate");
    };
  }, []);

  const answerCall = async () => {
    try {
      const peer = new RTCPeerConnection();
      peerRef.current = peer;

      // Nếu admin đã bật cam/mic từ trước
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peer.addTrack(track, localStream);
        });
        console.log("📷 Gửi stream từ admin");
      }

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            to: incomingCall.from,
            candidate: e.candidate,
          });
        }
      };

      peer.ontrack = (e) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };

      await peer.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      for (const candidate of iceBufferRef.current) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
      iceBufferRef.current = [];

      socket.emit("answer-call", {
        to: incomingCall.from,
        answer,
      });

      setInCall(true);
      setIncomingCall(null);
      message.success("✅ Đã kết nối với người dùng");
    } catch (err) {
      console.error("❌ Lỗi khi trả lời cuộc gọi:", err);
      message.error("Lỗi khi thiết lập cuộc gọi");
    }
  };

  const enableCameraMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      message.success("🎥 Đã bật camera/microphone");
    } catch (err) {
      console.error("❌ Không thể bật camera/mic:", err);
      message.error("Không thể truy cập camera/microphone");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>📡 Admin Nhận Cuộc Gọi</h2>

      <Modal
        open={!!incomingCall}
        onCancel={() => setIncomingCall(null)}
        onOk={answerCall}
        okText="Trả lời"
        cancelText="Từ chối"
        title="📲 Có cuộc gọi đến"
        centered
      >
        <p>Người gọi: {incomingCall?.from}</p>
      </Modal>

      {inCall && (
        <div style={{ display: "flex", marginTop: 24 }}>
          <div style={{ textAlign: "center" }}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{ width: "300px", border: "1px solid #ccc" }}
            />
            <Button style={{ marginTop: 8 }} onClick={enableCameraMic}>
              Bật Camera/Mic
            </Button>
          </div>

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: "300px", marginLeft: 20, border: "1px solid #ccc" }}
          />
        </div>
      )}
    </div>
  );
};

export default VideoChatAdmin;
