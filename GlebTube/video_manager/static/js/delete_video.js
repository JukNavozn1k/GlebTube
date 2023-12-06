function handleDeleteButtonClick(event) {
    // Extracting video ID from the clicked button
    const videoId = event.target.value;

    // Extracting CSRF token value
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    
    // Making the DELETE request using fetch
    fetch(`/delete/video/${videoId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken // Include the CSRF token in the headers
            // Add any other headers if required
        },
        // You might need credentials: 'same-origin' or 'include' based on your setup
    })
    .then(response => {
        // Handle the response here (status code, etc.)
        if (response.ok) {
            // Successful deletion
            console.log(`Video with ID ${videoId} deleted successfully.`);
            // You can perform further actions if needed
        } else {
            // Handle errors or non-successful status codes
            console.error('Failed to delete the video.');
        }
    })
    .catch(error => {
        // Handle network errors or other issues that prevented the request
        console.error('Error deleting the video:', error);
    });
}

const deleteButtons = document.querySelectorAll('.delete-button');
deleteButtons.forEach(button => {
    button.addEventListener('click', handleDeleteButtonClick);
});