import torch

import torch.nn.functional as F

from ml.encode import encode_texts

# 1. Модель и токенайзер для энкодинга заголовков (используем готовую предобученную)
# tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-mpnet-base-v2")
# model = AutoModel.from_pretrained("sentence-transformers/all-mpnet-base-v2")




def semantic_search_knn(dataset, query, k=5, text_embeddings=None):
    """
    dataset: pytorch dataset с доступом dataset[i]['text']
    query: строка запроса
    k: количество ближайших соседей
    text_embeddings: (optional) заранее вычисленные эмбеддинги всех заголовков [N, D]
    
    Возвращает список (индекс, расстояние) отсортированных по возрастанию расстояния.
    """
    # Если эмбеддинги не переданы, считаем их
    if text_embeddings is None:
        texts = [dataset[i]['text'] for i in range(len(dataset))]
        text_embeddings = encode_texts(texts)  # Ваша функция для вычисления эмбеддингов
    
    query_emb = encode_texts([query])
    
    # Нормализуем эмбеддинги
    text_embeddings = F.normalize(text_embeddings, p=2, dim=1)
    query_emb = F.normalize(query_emb, p=2, dim=1)
    
    # Косинусная похожесть
    cos_sim = torch.matmul(text_embeddings, query_emb.T).squeeze(1)
    cos_dist = 1 - cos_sim
    
    # Берём топ-k ближайших по минимальному расстоянию
    if k > len(cos_dist):
        k = len(cos_dist)
    topk_dist, topk_idx = torch.topk(cos_dist, k, largest=False)
    
    results = [(int(idx), float(dist.item())) for idx, dist in zip(topk_idx, topk_dist)]
    # Отсортируем по возрастанию расстояния (для надежности)
    results_sorted = sorted(results, key=lambda x: x[1])  # сортируем по убыванию dist, но у тебя dist = 1 - similarity, значит хуже

    
    return results_sorted


# Универсальная функция поиска по видео (query, queryset, k)
def semantic_search_videos(query, videos_qs, k=10):
    """
    query: строка запроса
    videos_qs: QuerySet Video с video_embedding
    k: top-k
    Возвращает список Video в порядке похожести
    """
    import torch.nn.functional as F
    embeddings_list = []
    videos_list = []
    for video in videos_qs:
        if video.video_embedding:
            embeddings_list.append(torch.tensor(video.video_embedding))
            videos_list.append(video)
    if not embeddings_list:
        return []
    text_embeddings = torch.stack(embeddings_list)
    query_emb = encode_texts([query])
    text_embeddings = F.normalize(text_embeddings, p=2, dim=1)
    query_emb = F.normalize(query_emb, p=2, dim=1)
    cos_sim = torch.matmul(text_embeddings, query_emb.T).squeeze(1)
    cos_dist = 1 - cos_sim
    if k > len(cos_dist):
        k = len(cos_dist)
    topk_dist, topk_idx = torch.topk(cos_dist, k, largest=False)
    results = [videos_list[idx] for idx in topk_idx]
    return results



