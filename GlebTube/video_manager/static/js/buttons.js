function parseVideoIdFromUrl() {
    const url = window.location.pathname; // Get the current URL
    const parts = url.split('/'); // Split the URL by '/'
    
    // Assuming 'video_id' is the second part in the URL (index 2, considering 0-based indexing)
    const videoId = parseInt(parts[2], 10);

    if (!isNaN(videoId)) {
        // videoId contains the parsed integer value
        return videoId;
    } else {
        // Handle the case where 'video_id' is not a valid integer
        return null;
    }
}


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
			
			ratings.forEach(rating => {
				if (rating.classList.contains("post-rating-selected")) {
					const count = rating.querySelector(".post-rating-count");

					count.textContent = Math.max(0, Number(count.textContent) - 1);
					rating.classList.remove("post-rating-selected");
				}
			});
			if (!unrate) 
			{
				count.textContent = Number(count.textContent) + 1;
				rating.classList.add("post-rating-selected");
				var action = likeRating === rating ? "like" : "dislike";	
			}
			else {action = "unrate"}
			const response = await fetch(`/rate_video/${postId}/${action}`,{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken, // Include the CSRF token in the headers
				},
				body: JSON.stringify({ comment: comment }),
			});
			const body = await response.json();
		});
	});
});


// Add comment
document.getElementById('sendButton').addEventListener('click', function () {
    const comment = document.getElementById('comment').value;
   
    fetch(window.location.pathname, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken, // Include the CSRF token in the headers
        },
        body: JSON.stringify({ comment: comment }),
    })
    .then(response => response.text())
            .then(html => {
                // Update the content of the current page with the received HTML
                document.body.innerHTML = html;
            })
            .catch(error => {
                console.error('Error:', error);
            });
});