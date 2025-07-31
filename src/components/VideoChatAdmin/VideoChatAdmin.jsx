import React, { useEffect, useRef } from "react";
import { Modal } from "antd";

const VideoChatAdmin = ({ socket, user }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const callerIdRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const initStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    };

    initStream();

    socket.on("incoming-call", ({ from, offer }) => {
      callerIdRef.current = from;

      // Hiện modal xác nhận
      Modal.confirm({
        title: "📞 Có cuộc gọi đến",
        content: `Người dùng ${from} đang gọi cho bạn. Bạn có muốn trả lời không?`,
        okText: "Chấp nhận",
        cancelText: "Từ chối",
        onOk: async () => {
          const peer = new RTCPeerConnection();
          peerRef.current = peer;

          streamRef.current?.getTracks().forEach((track) => {
            peer.addTrack(track, streamRef.current);
          });

          peer.onicecandidate = (e) => {
            if (e.candidate) {
              socket.emit("ice-candidate", {
                to: from,
                candidate: e.candidate,
              });
            }
          };

          peer.ontrack = (event) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
          };

          await peer.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);

          socket.emit("answer-call", {
            to: from,
            answer,
          });
        },
        onCancel: () => {
          // Gửi tín hiệu từ chối (tuỳ chọn)
          socket.emit("reject-call", { to: from });
        },
      });
    });

    socket.on("ice-candidate", ({ candidate }) => {
      if (peerRef.current && candidate) {
        peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off("incoming-call");
      socket.off("ice-candidate");
    };
  }, [socket]);

  return (
    <div>
      <h2>Admin Side</h2>
      <video ref={localVideoRef} autoPlay muted playsInline />
      <video ref={remoteVideoRef} autoPlay playsInline />
    </div>
  );
};

export default VideoChatAdmin;
