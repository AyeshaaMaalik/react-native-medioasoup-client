import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as mediasoupClient from 'mediasoup-client';
import { RTCView } from 'react-native-webrtc';

const MediasoupTest = () => {
  const [device, setDevice] = useState(null);
  const [producerTransport, setProducerTransport] = useState(null);
  const [consumerTransport, setConsumerTransport] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    initializeDevice();
  }, []);

  const initializeDevice = async () => {
    const mediasoupDevice = new mediasoupClient.Device();

    const routerRtpCapabilities = await fetchRouterRtpCapabilitiesFromServer();
    await mediasoupDevice.load({ routerRtpCapabilities });
    setDevice(mediasoupDevice);
  };

  const createTransport = async () => {
    if (!device) {
      console.warn('Device not loaded yet');
      return;
    }

    const producerTransport = await device.createSendTransport({
      id: 'transport-id',
      iceParameters: {},
      iceCandidates: [],
      dtlsParameters: {},
    });

    setProducerTransport(producerTransport);

    const consumerTransport = await device.createRecvTransport({
      id: 'transport-id',
      iceParameters: {},
      iceCandidates: [],
      dtlsParameters: {},
    });

    setConsumerTransport(consumerTransport);
  };

  const startProducing = async () => {
    const stream = await getLocalStream();
    setLocalStream(stream);

    const track = stream.getVideoTracks()[0];
    await producerTransport.produce({ track });
  };

  const consumeMedia = async () => {
    const consumer = await consumerTransport.consume({
      id: 'consumer-id',
      producerId: 'producer-id',
      kind: 'video',
      rtpParameters: {},
    });

    const stream = new MediaStream([consumer.track]);
    setRemoteStream(stream);
  };

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    return stream;
  };

  const fetchRouterRtpCapabilitiesFromServer = async () => {
    return {
      codecs: [],
      headerExtensions: [],
      fecMechanisms: [],
    };
  };

  return (
    <View style={styles.container}>
      <Text>Mediasoup Client Test</Text>
      <Button title="Initialize Transport" onPress={createTransport} />
      <Button title="Start Producing" onPress={startProducing} />
      <Button title="Consume Media" onPress={consumeMedia} />

      {localStream && (
        <RTCView streamURL={localStream.toURL()} style={styles.localStream} />
      )}

      {remoteStream && (
        <RTCView streamURL={remoteStream.toURL()} style={styles.remoteStream} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localStream: {
    width: 200,
    height: 150,
    backgroundColor: 'black',
  },
  remoteStream: {
    width: 200,
    height: 150,
    backgroundColor: 'black',
  },
});

export default MediasoupTest;
