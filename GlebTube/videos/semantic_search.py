import torch
from transformers import AutoTokenizer, AutoModel
import torch.nn.functional as F
import numpy as np

# 1. Модель и токенайзер для энкодинга заголовков (используем готовую предобученную)
# tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
# model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-mpnet-base-v2")
model = AutoModel.from_pretrained("sentence-transformers/all-mpnet-base-v2")


def encode_titles(titles, batch_size=32):
    """
    Эмбеддим список заголовков с помощью модели.
    Возвращаем тензор [N, D] с эмбеддингами.
    """
    embeddings = []
    for i in range(0, len(titles), batch_size):
        batch = titles[i:i+batch_size]
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

def semantic_search_knn(dataset, query, k=5, title_embeddings=None):
    """
    dataset: pytorch dataset с доступом dataset[i]['title']
    query: строка запроса
    k: количество ближайших соседей
    title_embeddings: (optional) заранее вычисленные эмбеддинги всех заголовков [N, D]
    
    Возвращает список (индекс, расстояние) отсортированных по возрастанию расстояния.
    """
    # Если эмбеддинги не переданы, считаем их
    if title_embeddings is None:
        titles = [dataset[i]['title'] for i in range(len(dataset))]
        title_embeddings = encode_titles(titles)  # Ваша функция для вычисления эмбеддингов
    
    query_emb = encode_titles([query])
    
    # Нормализуем эмбеддинги
    title_embeddings = F.normalize(title_embeddings, p=2, dim=1)
    query_emb = F.normalize(query_emb, p=2, dim=1)
    
    # Косинусная похожесть
    cos_sim = torch.matmul(title_embeddings, query_emb.T).squeeze(1)
    cos_dist = 1 - cos_sim
    
    # Берём топ-k ближайших по минимальному расстоянию
    if k > len(cos_dist):
        k = len(cos_dist)
    topk_dist, topk_idx = torch.topk(cos_dist, k, largest=False)
    
    results = [(int(idx), float(dist.item())) for idx, dist in zip(topk_idx, topk_dist)]
    # Отсортируем по возрастанию расстояния (для надежности)
    results_sorted = sorted(results, key=lambda x: x[1])  # сортируем по убыванию dist, но у тебя dist = 1 - similarity, значит хуже

    
    return results_sorted
