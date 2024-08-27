import { WebSocketClient } from "./WebSocketClient";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import "@testing-library/jest-dom";

jest.mock("websocket", () => ({
  w3cwebsocket: jest.fn(),
}));

describe("WebSocketClient", () => {
  let webSocketClient: WebSocketClient;
  const messageCallback = jest.fn();
  const mockWebSocket = {
    onopen: jest.fn(),
    onmessage: jest.fn(),
    onerror: jest.fn(),
    onclose: jest.fn(),
    send: jest.fn(),
  };

  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    (W3CWebSocket as unknown as jest.Mock).mockImplementation(
      () => mockWebSocket,
    );
    webSocketClient = new WebSocketClient(
      "ws://localhost:8080",
      messageCallback,
    );
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test("should initialize with given server address and callback", () => {
    expect(webSocketClient.serverAddress).toBe("ws://localhost:8080");
    expect(webSocketClient.messageCallback).toBe(messageCallback);
    expect(W3CWebSocket).toHaveBeenCalledWith("ws://localhost:8080");
    expect(webSocketClient.client).toBe(mockWebSocket);
  });

  test("should call connectToSocketServer on initialization", () => {
    expect(mockWebSocket.onopen).toBeDefined();
    expect(mockWebSocket.onmessage).toBeDefined();
    expect(mockWebSocket.onerror).toBeDefined();
    expect(mockWebSocket.onclose).toBeDefined();
  });

  test("should send a message using WebSocket", () => {
    webSocketClient.send("test message");
    expect(mockWebSocket.send).toHaveBeenCalledWith("test message");
  });

  test("should call connectedHandler when WebSocket opens", () => {
    webSocketClient.connectedHandler();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Connected to ws://localhost:8080",
    );
  });

  test("should call errorHandler when WebSocket errors", () => {
    webSocketClient.errorHandler();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Connection to ws://localhost:8080 failed",
    );
  });

  test("should call closedHandler when WebSocket closes", () => {
    webSocketClient.closedHandler();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Connection to ws://localhost:8080 closed",
    );
  });

  test("should handle error during connection", () => {
    (W3CWebSocket as unknown as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Connection error");
    });
    expect(
      () => new WebSocketClient("ws://localhost:8080", messageCallback),
    ).not.toThrow();
    expect(consoleLogSpy).toHaveBeenCalledWith("Connection error");
  });
});
