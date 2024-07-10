
const commentsCountElement = document.getElementById("comments_count");
const  commentListDiv = document.querySelector('.comment_list');


// Clear comment
document.getElementById('clearButton').addEventListener('click', function () {
    comment = document.getElementById('comment').value = "";
});

document.body.addEventListener('htmx:afterRequest', function (evt) {
 
  if (evt.detail.xhr.status === 401) {
    alert("Ошибка: Необходима авторизация.");
  }
  else {alert("Ошибка: Мы стараемся её исправить...");}
});