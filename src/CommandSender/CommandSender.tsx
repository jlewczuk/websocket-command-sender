import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Checkbox, Divider, message, Space } from "antd";
import { Message, WebSocketClient } from "../WebSocketClient/WebSocketClient";

type CheckboxValueType = string | number | boolean;

export const CommandSender = () => {
  const [selectedCommands, setSelectedCommands] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const webSocketClient = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    if (webSocketClient.current === null) {
      webSocketClient.current = new WebSocketClient(
        "wss://recruitment.skyengine.io/ws/command_executor/",
        handleReceivedMessage,
      );
    }
  }, []);

  const handleReceivedMessage = useCallback((msg: Message) => {
    if ("msg_type" in msg && "data" in msg) {
      message
        .info(`Got msg: {msg_type: ${msg.msg_type}, data: ${msg.data}}`)
        .then();
    } else {
      message.warning(`Got unsupported msg: ${msg}`).then();
    }
  }, []);

  const sendCommand = (command: string) => {
    webSocketClient.current?.send(command);
  };

  const handleCommandFeedback = (
    msg: Message,
    command: string,
    resolve: () => void,
    reject: (reason?: any) => void,
    feedbackIntervalId: NodeJS.Timeout,
    timeoutId: NodeJS.Timeout,
  ) => {
    console.log(`Got msg: {msg_type: ${msg.msg_type}, data: ${msg.data}}`);

    handleReceivedMessage(msg);

    if (msg.msg_type === `${command}_feedback`) {
      if (msg.data === true) {
        message.success(`Command "${command}" completed successfully.`).then();
        clearInterval(feedbackIntervalId);
        clearTimeout(timeoutId);
        resolve();
      } else if (msg.data === false) {
        console.log(`Command "${command}" is still being processed.`);
      } else {
        message.warning(`Unexpected feedback data: ${msg.data}`).then();
        clearInterval(feedbackIntervalId);
        clearTimeout(timeoutId);
        reject(new Error(`Unexpected feedback data: ${msg.data}`));
      }
    }
  };

  const executeCommandWithFeedback = (command: string) => {
    return new Promise<void>((resolve, reject) => {
      const feedbackIntervalId = setInterval(
        () => sendCommand(`${command}_get_feedback`),
        1000,
      );
      const timeoutId = setTimeout(() => {
        clearInterval(feedbackIntervalId);
        reject(new Error(`Timeout waiting for ${command} to complete.`));
      }, 10000);

      webSocketClient.current!.messageCallback = (msg: Message) =>
        handleCommandFeedback(
          msg,
          command,
          resolve,
          reject,
          feedbackIntervalId,
          timeoutId,
        );

      sendCommand(command);
    });
  };

  const executeCommands = async () => {
    setIsExecuting(true);
    try {
      for (const command of selectedCommands) {
        await executeCommandWithFeedback(command);
      }
      message.success("All commands executed successfully.");
    } catch (error: unknown) {
      console.error("Error during command execution:", error);
      if (error instanceof Error) {
        message.error(`Command execution failed: ${error.message}`);
      } else {
        message.error("An unknown error occurred.");
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const onCommandChange = (checkedValues: CheckboxValueType[]) => {
    setSelectedCommands(checkedValues as string[]);
  };

  return (
    <div style={{ padding: 30 }}>
      <Divider orientation="left" plain>
        Testing
      </Divider>
      <Space>
        <Button type="primary" onClick={() => sendCommand("test")}>
          Send "test"
        </Button>
        <Button type="primary" onClick={() => sendCommand("initialize")}>
          Send "initialize"
        </Button>
        <Button
          type="primary"
          onClick={() => sendCommand("initialize_get_feedback")}
        >
          Send "initialize_get_feedback"
        </Button>
      </Space>
      <Divider orientation="left" plain>
        Solution
      </Divider>
      <Checkbox.Group
        options={["initialize", "startup", "clear_output", "reset", "run"]}
        onChange={onCommandChange}
        disabled={isExecuting}
      />
      <Button
        type="primary"
        onClick={executeCommands}
        disabled={isExecuting || selectedCommands.length === 0}
      >
        Send checked commands
      </Button>
    </div>
  );
};
