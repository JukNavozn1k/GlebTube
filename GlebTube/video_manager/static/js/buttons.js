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
				var likeOrDislike = likeRating === rating ? "like" : "dislike";	
			}
			else {likeOrDislike = "unrate"}
			const response = await fetch(`/video/${postId}/${likeOrDislike}`);
			const body = await response.json();
		});
	});
});