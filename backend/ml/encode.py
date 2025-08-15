from videos.models import Video
import torch
from ml.models import tokenizer, model

def format_video_text(video: Video) -> str:
    parts = []
    parts.append(f"title: {video.title or ''}")
    if video.channel:
        parts.append(f"channel: {video.channel.username}")
    return " | ".join(parts)


# Функция для получения эмбеддинга одного заголовка (для tasks)
def encode_text(text):
    encoded_input = tokenizer([text], padding=True, truncation=True, return_tensors='pt')
    with torch.no_grad():
        model_output = model(**encoded_input)
    token_embeddings = model_output.last_hidden_state
    attention_mask = encoded_input['attention_mask'].unsqueeze(-1)
    masked_embeddings = token_embeddings * attention_mask
    summed = masked_embeddings.sum(dim=1)
    counts = attention_mask.sum(dim=1).clamp(min=1e-9)
    embedding = (summed / counts).squeeze().tolist()
    return embedding


def encode_texts(texts, batch_size=32):
    """
    Эмбеддим список заголовков с помощью модели.
    Возвращаем тензор [N, D] с эмбеддингами.
    """
    embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        encoded_input = tokenizer(batch, padding=True, truncation=True, return_tensors='pt')
        with torch.no_grad():
            model_output = model(**encoded_input)
        # Усредняем по токенам (pooling)
        token_embeddings = model_output.last_hidden_state  # (batch, seq_len, hidden)
        attention_mask = encoded_input['attention_mask'].unsqueeze(-1)  # (batch, seq_len, 1)
        masked_embeddings = token_embeddings * attention_mask
        summed = masked_embeddings.sum(dim=1)
        counts = attention_mask.sum(dim=1).clamp(min=1e-9)
        batch_embeddings = summed / counts  # (batch, hidden)
        embeddings.append(batch_embeddings)
    return torch.cat(embeddings)