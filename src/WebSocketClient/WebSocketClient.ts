import { IMessageEvent, w3cwebsocket as W3CWebSocket } from "websocket";

export type Message = {
  msg_type: string;
  data: string | boolean;
};

export class WebSocketClient {
  client?: W3CWebSocket | null;
  serverAddress: any;
  messageCallback: any;
  connected: boolean;

  constructor(serverAddress: string, messageCallback: (msg: Message) => void) {
    this.client = null;
    this.serverAddress = serverAddress;
    this.messageCallback = messageCallback;
    this.connected = false;
    this.connectToSocketServer();
  }

  send = (msg: string) => {
    if (this.client != null) {
      console.log(`Sending: "${msg}"`);
      this.client.send(msg);
    }
  };

  messageHandler = (event: IMessageEvent) => {
    console.log(`Received: "${event.data}"`);
    this.messageCallback(JSON.parse(event.data as string));
  };

  connectedHandler = () => {
    console.log(`Connected to ${this.serverAddress}`);
  };

  errorHandler = () => {
    console.log(`Connection to ${this.serverAddress} failed`);
  };

  closedHandler = () => {
    console.log(`Connection to ${this.serverAddress} closed`);
  };

  connectToSocketServer = () => {
    try {
      this.client = new W3CWebSocket(this.serverAddress);
      this.client.onopen = this.connectedHandler;
      this.client.onmessage = this.messageHandler;
      this.client.onerror = this.errorHandler;
      this.client.onclose = this.closedHandler;
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log(e.message);
        console.log(
          `While creating client to ${this.serverAddress} got error: ${e.message}`,
        );
      }

      delete this.client;
      this.client = null;
    }
  };
}
