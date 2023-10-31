 // Get the CSRF token using the {% csrf_token %} template tag
 const csrfToken = document.querySelector('input[name=csrfmiddlewaretoken]').value;
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


 const commentsCountElement = document.getElementById("comments_count");


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
          inc_count();
         
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