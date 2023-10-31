 // Get the CSRF token using the {% csrf_token %} template tag
 const csrfToken = document.querySelector('input[name=csrfmiddlewaretoken]').value;


// Add comment 
document.getElementById('sendButton').addEventListener('click', function () {
    const comment = document.getElementById('comment').value;
   
    fetch(`${window.location.pathname}/comment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken, // Include the CSRF token in the headers
        },
        body: JSON.stringify({ comment: comment }),
    })
    .then((res) => {
		if (res.status === 200) {
			window.location.reload();
			// ToDo async comment adding without reloading
		  
		} else if (res.status === 401) {
		  alert("Unauthorized: You need to log in");
		}
	  });
});

// Clear comment
document.getElementById('clearButton').addEventListener('click', function () {
    comment = document.getElementById('comment').value = "";
});