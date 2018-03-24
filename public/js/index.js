'use strict';

$(document).ready(function () {
  const socket = io();
  const $topBar = $('#topBar');
  const canvas = document.getElementById('whiteboard');
  const colors = document.getElementsByClassName('color');
  const context = canvas.getContext('2d');

  let current = {
    color: 'black',
    emitTo: 'drawing'
  };
  let drawing = false;

  $(window).resize(onResize);
  onResize();

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseout', onMouseUp);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 5));

  for (var i = 0; i < colors.length; i++) {
    colors[i].addEventListener('click', onColorUpdate, false);
  }

  socket.on('drawing', onDrawingEvent);
  socket.on("createdSession", onCreatedSession);
  socket.on("joinedSession", onJoinedSession);
  socket.on("drawingInSession", onDrawingInSessionEvent);

  $('#createSession').click(function () {
    socket.emit("createSession");
  });

  $('#joinSession').click(function () {
    socket.emit("joinSession", {
      sessionId: $('#sessionIdJoinSession').val()
    })
  });


  function drawLine(x0, y0, x1, y1, color, emit, strokeWidth) {
    y0 -= 50;
    y1 -= 50;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = (strokeWidth ? strokeWidth : 4) / 2;
    if (color === "white") {
      context.lineWidth = 25;
    }

    context.stroke();
    context.closePath();

    if (!emit) {
      return;
    }

    let w = canvas.width;
    let h = canvas.height;

    let emitToServerObject = {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
      strokeWidth: context.lineWidth * 2
    };

    if (current.sessionId) {
      emitToServerObject.sessionId = current.sessionId;
    }
    socket.emit(current.emitTo, emitToServerObject);

  }

  function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX;
    current.y = e.clientY;
  }

  function onMouseUp(e) {
    if (!drawing) {
      return;
    }
    drawing = false;
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
  }

  function onMouseMove(e) {
    if (!drawing) {
      return;
    }
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
    current.x = e.clientX;
    current.y = e.clientY;
  }

  function onColorUpdate(e) {
    current.color = e.target.className.split(' ')[1];
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    let previousCall = new Date().getTime();
    return function () {
      let time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data) {
    let w = canvas.width;
    let h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h + 50, data.x1 * w, data.y1 * h + 50, data.color);
  }

  function onDrawingInSessionEvent(data) {
    let w = canvas.width;
    let h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h + 50, data.x1 * w, data.y1 * h + 50, data.color, false, data.strokeWidth);
  }

  function onCreatedSession(data) {
    if (data.success) {
      socket.off('drawing');
      current.sessionId = data.sessionId;
      current.emitTo = 'drawingInSession';
      $topBar.empty().append(`
        <div class="col-3 ml-auto text-white">Session Id: ${data.sessionId}</div>    
      `);
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function onJoinedSession(data) {
    if (data.success) {
      socket.off('drawing');
      current.sessionId = data.sessionId;
      current.emitTo = '';
      $topBar.empty().append(`
        <div class="col-3 ml-auto text-white">Session Id: ${data.sessionId}</div>    
      `);
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});
