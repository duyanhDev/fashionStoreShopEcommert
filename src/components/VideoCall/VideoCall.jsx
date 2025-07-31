// src/components/VideoChat.js
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Modal, message, Button } from "antd";
import "antd/dist/reset.css"; // hoặc 'antd/dist/antd.css' nếu bạn dùng phiên bản Ant Design cũ

const socket = io("https://fashionstoreshopecommertbe.onrender.com"); // Thay đổi theo địa chỉ server bạn

const VideoChatUser = ({ currentUserId, targetUserId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [inCall, setInCall] = useState(false);
  const [isReceivingCall, setIsReceivingCall] = useState(false);

  useEffect(() => {
    socket.emit("register", { userId: currentUserId });

    // Cuộc gọi đến
    socket.on("incoming-call", ({ from, offer }) => {
      setIsReceivingCall(true);

      Modal.confirm({
        title: `📞 Cuộc gọi đến từ ${from}`,
        content: "Bạn có muốn chấp nhận cuộc gọi không?",
        okText: "Chấp nhận",
        cancelText: "Từ chối",
        onOk: async () => {
          await startMedia();

          peerConnectionRef.current = createPeerConnection(from);
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(offer)
          );

          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);

          socket.emit("answer-call", {
            to: from,
            answer,
          });

          setInCall(true);
          setIsReceivingCall(false);
          message.success("✅ Cuộc gọi đã được chấp nhận");
        },
        onCancel: () => {
          setIsReceivingCall(false);
          message.info("❌ Bạn đã từ chối cuộc gọi");
        },
      });
    });

    socket.on("call-answered", async ({ from, answer }) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      setInCall(true);
    });

    socket.on("ice-candidate", ({ from, candidate }) => {
      if (candidate && peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  const startMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  };

  const createPeerConnection = (toUserId) => {
    const pc = new RTCPeerConnection();

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: toUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    return pc;
  };

  const callUser = async () => {
    await startMedia();

    peerConnectionRef.current = createPeerConnection(targetUserId);

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);

    socket.emit("call-user", {
      to: targetUserId,
      offer,
    });
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setInCall(false);
    message.info("📴 Cuộc gọi đã kết thúc");
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">📹 Video Chat</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm">Your Video</h4>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-60 bg-black rounded"
          />
        </div>
        <div>
          <h4 className="text-sm">Remote Video</h4>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-60 bg-black rounded"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="primary"
          onClick={callUser}
          disabled={inCall || isReceivingCall}
        >
          📲 Gọi {targetUserId}
        </Button>
        <Button danger onClick={endCall} disabled={!inCall}>
          ❌ Kết thúc
        </Button>
      </div>
    </div>
  );
};

export default VideoChatUser;
