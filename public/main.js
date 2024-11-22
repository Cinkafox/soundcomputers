const url = window.location.href;

function printMessage(json){
    const message = document.getElementById("message");
    message.innerText = "status: " + json.status;
}

async function loadClicked(){
    const input = document.getElementById("loadInput");
    if(input.value === undefined || input.value === "") {
        return;
    }

    let response = await fetch(url + "load", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input.value })
    });

    var jsonData = await response.json();

    printMessage(jsonData);
}

async function clearClicked(){
    const input = document.getElementById("loadInput");
    input.value = "";
    let response = await fetch(url + "stop");

    var jsonData = await response.json();

    printMessage(jsonData);
}

function copy(text) {
    navigator.clipboard.writeText(text);
}
