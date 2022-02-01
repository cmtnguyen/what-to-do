const tasks = document.querySelectorAll('.card');
for (const task of tasks) {
  task.addEventListener('click', function (event) {
    if (event.target.tagName === 'INPUT') {
      document.querySelector(`.check${event.target.id}`).submit();
    }
  }, false);
}