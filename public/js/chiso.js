
  const socket = io('', { query: 'clientType=web' });

  let dataToSend  = {}

//   tin nhan tu bo xu li trung tam 
  socket.on("/trungtam", (data) => {
    console.log(data);
     dataToSend  = {}

    dataToSend = {...data}
    

  });
// dataToSend = "asdsasd";
export  {dataToSend};