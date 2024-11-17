export default class StreamBuffer{
    buffer = []

    constructor(tunnel){
        tunnel.on('data', (d)=>{
           this.buffer.push(d)  
        })

        tunnel.on('end',()=>{
            
        })
    }

    getItems(shift, length){
    
    }
}