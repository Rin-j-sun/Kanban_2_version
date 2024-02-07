let task = document.getElementById('myTask');

task.onmousedown = function(e) {

  let coords = getCoords(task);
  let shiftX = e.pageX - coords.left;
  let shiftY = e.pageY - coords.top;

  task.style.position = 'absolute';
  document.body.appendChild(task);
  moveAt(e);

  task.style.zIndex = 1000; // над другими элементами

  function moveAt(e) {
    task.style.left = e.pageX - shiftX + 'px';
    task.style.top = e.pageY - shiftY + 'px';
  }

  document.onmousemove = function(e) {
    moveAt(e);
  };

  task.onmouseup = function() {
    document.onmousemove = null;
    task.onmouseup = null;
  };

}

task.ondragstart = function() {
  return false;
};

function getCoords(elem) {   // кроме IE8-
  let box = elem.getBoundingClientRect();
  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
}