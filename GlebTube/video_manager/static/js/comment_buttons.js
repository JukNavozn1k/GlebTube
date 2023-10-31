 // Get the CSRF token using the {% csrf_token %} template tag
const csrfToken = document.querySelector('input[name=csrfmiddlewaretoken]').value;
const commentsCountElement = document.getElementById("comments_count");
const parentElement = document.querySelector('.comment_list');


function inc_count()
{
  const text = commentsCountElement.textContent;
  const match = /(\d+)/.exec(text);

  if (match) {
    const currentCount = parseInt(match[1], 10);
    const newCount = currentCount + 1;
    // Update the text content with the incremented count
    commentsCountElement.textContent = text.replace(currentCount, newCount);
  }
}
function add_comment(author,date_uploaded,comment)
{
  
  // Create a new div element to contain the provided code
  var newDiv = document.createElement('div');
  newDiv.innerHTML = `
    <div class="d-flex justify-content-center row">
        <div class="col">
            <div class="d-flex flex-column comment-section">
                <div class="bg-white p-2">
                    <div class="d-flex flex-row user-info"><img class="rounded-circle" src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Israeli_blue_Star_of_David.png" width="40">
                        <div class="d-flex flex-column justify-content-start ml-2"><span class="d-block font-weight-bold name">${author}</span>
                          <span class="date text-black-50">${date_uploaded}</span></div>
                    </div>
                    <div class="mt-2">
                        <p class="comment-text">${comment}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;
  parentElement.appendChild(newDiv);

}





// Add comment 
document.getElementById('sendButton').addEventListener('click', function () {
    const comment = document.getElementById('comment').value;
   
    var response = fetch(`${window.location.pathname}/comment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken, // Include the CSRF token in the headers
        },
        body: JSON.stringify({ comment: comment }),
    });
    response = response.then((res) => {
      if (res.status === 200) {
        // Parse JSON response from the server
        return res.json().then((data) => {
          // You can now work with the JSON data in the 'data' variable
          // alert(`${data['param']}`);
          console.log(data);
          inc_count();
          add_comment(data['author'],'Только что',data['comment']);
         
        });
      } else if (res.status === 401) {
        alert("Unauthorized: You need to log in");
      }
      });


});

// Clear comment
document.getElementById('clearButton').addEventListener('click', function () {
    comment = document.getElementById('comment').value = "";
});