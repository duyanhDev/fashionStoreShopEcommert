// VideoChatUser.js
import React, { useEffect, useRef } from "react";

const VideoChatUser = ({ socket, user }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    const startCall = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      peerRef.current = new RTCPeerConnection();

      stream
        .getTracks()
        .forEach((track) => peerRef.current.addTrack(track, stream));

      peerRef.current.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            to: "admin",
            candidate: e.candidate,
          });
        }
      };

      peerRef.current.ontrack = (event) => {
        if (remoteVideoRef.current)
          remoteVideoRef.current.srcObject = event.streams[0];
      };

      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);

      socket.emit("call-user", {
        to: "admin",
        from: user._id,
        offer,
      });
    };

    if (user?._id) {
      startCall();
    }

    socket.on("answer-call", async ({ answer }) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });

    socket.on("ice-candidate", ({ candidate }) => {
      if (peerRef.current && candidate) {
        peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off("answer-call");
      socket.off("ice-candidate");
    };
  }, [socket, user]);

  return (
    <div>
      <h2>User Side</h2>
      <video ref={localVideoRef} autoPlay muted playsInline />
      <video ref={remoteVideoRef} autoPlay playsInline />
    </div>
  );
};

export default VideoChatUser;
