 // Get the CSRF token using the {% csrf_token %} template tag
const csrfToken = document.querySelector('input[name=csrfmiddlewaretoken]').value;

// Rate video Buttons
document.querySelectorAll(".post").forEach(post => {
	
	const postId = post.dataset.postId;
	const ratings = post.querySelectorAll(".post-rating");
	const likeRating = ratings[0];
	
	ratings.forEach(rating => {
		const button = rating.querySelector(".post-rating-button");
		const count = rating.querySelector(".post-rating-count");
		
		button.addEventListener("click", async () => {
			var unrate = false;
			if (rating.classList.contains("post-rating-selected")) {
				unrate = true;
			}			
			if (!unrate) 
			{
				var action = likeRating === rating ? "like" : "dislike";	
			}
			else {action = "unrate"}
			const response = await fetch(`${window.location.pathname}/${action}`,{  
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken, 
				},
				body: JSON.stringify({ comment: comment }),
			})
			.then((res) => {
				if (res.status === 200) {
					ratings.forEach(rating => {
						if (rating.classList.contains("post-rating-selected")) {
							const count = rating.querySelector(".post-rating-count");

							count.textContent = Math.max(0, Number(count.textContent) - 1);
							rating.classList.remove("post-rating-selected");
						}
					});
					if (!unrate){
					count.textContent = Number(count.textContent) + 1;
					rating.classList.add("post-rating-selected"); }
				  
				} else if (res.status === 401) {
				  alert("Unauthorized: You need to log in");
				}
			  });

		//	const body = await response.json();
		});
	});
});


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