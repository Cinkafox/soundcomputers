local args = {...}
 
if not args[1] then
    print("Usage: sosalka <url>")
    return
end
 
local dfpwm = require("cc.audio.dfpwm")
local decoder = dfpwm.make_decoder()
local speaker = peripheral.find("speaker")
 
if not speaker then
    print("DOLBOEB BLYAT KOLONKY DAI!")
    return
end
 

currDat = ""
while true do
    local request = http.get(args[1])
    local raw = request.readAll();
    local data = textutils.unserializeJSON(raw)
 
    if not data.isEmpty and currDat ~= data.timeStamp then
        print(currDat)
        print(data.timeStamp)
        print(data.url)
        currDat = data.timeStamp
 
        local requestS = http.get(data.url,{},true)
 
        local chunk = requestS.read(16*1024)
        while chunk ~= nil do
            PlayChunk(chunk)
            chunk = requestS.read(16*1024)
        end
    end
    sleep(0.1)
end

function PlayChunk(chunk)
    local buffer = decoder(chunk)
    while not speaker.playAudio(buffer) do
        os.pullEvent("speaker_audio_empty")
    end
end