const mqtt = require('mqtt');

const HOST = 'mqtt://localhost'; // IP address (e.g., 192.168.1.2) of the MQTT broker (in this case, the IP address of the raspberry pi itself).
const TOPIC = 'sapflow';

const client = mqtt.connect(HOST, {
  // Config fields if needed to connect to the MQTT broker
  // username: 'username',
  // password: 'password',
  clientId: 'deviceSimulator'
});

let MAX_MESSAGES = 0;

client.on('connect', () => {
  client.subscribe(TOPIC);
  console.log(`Connected to MQTT broker on host: ${HOST} under topic: ${TOPIC}`);

  const node1Interval = setInterval(() => {
    client.publish(`sapflow`, JSON.stringify(sapflowMessageGenerator(1)));
    MAX_MESSAGES++;
  }, 2000);

  const node2Interval = setInterval(() => {
    client.publish(`sapflow`, JSON.stringify(sapflowMessageGenerator(2)));
    MAX_MESSAGES++;
  }, 3000);

  client.on('message', () => {
    if (MAX_MESSAGES >= 20) {
      console.log(`${MAX_MESSAGES} messages reached; clearing intervals now`);
      clearInterval(node1Interval);
      clearInterval(node2Interval);
    }
  });

});

function sapflowMessageGenerator(id) {
  return messageFactory({
    id: () => id,
    temp1: () => 22 + (Math.random() > 0.5 ? -1 : 1),
    temp2: () => 22 + (Math.random() > 0.5 ? -1 : 1),
    millisSinceHeatPulse: () => 10000,
    outsideTemp: () => 22 + (Math.random() > 0.5 ? -1 : 1),
    outsideHumidity: () => 70 + (Math.random() > 0.5 ? -1 : 1),
    soilMoisture: () => Math.random(),
    rtcUnixTimestamp: () => new Date().valueOf(),
    millisSinceReferenceTemp: () => 11000
  });
}

/**
 * Factory function that creates dummy data based on messageTemplate
 * @param { Object } messageTemplate template object of keys + creator functions that generate the value for the key
 * @example
 * const messageTemplate = {
    id: () => id,
    temp1: () => 22 + (Math.random() > 0.5 ? -1 : 1),
    temp2: () => 22 + (Math.random() > 0.5 ? -1 : 1),
    millisSinceHeatPulse: () => 10000,
    outsideTemp: () => 22 + (Math.random() > 0.5 ? -1 : 1),
    outsideHumidity: () => 70 + (Math.random() > 0.5 ? -1 : 1),
    soilMoisture: () => Math.random(),
    rtcUnixTimestamp: () => new Date().valueOf(),
    millisSinceReferenceTemp: () => 11000
  }
 *
 */
function messageFactory(messageTemplate) {
  let message = {};

  for (let [key, value] of Object.entries(messageTemplate)) {
    message[key] = value();
  }

  return message;
}