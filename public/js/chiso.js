
const socket = io('', { query: 'clientType=web' });

  let dataToSend  = { 
    nhiptim: 1, sbp: 2, dbp: 3, spo2: 4, nhietdocothe: 9
  };

  // nhietdocothe: "",
  // spo2: "",
  // nhiptim: "",
  // sbp: "", // tam truong
  // dbp: "", // tam thu
//   tin nhan tu bo xu li trung tam 
  socket.on("/trungtam", (data) => {
    console.log(data);
     dataToSend  = {}

    dataToSend = {...data}
    
  });

export  {dataToSend};