
const socket = io('', { query: 'clientType=web' });

  let dataToSend  = { 
    // sbp: 100, dbp: 100, nhiptim: 100, nhietdocothe: 30, spo2: 99, demgiot: 70
  };

  // nhietdocothe: "",
  // spo2: "",
  // nhiptim: "",
  // sbp: "", // tam truong
  // dbp: "", // tam thu
  //demgiot
//   tin nhan tu bo xu li trung tam 
  socket.on("/trungtam", (data) => {
    console.log(data);
     dataToSend  = {}

    dataToSend = {...data}
    
  });

export  {dataToSend};