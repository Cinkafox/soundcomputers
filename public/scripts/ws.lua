local args = {...}

local dfpwm = require("cc.audio.dfpwm")
local decoder = dfpwm.make_decoder()
local speaker = peripheral.find("speaker")
local debug = false;
 
if not speaker then
    print("DOLBOEB BLYAT KOLONKY DAI!")
    shell.run("attach", "left", "speaker")
    return
end

function PlayChunk(chunk)
    local buffer = decoder(chunk)
    while not speaker.playAudio(buffer) do
        os.pullEvent("speaker_audio_empty")
    end
end

function processMusic()
    local socket = http.websocket(args[1])
    while socket do
        local message = socket.receive()
        if message then
            PlayChunk(message)
        end
        sleep(0)
    end
end

if debug then
    processMusic()
end

while not debug do
    pcall(processMusic)
    print("Some shit is happened now! restarting the application")
    sleep(1)
end