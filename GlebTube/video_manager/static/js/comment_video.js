

const commentsCountElement = document.getElementById("comments_count");

// Add comment 
document.getElementById('sendButton').addEventListener('click', function () {
  const text = commentsCountElement.textContent;
  const match = /(\d+)/.exec(text);

  if (match) {
    const currentCount = parseInt(match[1], 10);
    const newCount = currentCount + 1;
    // Update the text content with the incremented count
    commentsCountElement.textContent = text.replace(currentCount, newCount);
  }
});

// Clear comment
document.getElementById('clearButton').addEventListener('click', function () {
    comment = document.getElementById('comment').value = "";
});