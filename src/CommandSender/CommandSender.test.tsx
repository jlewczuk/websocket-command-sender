import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { CommandSender } from "./CommandSender";
import { WebSocketClient } from "../WebSocketClient/WebSocketClient";
import React from "react";

jest.mock("../WebSocketClient/WebSocketClient", () => {
  return {
    WebSocketClient: jest.fn().mockImplementation(() => {
      return {
        connectToSocketServer: () => {
          throw new Error("Connection failed");
        },
        send: jest.fn(),
        messageCallback: jest.fn(),
        client: {
          onopen: jest.fn(),
          onmessage: jest.fn(),
          onerror: jest.fn(),
          onclose: jest.fn(),
        },
      };
    }),
  };
});

jest.mock("antd", () => ({
  Checkbox: {
    Group: jest.fn(() => <div>Mock Checkbox Group</div>),
  },
  message: {
    info: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  Divider: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )),
  Button: jest.fn(
    ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: any;
    }) => <button {...props}>{children}</button>,
  ),
  Space: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )),
}));

describe("CommandSender Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should establish WebSocket connection on mount", () => {
    render(<CommandSender />);
    expect(WebSocketClient).toHaveBeenCalledWith(
      "wss://recruitment.skyengine.io/ws/command_executor/",
      expect.any(Function),
    );
  });
});
