socket = http.websocket("ws://127.0.0.1:3000")
while true do
    local message = socket.receive()
    if message then
        print(message)
        socket.send("yay")
    end
    sleep(0)
end