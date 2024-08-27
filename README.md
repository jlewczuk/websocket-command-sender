#### Task goal

Send a series of commands from React frontend to the WebSocket API. The endpoint is available at `wss://recruitment.skyengine.io/ws/command_executor/`. The user can choose which commands to send from the list of available ones. Using a feedback system, ensure that the next command in a series is sent after the previous one finished successfully.

#### Your tools

You received a working React application (created with "Create React App") with a connection to this endpoint already implemented, you can start it simply by:
``` sh
npm install
npm start
```
It is tested with node v17.2.0 and npm 8.1.4.

To check if the endpoint is up and running, you can send a `'test'` message and you should receive a `{'msg_type': 'test', 'data': 'hello'}` reply. The buttons for sending a test message, a command, and a command feedback request are already implemented in the React application: the "Testing" section in the app should be working "out of the box". If this is not the case, let us know. The "Solution" section waits for you to make it work.

#### Detailed description

The WebSocket endpoint can do the following tasks:
    - start the command execution,
    - provide feedback about the ongoing execution process.

1. Starting the command execution.

    To start the command, you have to send one of the supported commands to the endpoint: `'initialize'`, `'startup'`, `'clear_output'`, `'reset'`, or `'run'`. 

2. Feedback.

    To get the feedback, you have to add the `'_get_feedback'` suffix to the command name and send it to the same endpoint, e.g. `'initialize_get_feedback'`. If the command you are asking about is the most recent command sent to the endpoint by your application, you can expect a prompt reply with `'msg_type'` field containing the command name with `'_feedback'` suffix. If the `'data'` in the message is `false`, the command is still being processed, if it's `true` - the command execution is finished. For example, after you send `'initialize_get_feedback'`, you can get `{'msg_type': 'initialize_feedback', 'data': false}` if the `'initialize'` command is ongoing, or `{'msg_type': 'initialize_feedback', 'data': true}` if the command is finished.

**To solve the task, you have to send a series of commands chosen by the user to the WebSocket endpoint. You have to ensure that the previous command is finished before sending the next one.**

Take into account that if the server does not recognize your message, you won't get any answer. Moreover, the feedback that the command is finished (`'data': true`) is sent only once, i.e. if you send `'{command}_get_feedback'` requests after you've already received a message with `'data': true` for this command, you won't get any answer. Similarly, if you send a feedback request for a different command, for example `'reset_get_feedback'` after sending `'startup'` command, you won't get any answer.

#### Example

The user chose to execute `'initialize'` and `'clear_output'` commands. You have to send the `'initialize'` message to the WebSocket endpoint, then using the message `'initialize_get_feedback'` you can check if the command execution is finished and after you receive `{'msg_type': 'initialize_feedback', 'data': true}`, you can move on to the next command - `'clear_output'`. You should check if the command `'clear_output'` is executed correctly too and provide the feedback to the user about the command series execution result.

#### Special cases

There are three special cases you have to take into account:
1. The command you sent can be executed instantaneously. Sometimes, the server can respond `{'msg_type': '{command}_feedback', 'data': true}` to the `'{command}'` message (not `'{command}_get_feedback'`). Take into account, that afterward, you can't expect any reply to the `'{command}_get_feedback'` messages, as explained above (the task execution confirmation is always sent just once).
2. The command you sent can take forever to execute.
3. Your command can be silently ignored. 

Play with the API, check the reasonable execution times, and implement some timeout to handle cases 2 and 3.

If any of the commands from the list failed, stop the process - don't send the rest of the commands.

#### What we are looking for

1. Robust solution: 
a) many consecutive series of commands can be sent regardless of the result of the previous series,
b) the process is user-proof: the endpoint is sensitive to the additional messages, don't let the user mess up the process.
2. Clean code.
3. Some feedback to the user: which command is being executed right now, what was the result of the previous series (success/fail).
4. Correct code formatting.

Extra points for writing tests.
