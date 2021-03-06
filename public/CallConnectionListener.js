import WebRtcHelper from './webRtcHelper.js';

export default class CallConnectionListerner {
   
   callConnection = {
      id: null,
      connection: null,
      localStream: null,
      remoteStream: null,
      remoteStreamList: []
   }

   async createCallId(e) {
      document.querySelector('#createBtn').disabled = true;
      document.querySelector('#joinBtn').disabled = true;
      document.querySelector('#hangupBtn').disabled = false;

      let callRef = await WebRtcHelper.getDbEntityReference("calls");
      this.callConnection.localStream = await WebRtcHelper.accessDeviceMedia(e);
      this.callConnection.connection = WebRtcHelper.createPeerConnection();
      WebRtcHelper.addTracksToLocalStream(this.callConnection.connection, this.callConnection.localStream);
      WebRtcHelper.gatherLocalIceCandidates(this.callConnection.connection, callRef, 'callerCandidates');

      await WebRtcHelper.createOffer(this.callConnection.connection, callRef);
      document.getElementById('createdCallId').value = callRef.id;

      this.callConnection.remoteStream = WebRtcHelper.initRemoteStream(this.callConnection.connection);
      await WebRtcHelper.listenForAnswerSdp(this.callConnection.connection, callRef);
      await WebRtcHelper.gatherRemoteIceCandidates(this.callConnection.connection, callRef, 'calleeCandidates');
      this.ringWhenConnected(this.callConnection.connection, this.callConnection.remoteStream);

      document.querySelector('#hangupBtn').addEventListener('click', e => WebRtcHelper.hangUp(e, this.callConnection.connection, this.callConnection.remoteStream, "calls", callRef.id));
   }

   ringWhenConnected(peerConnection, remoteStream) {
      let ringtone = document.getElementById('ringtone');
      peerConnection.addEventListener('connectionstatechange', e => {
         // if rigntone available, play it
         if (ringtone && peerConnection.connectionState === 'connected') {
            ringtone.play();
            let ans = document.getElementById('ans');
            ans.onclick = function () {
               ringtone.pause();
               ringtone.currentTime = 0;
               document.querySelector('#remoteVideo').srcObject = remoteStream;
               ans.style.display = 'none';
            }
            ans.style.display = 'block';
         }
      });
   }
}